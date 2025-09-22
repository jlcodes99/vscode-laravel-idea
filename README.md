# 🚀 Learvel Idea / Laravel 通用跳转

一个强大的Laravel开发扩展，为Visual Studio Code提供智能导航和代码跳转功能。

A powerful Laravel development extension for Visual Studio Code that provides intelligent navigation and code jumping capabilities.

[![Version](https://img.shields.io/visual-studio-marketplace/v/jlcodes.learvel-idea?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jlcodes.learvel-idea)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/jlcodes.learvel-idea?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jlcodes.learvel-idea)
[![License](https://img.shields.io/github/license/jlcodes99/vscode-learvel-idea?style=flat-square)](LICENSE)

## ✨ 功能特性 / Features

### 🎯 路由导航 / Route Navigation
- **路由 ↔ 控制器**: 在路由定义和控制器方法之间跳转
- **命名空间感知**: 精确处理嵌套路由组和命名空间
- **双向导航**: 双向导航 - 从路由到控制器，也可以反向跳转

- **Route ↔ Controller**: Jump between route definitions and controller methods
- **Namespace Aware**: Accurately handles nested route groups and namespaces
- **Bidirectional**: Navigate both ways - from routes to controllers and back

### 🔧 中间件导航 / Middleware Navigation  
- **中间件跳转**: 点击中间件名称跳转到定义
- **使用发现**: 查找中间件在应用中的使用位置
- **参数支持**: 支持带参数的中间件

- **Middleware Jump**: Click on middleware names to jump to their definitions
- **Usage Discovery**: Find where middleware is used across your application
- **Parameter Support**: Handles middleware with parameters

### ⚡ 命令导航 / Command Navigation
- **定时任务 ↔ 命令**: 在定时任务和命令类之间跳转
- **参数支持**: 支持带参数和选项的命令
- **签名匹配**: 使用Laravel的`$signature`属性进行精确匹配

- **Schedule ↔ Command**: Jump between scheduled tasks and command classes
- **Parameter Support**: Works with commands that have parameters and options
- **Signature Matching**: Uses Laravel's `$signature` property for accurate matching

## 🚀 快速开始 / Quick Start

1. **安装** 从VS Code市场安装扩展 / **Install** the extension from VS Code Marketplace
2. **打开** 你的Laravel项目 / **Open** your Laravel project
3. **点击** 任何路由、中间件或命令名称跳转到定义 / **Click** on any route, middleware, or command name to jump to its definition
4. **使用Ctrl+点击** (Mac上Cmd+点击) 快速导航 / **Use Ctrl+Click** (Cmd+Click on Mac) for quick navigation

## 📖 使用方法 / Usage

### 路由导航 / Route Navigation
```php
// 在 routes/api.php 中 - 点击 'UserController@show' 跳转到控制器
// In routes/api.php - Click on 'UserController@show' to jump to controller
Route::get('/users/{id}', 'UserController@show');

// 在 UserController.php 中 - 点击方法名查找对应路由
// In UserController.php - Click on method name to find its routes
public function show($id) { ... }
```

### 中间件导航 / Middleware Navigation
```php
// 点击 'auth' 跳转到中间件定义
// Click on 'auth' to jump to middleware definition
Route::middleware(['auth', 'throttle:60,1'])->group(function () {
    // ...
});
```

### 命令导航 / Command Navigation
```php
// 在 app/Console/Kernel.php 中 - 点击命令名跳转到类
// In app/Console/Kernel.php - Click on command name to jump to class
$schedule->command('send:emails --queue=high')->daily();

// 在命令类中 - 点击类名查找定时任务定义
// In Command class - Click on class name to find schedule definition
class SendEmails extends Command { ... }
```

## ⚙️ 命令 / Commands

- `Laravel Jump: Show Logs` - 查看扩展活动日志 / View extension activity logs
- `Laravel Jump: Clear Cache` - 清除解析的路由/中间件缓存 / Clear parsed route/middleware cache
- `Laravel Jump: Rescan Project` - 强制重新扫描所有Laravel文件 / Force rescan of all Laravel files
- `Laravel Jump: Show Statistics` - 显示解析统计信息 / Display parsing statistics

## 🔧 配置 / Configuration

扩展开箱即用，适用于标准Laravel项目。它会自动：

The extension works out of the box with standard Laravel projects. It automatically:

- 检测Laravel项目结构 / Detects Laravel project structure
- 解析路由文件 (`routes/*.php`) / Parses route files (`routes/*.php`)
- 扫描中间件定义 (`app/Http/Kernel.php`) / Scans middleware definitions (`app/Http/Kernel.php`)
- 发现命令类 (`app/Console/Commands/`) / Discovers command classes (`app/Console/Commands/`)
- 监控文件变化实时更新 / Monitors file changes for real-time updates

## 📁 支持的文件类型 / Supported File Types

- **路由 / Routes**: `routes/api.php`, `routes/web.php`, `routes/app.php`, etc.
- **控制器 / Controllers**: `app/Api/Controllers/**/*.php`, `app/Http/Controllers/**/*.php`
- **中间件 / Middleware**: `app/Http/Middleware/**/*.php`
- **命令 / Commands**: `app/Console/Commands/**/*.php`
- **内核文件 / Kernel Files**: `app/Http/Kernel.php`, `app/Console/Kernel.php`

## 🐛 故障排除 / Troubleshooting

**导航不工作？ / Navigation not working?**
1. 确保你在Laravel项目中 / Ensure you're in a Laravel project
2. 尝试 `Laravel Jump: Rescan Project` 命令 / Try `Laravel Jump: Rescan Project` command
3. 使用 `Laravel Jump: Show Logs` 查看日志 / Check logs with `Laravel Jump: Show Logs`

**性能问题？ / Performance issues?**
1. 使用 `Laravel Jump: Clear Cache` 刷新 / Use `Laravel Jump: Clear Cache` to refresh
2. 检查 `Laravel Jump: Show Statistics` 查看缓存状态 / Check `Laravel Jump: Show Statistics` for cache status

## 📝 许可证 / License

本项目基于MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 贡献 / Contributing

欢迎贡献！请随时提交问题和拉取请求。

Contributions are welcome! Please feel free to submit issues and pull requests.

---

**为Laravel开发者用心制作 ❤️ / Made with ❤️ for Laravel developers**