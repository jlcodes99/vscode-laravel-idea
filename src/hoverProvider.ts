/**
 * Laravel IDE扩展 - 悬停预览提供者
 * 
 * 负责实现代码预览功能：
 * - 路由中悬停控制器名显示类定义预览
 * - 路由中悬停方法名显示方法定义预览
 * - 显示PHPDoc注释
 * 
 * @author lijie
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { CacheManager } from './cacheManager';

export class LaravelHoverProvider implements vscode.HoverProvider {
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
                this.outputChannel.appendLine(`[${timestamp}] [Hover] ${message}: ${JSON.stringify(data)}`);
            } else {
                this.outputChannel.appendLine(`[${timestamp}] [Hover] ${message}`);
            }
        }
    }

    async provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Hover | null> {
        // 只在路由文件中提供悬停预览
        if (!this.isRouteFile(document.fileName)) {
            return null;
        }

        const line = document.lineAt(position.line);
        const lineText = line.text;
        
        // 解析路由中的控制器和方法信息
        const routeInfo = this.parseRouteAtPosition(lineText, position.character);
        if (!routeInfo) {
            return null;
        }

        // 获取期望的命名空间
        const expectedNamespace = this.cacheManager.findExpectedNamespace(document.fileName, position.line);

        this.log('🔍 悬停预览分析', {
            controller: routeInfo.controller,
            action: routeInfo.action,
            type: routeInfo.type,
            expectedNamespace: expectedNamespace || 'null'
        });

        // 查找控制器文件
        const controllerFiles = await this.findControllerFiles(routeInfo.controller, expectedNamespace);
        if (controllerFiles.length === 0) {
            return null;
        }

        const filePath = controllerFiles[0]; // 使用第一个匹配的文件

        if (routeInfo.type === 'method' && routeInfo.action) {
            // 显示方法预览
            return this.createMethodHover(filePath, routeInfo.controller, routeInfo.action);
        } else if (routeInfo.type === 'controller') {
            // 显示类预览
            return this.createClassHover(filePath, routeInfo.controller);
        }

        return null;
    }

    /**
     * 创建类定义的悬停预览
     */
    private createClassHover(filePath: string, className: string): vscode.Hover | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            // 查找类定义
            let classLine = -1;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const classPattern = new RegExp(`^\\s*class\\s+(${className}Controller?)\\s*`);
                const match = line.match(classPattern);
                
                if (match) {
                    classLine = i;
                    break;
                }
            }
            
            if (classLine === -1) {
                return null;
            }
            
            // 只显示当前类定义行
            const codeLine = lines[classLine];
            
            // 使用原生代码块展示，保持语法高亮
            const markdown = new vscode.MarkdownString();
            markdown.appendCodeblock(codeLine, 'php');
            
            this.log('✅ 类预览生成成功', { className, filePath: path.basename(filePath) });
            
            return new vscode.Hover(markdown);
            
        } catch (error) {
            this.log('❌ 类预览生成失败', { error: String(error) });
            return null;
        }
    }

    /**
     * 创建方法定义的悬停预览
     */
    private createMethodHover(filePath: string, className: string, methodName: string): vscode.Hover | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            // 查找方法定义
            let methodLine = -1;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const methodPattern = new RegExp(`^\\s*(public|private|protected)?\\s*function\\s+(${methodName})\\s*\\(`);
                const match = line.match(methodPattern);
                
                if (match) {
                    methodLine = i;
                    break;
                }
            }
            
            if (methodLine === -1) {
                return null;
            }
            
            // 只显示当前方法定义行
            const codeLine = lines[methodLine];
            
            // 使用原生代码块展示，保持语法高亮
            const markdown = new vscode.MarkdownString();
            markdown.appendCodeblock(codeLine, 'php');
            
            this.log('✅ 方法预览生成成功', { 
                className, 
                methodName, 
                filePath: path.basename(filePath) 
            });
            
            return new vscode.Hover(markdown);
            
        } catch (error) {
            this.log('❌ 方法预览生成失败', { error: String(error) });
            return null;
        }
    }


    /**
     * 解析路由位置信息
     */
    private parseRouteAtPosition(lineText: string, character: number): {
        controller: string;
        action?: string;
        type: 'controller' | 'method';
    } | null {
        const patterns = [
            /\$api\s*->\s*(get|post|put|delete|patch|options|any|match)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/,
            /Route\s*::\s*(get|post|put|delete|patch|options|any|match)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/,
            /\$api\s*->\s*match\s*\(\s*\[.*?\]\s*,\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/,
            /Route\s*::\s*match\s*\(\s*\[.*?\]\s*,\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/
        ];

        for (const pattern of patterns) {
            const match = lineText.match(pattern);
            if (!match) continue;
            
            const fullMatch = match[0];
            let controller, action;
            
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
     * 查找控制器文件
     */
    private async findControllerFiles(controllerName: string, expectedNamespace?: string | null): Promise<string[]> {
        const possibleNames = [
            controllerName + 'Controller.php',
            controllerName + '.php'
        ];

        if (expectedNamespace) {
            const targetFile = this.getExpectedFilePath(controllerName, expectedNamespace);
            if (targetFile && fs.existsSync(targetFile)) {
                return [targetFile];
            }
        }
        
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

    private getExpectedFilePath(controllerName: string, namespace: string): string | null {
        const namespacePath = namespace
            .replace(/^App\\/, 'app/')
            .replace(/\\/g, '/');
        
        const fileName = controllerName + 'Controller.php';
        const expectedPath = path.join(this.workspaceRoot, namespacePath, fileName);
        
        return expectedPath;
    }

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

    private getFileNamespace(filePath: string): string | null {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const namespaceMatch = content.match(/^\s*namespace\s+([\w\\]+);/m);
            return namespaceMatch ? namespaceMatch[1] : null;
        } catch (error) {
            return null;
        }
    }

    private isRouteFile(filePath: string): boolean {
        const config = vscode.workspace.getConfiguration('learvelIdea');
        const pattern = config.get<string>('routeFilePattern', '/routes/');
        return filePath.includes(pattern) && filePath.endsWith('.php');
    }

}

