/**
 * Laravel IDE扩展 - 路由解析模块
 * 
 * 负责解析Laravel路由文件，支持：
 * - 嵌套路由组命名空间解析
 * - 路由定义提取和匹配
 * - 控制器和方法信息解析
 * - 智能命名空间栈管理
 * 
 * @author lijie
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { ParsedRoute } from './types';

export class LaravelRouteParser {
    private static outputChannel: vscode.OutputChannel;
    
    static setOutputChannel(channel: vscode.OutputChannel): void {
        this.outputChannel = channel;
    }

    private static log(message: string, data?: any): void {
        if (this.outputChannel) {
            const timestamp = new Date().toISOString().substring(11, 19);
            if (data) {
                this.outputChannel.appendLine(`[${timestamp}] [Route] ${message}: ${JSON.stringify(data)}`);
            } else {
                this.outputChannel.appendLine(`[${timestamp}] [Route] ${message}`);
            }
        }
    }

    /**
     * 解析单个路由文件
     */
    static parseRouteFile(filePath: string): ParsedRoute[] {
        const fileName = path.basename(filePath);
        const startTime = Date.now();
        
        this.log(`🚀 开始解析路由文件`, { file: fileName });
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            const routes: ParsedRoute[] = [];
            
            // 命名空间栈：管理嵌套的路由组
            const namespaceStack: string[] = [];
            const indentLevelStack: number[] = []; // 跟踪每个路由组的缩进级别
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();
                
                if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) {
                    continue;
                }
                
                // 计算当前行的缩进级别
                const indentLevel = line.length - line.trimLeft().length;
                
                // 检测路由组开始
                if (this.isRouteGroupStart(trimmed)) {
                    const isIndependentRouteGroup = trimmed.includes('Route::group(');
                    
                    // 智能栈管理：Route::group是顶级路由组，$api->group是嵌套路由组
                    if (isIndependentRouteGroup) {
                        // Route::group表示新的顶级路由组，清空之前的栈
                        if (namespaceStack.length > 0) {
                        this.log(`🔄 重置命名空间栈`, { line: i + 1 });
                        }
                        namespaceStack.length = 0;
                        indentLevelStack.length = 0;
                    }
                    
                    // 路由组是多行格式，需要往下几行寻找namespace
                    const namespace = this.extractNamespaceFromGroup(lines, i);
                    if (namespace) {
                        namespaceStack.push(namespace);
                        indentLevelStack.push(indentLevel);
                        this.log(`📦 推入命名空间: ${namespace}`, { line: i + 1 });
                    }
                }
                
                // 检测路由组结束 - 基于缩进级别的精确匹配
                if (trimmed === '});' || trimmed.startsWith('});')) {
                    // 只有当前缩进级别匹配栈顶路由组的缩进级别时，才认为是对应的结束
                    if (namespaceStack.length > 0 && indentLevelStack.length > 0) {
                        const expectedIndentLevel = indentLevelStack[indentLevelStack.length - 1];
                        
                        if (indentLevel === expectedIndentLevel) {
                            const poppedNamespace = namespaceStack.pop();
                            const poppedIndentLevel = indentLevelStack.pop();
                            this.log(`📤 弹出命名空间: ${poppedNamespace}`, { line: i + 1 });
                        }
                    } else if (namespaceStack.length > 0) {
                        this.log(`⚠️ 栈状态异常`, {
                            file: fileName,
                            line: i + 1,
                            namespaceStackLength: namespaceStack.length,
                            indentStackLength: indentLevelStack.length,
                            indentLevel: indentLevel
                        });
                    }
                }
                
                // 解析路由定义
                const routeMatch = this.extractRoute(line);
                if (routeMatch) {
                    const currentNamespace = this.buildNamespace(namespaceStack);
                    
                    
                    const route: ParsedRoute = {
                        method: routeMatch.method.toUpperCase(),
                        path: routeMatch.path,
                        controller: routeMatch.controller.replace(/Controller$/, ''),
                        action: routeMatch.action,
                        namespace: currentNamespace,
                        file: filePath,
                        line: i,
                        column: routeMatch.column
                    };
                    
                    routes.push(route);
                }
            }
            
            const duration = Date.now() - startTime;
            this.log(`🎉 文件解析完成`, {
                file: fileName,
                routeCount: routes.length,
                duration: `${duration}ms`
            });
            
            return routes;
            
        } catch (error) {
            this.log(`❌ 解析失败`, { file: fileName, error: String(error) });
            return [];
        }
    }

    /**
     * 检测是否是路由组开始
     */
    private static isRouteGroupStart(line: string): boolean {
        const patterns = [
            'Route::group(',
            '$api->group('
        ];
        
        return patterns.some(pattern => line.includes(pattern));
    }
    
    /**
     * 检测是否是路由组结束
     */
    private static isRouteGroupEnd(line: string): boolean {
        // 更宽松的路由组结束检测，支持各种格式
        const endPatterns = [
            /^\s*\}\s*\)\s*;\s*$/,  // }); 允许空格
            /^\s*\}\s*\)\s*->\s*\w+\([^)]*\)\s*;\s*$/,  // })->withoutMiddleware(...);
            /^\s*\}\s*\)\s*;\s*\/\/.*$/,  // }); // 注释
            /^\s*\}\s*\)\s*->\s*middleware\([^)]*\)\s*;\s*$/,  // })->middleware(...);
            /^\s*\}\s*\)\s*;\s*\/\*.*\*\/\s*$/  // }); /* 注释 */
        ];
        
        return endPatterns.some(pattern => pattern.test(line));
    }
    
    /**
     * 从路由组中提取命名空间（支持多行格式）
     */
    private static extractNamespaceFromGroup(lines: string[], startIndex: number): string | null {
        // 从路由组开始行往下最多搜索15行
        const maxLines = Math.min(startIndex + 15, lines.length);
        
        
        for (let i = startIndex; i < maxLines; i++) {
            const line = lines[i];
            
            // 遇到路由组结束，停止搜索
            if (line.includes('], function(') || line.includes('],function(') || 
                line.includes('}, function(') || line.includes('},function(')) {
                break;
            }
            
            // 多种命名空间匹配模式 - 更宽松的格式支持
            const patterns = [
                /'namespace'\s*=>\s*['"`]([^'"`]+)['"`]/,  // 'namespace' => 'Value'
                /"namespace"\s*=>\s*['"`]([^'"`]+)['"`]/,  // "namespace" => "Value"
                /namespace\s*=>\s*['"`]([^'"`]+)['"`]/,    // namespace => 'Value' (无引号键)
                /\[\s*['"`]?namespace['"`]?\s*=>\s*['"`]([^'"`]+)['"`]/,  // 数组格式
                /'namespace'\s*=>\s*([^,\]\}\s'"]+)/,      // 无引号值
                /"namespace"\s*=>\s*([^,\]\}\s'"]+)/       // 无引号值
            ];
            
            for (const pattern of patterns) {
                const match = line.match(pattern);
                if (match) {
                    let namespace = match[1];
                    const originalNamespace = namespace;
                    
                    // 清理前导反斜杠，但保留绝对命名空间的标识
                    if (namespace.startsWith('\\')) {
                        // 以\开头的是绝对命名空间，移除前导反斜杠但保留完整路径
                        namespace = namespace.substring(1);
                    }
                    
                    
                    return namespace;
                }
            }
        }
        
        
        return null;
    }
    
    /**
     * 提取路由信息
     */
    private static extractRoute(line: string): {
        method: string;
        path: string;
        controller: string;
        action: string;
        column: number;
    } | null {
        // 支持两种路由定义方式 - 更宽松的格式
        const patterns = [
            // $api->方法 - 支持各种空格组合
            /\$api\s*->\s*(get|post|put|delete|patch|options|any|match)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/,
            // Route::方法 - 支持各种空格组合  
            /Route\s*::\s*(get|post|put|delete|patch|options|any|match)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/,
            // 支持数组参数的match方法
            /\$api\s*->\s*match\s*\(\s*\[.*?\]\s*,\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/,
            /Route\s*::\s*match\s*\(\s*\[.*?\]\s*,\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/
        ];
        
        for (const pattern of patterns) {
            const match = line.match(pattern);
            if (match) {
                // match方法的特殊处理
                if (match[1] === 'match' && match.length === 5) {
                    return {
                        method: 'match',
                        path: match[2],
                        controller: match[3],
                        action: match[4],
                        column: line.indexOf(match[0])
                    };
                } else if (match.length >= 5) {
                    return {
                        method: match[1],
                        path: match[2],
                        controller: match[3],
                        action: match[4],
                        column: line.indexOf(match[0])
                    };
                }
            }
        }
        
        return null;
    }
    
    /**
     * 构建完整命名空间
     */
    private static buildNamespace(namespaceStack: string[]): string {
        if (namespaceStack.length === 0) {
            return '';
        }
        
        let result = '';
        
        for (let i = 0; i < namespaceStack.length; i++) {
            const ns = namespaceStack[i];
            if (!ns) continue;
            
            // 清理命名空间：统一使用反斜杠
            let cleanNs = ns.replace(/\/+/g, '\\');
            
            // 判断是否是绝对命名空间（以App开头或以反斜杠开头）
            if (cleanNs.startsWith('App\\') || cleanNs === 'App') {
                // 绝对命名空间，重置为当前命名空间
                result = cleanNs;
            } else if (result) {
                // 相对命名空间，拼接到现有命名空间
                if (!result.endsWith('\\')) {
                    result += '\\';
                }
                result += cleanNs;
            } else {
                // 第一个命名空间且为相对命名空间，添加App前缀
                result = 'App\\' + cleanNs;
            }
        }
        
        // 清理多余的反斜杠
        result = result.replace(/\\+/g, '\\');
        
        return result;
    }
}
