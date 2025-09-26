/**
 * Laravel IDE扩展 - 跳转提供者模块
 * 
 * 负责实现具体的跳转逻辑，包括：
 * - 路由 → 控制器跳转
 * - 控制器 → 路由反跳
 * - 路由 → 中间件跳转
 * - 智能位置检测和整行选中
 * 
 * @author lijie
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { RouteInfo, ControllerInfo, LaravelCache } from './types';
import { LaravelMiddlewareParser, LaravelKernelParser } from './middlewareParser';
import { LaravelCommandParser, LaravelConsoleKernelParser } from './commandParser';
import { LaravelConfigParser } from './configParser';
import { CacheManager } from './cacheManager';

export class LaravelJumpProvider implements vscode.DefinitionProvider {
    private outputChannel: vscode.OutputChannel;
    private workspaceRoot: string;
    private cacheManager: CacheManager;
    
    constructor(outputChannel: vscode.OutputChannel, workspaceRoot: string) {
        this.outputChannel = outputChannel;
        this.workspaceRoot = workspaceRoot;
        this.cacheManager = CacheManager.getInstance();
    }

    private log(message: string, data?: any): void {
        if (this.outputChannel) {
            const timestamp = new Date().toISOString().substring(11, 19);
            if (data) {
                this.outputChannel.appendLine(`[${timestamp}] [Jump] ${message}: ${JSON.stringify(data)}`);
            } else {
                this.outputChannel.appendLine(`[${timestamp}] [Jump] ${message}`);
            }
        }
    }
    
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Definition | null> {
        const fileName = path.basename(document.fileName);
        const line = document.lineAt(position.line);
        
        this.log('🎯 开始跳转分析', {
            file: fileName,
            line: position.line + 1,
            character: position.character + 1,
            content: line.text.trim()
        });

        // 添加文件类型检测日志
        this.log('🔍 文件类型检测', {
            filePath: document.fileName,
            isRouteFile: this.isRouteFile(document.fileName),
            isControllerFile: this.isControllerFile(document.fileName), 
            isCommandFile: this.isCommandFile(document.fileName),
            isConsoleKernelFile: this.isConsoleKernelFile(document.fileName),
            isConfigFile: this.isConfigFile(document.fileName)
        });

        try {
            if (this.isRouteFile(document.fileName)) {
                return await this.jumpFromRoute(document, position);
            } else if (this.isControllerFile(document.fileName)) {
                return await this.jumpFromController(document, position);
            } else if (this.isCommandFile(document.fileName)) {
                return await this.jumpFromCommand(document, position);
            } else if (this.isConsoleKernelFile(document.fileName)) {
                return await this.jumpFromConsoleKernel(document, position);
            } else if (this.isConfigFile(document.fileName)) {
                return await this.jumpFromConfig(document, position);
            }

            this.log('❌ 未识别的文件类型', { filePath: document.fileName });
            return null;

        } catch (error) {
            this.log('❌ 跳转失败', { error: String(error) });
            return null;
        }
    }

    /**
     * 从Console/Kernel.php跳转到Command类
     */
    private async jumpFromConsoleKernel(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location[] | null> {
        const fileName = path.basename(document.fileName);
        const line = document.lineAt(position.line);
        
        // 解析当前点击的命令信息
        const commandInfo = LaravelCommandParser.parseCommandAtPosition(line.text, position.character);
        if (!commandInfo) {
            this.log('⚠️ 未能解析命令信息');
            return null;
        }
        
        this.log('🔍 Console/Kernel命令跳转分析', {
            commandName: commandInfo.commandName,
            signature: commandInfo.signature,
            line: position.line + 1
        });
        
        // 在缓存中查找对应的Command类定义
        const cache = this.cacheManager.getCache();
        const commandDefinition = LaravelCommandParser.findCommandDefinition(cache.commandDefinitions, commandInfo.commandName);
        
        if (commandDefinition) {
            const location = new vscode.Location(
                vscode.Uri.file(commandDefinition.file),
                new vscode.Position(commandDefinition.line, 0) // 定位到类定义行
            );
            
            this.log('🎉 命令跳转成功', {
                commandName: commandInfo.commandName,
                targetFile: path.basename(commandDefinition.file),
                targetLine: commandDefinition.line + 1,
                className: commandDefinition.className
            });
            
            return [location];
        } else {
            this.log('❌ 命令跳转失败 - 未找到Command类', {
                commandName: commandInfo.commandName,
                availableCommands: Array.from(cache.commandDefinitions.keys()).slice(0, 10) // 只显示前10个
            });
            return null;
        }
    }

    /**
     * 从路由跳转到控制器或中间件
     */
    private async jumpFromRoute(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location[] | null> {
        const fileName = path.basename(document.fileName);
        const line = document.lineAt(position.line);
        
        // 解析当前点击的路由信息
        const routeInfo = this.parseRouteAtPosition(line.text, position.character);
        if (!routeInfo) {
            this.log('⚠️ 未能解析路由信息');
            return null;
        }
        
        // 如果点击的是中间件，跳转到Kernel.php
        if (routeInfo.type === 'middleware' && routeInfo.middleware) {
            return this.jumpToMiddleware(routeInfo.middleware, position.line);
        }
        
        // 如果点击的是命令，跳转到Command类
        if (routeInfo.type === 'command' && routeInfo.command) {
            return this.jumpToCommand(routeInfo.command, position.line);
        }

        // 确保是控制器相关的跳转
        if (!routeInfo.controller) {
            this.log('❌ 无法处理非控制器跳转', { type: routeInfo.type });
            return null;
        }
        
        // 从缓存中找到期望的命名空间
        const expectedNamespace = this.cacheManager.findExpectedNamespace(document.fileName, position.line);

        this.log('🔍 解析路由跳转信息', {
            controller: routeInfo.controller,
            action: routeInfo.action,
            type: routeInfo.type,
            expectedNamespace: expectedNamespace || 'null'
        });

        // 查找控制器文件
        const controllerFiles = await this.findControllerFiles(routeInfo.controller, expectedNamespace);
        const locations: vscode.Location[] = [];
        

        for (const filePath of controllerFiles) {
            const fileNamespace = this.getFileNamespace(filePath);
            
            
            let location: vscode.Location | null = null;
            
            if (routeInfo.type === 'method' && routeInfo.action) {
                // 跳转到方法
                location = this.findMethodInFile(filePath, routeInfo.action);
            } else if (routeInfo.type === 'controller') {
                // 跳转到类定义
                location = this.findClassInFile(filePath, routeInfo.controller);
            }
            
            if (location) {
                locations.push(location);
            }
        }

        if (locations.length > 0) {
            this.log('🎉 跳转成功', { targetCount: locations.length });
            return locations;
        } else {
            this.log('❌ 未找到匹配的目标');
            return null;
        }
    }

    /**
     * 从Command类跳转到Console/Kernel.php中的定时任务
     */
    private async jumpFromCommand(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location[] | null> {
        const fileName = path.basename(document.fileName);
        const line = document.lineAt(position.line);
        const lineText = line.text;
        const character = position.character;
        
        // 检查是否点击了类名
        const classMatch = lineText.match(/^\s*class\s+(\w+)/);
        if (!classMatch) {
            this.log('⚠️ 未在类定义行点击');
            return null;
        }
        
        const className = classMatch[1];
        const classIndex = lineText.indexOf(className);
        
        // 确认点击位置在类名上
        if (character < classIndex || character >= classIndex + className.length) {
            this.log('⚠️ 点击位置不在类名上');
            return null;
        }
        
        this.log('🔍 Command反跳分析', {
            className: className,
            file: fileName,
            line: position.line + 1
        });
        
        const cache = this.cacheManager.getCache();
        const scheduleCommands = cache.commands.get('console') || [];
        
        // 查找对应的定时任务
        const scheduleCommand = LaravelConsoleKernelParser.findScheduleByClassName(
            cache.commandDefinitions,
            scheduleCommands,
            className
        );
        
        if (scheduleCommand) {
            const location = new vscode.Location(
                vscode.Uri.file(scheduleCommand.file),
                this.createFullLineSelection(scheduleCommand.file, scheduleCommand.line)
            );
            
            this.log('🎉 Command反跳成功', {
                className: className,
                commandName: scheduleCommand.commandName,
                targetFile: path.basename(scheduleCommand.file),
                targetLine: scheduleCommand.line + 1
            });
            
            return [location];
        } else {
            this.log('❌ Command反跳失败 - 未找到对应的定时任务', {
                className: className,
                availableScheduleCommands: scheduleCommands.map(cmd => cmd.commandName)
            });
            return null;
        }
    }

    /**
     * 从控制器跳转到路由
     */
    private async jumpFromController(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location[] | null> {
        const fileName = path.basename(document.fileName);
        const controllerInfo = this.parseControllerAtPosition(document, position);
        
        if (!controllerInfo) {
            this.log('⚠️ 未能解析控制器信息');
            return null;
        }
        
        const currentNamespace = this.getFileNamespace(document.fileName);
        this.log('🔍 控制器反跳分析', {
            controller: controllerInfo.controller,
            method: controllerInfo.method,
            type: controllerInfo.type,
            currentNamespace: currentNamespace,
            filePath: this.getRelativePath(document.fileName)
        });
        
        const locations: vscode.Location[] = [];
        const cache = this.cacheManager.getCache();
        
        // 在所有缓存的路由中查找匹配项
        for (const [routeFile, routes] of cache.routes) {
            const fileName = path.basename(routeFile);
            
            for (const route of routes) {
                // 控制器名称匹配
                if (route.controller !== controllerInfo.controller) continue;
                
                // 如果是方法跳转，还需要匹配方法名
                if (controllerInfo.method && route.action !== controllerInfo.method) continue;
                
                // 命名空间匹配
                if (currentNamespace && route.namespace !== currentNamespace) {
                    continue;
                }
                
                // 创建选中整行的Location
                const location = new vscode.Location(
                    vscode.Uri.file(route.file),
                    this.createFullLineSelection(route.file, route.line)
                );
                
                locations.push(location);
                
            }
        }

        if (locations.length > 0) {
            this.log('🎉 反跳成功', { targetCount: locations.length });
            return locations;
        } else {
            this.log('❌ 未找到匹配的路由');
            return null;
        }
    }
    
    /**
     * 跳转到命令类定义
     */
    private jumpToCommand(commandName: string, lineNumber: number): vscode.Location[] | null {
        this.log('🔄 开始命令跳转', {
            commandName: commandName,
            line: lineNumber + 1
        });
        
        const cache = this.cacheManager.getCache();
        const commandDefinition = LaravelCommandParser.findCommandDefinition(cache.commandDefinitions, commandName);
        
        if (commandDefinition) {
            const location = new vscode.Location(
                vscode.Uri.file(commandDefinition.file),
                new vscode.Position(commandDefinition.line, 0) // 定位到类定义行
            );
            
            this.log('🎉 命令跳转成功', {
                commandName: commandName,
                targetFile: path.basename(commandDefinition.file),
                targetLine: commandDefinition.line + 1,
                className: commandDefinition.className
            });
            
            return [location];
        } else {
            this.log('❌ 命令跳转失败 - 未找到Command类', {
                commandName: commandName,
                availableCommands: Array.from(cache.commandDefinitions.keys())
            });
            return null;
        }
    }

    /**
     * 跳转到中间件定义
     */
    private jumpToMiddleware(middlewareName: string, lineNumber: number): vscode.Location[] | null {
        this.log('🔄 开始中间件跳转', {
            middlewareName: middlewareName,
            line: lineNumber + 1
        });
        
        const cache = this.cacheManager.getCache();
        const middlewareDefinition = LaravelKernelParser.findMiddlewareDefinition(cache.middlewareDefinitions, middlewareName);
        
        if (middlewareDefinition) {
            const location = new vscode.Location(
                vscode.Uri.file(middlewareDefinition.file),
                this.createFullLineSelection(middlewareDefinition.file, middlewareDefinition.line)
            );
            
            this.log('🎉 中间件跳转成功', {
                middlewareName: middlewareName,
                targetFile: path.basename(middlewareDefinition.file),
                targetLine: middlewareDefinition.line + 1,
                className: middlewareDefinition.className
            });
            
            return [location];
        } else {
            this.log('❌ 中间件跳转失败 - 未找到定义', {
                middlewareName: middlewareName,
                availableMiddlewares: Array.from(cache.middlewareDefinitions.keys())
            });
            return null;
        }
    }
    
    /**
     * 创建选中整行的Range
     */
    private createFullLineSelection(filePath: string, lineNumber: number): vscode.Range {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const lineContent = lines[lineNumber];
            
            if (!lineContent) {
                return new vscode.Range(
                    new vscode.Position(lineNumber, 0),
                    new vscode.Position(lineNumber, 0)
                );
            }
            
            // 计算行的实际内容范围（去掉前后空白）
            const trimmedLine = lineContent.trim();
            const leadingSpaces = lineContent.length - lineContent.trimLeft().length;
            const contentStart = leadingSpaces;
            const contentEnd = leadingSpaces + trimmedLine.length;
            
            
            // 返回选中整行内容的Range（不包括前导空格）
            return new vscode.Range(
                new vscode.Position(lineNumber, contentStart),
                new vscode.Position(lineNumber, contentEnd)
            );
            
        } catch (error) {
            this.log('⚠️ 创建整行选中Range失败', {
                error: String(error),
                filePath: path.basename(filePath),
                lineNumber: lineNumber + 1
            });
            
            // 降级方案：返回行首位置
            return new vscode.Range(
                new vscode.Position(lineNumber, 0),
                new vscode.Position(lineNumber, 0)
            );
        }
    }

    /**
     * 解析路由位置信息
     */
    private parseRouteAtPosition(lineText: string, character: number): RouteInfo | null {
        // 首先检测是否点击了中间件
        const middlewareInfo = LaravelMiddlewareParser.parseMiddlewareAtPosition(lineText, character);
        if (middlewareInfo) {
            return {
                middleware: middlewareInfo.name,
                type: 'middleware'
            };
        }
        
        // 检测是否点击了命令
        const commandInfo = LaravelCommandParser.parseCommandAtPosition(lineText, character);
        if (commandInfo) {
            return {
                command: commandInfo.commandName,
                type: 'command'
            };
        }
        
        // 如果不是中间件，检测控制器和方法
        const patterns = [
            // 更宽松的模式匹配 - 支持各种空格和引号组合
            /\$api\s*->\s*(get|post|put|delete|patch|options|any|match)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/,
            /Route\s*::\s*(get|post|put|delete|patch|options|any|match)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/,
            // 支持match方法的数组参数格式
            /\$api\s*->\s*match\s*\(\s*\[.*?\]\s*,\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/,
            /Route\s*::\s*match\s*\(\s*\[.*?\]\s*,\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/
        ];

        for (const pattern of patterns) {
            const match = lineText.match(pattern);
            if (!match) continue;
            
            const fullMatch = match[0];
            let controller, action;
            
            // 处理match方法的特殊情况
            if (match[1] === 'match' && match.length === 5) {
                controller = match[3];
                action = match[4];
            } else if (match.length >= 5) {
                controller = match[3];
                action = match[4];
            } else {
                continue;
            }
            
            const matchStart = lineText.indexOf(fullMatch);
            
            if (character < matchStart || character > matchStart + fullMatch.length) {
                continue;
            }
            
            // 确定点击位置
            const controllerActionStr = `${controller}@${action}`;
            const controllerActionIndex = fullMatch.indexOf(controllerActionStr);
            const controllerStart = matchStart + controllerActionIndex;
            const controllerEnd = controllerStart + controller.length;
            const actionStart = controllerStart + controller.length + 1;
            const actionEnd = actionStart + action.length;
                    
            if (character >= controllerStart && character < controllerEnd) {
                return {
                    controller: controller.replace(/Controller$/, ''),
                    type: 'controller'
                };
            } else if (character >= actionStart && character < actionEnd) {
                return {
                    controller: controller.replace(/Controller$/, ''),
                    action: action,
                    type: 'method'
                };
            }
        }

        return null;
    }

    /**
     * 解析控制器位置信息
     */
    private parseControllerAtPosition(document: vscode.TextDocument, position: vscode.Position): ControllerInfo | null {
        const line = document.lineAt(position.line);
        const lineText = line.text;
        const character = position.character;

        // 检查类定义
        const classMatch = lineText.match(/^\s*class\s+(\w+)/);
        if (classMatch) {
            const className = classMatch[1];
            const classIndex = lineText.indexOf(className);
            if (character >= classIndex && character < classIndex + className.length) {
                return {
                    controller: className.replace(/Controller$/, ''),
                    type: 'class'
                };
            }
        }

        // 检查方法定义
        const methodMatch = lineText.match(/^\s*(public|private|protected)?\s*function\s+(\w+)\s*\(/);
        if (methodMatch) {
            const methodName = methodMatch[2];
            const methodIndex = lineText.indexOf(`function ${methodName}`) + 9;
            if (character >= methodIndex && character < methodIndex + methodName.length) {
                const className = this.getClassNameFromDocument(document);
                return {
                    controller: className.replace(/Controller$/, ''),
                    method: methodName,
                    type: 'method'
                };
            }
        }
        
        return null;
    }

    /**
     * 查找控制器文件
     */
    private async findControllerFiles(controllerName: string, expectedNamespace?: string | null): Promise<string[]> {
        const possibleNames = [
            controllerName + 'Controller.php',
            controllerName + '.php'
        ];

        // 如果有期望命名空间，优先查找对应路径
        if (expectedNamespace) {
            const targetFile = this.getExpectedFilePath(controllerName, expectedNamespace);
            if (targetFile && fs.existsSync(targetFile)) {
                return [targetFile];
            }
        }
        
        // 降级：在所有可能的目录中搜索
        const searchDirs = [
            path.join(this.workspaceRoot, 'app', 'Http', 'Controllers'),
            path.join(this.workspaceRoot, 'app', 'Api', 'Controllers'),
            path.join(this.workspaceRoot, 'app', 'Controllers')
        ];

        const files: string[] = [];

        for (const dir of searchDirs) {
            if (fs.existsSync(dir)) {
                this.findFilesRecursively(dir, possibleNames, files);
            }
        }

        // 如果有期望命名空间，优先返回匹配的文件
        if (expectedNamespace && files.length > 1) {
            const matchedFiles = files.filter(file => {
                const fileNamespace = this.getFileNamespace(file);
                return fileNamespace === expectedNamespace;
            });
            
            if (matchedFiles.length > 0) {
                return matchedFiles;
            }
        }

        return files;
    }
    
    /**
     * 根据命名空间推断期望的文件路径
     */
    private getExpectedFilePath(controllerName: string, namespace: string): string | null {
        const namespacePath = namespace
            .replace(/^App\\/, 'app/')
            .replace(/\\/g, '/');
        
        const fileName = controllerName + 'Controller.php';
        const expectedPath = path.join(this.workspaceRoot, namespacePath, fileName);
        
        
        return expectedPath;
    }
    
    /**
     * 递归查找文件
     */
    private findFilesRecursively(dir: string, targetNames: string[], results: string[]): void {
        try {
            const items = fs.readdirSync(dir, { withFileTypes: true });

            for (const item of items) {
                const fullPath = path.join(dir, item.name);

                if (item.isDirectory()) {
                    this.findFilesRecursively(fullPath, targetNames, results);
                } else if (item.isFile() && targetNames.includes(item.name)) {
                    results.push(fullPath);
                }
            }
        } catch (error) {
            // 忽略权限错误等
        }
    }

    /**
     * 在文件中查找方法
     */
    private findMethodInFile(filePath: string, methodName: string): vscode.Location | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const methodPattern = new RegExp(`^\\s*(public|private|protected)?\\s*function\\s+(${methodName})\\s*\\(`);
                const match = line.match(methodPattern);
                
                if (match) {
                    const methodIndex = line.indexOf(methodName);
                    return new vscode.Location(
                        vscode.Uri.file(filePath),
                        new vscode.Position(i, methodIndex)
                    );
                }
            }
        } catch (error) {
            // 忽略文件读取错误
        }

        return null;
    }

    /**
     * 在文件中查找类定义
     */
    private findClassInFile(filePath: string, className: string): vscode.Location | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const classPattern = new RegExp(`^\\s*class\\s+(${className}Controller?)\\s*`);
                const match = line.match(classPattern);

                if (match) {
                    const classIndex = line.indexOf(match[1]);
                    return new vscode.Location(
                        vscode.Uri.file(filePath),
                        new vscode.Position(i, classIndex)
                    );
                }
            }
        } catch (error) {
            // 忽略文件读取错误
        }

        return null;
    }

    /**
     * 获取文件的命名空间
     */
    private getFileNamespace(filePath: string): string | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const namespaceMatch = content.match(/^\s*namespace\s+([\w\\]+);/m);
            return namespaceMatch ? namespaceMatch[1] : null;
        } catch (error) {
            return null;
        }
    }

    /**
     * 从文档获取类名
     */
    private getClassNameFromDocument(document: vscode.TextDocument): string {
        const content = document.getText();
        const classMatch = content.match(/^\s*class\s+(\w+)/m);
        return classMatch ? classMatch[1] : path.parse(document.fileName).name;
    }
    
    /**
     * 获取相对于工作区的路径
     */
    private getRelativePath(fullPath: string): string {
        return path.relative(this.workspaceRoot, fullPath);
    }

    private isRouteFile(filePath: string): boolean {
        return filePath.includes('/routes/') && filePath.endsWith('.php');
    }

    private isControllerFile(filePath: string): boolean {
        return filePath.includes('Controller') && filePath.endsWith('.php');
    }
    
    private isCommandFile(filePath: string): boolean {
        return filePath.includes('/Console/Commands/') && filePath.endsWith('.php');
    }
    
    private isConsoleKernelFile(filePath: string): boolean {
        return filePath.includes('/Console/Kernel.php') && filePath.endsWith('.php');
    }
    
    private isConfigFile(filePath: string): boolean {
        return filePath.includes('/config/') && filePath.endsWith('.php');
    }

    /**
     * 从配置文件跳转到引用处 - 实时查找版本
     */
    private async jumpFromConfig(document: vscode.TextDocument, position: vscode.Position): Promise<vscode.Location[] | null> {
        const fileName = path.basename(document.fileName, '.php');
        const line = document.lineAt(position.line);
        
        // 解析当前点击的配置项信息
        const configInfo = this.parseConfigAtPosition(line.text, position.character, fileName);
        if (!configInfo) {
            this.log('⚠️ 未能解析配置项信息');
            return null;
        }
        
        this.log('🔍 配置文件跳转分析（实时模式）', {
            configKey: configInfo.configKey,
            fileName: fileName,
            line: position.line + 1
        });
        
        // 从缓存中获取包含该配置键的文件列表
        const cache = this.cacheManager.getCache();
        const configReferences = LaravelConfigParser.findConfigReferences(cache.configReferences, configInfo.configKey);
        
        if (configReferences.length > 0) {
            const locations: vscode.Location[] = [];
            
            // 对每个引用文件进行实时查找
            for (const ref of configReferences) {
                this.log('🔄 实时搜索文件', { 
                    file: path.basename(ref.file),
                    configKey: configInfo.configKey 
                });
                
                // 实时查找该配置键在文件中的所有位置
                const fileLocations = LaravelConfigParser.findConfigReferencesInFile(ref.file, configInfo.configKey);
                
                // 转换为VS Code Location对象
                for (const loc of fileLocations) {
                    const location = new vscode.Location(
                        vscode.Uri.file(ref.file),
                        this.createFullLineSelection(ref.file, loc.line)
                    );
                    locations.push(location);
                }
                
                this.log('📍 文件中找到引用位置', {
                    file: path.basename(ref.file),
                    locationCount: fileLocations.length,
                    lines: fileLocations.map(loc => loc.line + 1)
                });
            }
            
            this.log('🎉 配置跳转成功（实时模式）', {
                configKey: configInfo.configKey,
                fileCount: configReferences.length,
                totalLocationCount: locations.length
            });
            
            return locations.length > 0 ? locations : null;
        } else {
            this.log('❌ 配置跳转失败 - 未找到引用文件', {
                configKey: configInfo.configKey,
                availableReferences: cache.configReferences.slice(0, 10).map(ref => ref.configKey)
            });
            return null;
        }
    }
    
    /**
     * 解析配置文件中的配置项位置信息
     */
    private parseConfigAtPosition(lineText: string, character: number, fileName: string): { configKey: string } | null {
        // 匹配配置项的键值对
        const keyValueMatch = this.matchConfigKeyValue(lineText);
        if (!keyValueMatch) {
            return null;
        }
        
        const { key, keyStart, keyEnd } = keyValueMatch;
        
        // 确认点击位置在键名上
        if (character >= keyStart && character <= keyEnd) {
            // 分析配置文件的嵌套结构，构建完整的配置键名
            const nestedPath = this.analyzeNestedConfigPath(vscode.window.activeTextEditor!.document, vscode.window.activeTextEditor!.selection.active.line, key);
            const configKey = `${fileName}.${nestedPath}`;
            return { configKey };
        }
        
        return null;
    }
    
    /**
     * 分析配置文件的嵌套结构，构建完整的配置路径
     */
    private analyzeNestedConfigPath(document: vscode.TextDocument, currentLine: number, currentKey: string): string {
        const pathParts: string[] = [];
        let indentLevel = this.getLineIndentLevel(document.lineAt(currentLine).text);
        
        // 向上扫描，找到所有父级配置键
        for (let line = currentLine - 1; line >= 0; line--) {
            const lineText = document.lineAt(line).text.trim();
            const lineIndent = this.getLineIndentLevel(document.lineAt(line).text);
            
            // 如果遇到缩进更小的行，可能是父级配置
            if (lineIndent < indentLevel && lineText.includes('=>')) {
                const keyMatch = lineText.match(/['"]([^'"]+)['"](?:\s*=>)/);
                if (keyMatch) {
                    pathParts.unshift(keyMatch[1]);
                    indentLevel = lineIndent;
                }
            }
            
            // 如果到达顶层数组定义，停止扫描
            if (lineIndent === 0 && (lineText.includes('return [') || lineText.includes('= ['))) {
                break;
            }
        }
        
        // 添加当前键
        pathParts.push(currentKey);
        
        return pathParts.join('.');
    }
    
    /**
     * 获取行的缩进级别
     */
    private getLineIndentLevel(line: string): number {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
    }
    
    /**
     * 匹配配置文件中的键值对
     */
    private matchConfigKeyValue(line: string): { 
        key: string, 
        keyStart: number, 
        keyEnd: number 
    } | null {
        // 匹配键值对的各种格式
        const patterns = [
            // 'key' => 'value'
            /'([^']+)'\s*=>\s*(.+)/,
            // "key" => "value"  
            /"([^"]+)"\s*=>\s*(.+)/
        ];
        
        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                const key = match[1];
                
                // 查找键在行中的位置
                const keyStart = line.indexOf(`'${key}'`) !== -1 ? 
                    line.indexOf(`'${key}'`) + 1 : 
                    line.indexOf(`"${key}"`) + 1;
                const keyEnd = keyStart + key.length;
                
                return { key, keyStart, keyEnd };
            }
        }
        
        return null;
    }
}
