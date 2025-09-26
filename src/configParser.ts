/**
 * Laravel IDE扩展 - 配置文件解析模块
 * 
 * 负责解析Laravel配置文件和查找配置引用，包括：
 * - 解析 config/*.php 文件结构
 * - 提取配置项和位置信息
 * - 查找项目中的 config() 函数调用
 * - 建立配置项到引用的映射关系
 * 
 * @author lijie
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ConfigItem, ConfigReference, ConfigDefinition } from './types';

export class LaravelConfigParser {
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
                this.outputChannel.appendLine(`[${timestamp}] [Config] ${message}: ${JSON.stringify(data)}`);
            } else {
                this.outputChannel.appendLine(`[${timestamp}] [Config] ${message}`);
            }
        }
    }
    
    /**
     * 解析指定配置文件中的所有配置项
     */
    static parseConfigFile(filePath: string): ConfigItem[] {
        const configItems: ConfigItem[] = [];
        
        try {
            if (!fs.existsSync(filePath)) {
                this.log('⚠️ 配置文件不存在', { filePath: path.basename(filePath) });
                return configItems;
            }
            
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const fileName = path.basename(filePath, '.php');
            
            // 递归解析配置项
            this.parseArrayContent(lines, fileName, '', configItems, filePath, 0, lines.length - 1);
            
        } catch (error) {
            this.log('❌ 配置文件解析失败', { 
                file: path.basename(filePath), 
                error: String(error) 
            });
        }
        
        return configItems;
    }
    
    /**
     * 递归解析数组内容
     */
    private static parseArrayContent(
        lines: string[], 
        fileName: string, 
        keyPrefix: string, 
        configItems: ConfigItem[], 
        filePath: string,
        startLine: number,
        endLine: number
    ): void {
        let bracketLevel = 0;
        let inString = false;
        let stringChar = '';
        let currentKey = '';
        let currentKeyLine = -1;
        let currentKeyColumn = -1;
        
        for (let i = startLine; i <= endLine; i++) {
            const line = lines[i];
            const trimmedLine = line.trim();
            
            // 跳过注释和空行
            if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || 
                trimmedLine.startsWith('/*') || trimmedLine === '' || 
                trimmedLine === 'return [' || trimmedLine === '];') {
                continue;
            }
            
            // 查找键值对
            const keyValueMatch = this.matchKeyValue(line);
            if (keyValueMatch) {
                const { key, value, keyStart, keyEnd, valueStart } = keyValueMatch;
                const fullKey = keyPrefix ? `${keyPrefix}.${key}` : key;
                
                // 创建配置项
                const configItem: ConfigItem = {
                    key: fullKey,
                    fileName: fileName,
                    value: value,
                    file: filePath,
                    line: i,
                    keyStart: keyStart,
                    keyEnd: keyEnd,
                    valueStart: valueStart
                };
                
                configItems.push(configItem);
                
                // 如果值是数组，递归解析
                if (value.trim() === '[' || value.includes('[')) {
                    this.parseNestedArray(lines, fileName, fullKey, configItems, filePath, i + 1, endLine);
                }
            }
        }
    }
    
    /**
     * 解析嵌套数组
     */
    private static parseNestedArray(
        lines: string[], 
        fileName: string, 
        parentKey: string, 
        configItems: ConfigItem[], 
        filePath: string,
        startLine: number,
        endLine: number
    ): void {
        let bracketLevel = 0;
        let arrayEndLine = startLine;
        
        // 找到数组结束位置
        for (let i = startLine; i <= endLine; i++) {
            const line = lines[i];
            for (let j = 0; j < line.length; j++) {
                const char = line[j];
                if (char === '[') {
                    bracketLevel++;
                } else if (char === ']') {
                    bracketLevel--;
                    if (bracketLevel === 0) {
                        arrayEndLine = i;
                        break;
                    }
                }
            }
            if (bracketLevel === 0) break;
        }
        
        // 递归解析数组内容
        this.parseArrayContent(lines, fileName, parentKey, configItems, filePath, startLine, arrayEndLine);
    }
    
    /**
     * 匹配键值对
     */
    private static matchKeyValue(line: string): { 
        key: string, 
        value: string, 
        keyStart: number, 
        keyEnd: number, 
        valueStart: number 
    } | null {
        // 匹配键值对的各种格式
        const patterns = [
            // 'key' => 'value'
            /'([^']+)'\s*=>\s*(.+)/,
            // "key" => "value"  
            /"([^"]+)"\s*=>\s*(.+)/,
            // 'key' => value
            /'([^']+)'\s*=>\s*([^,\]]+)/,
            // "key" => value
            /"([^"]+)"\s*=>\s*([^,\]]+)/
        ];
        
        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                const key = match[1];
                const value = match[2].replace(/,$/, '').trim(); // 移除末尾逗号
                
                // 查找键和值在行中的位置
                const keyStart = line.indexOf(`'${key}'`) !== -1 ? 
                    line.indexOf(`'${key}'`) + 1 : 
                    line.indexOf(`"${key}"`) + 1;
                const keyEnd = keyStart + key.length;
                const valueStart = line.indexOf('=>') + 2;
                
                return { key, value, keyStart, keyEnd, valueStart };
            }
        }
        
        return null;
    }
    
    /**
     * 扫描项目中的所有 config() 调用
     */
    static async scanConfigReferences(): Promise<ConfigReference[]> {
        const references: ConfigReference[] = [];
        
        try {
            const searchPatterns = [
                'app/**/*.php',
                'routes/**/*.php',
                'database/**/*.php'
            ];
            
            for (const pattern of searchPatterns) {
                const files = await vscode.workspace.findFiles(pattern, '**/vendor/**');
                
                for (const fileUri of files) {
                    const fileReferences = await this.scanFileForConfigReferences(fileUri.fsPath);
                    references.push(...fileReferences);
                }
            }
            
        } catch (error) {
            this.log('❌ config() 引用扫描失败', { 
                error: String(error) 
            });
        }
        
        return references;
    }
    
    /**
     * 扫描单个文件中的 config() 引用
     * 新策略：只缓存配置键和文件路径，不缓存具体位置
     */
    private static async scanFileForConfigReferences(filePath: string): Promise<ConfigReference[]> {
        const references: ConfigReference[] = [];
        const uniqueKeys = new Set<string>();  // 避免同文件中重复的配置键
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // 跳过注释行
                if (this.isCommentedLine(line)) {
                    continue;
                }
                
                // 查找 config() 调用，但只提取配置键
                const configCalls = this.findConfigCalls(line, i);
                for (const call of configCalls) {
                    if (!uniqueKeys.has(call.configKey)) {
                        uniqueKeys.add(call.configKey);
                        references.push({
                            configKey: call.configKey,
                            file: filePath
                        });
                    }
                }
            }
            
        } catch (error) {
            // 忽略文件读取错误
        }
        
        return references;
    }
    
    /**
     * 在行中查找 config() 调用 - 简化版本，只返回配置键
     */
    private static findConfigCalls(line: string, lineNumber: number): { configKey: string }[] {
        const calls: { configKey: string }[] = [];
        
        // 匹配各种 config() 调用格式
        const patterns = [
            // config('app.name')
            /config\s*\(\s*['"]([\w\.\-_]+)['"]\s*\)/g,
            // config("app.name")
            /config\s*\(\s*['"]([\w\.\-_]+)['"]\s*\)/g,
            // config('app.name', 'default')
            /config\s*\(\s*['"]([\w\.\-_]+)['"]\s*,\s*[^)]+\)/g
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(line)) !== null) {
                const configKey = match[1];
                calls.push({ configKey });
            }
        }
        
        return calls;
    }
    
    /**
     * 解析配置键在指定位置的信息 - 实时解析版本
     */
    static parseConfigAtPosition(lineText: string, character: number): { configKey: string } | null {
        // 实时匹配各种 config() 调用格式
        const patterns = [
            /config\s*\(\s*['"]([\w\.\-_]+)['"]\s*\)/g,
            /config\s*\(\s*['"]([\w\.\-_]+)['"]\s*,\s*[^)]+\)/g
        ];
        
        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(lineText)) !== null) {
                const configKey = match[1];
                const matchStart = match.index;
                const keyStart = lineText.indexOf(configKey, matchStart);
                const keyEnd = keyStart + configKey.length;
                
                if (character >= keyStart && character <= keyEnd) {
                    return { configKey };
                }
            }
        }
        
        return null;
    }
    
    /**
     * 在指定文件中实时查找配置引用的所有位置
     * 这是实现实时跳转的核心方法
     */
    static findConfigReferencesInFile(filePath: string, configKey: string): { line: number; keyStart: number; keyEnd: number }[] {
        const locations: { line: number; keyStart: number; keyEnd: number }[] = [];
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            // 构建匹配该配置键的正则表达式
            const escapedKey = configKey.replace(/\./g, '\\.');
            const patterns = [
                new RegExp(`config\\s*\\(\\s*['"]${escapedKey}['"]\\s*\\)`, 'g'),
                new RegExp(`config\\s*\\(\\s*['"]${escapedKey}['"]\\s*,\\s*[^)]+\\)`, 'g')
            ];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // 跳过注释行 - 检查行是否被注释
                if (this.isCommentedLine(line)) {
                    continue;
                }
                
                for (const pattern of patterns) {
                    let match;
                    // 重置 lastIndex 以便重复使用全局正则
                    pattern.lastIndex = 0;
                    
                    while ((match = pattern.exec(line)) !== null) {
                        const keyStart = line.indexOf(configKey, match.index);
                        const keyEnd = keyStart + configKey.length;
                        
                        locations.push({
                            line: i,
                            keyStart: keyStart,
                            keyEnd: keyEnd
                        });
                    }
                }
            }
            
        } catch (error) {
            // 忽略文件读取错误
        }
        
        return locations;
    }
    
    /**
     * 检查行是否被注释
     * 支持多种注释格式：//、/*、*、#等
     */
    private static isCommentedLine(line: string): boolean {
        const trimmed = line.trim();
        
        // 空行不算注释
        if (!trimmed) {
            return false;
        }
        
        // 单行注释：// 或 #
        if (trimmed.startsWith('//') || trimmed.startsWith('#')) {
            return true;
        }
        
        // 多行注释开始：/*
        if (trimmed.startsWith('/*')) {
            return true;
        }
        
        // 多行注释中间或结尾：* 或 */
        if (trimmed.startsWith('*')) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 发现所有配置文件
     */
    static async discoverConfigFiles(): Promise<string[]> {
        const configFiles: string[] = [];
        const configDir = path.join(this.workspaceRoot, 'config');
        
        if (!fs.existsSync(configDir)) {
            this.log('⚠️ config目录不存在', { dir: configDir });
            return configFiles;
        }
        
        try {
            const files = fs.readdirSync(configDir);
            for (const file of files) {
                if (file.endsWith('.php')) {
                    configFiles.push(path.join(configDir, file));
                }
            }
            
            this.log('📁 发现配置文件', { 
                count: configFiles.length, 
                files: configFiles.map(f => path.basename(f)) 
            });
            
        } catch (error) {
            this.log('❌ 配置文件发现失败', { error: String(error) });
        }
        
        return configFiles;
    }
    
    /**
     * 根据配置键查找对应的定义
     */
    static findConfigDefinition(configItems: ConfigItem[], configKey: string): ConfigDefinition | null {
        // 直接匹配
        for (const item of configItems) {
            if (item.key === configKey) {
                return {
                    configKey: item.key,
                    fileName: item.fileName,
                    file: item.file,
                    line: item.line,
                    keyStart: item.keyStart,
                    keyEnd: item.keyEnd
                };
            }
        }
        
        // 如果没有直接匹配，尝试匹配部分键
        // 例如：config('app.doudian.settle_start_time') 匹配 'settle_start_time'
        const keyParts = configKey.split('.');
        if (keyParts.length > 1) {
            const fileName = keyParts[0];
            const remainingKey = keyParts.slice(1).join('.');
            
            for (const item of configItems) {
                if (item.fileName === fileName && item.key.endsWith(remainingKey)) {
                    return {
                        configKey: item.key,
                        fileName: item.fileName,
                        file: item.file,
                        line: item.line,
                        keyStart: item.keyStart,
                        keyEnd: item.keyEnd
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * 查找配置项的所有引用
     */
    static findConfigReferences(references: ConfigReference[], configKey: string): ConfigReference[] {
        return references.filter(ref => {
            // 精确匹配或部分匹配
            return ref.configKey === configKey || ref.configKey.includes(configKey);
        });
    }
}
