import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';

/**
 * Laravel development enhancement plugin with namespace-aware navigation
 * 
 * Author: lijie
 * Date: 2025/01/18
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Learvel Idea plugin activated');

    // 注册定义提供者
    const definitionProvider = new LaravelDefinitionProvider();
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider('php', definitionProvider)
    );

    // 注册反向定义提供者（用于Alt+Click反向跳转）
    const reverseDefinitionProvider = new LaravelReverseDefinitionProvider();
    context.subscriptions.push(
        vscode.languages.registerDefinitionProvider('php', reverseDefinitionProvider)
    );

    // 注册悬浮提示提供者
    const hoverProvider = new LaravelHoverProvider();
    context.subscriptions.push(
        vscode.languages.registerHoverProvider('php', hoverProvider)
    );

    // 注册跳转命令
    const gotoCommand = vscode.commands.registerCommand('learvel-idea.gotoController', () => {
        vscode.window.showInformationMessage('Learvel Idea 跳转功能已启用');
    });
    context.subscriptions.push(gotoCommand);
}

/**
 * Laravel定义提供者类（正向跳转：路由到控制器）
 * 
 * Author: lijie
 * Date: 2025/01/18
 */
class LaravelDefinitionProvider implements vscode.DefinitionProvider {
    
    /**
     * 提供定义位置
     * 
     * @param document 文档对象
     * @param position 光标位置
     * @param token 取消令牌
     * @returns 定义位置数组
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Definition> {
        
        const line = document.lineAt(position);
        const text = line.text;
        
        // 检查是否在路由文件中
        if (this.isRouteFile(document.fileName)) {
            // 优先检查中间件名称
            const middlewareInfo = this.extractMiddlewareInfo(text, position.character);
            if (middlewareInfo) {
                return this.findMiddlewareDefinition(middlewareInfo);
            }
            
            // 匹配Laravel路由定义模式
            const routePattern = this.extractRouteInfo(text, position.character);
            if (routePattern) {
                return this.findControllerDefinitionWithNamespace(routePattern);
            }
        }
        
        // 检查是否在 Kernel.php 文件中
        if (this.isKernelFile(document.fileName)) {
            const middlewareInfo = this.extractKernelMiddlewareInfo(text, position.character);
            if (middlewareInfo) {
                return this.findRouteUsesMiddleware(middlewareInfo);
            }
        }
        
        return null;
    }

    /**
     * 解析中间件名称，分离基础名称和参数
     * 
     * @param middlewareNameWithParams 带参数的中间件名称
     * @returns 解析后的中间件信息
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private parseMiddlewareName(middlewareNameWithParams: string): {name: string, parameters: string[]} {
        const parts = middlewareNameWithParams.split(':');
        const name = parts[0];
        const parameters = parts.length > 1 ? parts[1].split(',').map(p => p.trim()) : [];
        
        return { name, parameters };
    }

    /**
     * 检查是否为路由文件
     * 
     * @param fileName 文件名
     * @returns 是否为路由文件
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private isRouteFile(fileName: string): boolean {
        return fileName.includes('/routes/') && fileName.endsWith('.php');
    }

    /**
     * 检查是否为 Kernel.php 文件
     * 
     * @param fileName 文件名
     * @returns 是否为 Kernel.php 文件
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private isKernelFile(fileName: string): boolean {
        return fileName.includes('/Http/Kernel.php') && fileName.endsWith('.php');
    }

    /**
     * 提取路由信息
     * 
     * @param text 文本行
     * @param character 字符位置
     * @returns 路由信息对象或null
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private extractRouteInfo(text: string, character: number): RouteInfo | null {
        // 匹配各种Laravel路由模式，精确定位控制器和方法
        const patterns = [
            // $api->get('path', 'ControllerName@method')
            /\$api->(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/g,
            // Route::get('path', 'ControllerName@method')
            /Route::(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/g,
            // 'ControllerName@method' 单独匹配
            /['"`]([^'"`@]+)@([^'"`]+)['"`]/g
        ];

        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0; // 重置正则表达式状态
            
            while ((match = pattern.exec(text)) !== null) {
                const fullMatch = match[0];
                const controller = match[3] || match[1]; // 控制器名称
                const method = match[4] || match[2]; // 方法名称
                
                // 找到控制器和方法在匹配字符串中的位置
                const controllerAtMethodStr = `${controller}@${method}`;
                const controllerAtMethodIndex = fullMatch.indexOf(controllerAtMethodStr);
                
                if (controllerAtMethodIndex === -1) continue;
                
                const matchStart = match.index;
                const controllerStart = matchStart + controllerAtMethodIndex;
                const controllerEnd = controllerStart + controller.length;
                const methodStart = controllerStart + controller.length + 1; // +1 for '@'
                const methodEnd = methodStart + method.length;
                
                // 检查光标是否在控制器名称范围内
                if (character >= controllerStart && character < controllerEnd) {
                    return {
                        controller: controller,
                        method: method,
                        fullMatch: fullMatch,
                        type: 'controller',
                        range: { start: controllerStart, end: controllerEnd }
                    };
                }
                
                // 检查光标是否在方法名称范围内
                if (character >= methodStart && character < methodEnd) {
                    return {
                        controller: controller,
                        method: method,
                        fullMatch: fullMatch,
                        type: 'method',
                        range: { start: methodStart, end: methodEnd }
                    };
                }
            }
        }
        
        return null;
    }

    /**
     * 提取中间件信息
     * 
     * @param text 文本行
     * @param character 字符位置
     * @returns 中间件信息对象或null
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private extractMiddlewareInfo(text: string, character: number): MiddlewareInfo | null {
        // 匹配各种中间件使用模式，支持带参数的中间件
        const patterns = [
            // ->middleware('name:params') 或 ->middleware(['name1:params', 'name2'])
            /->middleware\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            /->middleware\s*\(\s*\[\s*['"`]([^'"`]+)['"`]/g,
            // ->withoutMiddleware('name:params') 或 ->withoutMiddleware(['name1:params', 'name2'])
            /->withoutMiddleware\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            /->withoutMiddleware\s*\(\s*\[\s*['"`]([^'"`]+)['"`]/g,
            // 中间件数组中的项目: 'middleware' => ['name1:params', 'name2']
            /'middleware'\s*=>\s*\[\s*['"`]([^'"`]+)['"`]/g,
            // 单个中间件引用: 'middlewareName' 或 'middlewareName:params'
            /['"`]([a-zA-Z][a-zA-Z0-9_]*(?::[^'"`]*)?)['"`]/g
        ];

        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0; // 重置正则表达式状态
            
            while ((match = pattern.exec(text)) !== null) {
                const fullMatch = match[0];
                const middlewareNameWithParams = match[1];
                
                // 跳过明显不是中间件的匹配（比如路径、控制器名等）
                if (this.isLikelyMiddleware(middlewareNameWithParams, text)) {
                    const matchStart = match.index;
                    const middlewareIndex = fullMatch.indexOf(middlewareNameWithParams);
                    const middlewareStart = matchStart + middlewareIndex;
                    const middlewareEnd = middlewareStart + middlewareNameWithParams.length;
                    
                    // 检查光标是否在中间件名称范围内
                    if (character >= middlewareStart && character < middlewareEnd) {
                        // 分离中间件名称和参数
                        const parsedMiddleware = this.parseMiddlewareName(middlewareNameWithParams);
                        return {
                            name: parsedMiddleware.name,
                            fullName: middlewareNameWithParams,
                            parameters: parsedMiddleware.parameters,
                            range: { start: middlewareStart, end: middlewareEnd }
                        };
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * 判断字符串是否可能是中间件名称
     * 
     * @param name 字符串
     * @param context 上下文文本
     * @returns 是否可能是中间件
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private isLikelyMiddleware(name: string, context: string): boolean {
        // 分离中间件名称和参数
        const baseName = name.split(':')[0];
        
        // 排除路径和URL（但允许中间件参数中的冒号）
        if (name.includes('/') || name.includes('.')) {
            return false;
        }
        
        // 排除明显的HTTP URL模式（如 http:// 或 https://）
        if (name.match(/^https?:/)) {
            return false;
        }
        
        // 排除明显的控制器名称
        if (name.includes('Controller') || name.includes('@')) {
            return false;
        }
        
        // 检查是否在中间件相关的上下文中
        const middlewareContextPattern = /->(middleware|withoutMiddleware)\s*\(|'middleware'\s*=>/;
        if (middlewareContextPattern.test(context)) {
            return true;
        }
        
        // 检查是否是已知的中间件名称模式
        const knownMiddlewarePatterns = [
            /^auth/i,
            /^throttle/i,
            /^guest/i,
            /^verified/i,
            /^signed/i,
            /^can:/i,
            /^role:/i,
            /^permission:/i,
            /.*permissions$/i,
            /.*login$/i,
            /.*check.*$/i
        ];
        
        return knownMiddlewarePatterns.some(pattern => pattern.test(baseName));
    }

    /**
     * 从 Kernel.php 中提取中间件信息
     * 
     * @param text 文本行
     * @param character 字符位置
     * @returns 中间件信息对象或null
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private extractKernelMiddlewareInfo(text: string, character: number): MiddlewareInfo | null {
        // 匹配 Kernel.php 中的中间件定义模式
        const patterns = [
            // 'middlewareName' => MiddlewareClass::class,
            /['"`]([a-zA-Z][a-zA-Z0-9_]*?)['"`]\s*=>\s*[^,;\s]+/g,
            // protected $routeMiddleware = [...
            // protected $middlewareGroups = [...
        ];

        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(text)) !== null) {
                const fullMatch = match[0];
                const middlewareName = match[1];
                
                const matchStart = match.index;
                const middlewareIndex = fullMatch.indexOf(middlewareName);
                const middlewareStart = matchStart + middlewareIndex;
                const middlewareEnd = middlewareStart + middlewareName.length;
                
                // 检查光标是否在中间件名称范围内
                if (character >= middlewareStart && character < middlewareEnd) {
                    return {
                        name: middlewareName,
                        range: { start: middlewareStart, end: middlewareEnd }
                    };
                }
            }
        }
        
        return null;
    }

    /**
     * 查找控制器定义位置（基于命名空间精确匹配）
     * 
     * @param routeInfo 路由信息
     * @returns 定义位置或null
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private async findControllerDefinitionWithNamespace(routeInfo: RouteInfo): Promise<vscode.Location | null> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return null;
        }

        const config = vscode.workspace.getConfiguration('learvelIdea');
        const controllerPath = config.get<string>('controllerPath', 'app/Api/Controllers');
        
        // 解析路由文件中的命名空间上下文
        const routeNamespace = await this.extractRouteNamespaceContext(routeInfo);
        
        // 构建控制器文件搜索路径
        const searchPaths = [
            path.join(workspaceFolder.uri.fsPath, controllerPath, '**', `${routeInfo.controller}.php`),
            path.join(workspaceFolder.uri.fsPath, controllerPath, '**', `${routeInfo.controller}Controller.php`),
            path.join(workspaceFolder.uri.fsPath, 'app', '**', `${routeInfo.controller}.php`),
            path.join(workspaceFolder.uri.fsPath, 'app', '**', `${routeInfo.controller}Controller.php`)
        ];

        for (const searchPath of searchPaths) {
            try {
                const files = await new Promise<string[]>((resolve, reject) => {
                    glob.glob(searchPath, (err, matches) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(matches);
                        }
                    });
                });
                
                for (const file of files) {
                    const location = await this.findTargetInFileWithNamespace(file, routeInfo, routeNamespace);
                    if (location) {
                        return location;
                    }
                }
            } catch (error) {
                console.error('搜索控制器文件时出错:', error);
            }
        }

        return null;
    }

    /**
     * 提取路由的命名空间上下文
     * 
     * @param routeInfo 路由信息
     * @returns 命名空间字符串
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private async extractRouteNamespaceContext(routeInfo: RouteInfo): Promise<string> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return '';
        }
        
        const config = vscode.workspace.getConfiguration('learvelIdea');
        const routePath = config.get<string>('routePath', 'routes');
        
        // 搜索路由文件
        const routeFiles = [
            path.join(workspaceFolder.uri.fsPath, routePath, 'api.php'),
            path.join(workspaceFolder.uri.fsPath, routePath, 'web.php'),
            path.join(workspaceFolder.uri.fsPath, routePath, 'app.php')
        ];
        
        for (const routeFile of routeFiles) {
            if (fs.existsSync(routeFile)) {
                const namespace = await this.findNamespaceForRoute(routeFile, routeInfo);
                if (namespace) {
                    return namespace;
                }
            }
        }
        
        return '';
    }

    /**
     * 在路由文件中查找特定路由的命名空间
     * 
     * @param filePath 路由文件路径
     * @param routeInfo 路由信息
     * @returns 命名空间字符串
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private async findNamespaceForRoute(filePath: string, routeInfo: RouteInfo): Promise<string> {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            const namespaceStack: string[] = [];
            const groupStack: Array<{depth: number, namespace?: string}> = [];
            let braceDepth = 0;
            let foundRoute = false;
            let routeNamespace = '';
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                
                // 计算当前行的括号深度变化
                const openingBraces = (line.match(/\{/g) || []).length;
                const closingBraces = (line.match(/\}/g) || []).length;
                
                // 处理Route::group或$api->group
                const routeGroupMatch = line.match(/(?:Route::group|\$api->group)\s*\(\s*\[([^\]]+)\]/);
                if (routeGroupMatch) {
                    const groupParams = routeGroupMatch[1];
                    const namespaceMatch = groupParams.match(/'namespace'\s*=>\s*'([^']+)'/);
                    
                    if (namespaceMatch) {
                        const namespace = namespaceMatch[1];
                        groupStack.push({depth: braceDepth + openingBraces, namespace});
                        console.log(`发现命名空间分组: ${namespace}, 深度: ${braceDepth + openingBraces}`);
                    } else {
                        groupStack.push({depth: braceDepth + openingBraces});
                    }
                }
                
                // 更新括号深度
                braceDepth += openingBraces - closingBraces;
                
                // 清理已关闭的分组
                while (groupStack.length > 0 && groupStack[groupStack.length - 1].depth > braceDepth) {
                    const closedGroup = groupStack.pop();
                    console.log(`关闭分组, 深度: ${closedGroup?.depth}, 当前深度: ${braceDepth}`);
                }
                
                // 检查当前行是否包含目标路由
                if (line.includes(`${routeInfo.controller}@${routeInfo.method}`)) {
                    console.log(`找到目标路由: ${routeInfo.controller}@${routeInfo.method}, 行: ${i + 1}`);
                    console.log(`当前活跃分组栈:`, groupStack);
                    
                    // 构建完整的命名空间路径
                    const activeNamespaces = groupStack
                        .filter(group => group.namespace)
                        .map(group => group.namespace);
                    
                    routeNamespace = activeNamespaces.join('\\');
                    console.log(`解析出的命名空间: ${routeNamespace}`);
                    foundRoute = true;
                    break;
                }
            }
            
            return routeNamespace;
            
        } catch (error) {
            console.error('解析路由命名空间时出错:', error);
        }
        
        return '';
    }

    /**
     * 在文件中查找目标位置（带命名空间验证）
     * 
     * @param filePath 文件路径
     * @param routeInfo 路由信息
     * @param routeNamespace 路由命名空间
     * @returns 位置对象或null
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private async findTargetInFileWithNamespace(filePath: string, routeInfo: RouteInfo, routeNamespace?: string): Promise<vscode.Location | null> {
        try {
            if (!fs.existsSync(filePath)) {
                return null;
            }

            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            // 提取文件的命名空间
            const fileNamespace = this.extractNamespaceFromFile(content);
            const expectedControllerName = this.getControllerNameFromPath(filePath);
            
            // 验证这是否是正确的控制器文件（带命名空间验证）
            if (!this.isMatchingControllerWithNamespace(routeInfo.controller, expectedControllerName, fileNamespace, routeNamespace)) {
                console.log(`命名空间不匹配: 路由[${routeNamespace}] vs 文件[${fileNamespace}], 控制器[${routeInfo.controller}] vs 文件[${expectedControllerName}]`);
                return null;
            }
            
            console.log(`命名空间匹配成功: ${fileNamespace}, 控制器: ${expectedControllerName}`);

            if (routeInfo.type === 'method') {
                // 查找方法定义
                const methodPattern = new RegExp(`^\\s*(public|private|protected)?\\s*function\\s+(${routeInfo.method})\\s*\\(`);
                
                for (let i = 0; i < lines.length; i++) {
                    const match = lines[i].match(methodPattern);
                    if (match) {
                        const uri = vscode.Uri.file(filePath);
                        // 定位到方法名称的开始位置
                        const methodIndex = lines[i].indexOf(routeInfo.method);
                        const position = new vscode.Position(i, methodIndex);
                        return new vscode.Location(uri, position);
                    }
                }
            } else {
                // 查找控制器类定义
                const classPattern = new RegExp(`^\\s*class\\s+(${expectedControllerName})\\s*`);
                
                for (let i = 0; i < lines.length; i++) {
                    const match = lines[i].match(classPattern);
                    if (match) {
                        const uri = vscode.Uri.file(filePath);
                        // 定位到类名的开始位置
                        const classIndex = lines[i].indexOf(expectedControllerName);
                        const position = new vscode.Position(i, classIndex);
                        return new vscode.Location(uri, position);
                    }
                }
            }

            // 如果没找到，返回文件开头
            const uri = vscode.Uri.file(filePath);
            const position = new vscode.Position(0, 0);
            return new vscode.Location(uri, position);
            
        } catch (error) {
            console.error('读取文件时出错:', error);
            return null;
        }
    }
    
    /**
     * 从文件内容中提取命名空间
     * 
     * @param content 文件内容
     * @returns 命名空间字符串
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private extractNamespaceFromFile(content: string): string {
        const namespaceMatch = content.match(/^\s*namespace\s+([^;]+);/m);
        return namespaceMatch ? namespaceMatch[1].trim() : '';
    }
    
    /**
     * 从文件路径获取控制器名称
     * 
     * @param filePath 文件路径
     * @returns 控制器名称
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private getControllerNameFromPath(filePath: string): string {
        return path.basename(filePath, '.php');
    }
    
    /**
     * 验证是否为匹配的控制器（带命名空间验证）
     * 
     * @param routeController 路由中的控制器名
     * @param fileController 文件中的控制器名
     * @param fileNamespace 文件命名空间
     * @param routeNamespace 路由命名空间
     * @returns 是否匹配
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private isMatchingControllerWithNamespace(routeController: string, fileController: string, fileNamespace: string, routeNamespace?: string): boolean {
        // 首先验证控制器名称是否匹配
        let controllerMatches = false;
        
        if (routeController === fileController) {
            controllerMatches = true;
        } else if (routeController + 'Controller' === fileController) {
            controllerMatches = true;
        }
        
        if (!controllerMatches) {
            return false;
        }
        
        // 如果没有路由命名空间信息，只验证控制器名称
        if (!routeNamespace) {
            return true;
        }
        
        // 验证命名空间是否匹配
        // 构建期望的完整命名空间路径
        const expectedNamespace = `App\\Api\\Controllers\\V1\\${routeNamespace}`;
        
        console.log(`命名空间匹配检查: 期望[${expectedNamespace}] vs 实际[${fileNamespace}]`);
        
        return fileNamespace === expectedNamespace;
    }

    /**
     * 查找中间件定义位置
     * 
     * @param middlewareInfo 中间件信息
     * @returns 定义位置或null
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private async findMiddlewareDefinition(middlewareInfo: MiddlewareInfo): Promise<vscode.Location | null> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return null;
        }

        // 查找 Kernel.php 文件
        const kernelPath = path.join(workspaceFolder.uri.fsPath, 'app', 'Http', 'Kernel.php');
        
        if (!fs.existsSync(kernelPath)) {
            return null;
        }

        try {
            const content = fs.readFileSync(kernelPath, 'utf8');
            const lines = content.split('\n');

            // 查找中间件定义
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // 跳过注释行
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
                    continue;
                }
                
                // 匹配中间件定义模式: 'middlewareName' => MiddlewareClass::class,
                const middlewarePattern = new RegExp(`['"\`]${middlewareInfo.name}['"\`]\\s*=>\\s*([^,;\\s]+)`);
                const match = line.match(middlewarePattern);
                
                if (match) {
                    const uri = vscode.Uri.file(kernelPath);
                    // 定位到中间件名称的开始位置
                    let middlewareIndex = line.indexOf(`'${middlewareInfo.name}'`);
                    if (middlewareIndex === -1) {
                        middlewareIndex = line.indexOf(`"${middlewareInfo.name}"`);
                    }
                    if (middlewareIndex === -1) {
                        middlewareIndex = line.indexOf(`\`${middlewareInfo.name}\``);
                    }
                    
                    if (middlewareIndex !== -1) {
                        const position = new vscode.Position(i, middlewareIndex + 1); // +1 跳过引号
                        return new vscode.Location(uri, position);
                    }
                }
            }
        } catch (error) {
            console.error('读取 Kernel.php 文件时出错:', error);
        }

        return null;
    }

    /**
     * 查找使用指定中间件的路由
     * 
     * @param middlewareInfo 中间件信息
     * @returns 路由位置数组
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private async findRouteUsesMiddleware(middlewareInfo: MiddlewareInfo): Promise<vscode.Location[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [];
        }

        const config = vscode.workspace.getConfiguration('learvelIdea');
        const routePath = config.get<string>('routePath', 'routes');
        
        // 搜索路由文件
        const routeFiles = [
            path.join(workspaceFolder.uri.fsPath, routePath, 'api.php'),
            path.join(workspaceFolder.uri.fsPath, routePath, 'web.php'),
            path.join(workspaceFolder.uri.fsPath, routePath, 'app.php')
        ];

        let allLocations: vscode.Location[] = [];

        for (const routeFile of routeFiles) {
            if (fs.existsSync(routeFile)) {
                const locations = await this.findMiddlewareUsageInRouteFile(routeFile, middlewareInfo.name);
                allLocations.push(...locations);
            }
        }

        return allLocations;
    }

    /**
     * 在路由文件中查找中间件使用
     * 
     * @param filePath 路由文件路径
     * @param middlewareName 中间件名称
     * @returns 路由位置数组
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private async findMiddlewareUsageInRouteFile(filePath: string, middlewareName: string): Promise<vscode.Location[]> {
        const locations: vscode.Location[] = [];

        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];

                // 检查是否包含指定的中间件名称
                if (this.lineContainsMiddleware(line, middlewareName)) {
                    const uri = vscode.Uri.file(filePath);
                    // 定位到行开头以显示完整的路由信息
                    const position = new vscode.Position(i, 0);
                    locations.push(new vscode.Location(uri, position));
                }
            }
        } catch (error) {
            console.error('读取路由文件时出错:', error);
        }

        return locations;
    }

    /**
     * 检查行是否包含指定的中间件
     * 
     * @param line 文本行
     * @param middlewareName 中间件名称
     * @returns 是否包含中间件
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private lineContainsMiddleware(line: string, middlewareName: string): boolean {
        // 匹配各种中间件使用模式，支持带参数的中间件
        const patterns = [
            // ->middleware('name') 或 ->middleware('name:params')
            new RegExp(`->middleware\\s*\\(\\s*['"\`]${middlewareName}(?::[^'"\`]*)?['"\`]\\s*\\)`),
            // ->middleware(['name', ...]) 或 ->middleware(['name:params', ...])
            new RegExp(`->middleware\\s*\\(\\s*\\[.*['"\`]${middlewareName}(?::[^'"\`]*)?['"\`].*\\]`),
            // ->withoutMiddleware('name') 或 ->withoutMiddleware('name:params')
            new RegExp(`->withoutMiddleware\\s*\\(\\s*['"\`]${middlewareName}(?::[^'"\`]*)?['"\`]\\s*\\)`),
            // ->withoutMiddleware(['name', ...]) 或 ->withoutMiddleware(['name:params', ...])
            new RegExp(`->withoutMiddleware\\s*\\(\\s*\\[.*['"\`]${middlewareName}(?::[^'"\`]*)?['"\`].*\\]`),
            // 'middleware' => ['name', ...] 或 'middleware' => ['name:params', ...]
            new RegExp(`'middleware'\\s*=>\\s*\\[.*['"\`]${middlewareName}(?::[^'"\`]*)?['"\`].*\\]`)
        ];

        return patterns.some(pattern => pattern.test(line));
    }
}

/**
 * Laravel反向定义提供者类（反向跳转：控制器到路由）
 * 
 * Author: lijie
 * Date: 2025/01/18
 */
class LaravelReverseDefinitionProvider implements vscode.DefinitionProvider {
    
