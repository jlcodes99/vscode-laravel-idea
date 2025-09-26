/**
 * Laravel IDE扩展 - 命令解析模块
 * 
 * 负责解析Laravel定时任务和Console命令，支持：
 * - Console/Kernel.php中的schedule定时任务解析
 * - Console/Commands目录下的Command类发现
 * - 命令名称到类名的智能映射
 * - 正跳：定时任务 → Command类
 * - 反跳：Command类 → 定时任务
 * 
 * @author lijie
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ParsedCommand, CommandDefinition } from './types';

export class LaravelCommandParser {
    private static outputChannel: vscode.OutputChannel;
    private static workspaceRoot: string;
    
    static setOutputChannel(channel: vscode.OutputChannel): void {
        this.outputChannel = channel;
    }
    
    static setWorkspaceRoot(root: string): void {
        this.workspaceRoot = root;
    }

    private static log(message: string, data?: any): void {
        if (this.outputChannel) {
            const timestamp = new Date().toISOString().substring(11, 19);
            if (data) {
                this.outputChannel.appendLine(`[${timestamp}] [Command] ${message}: ${JSON.stringify(data)}`);
            } else {
                this.outputChannel.appendLine(`[${timestamp}] [Command] ${message}`);
            }
        }
    }

    /**
     * 解析Console/Kernel.php中的定时任务
     */
    static parseScheduleFromFile(filePath: string): ParsedCommand[] {
        const fileName = path.basename(filePath);
        this.log(`🚀 开始解析定时任务`, { file: fileName });
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const commands: ParsedCommand[] = [];
            
            let inScheduleMethod = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                // 检测schedule方法开始
                if (trimmed.includes('function schedule(') || trimmed.includes('schedule(Schedule')) {
                    inScheduleMethod = true;
                    continue;
                }
                
                // 检测schedule方法结束
                if (inScheduleMethod && (trimmed === '}' || (trimmed.startsWith('}') && !trimmed.includes('>')))) {
                    break;
                }
                
                // 在schedule方法中解析命令
                if (inScheduleMethod) {
                    const lineCommands = LaravelCommandParser.extractCommandsFromLine(line, i, filePath);
                    commands.push(...lineCommands);
                }
            }
            
            this.log(`🎉 定时任务解析完成`, {
                file: fileName,
                commandCount: commands.length
            });
            
            return commands;
            
        } catch (error) {
            this.log(`❌ 定时任务解析失败`, { file: fileName, error: String(error) });
            return [];
        }
    }

    /**
     * 从一行中提取命令信息
     */
    static extractCommandsFromLine(lineText: string, lineNumber: number, filePath: string): ParsedCommand[] {
        const commands: ParsedCommand[] = [];
        
        // 匹配各种 $schedule->command() 格式
        const patterns = [
            // $schedule->command('command-name')
            /\$schedule\s*->\s*command\s*\(\s*['"`]([^'"`]+)['"`]/g,
            // 其他可能的格式
            /Schedule\s*::\s*command\s*\(\s*['"`]([^'"`]+)['"`]/g
        ];
        
        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(lineText)) !== null) {
                const fullMatch = match[0];
                const fullCommandSignature = match[1]; // 完整的命令字符串，可能包含参数
                const matchStart = match.index;
                
                // 提取纯命令名（第一个空格前的部分）
                const commandName = this.extractPureCommandName(fullCommandSignature);
                
                // 计算命令名在原字符串中的位置
                const signatureStart = lineText.indexOf(fullCommandSignature, matchStart);
                if (signatureStart !== -1) {
                    const commandNameStart = signatureStart;
                    const commandNameEnd = commandNameStart + commandName.length;
                    
                    commands.push({
                        commandName: commandName, // 纯命令名，用于匹配Command类的$signature
                        signature: fullCommandSignature, // 完整签名，包含参数
                        file: filePath,
                        line: lineNumber,
                        startPos: commandNameStart,
                        endPos: commandNameEnd,
                        type: 'schedule'
                    });
                    
                }
            }
        }
        
        return commands;
    }

    /**
     * 从完整命令签名中提取纯命令名
     */
    static extractCommandName(signature: string): string {
        // 移除参数和选项，只保留命令名称
        // 'upload:ai-ident-image param1 --option=value' → 'upload:ai-ident-image'
        return signature.split(' ')[0].trim();
    }

    /**
     * 提取纯命令名称（去除参数和选项）
     * 例如：'sync:bs:share:page:data' -> 'sync:bs:share:page:data'
     *      'update:platform-item-tag-new -r real' -> 'update:platform-item-tag-new'
     *      'sync:material-tech-data all 1' -> 'sync:material-tech-data'
     */
    private static extractPureCommandName(fullSignature: string): string {
        // 按空格分割，取第一部分作为纯命令名
        const parts = fullSignature.trim().split(/\s+/);
        return parts[0] || fullSignature;
    }

    /**
     * 扫描Console/Commands目录，发现所有Command类
     */
    static discoverCommandClasses(): Map<string, CommandDefinition> {
        const definitions = new Map<string, CommandDefinition>();
        const commandsDir = path.join(this.workspaceRoot, 'app', 'Console', 'Commands');
        
        if (!fs.existsSync(commandsDir)) {
            this.log('❌ Commands目录不存在', { dir: commandsDir });
            return definitions;
        }

        const commandFiles: string[] = [];
        LaravelCommandParser.findCommandFilesRecursively(commandsDir, commandFiles);
        
        for (const commandFile of commandFiles) {
            const commandDef = LaravelCommandParser.parseCommandClass(commandFile);
            if (commandDef) {
                definitions.set(commandDef.commandName, commandDef);
            }
        }
        
        return definitions;
    }

    /**
     * 递归查找Command文件
     */
    static findCommandFilesRecursively(dir: string, results: string[]): void {
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(dir, item.name);

                if (item.isDirectory()) {
                    this.findCommandFilesRecursively(fullPath, results);
                } else if (item.isFile() && item.name.endsWith('.php')) {
                    results.push(fullPath);
                }
            }
        } catch (error) {
            // 忽略权限错误等
        }
    }

    /**
     * 解析单个Command类文件
     */
    static parseCommandClass(filePath: string): CommandDefinition | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            let className = '';
            let classLine = -1;
            let commandSignature = '';
            let signatureLine = -1;
            
            // 提取类名和$signature
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                // 查找类定义
                const classMatch = trimmed.match(/^class\s+(\w+)\s+extends\s+Command/);
                if (classMatch) {
                    className = classMatch[1];
                    classLine = i;
                }
                
                // 查找$signature属性
                const signatureMatch = trimmed.match(/protected\s+\$signature\s*=\s*['"`]([^'"`]+)['"`]/);
                if (signatureMatch) {
                    commandSignature = signatureMatch[1];
                    signatureLine = i;
                }
                
                // 如果都找到了，提前退出
                if (className && commandSignature) {
                    break;
                }
            }
            
            if (className && commandSignature) {
                // 提取纯命令名（去除参数和选项）
                const commandName = this.extractPureCommandName(commandSignature);
                
                return {
                    commandName: commandName,
                    className: className,
                    file: filePath,
                    line: classLine,
                    signatureLine: signatureLine
                };
            } else {
                this.log(`⚠️ Command类信息不完整`, {
                    file: path.basename(filePath),
                    hasClassName: !!className,
                    hasSignature: !!commandSignature
                });
            }
            
        } catch (error) {
            this.log(`❌ 解析Command类失败`, { 
                file: path.basename(filePath), 
                error: String(error) 
            });
        }
        
        return null;
    }

    /**
     * 命令名称到类名的智能转换
     * Laravel约定：kebab-case → PascalCase
     */
    static commandNameToClassName(commandName: string): string[] {
        // 移除冒号，转换为驼峰命名
        // upload:ai-ident-image → UploadAiIdentImage
        
        const parts = commandName.split(':').join('-').split('-');
        const camelCase = parts
            .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
            .join('');
        
        // 返回可能的类名变体
        const possibleNames = [
            camelCase + 'Command',  // UploadAiIdentImageCommand
            camelCase,              // UploadAiIdentImage
            // 处理常见缩写保持大写的情况
            LaravelCommandParser.preserveCommonAcronyms(camelCase + 'Command'),  // UploadAIIdentImageCommand
            LaravelCommandParser.preserveCommonAcronyms(camelCase)               // UploadAIIdentImage
        ];
        
        // 去重
        return [...new Set(possibleNames)];
    }

    /**
     * 保持常见缩写为大写
     */
    static preserveCommonAcronyms(text: string): string {
        const acronyms = ['AI', 'API', 'URL', 'HTTP', 'JSON', 'XML', 'SQL', 'ERP', 'CRM', 'SMS', 'OSS'];
        
        let result = text;
        for (const acronym of acronyms) {
            const pattern = new RegExp(`\\b${acronym.toLowerCase()}\\b`, 'gi');
            result = result.replace(pattern, acronym);
        }
        
        return result;
    }

    /**
     * 类名到命令名称的转换（反向）
     */
    static classNameToCommandName(className: string): string[] {
        // 移除Command后缀
        let baseName = className.replace(/Command$/, '');
        
        // 处理连续大写字母（如AI, ERP等）
        baseName = baseName.replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2');
        
        // PascalCase → kebab-case
        const kebabCase = baseName
            .replace(/([a-z\d])([A-Z])/g, '$1-$2')  // 插入连字符
            .toLowerCase();
        
        // 可能的命令名称格式
        const possibleCommands = [
            kebabCase,                                          // upload-ai-image
            kebabCase.replace(/^([^-]+)-/, '$1:'),             // upload:ai-image (第一个-变:)
            kebabCase.replace(/-/g, ':'),                      // upload:ai:image (所有-变:)
            kebabCase.replace(/^([^-]+(?:-[^-]+)?)-/, '$1:')   // upload:ai-image (前两段用:)
        ];
        
        return [...new Set(possibleCommands)];
    }

    /**
     * 解析路由位置的命令信息
     */
    static parseCommandAtPosition(lineText: string, character: number): ParsedCommand | null {
        const lineCommands = LaravelCommandParser.extractCommandsFromLine(lineText, 0, '');
        
        // 找到光标位置对应的命令
        for (const command of lineCommands) {
            if (character >= command.startPos && character <= command.endPos) {
                this.log(`🎯 检测到命令: ${command.commandName}`);
                return command;
            }
        }
        
        return null;
    }

    /**
     * 根据命令名称查找对应的Command类
     */
    static findCommandDefinition(commandDefinitions: Map<string, CommandDefinition>, commandName: string): CommandDefinition | null {
        // 直接精确匹配$signature值
        const definition = commandDefinitions.get(commandName);
        if (definition) {
            this.log(`✅ 基于$signature精确匹配`, {
                commandName: commandName,
                className: definition.className
            });
            return definition;
        }
        
        this.log(`❌ 未找到命令定义`, {
            commandName: commandName,
            availableCommands: Array.from(commandDefinitions.keys()).slice(0, 5)
        });
        
        return null;
    }

}

export class LaravelConsoleKernelParser {
    private static outputChannel: vscode.OutputChannel;
    private static workspaceRoot: string;
    
    static setOutputChannel(channel: vscode.OutputChannel): void {
        this.outputChannel = channel;
    }
    
    static setWorkspaceRoot(root: string): void {
        this.workspaceRoot = root;
    }

    private static log(message: string, data?: any): void {
        if (this.outputChannel) {
            const timestamp = new Date().toISOString().substring(11, 19);
            if (data) {
                this.outputChannel.appendLine(`[${timestamp}] [ConsoleKernel] ${message}: ${JSON.stringify(data)}`);
            } else {
                this.outputChannel.appendLine(`[${timestamp}] [ConsoleKernel] ${message}`);
            }
        }
    }

    /**
     * 查找Console/Kernel.php文件
     */
    static findConsoleKernelFile(): string | null {
        const possiblePaths = [
            path.join(this.workspaceRoot, 'app', 'Console', 'Kernel.php')
        ];
        
        for (const kernelPath of possiblePaths) {
            if (fs.existsSync(kernelPath)) {
                this.log('🔍 找到Console Kernel文件', {
                    path: path.relative(this.workspaceRoot, kernelPath)
                });
                return kernelPath;
            }
        }
        
        this.log('❌ 未找到Console/Kernel.php文件');
        return null;
    }

    /**
     * 解析Console/Kernel.php中的所有定时任务
     */
    static parseConsoleKernel(): ParsedCommand[] {
        const kernelPath = this.findConsoleKernelFile();
        if (!kernelPath) {
            return [];
        }

        return LaravelCommandParser.parseScheduleFromFile(kernelPath);
    }

    /**
     * 解析指定Command类的$signature
     */
    static parseCommandSignature(filePath: string): { commandName: string; line: number } | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                // 查找$signature属性
                const signatureMatch = trimmed.match(/protected\s+\$signature\s*=\s*['"`]([^'"`]+)['"`]/);
                if (signatureMatch) {
                    const signature = signatureMatch[1];
                    const commandName = LaravelCommandParser.extractCommandName(signature);
                    
                    return {
                        commandName: commandName,
                        line: i
                    };
                }
            }
            
        } catch (error) {
            this.log(`❌ 解析Command signature失败`, {
                file: path.basename(filePath),
                error: String(error)
            });
        }
        
        return null;
    }

    /**
     * 根据类名查找在Console/Kernel.php中的定时任务定义
     */
    static findScheduleByClassName(
        commandDefinitions: Map<string, CommandDefinition>, 
        scheduleCommands: ParsedCommand[], 
        className: string
    ): ParsedCommand | null {
        // 1. 直接查找：通过类名找到对应的CommandDefinition，然后用其$signature匹配
        let targetSignature = '';
        
        for (const [cmdName, definition] of commandDefinitions) {
            if (definition.className === className) {
                targetSignature = cmdName; // 现在cmdName就是完整的$signature值
                break;
            }
        }
        
        if (targetSignature) {
            // 2. 用$signature值在定时任务中精确查找
            const scheduleCommand = scheduleCommands.find(cmd => cmd.commandName === targetSignature);
            if (scheduleCommand) {
                this.log(`✅ 基于$signature精确匹配到定时任务`, {
                    className: className,
                    signature: targetSignature,
                    line: scheduleCommand.line + 1
                });
                return scheduleCommand;
            }
        }
        
        this.log(`❌ 未找到类名对应的定时任务`, {
            className: className,
            targetSignature: targetSignature,
            availableScheduleCommands: scheduleCommands.map(cmd => cmd.commandName).slice(0, 5)
        });
        
        return null;
    }

}
