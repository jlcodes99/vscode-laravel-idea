# 更新日志 / Changelog

**Learvel Idea** 扩展的所有重要更改都将记录在此文件中。

All notable changes to the **Learvel Idea** extension will be documented in this file.

## [1.1.3] - 2025-10-07

### ✨ 新功能 / New Features

#### 🔧 中间件反向跳转 / Middleware Reverse Jump
- **中间件 → 路由**: 从 `app/Http/Kernel.php` 中的中间件定义跳转到所有使用该中间件的路由位置
- **全面搜索**: 自动查找项目中所有使用该中间件的路由、路由组、链式调用等位置
- **双向导航增强**: 完善了中间件的双向导航能力，现在支持：
  - ✅ 路由 → Kernel.php 中间件定义（已有功能）
  - ✅ Kernel.php 中间件定义 → 路由使用位置（新增功能）

- **Middleware → Routes**: Jump from middleware definitions in `app/Http/Kernel.php` to all route locations using that middleware
- **Comprehensive Search**: Automatically finds all locations using the middleware including routes, route groups, and chained calls
- **Enhanced Bidirectional Navigation**: Improved bidirectional navigation for middleware, now supports:
  - ✅ Route → Kernel.php middleware definition (existing feature)
  - ✅ Kernel.php middleware definition → Route usage locations (new feature)

#### 📋 使用示例 / Usage Examples
```php
// 在 app/Http/Kernel.php 中
// In app/Http/Kernel.php
protected $routeMiddleware = [
    'checkUserLogin' => CheckUserLoginMiddleware::class,  // 点击 'checkUserLogin' 跳转到所有使用位置
    'throttle' => ThrottleRequests::class,                // 点击 'throttle' 跳转到所有使用位置
];

// 自动跳转到所有使用该中间件的位置：
// Automatically jumps to all locations using this middleware:

// 路由组中间件
Route::group(['middleware' => ['checkUserLogin']], function () { });

// 链式中间件
Route::middleware(['throttle:200,1'])->group(function () { });

// 排除中间件
Route::group([...])->withoutMiddleware(['throttle']);
```

### 🔧 技术改进 / Technical Improvements
- 新增 `isHttpKernelFile()` 方法检测 HTTP Kernel 文件
- 新增 `jumpFromHttpKernel()` 方法处理中间件反向跳转逻辑
- 新增 `parseHttpKernelMiddlewareAtPosition()` 方法解析点击的中间件定义
- 利用现有的中间件缓存 (`cache.middlewares`) 实现高效的反向查找
- 支持同时跳转到多个使用位置，并高亮显示整行代码

- Added `isHttpKernelFile()` method to detect HTTP Kernel files
- Added `jumpFromHttpKernel()` method to handle middleware reverse jump logic
- Added `parseHttpKernelMiddlewareAtPosition()` method to parse clicked middleware definitions
- Utilizes existing middleware cache (`cache.middlewares`) for efficient reverse lookup
- Supports jumping to multiple usage locations simultaneously with full line highlighting

## [1.1.2] - 2025-09-26

### 🔧 改进 / Improvements

#### ✨ 配置导航智能过滤 / Configuration Navigation Smart Filtering
- **智能注释过滤**: 配置跳转功能现在会自动跳过被注释的配置调用
- **多种注释格式支持**: 支持识别 `//`、`#`、`/* */`、`*` 等多种注释格式
- **提高跳转准确性**: 只跳转到实际生效的配置使用位置，避免跳转到无效的注释代码
- **实时扫描优化**: 优化配置引用扫描算法，提升性能和准确性

- **Smart Comment Filtering**: Configuration navigation now automatically skips commented config calls
- **Multiple Comment Format Support**: Supports recognition of `//`, `#`, `/* */`, `*` and other comment formats
- **Improved Jump Accuracy**: Only jumps to active configuration usage locations, avoiding jumps to invalid commented code
- **Real-time Scanning Optimization**: Optimized config reference scanning algorithm for better performance and accuracy

#### 📋 示例场景 / Example Scenarios
```php
// ✅ 有效调用 - 会被跳转到 / Valid calls - will be jumped to
$accessKeyId = config('aliyun.access_key_id');

// ❌ 注释调用 - 会被跳过 / Commented calls - will be skipped
// $accessKeyId = config('aliyun.access_key_id');
# $region = config('aliyun.oss.region');
/* $secret = config('aliyun.access_key_secret'); */
* $docConfig = config('aliyun.sms.access_key_id');
```

### 🔧 技术改进 / Technical Improvements
- 优化 `configParser.ts` 中的 `isCommentedLine()` 方法
- 改进 `scanFileForConfigReferences()` 和 `findConfigReferencesInFile()` 方法
- 增强正则表达式匹配准确性
- 提升代码导航的整体用户体验

- Optimized `isCommentedLine()` method in `configParser.ts`
- Improved `scanFileForConfigReferences()` and `findConfigReferencesInFile()` methods
- Enhanced regex matching accuracy
- Improved overall user experience for code navigation

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