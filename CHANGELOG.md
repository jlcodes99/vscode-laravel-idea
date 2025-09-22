# 更新日志 / Changelog

**Learvel Idea** 扩展的所有重要更改都将记录在此文件中。

All notable changes to the **Learvel Idea** extension will be documented in this file.

## [1.1.0] - 2025-09-22

### 🎉 首次发布 / Initial Release

#### ✨ 功能特性 / Features
- **路由导航**: 在路由定义和控制器方法之间跳转
- **中间件导航**: 点击中间件名称跳转到定义
- **命令导航**: 在定时任务和命令类之间导航
- **命名空间支持**: 精确处理嵌套路由组和命名空间
- **参数支持**: 支持带参数的中间件和命令
- **双向导航**: 双向跳转 - 从定义到使用，也可以反向
- **实时更新**: 文件更改时自动刷新缓存
- **多文件支持**: 处理所有Laravel路由文件 (`api.php`, `web.php`, 等)

- **Route Navigation**: Jump between route definitions and controller methods
- **Middleware Navigation**: Click middleware names to jump to definitions
- **Command Navigation**: Navigate between scheduled tasks and command classes
- **Namespace Support**: Accurate handling of nested route groups and namespaces
- **Parameter Support**: Works with middleware and commands that have parameters
- **Bidirectional Navigation**: Jump both ways - from definitions to usage and back
- **Real-time Updates**: Automatic cache refresh when files change
- **Multi-file Support**: Handles all Laravel route files (`api.php`, `web.php`, etc.)

#### 🔧 命令 / Commands
- 显示扩展日志 / Show extension logs
- 清除缓存并重新扫描项目 / Clear cache and rescan project
- 显示解析统计信息 / Display parsing statistics

#### 📁 文件支持 / File Support
- 路由文件 / Route files: `routes/*.php`
- 控制器 / Controllers: `app/*/Controllers/**/*.php`
- 中间件 / Middleware: `app/Http/Middleware/**/*.php`
- 命令 / Commands: `app/Console/Commands/**/*.php`
- 内核文件 / Kernel files: `app/Http/Kernel.php`, `app/Console/Kernel.php`

#### ⚡ 性能 / Performance
- 智能缓存系统 / Intelligent caching system
- 文件监控实时更新 / File watcher for real-time updates
- 优化的解析算法 / Optimized parsing algorithms