    /**
     * 提供反向定义位置
     * 
     * @param document 文档对象
     * @param position 光标位置
     * @param token 取消令牌
     * @returns 定义位置数组
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): Promise<vscode.Definition | null> {
        
        const line = document.lineAt(position);
        const text = line.text;
        
        // 检查是否在控制器文件中
        if (this.isControllerFile(document.fileName)) {
            // 提取控制器信息
            const controllerInfo = this.extractControllerInfo(text, position.character, document);
            if (controllerInfo) {
                const allLocations = await this.findAllRouteDefinitionsWithNamespace(controllerInfo, document.fileName);
                
                if (allLocations.length === 0) {
                    return null;
                } else if (allLocations.length === 1) {
                    return allLocations[0];
                } else {
                    // 返回所有匹配的位置，VSCode会自动显示原生选择器
                    return allLocations;
                }
            }
        }
        
        return null;
    }

    /**
     * 检查是否为控制器文件
     * 
     * @param fileName 文件名
     * @returns 是否为控制器文件
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private isControllerFile(fileName: string): boolean {
        return fileName.includes('Controller') && fileName.endsWith('.php');
    }

    /**
     * 提取控制器信息
     * 
     * @param text 文本行
     * @param character 字符位置
     * @param document 文档对象
     * @returns 控制器信息或null
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private extractControllerInfo(text: string, character: number, document: vscode.TextDocument): ControllerInfo | null {
        // 匹配类名定义
        const classMatch = text.match(/^\s*class\s+(\w+)/);
        if (classMatch) {
            const className = classMatch[1];
            const classIndex = text.indexOf(className);
            if (character >= classIndex && character < classIndex + className.length) {
                return {
                    className: className,
                    type: 'class',
                    namespace: this.extractNamespaceFromDocument(document)
                };
            }
        }
        
        // 匹配方法名定义
        const methodMatch = text.match(/^\s*(public|private|protected)?\s*function\s+(\w+)\s*\(/);
        if (methodMatch) {
            const methodName = methodMatch[2];
            const methodIndex = text.indexOf(methodName);
            if (character >= methodIndex && character < methodIndex + methodName.length) {
                return {
                    methodName: methodName,
                    type: 'method',
                    className: this.getClassNameFromDocument(document),
                    namespace: this.extractNamespaceFromDocument(document)
                };
            }
        }
        
        return null;
    }

    /**
     * 从文档中提取命名空间
     * 
     * @param document 文档对象
     * @returns 命名空间字符串
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private extractNamespaceFromDocument(document: vscode.TextDocument): string {
        const content = document.getText();
        const namespaceMatch = content.match(/^\s*namespace\s+([^;]+);/m);
        return namespaceMatch ? namespaceMatch[1].trim() : '';
    }

    /**
     * 从文档中获取类名
     * 
     * @param document 文档对象
     * @returns 类名字符串
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private getClassNameFromDocument(document: vscode.TextDocument): string {
        const content = document.getText();
        const classMatch = content.match(/^\s*class\s+(\w+)/m);
        return classMatch ? classMatch[1] : '';
    }

    /**
     * 查找所有路由定义（基于命名空间精确匹配）
     * 
     * @param controllerInfo 控制器信息
     * @param controllerFilePath 控制器文件路径
     * @returns 路由位置数组
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private async findAllRouteDefinitionsWithNamespace(controllerInfo: ControllerInfo, controllerFilePath: string): Promise<vscode.Location[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return [];
        }
        
        const config = vscode.workspace.getConfiguration('learvelIdea');
        const routePath = config.get<string>('routePath', 'routes');
        
        // 搜索路由文件
        const routeFiles = [
            path.join(workspaceFolder.uri.fsPath, routePath, 'api.php'),
            path.join(workspaceFolder.uri.fsPath, routePath, 'web.php'),
            path.join(workspaceFolder.uri.fsPath, routePath, 'app.php')
        ];
        
        let allLocations: vscode.Location[] = [];
        
        for (const routeFile of routeFiles) {
            if (fs.existsSync(routeFile)) {
                const locations = await this.findRoutesInFileWithNamespace(routeFile, controllerInfo, controllerFilePath);
                allLocations.push(...locations);
            }
        }
        
        return allLocations;
    }

    /**
     * 在路由文件中查找匹配的路由（带命名空间验证）
     * 
     * @param filePath 文件路径
     * @param controllerInfo 控制器信息
     * @param controllerFilePath 控制器文件路径
     * @returns 路由位置数组
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private async findRoutesInFileWithNamespace(filePath: string, controllerInfo: ControllerInfo, controllerFilePath: string): Promise<vscode.Location[]> {
        const locations: vscode.Location[] = [];
        
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            
            // 从控制器文件路径推断预期的命名空间
            const expectedNamespace = this.inferNamespaceFromControllerPath(controllerFilePath);
            
            const groupStack: Array<{depth: number, namespace?: string}> = [];
            let braceDepth = 0;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                
                // 计算当前行的括号深度变化
                const openingBraces = (line.match(/\{/g) || []).length;
                const closingBraces = (line.match(/\}/g) || []).length;
                
                // 处理Route::group或$api->group
                const routeGroupMatch = line.match(/(?:Route::group|\$api->group)\s*\(\s*\[([^\]]+)\]/);
                if (routeGroupMatch) {
                    const groupParams = routeGroupMatch[1];
                    const namespaceMatch = groupParams.match(/'namespace'\s*=>\s*'([^']+)'/);
                    
                    if (namespaceMatch) {
                        const namespace = namespaceMatch[1];
                        groupStack.push({depth: braceDepth + openingBraces, namespace});
                    } else {
                        groupStack.push({depth: braceDepth + openingBraces});
                    }
                }
                
                // 更新括号深度
                braceDepth += openingBraces - closingBraces;
                
                // 清理已关闭的分组
                while (groupStack.length > 0 && groupStack[groupStack.length - 1].depth > braceDepth) {
                    groupStack.pop();
                }
                
                // 检查路由匹配
                if (controllerInfo.type === 'class' && controllerInfo.className) {
                    // 搜索包含控制器类名的路由，并验证命名空间
                    if (this.isMatchingRouteForControllerWithNamespace(line, controllerInfo.className, expectedNamespace, groupStack)) {
                        const uri = vscode.Uri.file(filePath);
                        // 定位到行开头以显示完整的路由信息
                        const position = new vscode.Position(i, 0);
                        locations.push(new vscode.Location(uri, position));
                    }
                } else if (controllerInfo.type === 'method' && controllerInfo.methodName && controllerInfo.className) {
                    // 搜索包含方法名的路由，并验证是同一个控制器
                    if (this.isMatchingRouteForMethodWithNamespace(line, controllerInfo.methodName, controllerInfo.className, expectedNamespace, groupStack)) {
                        const uri = vscode.Uri.file(filePath);
                        // 定位到行开头以显示完整的路由信息
                        const position = new vscode.Position(i, 0);
                        locations.push(new vscode.Location(uri, position));
                    }
                }
            }
            
        } catch (error) {
            console.error('读取路由文件时出错:', error);
        }
        
        return locations;
    }

    /**
     * 从控制器文件路径推断命名空间
     * 
     * @param controllerFilePath 控制器文件路径
     * @returns 命名空间字符串
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private inferNamespaceFromControllerPath(controllerFilePath: string): string {
        // 例如: /app/Api/Controllers/V1/Common/AuthController.php -> Common
        // 例如: /app/Api/Controllers/V1/Anjieli/AuthController.php -> Anjieli
        
        const pathParts = controllerFilePath.split('/');
        const controllersIndex = pathParts.findIndex(part => part === 'Controllers');
        
        if (controllersIndex !== -1 && controllersIndex + 2 < pathParts.length) {
            // Controllers/V1/XXX/... -> XXX
            return pathParts[controllersIndex + 2];
        }
        
        return '';
    }

    /**
     * 验证路由是否匹配控制器（带命名空间验证）
     * 
     * @param line 路由行
     * @param className 类名
     * @param expectedNamespace 预期命名空间
     * @param groupStack 当前的分组栈
     * @returns 是否匹配
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private isMatchingRouteForControllerWithNamespace(line: string, className: string, expectedNamespace: string, groupStack: Array<{depth: number, namespace?: string}>): boolean {
        // 检查是否包含控制器类名
        if (!line.includes(className)) {
            return false;
        }
        
        // 进一步验证是否为正确的路由格式
        const routePattern = new RegExp(`['"\`]([^'"\`@]*${className}[^'"\`@]*)@([^'"\`]+)['"\`]`);
        if (!routePattern.test(line)) {
            return false;
        }
        
        // 检查命名空间是否匹配
        const activeNamespaces = groupStack
            .filter(group => group.namespace)
            .map(group => group.namespace);
        
        const currentNamespace = activeNamespaces.join('\\');
        
        console.log(`反向跳转命名空间检查: 预期[${expectedNamespace}] vs 当前[${currentNamespace}]`);
        
        return currentNamespace === expectedNamespace;
    }

    /**
     * 验证路由是否匹配方法（带命名空间验证）
     * 
     * @param line 路由行
     * @param methodName 方法名
     * @param className 类名
     * @param expectedNamespace 预期命名空间
     * @param groupStack 当前的分组栈
     * @returns 是否匹配
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private isMatchingRouteForMethodWithNamespace(line: string, methodName: string, className: string, expectedNamespace: string, groupStack: Array<{depth: number, namespace?: string}>): boolean {
        // 检查是否包含方法名和类名
        if (!line.includes(methodName) || !line.includes(className)) {
            return false;
        }
        
        // 验证是否为正确的路由格式（控制器@方法）
        const routePattern = new RegExp(`['"\`]([^'"\`@]*${className}[^'"\`@]*)@${methodName}['"\`]`);
        if (!routePattern.test(line)) {
            return false;
        }
        
        // 检查命名空间是否匹配
        const activeNamespaces = groupStack
            .filter(group => group.namespace)
            .map(group => group.namespace);
        
        const currentNamespace = activeNamespaces.join('\\');
        
        console.log(`反向跳转方法命名空间检查: 预期[${expectedNamespace}] vs 当前[${currentNamespace}]`);
        
        return currentNamespace === expectedNamespace;
    }
}

/**
 * Laravel悬浮提示提供者类
 * 
 * Author: lijie
 * Date: 2025/01/18
 */
class LaravelHoverProvider implements vscode.HoverProvider {
    
