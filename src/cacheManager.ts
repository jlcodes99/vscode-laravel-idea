/**
 * Laravel IDE扩展 - 缓存管理模块
 * 
 * 负责管理扩展的所有缓存，包括：
 * - 路由信息缓存
 * - 中间件信息缓存
 * - Kernel定义缓存
 * - 自动更新和文件监控
 * 
 * @author lijie
 */

import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import { LaravelCache } from './types';
import { LaravelRouteParser } from './routeParser';
import { LaravelMiddlewareParser, LaravelKernelParser } from './middlewareParser';
import { LaravelCommandParser, LaravelConsoleKernelParser } from './commandParser';

export class CacheManager {
    private static instance: CacheManager;
    private outputChannel!: vscode.OutputChannel;
    private workspaceRoot!: string;
    private cache!: LaravelCache;
    
    static getInstance(): CacheManager {
        if (!CacheManager.instance) {
            CacheManager.instance = new CacheManager();
        }
        return CacheManager.instance;
    }
    
    setOutputChannel(channel: vscode.OutputChannel): void {
        this.outputChannel = channel;
        // 同时设置其他解析器的输出通道
        LaravelRouteParser.setOutputChannel(channel);
        LaravelMiddlewareParser.setOutputChannel(channel);
        LaravelKernelParser.setOutputChannel(channel);
        LaravelCommandParser.setOutputChannel(channel);
        LaravelConsoleKernelParser.setOutputChannel(channel);
    }
    
    setWorkspaceRoot(root: string): void {
        this.workspaceRoot = root;
        LaravelKernelParser.setWorkspaceRoot(root);
        LaravelCommandParser.setWorkspaceRoot(root);
        LaravelConsoleKernelParser.setWorkspaceRoot(root);
    }
    
    getCache(): LaravelCache {
        return this.cache;
    }
    
    private log(message: string, data?: any): void {
        if (this.outputChannel) {
            const timestamp = new Date().toISOString().substring(11, 19);
            if (data) {
                this.outputChannel.appendLine(`[${timestamp}] [Cache] ${message}: ${JSON.stringify(data)}`);
            } else {
                this.outputChannel.appendLine(`[${timestamp}] [Cache] ${message}`);
            }
        }
    }
    
    async initializeCache(): Promise<void> {
        const startTime = Date.now();
        
        this.cache = {
            routes: new Map(),
            middlewares: new Map(),
            middlewareDefinitions: new Map(),
            commands: new Map(),
            commandDefinitions: new Map(),
            lastUpdate: Date.now()
        };
        
        this.log('🔄 开始初始化缓存');

        try {
            // 1. 解析路由文件
            const routeFiles = await this.findRouteFiles();
            this.log('📁 找到路由文件', { count: routeFiles.length, files: routeFiles.map(f => path.basename(f)) });
            
            let totalRoutes = 0;
            let totalMiddlewares = 0;
            
            for (const routeFile of routeFiles) {
                // 解析路由
                const routes = LaravelRouteParser.parseRouteFile(routeFile);
                this.cache.routes.set(routeFile, routes);
                totalRoutes += routes.length;
                
                // 解析中间件
                const middlewares = LaravelMiddlewareParser.parseMiddlewareFromFile(routeFile);
                this.cache.middlewares.set(routeFile, middlewares);
                totalMiddlewares += middlewares.length;
                
            }
            
            // 2. 解析Kernel.php中的中间件定义
            const middlewareDefinitions = LaravelKernelParser.parseMiddlewareDefinitions();
            this.cache.middlewareDefinitions = middlewareDefinitions;
            
            // 3. 解析Console/Kernel.php中的定时任务
            const scheduleCommands = LaravelConsoleKernelParser.parseConsoleKernel();
            this.cache.commands.set('console', scheduleCommands);
            
            // 4. 扫描Console/Commands目录中的Command类
            const commandDefinitions = LaravelCommandParser.discoverCommandClasses();
            this.cache.commandDefinitions = commandDefinitions;
            
            const duration = Date.now() - startTime;
            
            this.log('🎉 缓存初始化完成', {
                fileCount: routeFiles.length,
                totalRoutes: totalRoutes,
                totalMiddlewares: totalMiddlewares,
                middlewareDefinitions: middlewareDefinitions.size,
                scheduleCommands: scheduleCommands.length,
                commandDefinitions: commandDefinitions.size,
                duration: `${duration}ms`
            });
            
            this.log('✅ Laravel Universal Jump 激活成功', {
                totalRoutes: totalRoutes,
                totalMiddlewares: totalMiddlewares,
                middlewareDefinitions: middlewareDefinitions.size,
                scheduleCommands: scheduleCommands.length,
                commandClasses: commandDefinitions.size,
                duration: `${duration}ms`
            });
            
        } catch (error) {
            this.log('❌ 缓存初始化失败', { error: String(error) });
        }
    }

    private async findRouteFiles(): Promise<string[]> {
        const routesDir = path.join(this.workspaceRoot, 'routes');
        
        if (!fs.existsSync(routesDir)) {
            this.log('⚠️ routes目录不存在', { dir: routesDir });
            return [];
        }

        const files = fs.readdirSync(routesDir);
        const phpFiles = files
            .filter(file => file.endsWith('.php'))
            .map(file => path.join(routesDir, file));
        
        return phpFiles;
    }
    
    /**
     * 从缓存中查找期望的命名空间
     */
    findExpectedNamespace(filePath: string, lineNumber: number): string | null {
        const routes = this.cache.routes.get(filePath);
        
        this.log('🔍 查找期望命名空间', {
            filePath: path.basename(filePath),
            lineNumber: lineNumber + 1,
            hasRoutes: !!routes,
            routeCount: routes ? routes.length : 0,
            cacheSize: this.cache.routes.size
        });
        
        if (!routes) {
            this.log('⚠️ 缓存中未找到路由文件，强制重新解析', {
                filePath: path.basename(filePath)
            });
            
            // 强制重新解析这个文件
            try {
                const newRoutes = LaravelRouteParser.parseRouteFile(filePath);
                this.cache.routes.set(filePath, newRoutes);
                this.log('🔄 强制重新解析完成', {
                    routeCount: newRoutes.length
                });
                
                // 重新尝试查找
                return this.findExpectedNamespace(filePath, lineNumber);
            } catch (error) {
                this.log('❌ 强制重新解析失败', { error: String(error) });
                return null;
            }
        }
        
        // 查找最接近的路由
        let bestMatch: any = null;
        let minDistance = Infinity;
        
        for (const route of routes) {
            const distance = Math.abs(route.line - lineNumber);
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = route;
            }
        }
        
        if (bestMatch && minDistance <= 5) {
            this.log('🎯 找到最佳匹配路由', {
                route: `${bestMatch.method} ${bestMatch.path}`,
                line: bestMatch.line + 1,
                distance: minDistance,
                namespace: bestMatch.namespace || '(空)'
            });
            return bestMatch.namespace;
        }
        
        this.log('❌ 未找到匹配的路由', {
            targetLine: lineNumber + 1,
            availableRoutes: routes.map((r: any) => ({ line: r.line + 1, path: r.path }))
        });
        
        return null;
    }
}
