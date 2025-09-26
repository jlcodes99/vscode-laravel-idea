/**
 * Laravel IDE扩展 - 主入口文件
 * 
 * 职责：
 * - 插件生命周期管理 (activate/deactivate)
 * - 模块初始化和依赖注入
 * - 命令注册和文件监控
 * - 统一的错误处理和日志管理
 * 
 * @author lijie
 */

import * as vscode from 'vscode';
import * as path from 'path';
import { CacheManager } from './cacheManager';
import { LaravelJumpProvider } from './jumpProvider';

// ======================== 全局变量 ========================

let outputChannel: vscode.OutputChannel;
let workspaceRoot: string;

// ======================== 插件激活 ========================

export async function activate(context: vscode.ExtensionContext) {
    // 初始化输出通道
    outputChannel = vscode.window.createOutputChannel('Laravel Universal Jump');
    
    // 验证工作区
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) {
        outputChannel.appendLine('⚠️ Laravel Universal Jump: 需要打开Laravel项目');
        return;
    }
    
    workspaceRoot = workspaceFolder.uri.fsPath;

    outputChannel.appendLine('🚀 Laravel Universal Jump 启动中...');
    outputChannel.appendLine(`📁 工作区: ${workspaceRoot}`);
    
    try {
        // 初始化缓存管理器
        const cacheManager = CacheManager.getInstance();
        cacheManager.setOutputChannel(outputChannel);
        cacheManager.setWorkspaceRoot(workspaceRoot);
        await cacheManager.initializeCache();

        // 注册跳转提供者
        const jumpProvider = new LaravelJumpProvider(outputChannel, workspaceRoot);
        context.subscriptions.push(
            vscode.languages.registerDefinitionProvider('php', jumpProvider)
        );

        // 注册文件监控
        registerFileWatchers(context, cacheManager);
        
        // 注册命令
        registerCommands(context, cacheManager);
        
        outputChannel.appendLine('✅ Laravel Universal Jump 激活成功');

    } catch (error) {
        outputChannel.appendLine(`❌ 激活失败: ${error}`);
    }
}

// ======================== 文件监控 ========================

function registerFileWatchers(context: vscode.ExtensionContext, cacheManager: CacheManager) {
    // 添加路由文件监控
    const routeWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(workspaceRoot, 'routes/**/*.php')
    );

    // 监控文件变更
    routeWatcher.onDidChange(async (uri) => {
        const fileName = path.basename(uri.fsPath);
        outputChannel.appendLine(`📝 检测到路由文件变更: ${fileName}`);
        outputChannel.appendLine('🔄 自动重新缓存...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine(`✅ 路由缓存已更新 (${fileName})`);
        } catch (error) {
            outputChannel.appendLine(`❌ 自动缓存更新失败: ${error}`);
        }
    });

    // 监控文件创建
    routeWatcher.onDidCreate(async (uri) => {
        const fileName = path.basename(uri.fsPath);
        outputChannel.appendLine(`➕ 检测到新路由文件: ${fileName}`);
        outputChannel.appendLine('🔄 自动重新缓存...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine(`✅ 路由缓存已更新 (新增${fileName})`);
        } catch (error) {
            outputChannel.appendLine(`❌ 自动缓存更新失败: ${error}`);
        }
    });

    // 监控文件删除
    routeWatcher.onDidDelete(async (uri) => {
        const fileName = path.basename(uri.fsPath);
        outputChannel.appendLine(`🗑️ 检测到路由文件删除: ${fileName}`);
        outputChannel.appendLine('🔄 自动重新缓存...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine(`✅ 路由缓存已更新 (删除${fileName})`);
        } catch (error) {
            outputChannel.appendLine(`❌ 自动缓存更新失败: ${error}`);
        }
    });

    // 监控Kernel.php文件变更
    const kernelWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(workspaceRoot, 'app/Http/Kernel.php')
    );
    
    kernelWatcher.onDidChange(async (uri) => {
        outputChannel.appendLine('📝 检测到Kernel.php变更');
        outputChannel.appendLine('🔄 重新缓存中间件定义...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine('✅ 中间件缓存已更新');
        } catch (error) {
            outputChannel.appendLine(`❌ 中间件缓存更新失败: ${error}`);
        }
    });

    // 监控Console/Commands目录下的脚本文件变更
    const commandWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(workspaceRoot, 'app/Console/Commands/**/*.php')
    );

    // 监控命令文件变更
    commandWatcher.onDidChange(async (uri) => {
        const fileName = path.basename(uri.fsPath);
        outputChannel.appendLine(`📝 检测到命令文件变更: ${fileName}`);
        outputChannel.appendLine('🔄 自动重新缓存命令定义...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine(`✅ 命令缓存已更新 (${fileName})`);
        } catch (error) {
            outputChannel.appendLine(`❌ 命令缓存更新失败: ${error}`);
        }
    });

    // 监控命令文件创建
    commandWatcher.onDidCreate(async (uri) => {
        const fileName = path.basename(uri.fsPath);
        outputChannel.appendLine(`➕ 检测到新命令文件: ${fileName}`);
        outputChannel.appendLine('🔄 自动重新缓存命令定义...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine(`✅ 命令缓存已更新 (新增${fileName})`);
        } catch (error) {
            outputChannel.appendLine(`❌ 命令缓存更新失败: ${error}`);
        }
    });

    // 监控命令文件删除
    commandWatcher.onDidDelete(async (uri) => {
        const fileName = path.basename(uri.fsPath);
        outputChannel.appendLine(`🗑️ 检测到命令文件删除: ${fileName}`);
        outputChannel.appendLine('🔄 自动重新缓存命令定义...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine(`✅ 命令缓存已更新 (删除${fileName})`);
        } catch (error) {
            outputChannel.appendLine(`❌ 命令缓存更新失败: ${error}`);
        }
    });

    // 监控Console/Kernel.php文件变更
    const consoleKernelWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(workspaceRoot, 'app/Console/Kernel.php')
    );
    
    consoleKernelWatcher.onDidChange(async (uri) => {
        outputChannel.appendLine('📝 检测到Console/Kernel.php变更');
        outputChannel.appendLine('🔄 重新缓存定时任务定义...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine('✅ 定时任务缓存已更新');
        } catch (error) {
            outputChannel.appendLine(`❌ 定时任务缓存更新失败: ${error}`);
        }
    });

    // 监控配置文件变更
    const configWatcher = vscode.workspace.createFileSystemWatcher(
        new vscode.RelativePattern(workspaceRoot, 'config/**/*.php')
    );

    // 监控配置文件变更
    configWatcher.onDidChange(async (uri) => {
        const fileName = path.basename(uri.fsPath);
        outputChannel.appendLine(`📝 检测到配置文件变更: ${fileName}`);
        outputChannel.appendLine('🔄 自动重新缓存配置...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine(`✅ 配置缓存已更新 (${fileName})`);
        } catch (error) {
            outputChannel.appendLine(`❌ 配置缓存更新失败: ${error}`);
        }
    });

    // 监控配置文件创建
    configWatcher.onDidCreate(async (uri) => {
        const fileName = path.basename(uri.fsPath);
        outputChannel.appendLine(`➕ 检测到新配置文件: ${fileName}`);
        outputChannel.appendLine('🔄 自动重新缓存配置...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine(`✅ 配置缓存已更新 (新增${fileName})`);
        } catch (error) {
            outputChannel.appendLine(`❌ 配置缓存更新失败: ${error}`);
        }
    });

    // 监控配置文件删除
    configWatcher.onDidDelete(async (uri) => {
        const fileName = path.basename(uri.fsPath);
        outputChannel.appendLine(`🗑️ 检测到配置文件删除: ${fileName}`);
        outputChannel.appendLine('🔄 自动重新缓存配置...');
        
        try {
            await cacheManager.initializeCache();
            outputChannel.appendLine(`✅ 配置缓存已更新 (删除${fileName})`);
        } catch (error) {
            outputChannel.appendLine(`❌ 配置缓存更新失败: ${error}`);
        }
    });

    context.subscriptions.push(routeWatcher, kernelWatcher, commandWatcher, consoleKernelWatcher, configWatcher);
}