    /**
     * 提供悬浮提示
     * 
     * @param document 文档对象
     * @param position 光标位置
     * @param token 取消令牌
     * @returns 悬浮提示或null
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<vscode.Hover> {
        
        const line = document.lineAt(position);
        const text = line.text;
        
        // 检查是否在路由文件中
        if (this.isRouteFile(document.fileName)) {
            // 优先检查中间件悬浮提示
            const middlewareInfo = this.extractMiddlewareInfo(text, position.character);
            if (middlewareInfo) {
                const hoverText = new vscode.MarkdownString();
                hoverText.appendMarkdown(`**Laravel 中间件跳转**\n\n`);
                hoverText.appendMarkdown(`中间件: \`${middlewareInfo.fullName || middlewareInfo.name}\`\n\n`);
                if (middlewareInfo.parameters && middlewareInfo.parameters.length > 0) {
                    hoverText.appendMarkdown(`参数: \`${middlewareInfo.parameters.join(', ')}\`\n\n`);
                }
                hoverText.appendMarkdown(`💡 按住 **Alt** 键点击可跳转到 Kernel.php 中的中间件定义`);
                
                return new vscode.Hover(hoverText);
            }
            
            // 匹配Laravel路由定义模式
            const routePattern = this.extractRouteInfo(text, position.character);
            if (routePattern) {
                const hoverText = new vscode.MarkdownString();
                hoverText.appendMarkdown(`**Laravel 路由跳转**\n\n`);
                hoverText.appendMarkdown(`控制器: \`${routePattern.controller}\`\n\n`);
                hoverText.appendMarkdown(`方法: \`${routePattern.method}\`\n\n`);
                hoverText.appendMarkdown(`💡 按住 **Alt** 键点击可跳转到控制器方法`);
                
                return new vscode.Hover(hoverText);
            }
        }
        
        // 检查是否在 Kernel.php 文件中
        if (this.isKernelFile(document.fileName)) {
            const middlewareInfo = this.extractKernelMiddlewareInfo(text, position.character);
            if (middlewareInfo) {
                const hoverText = new vscode.MarkdownString();
                hoverText.appendMarkdown(`**Laravel 中间件跳转**\n\n`);
                hoverText.appendMarkdown(`中间件: \`${middlewareInfo.fullName || middlewareInfo.name}\`\n\n`);
                if (middlewareInfo.parameters && middlewareInfo.parameters.length > 0) {
                    hoverText.appendMarkdown(`参数: \`${middlewareInfo.parameters.join(', ')}\`\n\n`);
                }
                hoverText.appendMarkdown(`💡 按住 **Alt** 键点击可跳转到使用此中间件的路由`);
                
                return new vscode.Hover(hoverText);
            }
        }
        
        return null;
    }

    /**
     * 提取路由信息（与DefinitionProvider中的方法相同）
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private extractRouteInfo(text: string, character: number): RouteInfo | null {
        const patterns = [
            /\$api->(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/g,
            /Route::(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]+)['"`]\s*,\s*['"`]([^'"`@]+)@([^'"`]+)['"`]/g,
            /['"`]([^'"`@]+)@([^'"`]+)['"`]/g
        ];

        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(text)) !== null) {
                const fullMatch = match[0];
                const controller = match[3] || match[1];
                const method = match[4] || match[2];
                
                // 找到控制器和方法在匹配字符串中的位置
                const controllerAtMethodStr = `${controller}@${method}`;
                const controllerAtMethodIndex = fullMatch.indexOf(controllerAtMethodStr);
                
                if (controllerAtMethodIndex === -1) continue;
                
                const matchStart = match.index;
                const controllerStart = matchStart + controllerAtMethodIndex;
                const controllerEnd = controllerStart + controller.length;
                const methodStart = controllerStart + controller.length + 1; // +1 for '@'
                const methodEnd = methodStart + method.length;
                
                // 检查光标是否在控制器名称范围内
                if (character >= controllerStart && character < controllerEnd) {
                    return {
                        controller: controller,
                        method: method,
                        fullMatch: fullMatch,
                        type: 'controller',
                        range: { start: controllerStart, end: controllerEnd }
                    };
                }
                
                // 检查光标是否在方法名称范围内
                if (character >= methodStart && character < methodEnd) {
                    return {
                        controller: controller,
                        method: method,
                        fullMatch: fullMatch,
                        type: 'method',
                        range: { start: methodStart, end: methodEnd }
                    };
                }
            }
        }
        
        return null;
    }

    /**
     * 检查是否为路由文件
     * 
     * @param fileName 文件名
     * @returns 是否为路由文件
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private isRouteFile(fileName: string): boolean {
        return fileName.includes('/routes/') && fileName.endsWith('.php');
    }

    /**
     * 检查是否为 Kernel.php 文件
     * 
     * @param fileName 文件名
     * @returns 是否为 Kernel.php 文件
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private isKernelFile(fileName: string): boolean {
        return fileName.includes('/Http/Kernel.php') && fileName.endsWith('.php');
    }

    /**
     * 提取中间件信息
     * 
     * @param text 文本行
     * @param character 字符位置
     * @returns 中间件信息对象或null
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private extractMiddlewareInfo(text: string, character: number): MiddlewareInfo | null {
        // 匹配各种中间件使用模式，支持带参数的中间件
        const patterns = [
            // ->middleware('name:params') 或 ->middleware(['name1:params', 'name2'])
            /->middleware\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            /->middleware\s*\(\s*\[\s*['"`]([^'"`]+)['"`]/g,
            // ->withoutMiddleware('name:params') 或 ->withoutMiddleware(['name1:params', 'name2'])
            /->withoutMiddleware\s*\(\s*['"`]([^'"`]+)['"`]\s*\)/g,
            /->withoutMiddleware\s*\(\s*\[\s*['"`]([^'"`]+)['"`]/g,
            // 中间件数组中的项目: 'middleware' => ['name1:params', 'name2']
            /'middleware'\s*=>\s*\[\s*['"`]([^'"`]+)['"`]/g,
            // 单个中间件引用: 'middlewareName' 或 'middlewareName:params'
            /['"`]([a-zA-Z][a-zA-Z0-9_]*(?::[^'"`]*)?)['"`]/g
        ];

        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0; // 重置正则表达式状态
            
            while ((match = pattern.exec(text)) !== null) {
                const fullMatch = match[0];
                const middlewareNameWithParams = match[1];
                
                // 跳过明显不是中间件的匹配（比如路径、控制器名等）
                if (this.isLikelyMiddleware(middlewareNameWithParams, text)) {
                    const matchStart = match.index;
                    const middlewareIndex = fullMatch.indexOf(middlewareNameWithParams);
                    const middlewareStart = matchStart + middlewareIndex;
                    const middlewareEnd = middlewareStart + middlewareNameWithParams.length;
                    
                    // 检查光标是否在中间件名称范围内
                    if (character >= middlewareStart && character < middlewareEnd) {
                        // 分离中间件名称和参数
                        const parsedMiddleware = this.parseMiddlewareName(middlewareNameWithParams);
                        return {
                            name: parsedMiddleware.name,
                            fullName: middlewareNameWithParams,
                            parameters: parsedMiddleware.parameters,
                            range: { start: middlewareStart, end: middlewareEnd }
                        };
                    }
                }
            }
        }
        
        return null;
    }

    /**
     * 判断字符串是否可能是中间件名称
     * 
     * @param name 字符串
     * @param context 上下文文本
     * @returns 是否可能是中间件
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private isLikelyMiddleware(name: string, context: string): boolean {
        // 分离中间件名称和参数
        const baseName = name.split(':')[0];
        
        // 排除路径和URL（但允许中间件参数中的冒号）
        if (name.includes('/') || name.includes('.')) {
            return false;
        }
        
        // 排除明显的HTTP URL模式（如 http:// 或 https://）
        if (name.match(/^https?:/)) {
            return false;
        }
        
        // 排除明显的控制器名称
        if (name.includes('Controller') || name.includes('@')) {
            return false;
        }
        
        // 检查是否在中间件相关的上下文中
        const middlewareContextPattern = /->(middleware|withoutMiddleware)\s*\(|'middleware'\s*=>/;
        if (middlewareContextPattern.test(context)) {
            return true;
        }
        
        // 检查是否是已知的中间件名称模式
        const knownMiddlewarePatterns = [
            /^auth/i,
            /^throttle/i,
            /^guest/i,
            /^verified/i,
            /^signed/i,
            /^can:/i,
            /^role:/i,
            /^permission:/i,
            /.*permissions$/i,
            /.*login$/i,
            /.*check.*$/i
        ];
        
        return knownMiddlewarePatterns.some(pattern => pattern.test(baseName));
    }

    /**
     * 解析中间件名称，分离基础名称和参数
     * 
     * @param middlewareNameWithParams 带参数的中间件名称
     * @returns 解析后的中间件信息
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private parseMiddlewareName(middlewareNameWithParams: string): {name: string, parameters: string[]} {
        const parts = middlewareNameWithParams.split(':');
        const name = parts[0];
        const parameters = parts.length > 1 ? parts[1].split(',').map(p => p.trim()) : [];
        
        return { name, parameters };
    }

    /**
     * 从 Kernel.php 中提取中间件信息
     * 
     * @param text 文本行
     * @param character 字符位置
     * @returns 中间件信息对象或null
     * 
     * Author: lijie
     * Date: 2025/01/18
     */
    private extractKernelMiddlewareInfo(text: string, character: number): MiddlewareInfo | null {
        // 匹配 Kernel.php 中的中间件定义模式
        const patterns = [
            // 'middlewareName' => MiddlewareClass::class,
            /['"`]([a-zA-Z][a-zA-Z0-9_]*?)['"`]\s*=>\s*[^,;\s]+/g,
        ];

        for (const pattern of patterns) {
            let match;
            pattern.lastIndex = 0;
            
            while ((match = pattern.exec(text)) !== null) {
                const fullMatch = match[0];
                const middlewareName = match[1];
                
                const matchStart = match.index;
                const middlewareIndex = fullMatch.indexOf(middlewareName);
                const middlewareStart = matchStart + middlewareIndex;
                const middlewareEnd = middlewareStart + middlewareName.length;
                
                // 检查光标是否在中间件名称范围内
                if (character >= middlewareStart && character < middlewareEnd) {
                    return {
                        name: middlewareName,
                        range: { start: middlewareStart, end: middlewareEnd }
                    };
                }
            }
        }
        
        return null;
    }
}

/**
 * 路由信息接口
 * 
 * Author: lijie
 * Date: 2025/01/18
 */
interface RouteInfo {
    controller: string;
    method: string;
    fullMatch: string;
    type?: 'controller' | 'method';
    range?: { start: number; end: number };
}

/**
 * 控制器信息接口
 * 
 * Author: lijie
 * Date: 2025/01/18
 */
interface ControllerInfo {
    className?: string;
    methodName?: string;
    type: 'class' | 'method';
    namespace?: string;
}

/**
 * 中间件信息接口
 * 
 * Author: lijie
 * Date: 2025/01/18
 */
interface MiddlewareInfo {
    name: string; // 基础中间件名称（去除参数后）
    fullName?: string; // 完整的中间件名称（包含参数）
    parameters?: string[]; // 解析出的参数数组
    range?: { start: number; end: number };
}

/**
 * Plugin deactivation function
 * 
 * Author: lijie
 * Date: 2025/01/18
 */
export function deactivate() {
    console.log('Learvel Idea plugin deactivated');
}