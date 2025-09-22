/**
 * Laravel IDE扩展 - 中间件解析模块
 * 
 * 负责解析Laravel路由文件中的中间件，支持：
 * - 路由组配置中间件：'middleware' => [...]
 * - 链式调用中间件：->middleware([...])
 * - 排除中间件：->withoutMiddleware([...])
 * - 带参数中间件智能解析：throttle:200,1,user_id
 * 
 * @author lijie
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ParsedMiddleware, MiddlewareDefinition } from './types';

export class LaravelMiddlewareParser {
    private static outputChannel: vscode.OutputChannel;
    
    static setOutputChannel(channel: vscode.OutputChannel): void {
        this.outputChannel = channel;
    }

    private static log(message: string, data?: any): void {
        if (this.outputChannel) {
            const timestamp = new Date().toISOString().substring(11, 19);
            if (data) {
                this.outputChannel.appendLine(`[${timestamp}] [Middleware] ${message}: ${JSON.stringify(data)}`);
            } else {
                this.outputChannel.appendLine(`[${timestamp}] [Middleware] ${message}`);
            }
        }
    }

    /**
     * 解析路由文件中的所有中间件
     */
    static parseMiddlewareFromFile(filePath: string): ParsedMiddleware[] {
        const fileName = path.basename(filePath);
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const middlewares: ParsedMiddleware[] = [];
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const lineMiddlewares = this.extractMiddlewareFromLine(line, i, filePath);
                middlewares.push(...lineMiddlewares);
            }
            
            
            return middlewares;
            
        } catch (error) {
            this.log(`❌ 中间件解析失败`, { file: fileName, error: String(error) });
            return [];
        }
    }

    /**
     * 从一行中提取所有中间件信息
     */
    private static extractMiddlewareFromLine(lineText: string, lineNumber: number, filePath: string): ParsedMiddleware[] {
        const middlewares: ParsedMiddleware[] = [];
        
        // 1. 路由组配置中的中间件：'middleware' => ...
        const groupMiddlewares = this.extractGroupMiddleware(lineText, lineNumber, filePath);
        middlewares.push(...groupMiddlewares);
        
        // 2. 链式调用中间件：->middleware(...)
        const chainMiddlewares = this.extractChainMiddleware(lineText, lineNumber, filePath);
        middlewares.push(...chainMiddlewares);
        
        // 3. withoutMiddleware：->withoutMiddleware(...)
        const withoutMiddlewares = this.extractWithoutMiddleware(lineText, lineNumber, filePath);
        middlewares.push(...withoutMiddlewares);
        
        return middlewares;
    }

    /**
     * 提取路由组配置中的中间件：'middleware' => ...
     */
    private static extractGroupMiddleware(lineText: string, lineNumber: number, filePath: string): ParsedMiddleware[] {
        const middlewares: ParsedMiddleware[] = [];
        
        // 匹配各种中间件配置格式
        const patterns = [
            // 单个中间件：'middleware' => 'checkSign'
            /'middleware'\s*=>\s*['"`]([^'"`]+)['"`]/g,
            /"middleware"\s*=>\s*['"`]([^'"`]+)['"`]/g,
            // 数组中间件：'middleware' => ['checkSign', 'throttle:200,1']
            /'middleware'\s*=>\s*\[([^\]]+)\]/g,
            /"middleware"\s*=>\s*\[([^\]]+)\]/g
        ];
        
        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0; // 重置正则状态
            
            while ((match = pattern.exec(lineText)) !== null) {
                const fullMatch = match[0];
                const middlewareContent = match[1];
                const matchStart = match.index;
                
                if (fullMatch.includes('[')) {
                    // 数组格式：解析每个中间件
                    const arrayMiddlewares = this.parseMiddlewareArray(
                        middlewareContent, matchStart, lineText, lineNumber, filePath, 'group'
                    );
                    middlewares.push(...arrayMiddlewares);
                } else {
                    // 单个中间件
                    const cleanName = this.extractMiddlewareName(middlewareContent);
                    const nameStart = lineText.indexOf(middlewareContent, matchStart);
                    
                    if (nameStart !== -1) {
                        middlewares.push({
                            name: cleanName,
                            fullName: middlewareContent,
                            type: 'group',
                            file: filePath,
                            line: lineNumber,
                            startPos: nameStart,
                            endPos: nameStart + middlewareContent.length
                        });
                    }
                }
            }
        }
        
        return middlewares;
    }

    /**
     * 提取链式调用中间件：->middleware(...)
     */
    private static extractChainMiddleware(lineText: string, lineNumber: number, filePath: string): ParsedMiddleware[] {
        const middlewares: ParsedMiddleware[] = [];
        
        const patterns = [
            // ->middleware(['auth', 'throttle'])
            /->middleware\s*\(\s*\[([^\]]+)\]/g,
            // ->middleware('auth')
            /->middleware\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g
        ];
        
        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(lineText)) !== null) {
                const middlewareContent = match[1];
                const matchStart = match.index;
                
                if (match[0].includes('[')) {
                    // 数组格式
                    const arrayMiddlewares = this.parseMiddlewareArray(
                        middlewareContent, matchStart, lineText, lineNumber, filePath, 'chain'
                    );
                    middlewares.push(...arrayMiddlewares);
                } else {
                    // 单个中间件
                    const cleanName = this.extractMiddlewareName(middlewareContent);
                    const nameStart = lineText.indexOf(middlewareContent, matchStart);
                    
                    if (nameStart !== -1) {
                        middlewares.push({
                            name: cleanName,
                            fullName: middlewareContent,
                            type: 'chain',
                            file: filePath,
                            line: lineNumber,
                            startPos: nameStart,
                            endPos: nameStart + middlewareContent.length
                        });
                    }
                }
            }
        }
        
        return middlewares;
    }

    /**
     * 提取withoutMiddleware：->withoutMiddleware(...)
     */
    private static extractWithoutMiddleware(lineText: string, lineNumber: number, filePath: string): ParsedMiddleware[] {
        const middlewares: ParsedMiddleware[] = [];
        
        const patterns = [
            // ->withoutMiddleware(['throttle', 'auth'])
            /->\s*withoutMiddleware\s*\(\s*\[([^\]]+)\]/g,
            // ->withoutMiddleware('throttle')
            /->\s*withoutMiddleware\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            // ->withoutMiddleware('*')
            /->\s*withoutMiddleware\s*\(\s*['"`]\*['"`]\s*\)/g
        ];
        
        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(lineText)) !== null) {
                const middlewareContent = match[1];
                const matchStart = match.index;
                
                if (match[0].includes('*')) {
                    // 特殊情况：withoutMiddleware('*')
                    const nameStart = lineText.indexOf(`'*'`, matchStart) + 1;
                    middlewares.push({
                        name: '*',
                        fullName: '*',
                        type: 'without',
                        file: filePath,
                        line: lineNumber,
                        startPos: nameStart,
                        endPos: nameStart + 1
                    });
                } else if (match[0].includes('[')) {
                    // 数组格式
                    const arrayMiddlewares = this.parseMiddlewareArray(
                        middlewareContent, matchStart, lineText, lineNumber, filePath, 'without'
                    );
                    middlewares.push(...arrayMiddlewares);
                } else {
                    // 单个中间件
                    const cleanName = this.extractMiddlewareName(middlewareContent);
                    const nameStart = lineText.indexOf(`'${middlewareContent}'`, matchStart);
                    const nameStartAlt = nameStart === -1 ? lineText.indexOf(`"${middlewareContent}"`, matchStart) : nameStart;
                    const actualStart = nameStartAlt === -1 ? nameStart : nameStartAlt;
                    
                    if (actualStart !== -1) {
                        middlewares.push({
                            name: cleanName,
                            fullName: middlewareContent,
                            type: 'without',
                            file: filePath,
                            line: lineNumber,
                            startPos: actualStart + 1, // +1 to skip quote
                            endPos: actualStart + 1 + middlewareContent.length
                        });
                    }
                }
            }
        }
        
        return middlewares;
    }

    /**
     * 解析中间件数组格式
     */
    private static parseMiddlewareArray(
        arrayContent: string, 
        baseIndex: number, 
        fullLine: string, 
        lineNumber: number, 
        filePath: string, 
        type: 'group' | 'chain' | 'without'
    ): ParsedMiddleware[] {
        const middlewares: ParsedMiddleware[] = [];
        
        // 更智能的中间件分割：考虑引号内的逗号
        const middlewareStrings = this.smartSplitMiddlewares(arrayContent);
        
        for (const middlewareStr of middlewareStrings) {
            // 清理引号
            const cleanStr = middlewareStr.replace(/^['"`]|['"`]$/g, '').trim();
            if (!cleanStr) continue;
            
            const middlewareName = this.extractMiddlewareName(cleanStr);
            const nameStart = fullLine.indexOf(`'${cleanStr}'`, baseIndex);
            const nameStartAlt = nameStart === -1 ? fullLine.indexOf(`"${cleanStr}"`, baseIndex) : nameStart;
            const actualStart = nameStartAlt === -1 ? nameStart : nameStartAlt;
            
            if (actualStart !== -1) {
                middlewares.push({
                    name: middlewareName,
                    fullName: cleanStr,
                    type: type,
                    file: filePath,
                    line: lineNumber,
                    startPos: actualStart + 1, // +1 to skip quote
                    endPos: actualStart + 1 + cleanStr.length
                });
            }
        }
        
        return middlewares;
    }

    /**
     * 智能分割中间件字符串，考虑引号内的逗号
     */
    private static smartSplitMiddlewares(arrayContent: string): string[] {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        let quoteChar = '';
        
        for (let i = 0; i < arrayContent.length; i++) {
            const char = arrayContent[i];
            
            if ((char === '"' || char === "'" || char === '`') && !inQuotes) {
                inQuotes = true;
                quoteChar = char;
                current += char;
            } else if (char === quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = '';
                current += char;
            } else if (char === ',' && !inQuotes) {
                if (current.trim()) {
                    result.push(current.trim());
                }
                current = '';
            } else {
                current += char;
            }
        }
        
        if (current.trim()) {
            result.push(current.trim());
        }
        
        return result;
    }

    /**
     * 从完整中间件名称中提取纯中间件名（去掉参数）
     */
    private static extractMiddlewareName(fullMiddlewareName: string): string {
        // 处理带参数的中间件：throttle:200,1,user_id => throttle
        const colonIndex = fullMiddlewareName.indexOf(':');
        return colonIndex !== -1 ? fullMiddlewareName.substring(0, colonIndex) : fullMiddlewareName;
    }

    /**
     * 解析路由位置的中间件信息
     */
    static parseMiddlewareAtPosition(lineText: string, character: number): ParsedMiddleware | null {
        const lineMiddlewares = this.extractMiddlewareFromLine(lineText, 0, '');
        
        // 找到光标位置对应的中间件
        for (const middleware of lineMiddlewares) {
            if (character >= middleware.startPos && character <= middleware.endPos) {
                this.log(`🎯 检测到中间件: ${middleware.name}`);
                return middleware;
            }
        }
        
        return null;
    }
}

export class LaravelKernelParser {
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
                this.outputChannel.appendLine(`[${timestamp}] [Kernel] ${message}: ${JSON.stringify(data)}`);
            } else {
                this.outputChannel.appendLine(`[${timestamp}] [Kernel] ${message}`);
            }
        }
    }

    /**
     * 查找Kernel.php文件
     */
    static findKernelFile(): string | null {
        const possiblePaths = [
            path.join(this.workspaceRoot, 'app', 'Http', 'Kernel.php'),
            path.join(this.workspaceRoot, 'app', 'Console', 'Kernel.php')
        ];
        
        for (const kernelPath of possiblePaths) {
            if (fs.existsSync(kernelPath)) {
                this.log('🔍 找到Kernel文件', {
                    path: path.relative(this.workspaceRoot, kernelPath)
                });
                return kernelPath;
            }
        }
        
        this.log('❌ 未找到Kernel.php文件');
        return null;
    }

    /**
     * 解析Kernel.php中的中间件定义
     */
    static parseMiddlewareDefinitions(): Map<string, MiddlewareDefinition> {
        const definitions = new Map<string, MiddlewareDefinition>();
        const kernelPath = this.findKernelFile();
        
        if (!kernelPath) {
            return definitions;
        }

        try {
            const content = fs.readFileSync(kernelPath, 'utf8');
            const lines = content.split('\n');
            
            this.log('🔍 解析Kernel.php中间件定义');
            
            let inRouteMiddlewareArray = false;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                // 检测routeMiddleware数组开始
                if (trimmed.includes('routeMiddleware') && trimmed.includes('=')) {
                    inRouteMiddlewareArray = true;
                    continue;
                }
                
                // 如果在routeMiddleware数组中，解析中间件定义
                if (inRouteMiddlewareArray) {
                    // 检测数组结束
                    if ((trimmed.includes('];') || trimmed.includes('}')) && !trimmed.includes('=>')) {
                        break;
                    }
                    
                    // 解析中间件定义：'middlewareName' => MiddlewareClass::class
                    const middlewareMatch = line.match(/['"`]([^'"`]+)['"`]\s*=>\s*([^,]+)/);
                    if (middlewareMatch) {
                        const middlewareName = middlewareMatch[1];
                        const className = middlewareMatch[2].trim();
                        const nameStart = line.indexOf(middlewareName);
                        const nameEnd = nameStart + middlewareName.length;
                        
                        definitions.set(middlewareName, {
                            name: middlewareName,
                            className: className,
                            file: kernelPath,
                            line: i,
                            startPos: nameStart,
                            endPos: nameEnd
                        });
                        
                    }
                }
            }
            
            this.log('🎉 Kernel解析完成', {
                definitionCount: definitions.size
            });
            
        } catch (error) {
            this.log('❌ Kernel解析失败', {
                error: String(error),
                kernelPath: path.basename(kernelPath)
            });
        }

        return definitions;
    }

    /**
     * 根据中间件名称查找定义
     */
    static findMiddlewareDefinition(middlewareDefinitions: Map<string, MiddlewareDefinition>, middlewareName: string): MiddlewareDefinition | null {
        return middlewareDefinitions.get(middlewareName) || null;
    }
}