// ======================== 命令注册 ========================

function registerCommands(context: vscode.ExtensionContext, cacheManager: CacheManager) {
    // 显示日志命令
    context.subscriptions.push(
        vscode.commands.registerCommand('laravelUniversalJump.showLogs', () => {
            outputChannel.show();
        })
    );

    // 清除缓存命令
    context.subscriptions.push(
        vscode.commands.registerCommand('laravelUniversalJump.clearCache', async () => {
            outputChannel.appendLine('🔄 清空缓存并重新扫描...');
            await cacheManager.initializeCache();
            outputChannel.appendLine('✅ Laravel缓存已刷新');
        })
    );

    // 重新扫描项目命令
    context.subscriptions.push(
        vscode.commands.registerCommand('laravelUniversalJump.rescanProject', async () => {
            outputChannel.appendLine('🔄 重新扫描项目...');
            await cacheManager.initializeCache();
            outputChannel.appendLine('✅ 项目重新扫描完成');
        })
    );
    
    // 显示缓存统计命令
    context.subscriptions.push(
        vscode.commands.registerCommand('laravelUniversalJump.showStats', () => {
            const cache = cacheManager.getCache();
            const totalRoutes = Array.from(cache.routes.values()).reduce((sum, routes) => sum + routes.length, 0);
            const totalMiddlewares = Array.from(cache.middlewares.values()).reduce((sum, middlewares) => sum + middlewares.length, 0);
            
            const message = `📊 Laravel IDE扩展统计信息：
            
🗂️ 缓存文件: ${cache.routes.size} 个路由文件
🛣️ 总路由数: ${totalRoutes} 个
🔧 总中间件: ${totalMiddlewares} 个  
🎯 中间件定义: ${cache.middlewareDefinitions.size} 个
📋 命令定义: ${cache.commandDefinitions.size} 个
⚙️ 配置项: ${cache.configItems.length} 个
🔗 配置引用: ${cache.configReferences.length} 个
⏰ 最后更新: ${new Date(cache.lastUpdate).toLocaleString()}`;
            
            vscode.window.showInformationMessage(message);
            outputChannel.appendLine(message);
        })
    );
}

// ======================== 插件停用 ========================

export function deactivate() {
    // 清理缓存管理器的资源
    const cacheManager = CacheManager.getInstance();
    cacheManager.dispose();
    
    if (outputChannel) {
        outputChannel.appendLine('👋 Laravel Universal Jump 停用');
        outputChannel.dispose();
    }
}
