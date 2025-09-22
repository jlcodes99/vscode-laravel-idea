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
- **多格式支持**: 支持Route::方法、$api变量、match方法等多种路由定义格式
- **智能匹配**: 基于命名空间栈的智能控制器匹配

- **Route ↔ Controller**: Jump between route definitions and controller methods
- **Namespace Aware**: Accurately handles nested route groups and namespaces
- **Bidirectional**: Navigate both ways - from routes to controllers and back
- **Multi-format Support**: Supports Route::methods, $api variables, match methods and more
- **Smart Matching**: Intelligent controller matching based on namespace stack

### 🔧 中间件导航 / Middleware Navigation  
- **中间件跳转**: 点击中间件名称跳转到定义
- **使用发现**: 查找中间件在应用中的使用位置
- **参数支持**: 支持带参数的中间件（如throttle:200,1,user_id）
- **多格式支持**: 支持路由组配置、链式调用、排除中间件等多种格式
- **智能解析**: 自动解析中间件数组和复杂配置

- **Middleware Jump**: Click on middleware names to jump to their definitions
- **Usage Discovery**: Find where middleware is used across your application
- **Parameter Support**: Handles middleware with parameters (e.g., throttle:200,1,user_id)
- **Multi-format Support**: Supports route group config, chained calls, withoutMiddleware and more
- **Smart Parsing**: Automatically parses middleware arrays and complex configurations

### ⚡ 命令导航 / Command Navigation
- **定时任务 ↔ 命令**: 在定时任务和命令类之间跳转
- **参数支持**: 支持带参数和选项的命令
- **签名匹配**: 使用Laravel的`$signature`属性进行精确匹配
- **智能转换**: 自动处理命令名到类名的转换（kebab-case → PascalCase）
- **双向查找**: 支持从定时任务跳转到命令类，也支持从命令类反跳转到定时任务

- **Schedule ↔ Command**: Jump between scheduled tasks and command classes
- **Parameter Support**: Works with commands that have parameters and options
- **Signature Matching**: Uses Laravel's `$signature` property for accurate matching
- **Smart Conversion**: Automatically handles command name to class name conversion (kebab-case → PascalCase)
- **Bidirectional Search**: Supports jumping from schedule to command class and reverse lookup

### 🚀 高级特性 / Advanced Features
- **实时监控**: 自动监控文件变化并更新缓存
- **智能缓存**: 高效的解析结果缓存，提升性能
- **错误处理**: 完善的错误处理和日志记录
- **多项目支持**: 支持复杂的Laravel项目结构
- **IDE集成**: 与VS Code完美集成，支持Ctrl+点击快速导航

- **Real-time Monitoring**: Automatically monitors file changes and updates cache
- **Smart Caching**: Efficient parsing result caching for better performance
- **Error Handling**: Comprehensive error handling and logging
- **Multi-project Support**: Supports complex Laravel project structures
- **IDE Integration**: Perfect integration with VS Code, supports Ctrl+click quick navigation

## 🎯 使用场景 / Use Cases

### 开发效率提升 / Development Efficiency
- **快速定位**: 从路由快速跳转到控制器方法，无需手动查找文件
- **代码审查**: 快速了解路由对应的业务逻辑实现
- **调试支持**: 快速定位中间件和命令的执行位置
- **重构辅助**: 在重构时快速找到所有相关的路由和控制器

- **Quick Location**: Jump from routes to controller methods without manual file searching
- **Code Review**: Quickly understand business logic implementation from routes
- **Debug Support**: Quickly locate middleware and command execution positions
- **Refactoring Aid**: Quickly find all related routes and controllers during refactoring

### 大型项目支持 / Large Project Support
- **复杂路由**: 支持多层嵌套的路由组和命名空间
- **中间件管理**: 快速定位中间件定义和使用位置
- **定时任务**: 快速在定时任务和命令类之间跳转
- **团队协作**: 帮助团队成员快速理解项目结构

- **Complex Routes**: Supports multi-level nested route groups and namespaces
- **Middleware Management**: Quickly locate middleware definitions and usage
- **Scheduled Tasks**: Quick jumping between scheduled tasks and command classes
- **Team Collaboration**: Helps team members quickly understand project structure

## 🚀 快速开始 / Quick Start

1. **安装** 从VS Code市场安装扩展 / **Install** the extension from VS Code Marketplace
2. **打开** 你的Laravel项目 / **Open** your Laravel project
3. **点击** 任何路由、中间件或命令名称跳转到定义 / **Click** on any route, middleware, or command name to jump to its definition
4. **使用Ctrl+点击** (Mac上Cmd+点击) 快速导航 / **Use Ctrl+Click** (Cmd+Click on Mac) for quick navigation

## 📖 使用方法 / Usage

### 路由导航 / Route Navigation

#### 基础路由跳转
```php
// 在 routes/api.php 中 - 点击 'UserController@show' 跳转到控制器
// In routes/api.php - Click on 'UserController@show' to jump to controller
Route::get('/users/{id}', 'UserController@show');

// 在 UserController.php 中 - 点击方法名查找对应路由
// In UserController.php - Click on method name to find its routes
public function show($id) { ... }
```

#### 复杂路由组跳转（支持命名空间）
```php
// 在 routes/open.php 中 - 支持嵌套路由组和命名空间
// In routes/open.php - Supports nested route groups and namespaces
Route::group([
    'namespace' => '\App\Api\Controllers\OpenApi',
    'prefix' => 'v1',
    'middleware' => ['openApiAuth'],
], function (Illuminate\Routing\Router $api) {
    // 点击 'GoodsController@batchAddGoods' 跳转到控制器
    // Click on 'GoodsController@batchAddGoods' to jump to controller
    $api->post('batch-add-goods', 'GoodsController@batchAddGoods');
    
    // 点击 'GoodsController@batchUpdateGoods' 跳转到控制器
    // Click on 'GoodsController@batchUpdateGoods' to jump to controller
    $api->post('batch-update-goods', 'GoodsController@batchUpdateGoods');
});
```

#### 控制器反跳转
```php
// 在 app/Api/Controllers/OpenApi/GoodsController.php 中
// In app/Api/Controllers/OpenApi/GoodsController.php
class GoodsController extends ApiController
{
    // 点击方法名 'batchAddGoods' 查找对应的路由定义
    // Click on method name 'batchAddGoods' to find corresponding route definition
    public function batchAddGoods(GoodsRequest $request): JsonResponse
    {
        $ret = ServicesMake::OpenApiGoodsService('OpenApi')->batchAddGoods($request->input());
        return $this->success($ret);
    }
    
    // 点击类名 'GoodsController' 查找所有相关路由
    // Click on class name 'GoodsController' to find all related routes
}
```

### 中间件导航 / Middleware Navigation

#### 路由组中间件跳转
```php
// 在路由文件中 - 点击中间件名称跳转到定义
// In route files - Click on middleware names to jump to definitions
Route::group([
    'namespace' => '\App\Api\Controllers\V1',
    'prefix' => 'v1',
    'middleware' => ['checkUserLogin', 'throttle:200,1,user_id'], // 点击 'checkUserLogin' 或 'throttle'
], function ($api) {
    // ...
});
```

#### 链式中间件跳转
```php
// 支持链式调用的中间件跳转
// Supports chained middleware navigation
Route::middleware(['auth', 'throttle:60,1'])->group(function () {
    // 点击 'auth' 或 'throttle' 跳转到中间件定义
    // Click on 'auth' or 'throttle' to jump to middleware definitions
});

// 支持排除中间件
// Supports withoutMiddleware
Route::group([...])->withoutMiddleware(['throttle']); // 点击 'throttle' 跳转
```

#### 中间件定义跳转
```php
// 在 app/Http/Kernel.php 中 - 点击中间件名称跳转到使用位置
// In app/Http/Kernel.php - Click on middleware names to find usage locations
protected $routeMiddleware = [
    'checkUserLogin' => \App\Http\Middleware\CheckUserLogin::class,
    'openApiAuth' => \App\Http\Middleware\OpenApiAuth::class,
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
];
```

### 命令导航 / Command Navigation

#### 定时任务跳转到命令类
```php
// 在 app/Console/Kernel.php 中 - 点击命令名跳转到类
// In app/Console/Kernel.php - Click on command name to jump to class
protected function schedule(Schedule $schedule)
{
    // 点击 'upload:ai-ident-image' 跳转到对应的Command类
    // Click on 'upload:ai-ident-image' to jump to corresponding Command class
    $schedule->command('upload:ai-ident-image')->daily();
    
    // 点击 'sync:bs:share:page:data' 跳转到对应的Command类
    // Click on 'sync:bs:share:page:data' to jump to corresponding Command class
    $schedule->command('sync:bs:share:page:data')->hourly();
    
    // 支持带参数的命令
    // Supports commands with parameters
    $schedule->command('update:platform-item-tag-new -r real')->daily();
}
```

#### 命令类反跳转到定时任务
```php
// 在 app/Console/Commands/ 目录下的命令类中
// In Command classes under app/Console/Commands/ directory

// 点击类名 'UploadAiIdentImageCommand' 查找对应的定时任务定义
// Click on class name 'UploadAiIdentImageCommand' to find corresponding schedule definition
class UploadAiIdentImageCommand extends Command
{
    protected $signature = 'upload:ai-ident-image';
    
    public function handle()
    {
        // 命令逻辑
        // Command logic
    }
}

// 点击类名 'SyncBsSharePageDataCommand' 查找对应的定时任务定义
// Click on class name 'SyncBsSharePageDataCommand' to find corresponding schedule definition
class SyncBsSharePageDataCommand extends Command
{
    protected $signature = 'sync:bs:share:page:data';
    
    public function handle()
    {
        // 命令逻辑
        // Command logic
    }
}
```

### 高级功能示例 / Advanced Features

#### 支持复杂命名空间路由
```php
// 支持多层嵌套的路由组
// Supports multi-level nested route groups
Route::group([
    'namespace' => '\App\Api\Controllers\V1',
    'prefix' => 'v1',
    'middleware' => ['checkUserLogin', 'throttle:200,1,user_id'],
], function ($api) {
    $api->group(['namespace' => 'Erp', 'prefix' => 'erp'], function ($api) {
        // 点击 'ErpWarehouseCheckController@list' 跳转到控制器
        // Click on 'ErpWarehouseCheckController@list' to jump to controller
        $api->post('warehouse-check/list', 'ErpWarehouseCheckController@list');
    });
});
```

#### 支持多种路由定义格式
```php
// 支持各种Laravel路由定义格式
// Supports various Laravel route definition formats

// 标准Route::方法
Route::get('/users', 'UserController@index');
Route::post('/users', 'UserController@store');

// $api变量路由
$api->get('user-list', 'UserController@list');
$api->post('user-create', 'UserController@create');

```

### 实际项目示例 / Real Project Examples

#### 基于雷小安API项目的完整示例
```php
// 1. 开放API路由跳转示例
// Open API route jump examples
// 文件: routes/open.php
Route::group([
    'namespace' => '\App\Api\Controllers\OpenApi',
    'prefix' => 'v1',
    'middleware' => ['openApiAuth'], // 点击 'openApiAuth' 跳转到中间件定义
], function (Illuminate\Routing\Router $api) {
    $api->group(['prefix' => 'goods'], function (Illuminate\Routing\Router $api) {
        // 点击 'GoodsController@batchAddGoods' 跳转到控制器方法
        $api->post('batch-add-goods', 'GoodsController@batchAddGoods');
        $api->post('batch-update-goods', 'GoodsController@batchUpdateGoods');
        $api->post('task-list', 'GoodsController@taskList');
        $api->post('goods-list', 'GoodsController@goodsList');
        $api->post('batch-on-sale', 'GoodsController@batchOnSale');
        $api->post('batch-off-sale', 'GoodsController@batchOffSale');
    });
});

// 2. 控制器反跳转示例
// Controller reverse jump examples
// 文件: app/Api/Controllers/OpenApi/GoodsController.php
class GoodsController extends ApiController
{
    // 点击方法名跳转到对应的路由定义
    public function batchAddGoods(GoodsRequest $request): JsonResponse
    {
        $ret = ServicesMake::OpenApiGoodsService('OpenApi')->batchAddGoods($request->input());
        return $this->success($ret);
    }
    
    public function batchUpdateGoods(GoodsRequest $request): JsonResponse
    {
        $ret = ServicesMake::OpenApiGoodsService('OpenApi')->batchUpdateGoods($request->input());
        return $this->success($ret);
    }
}

// 3. 中间件跳转示例
// Middleware jump examples
// 文件: app/Http/Kernel.php
protected $routeMiddleware = [
    'checkUserLogin' => \App\Http\Middleware\CheckUserLogin::class,
    'openApiAuth' => \App\Http\Middleware\OpenApiAuth::class,
    'xiaoeCheckLoginNew' => \App\Http\Middleware\XiaoeCheckLoginNew::class,
    'merchantIdempotency' => \App\Http\Middleware\MerchantIdempotency::class,
    'staffPermissions' => \App\Http\Middleware\StaffPermissions::class,
    'anjieliCheckUserLogin' => \App\Http\Middleware\AnjieliCheckUserLogin::class,
];

// 4. 定时任务跳转示例
// Schedule jump examples
// 文件: app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // 点击命令名跳转到对应的Command类
    $schedule->command('upload:ai-ident-image')->daily();
    $schedule->command('sync:bs:share:page:data')->hourly();
    $schedule->command('update:platform-item-tag-new -r real')->daily();
    $schedule->command('sync:material-tech-data all 1')->everyMinute();
}

// 5. 命令类反跳转示例
// Command class reverse jump examples
// 文件: app/Console/Commands/UploadAiIdentImageCommand.php
class UploadAiIdentImageCommand extends Command
{
    protected $signature = 'upload:ai-ident-image';
    
    // 点击类名查找对应的定时任务定义
    public function handle()
    {
        // 命令逻辑
    }
}

// 文件: app/Console/Commands/SyncBsSharePageDataCommand.php
class SyncBsSharePageDataCommand extends Command
{
    protected $signature = 'sync:bs:share:page:data';
    
    // 点击类名查找对应的定时任务定义
    public function handle()
    {
        // 命令逻辑
    }
}
```

#### 支持的中间件格式示例
```php
// 1. 路由组中间件配置
Route::group([
    'middleware' => ['checkUserLogin', 'throttle:200,1,user_id'], // 点击任意中间件名跳转
], function ($api) {
    // ...
});

// 2. 链式中间件调用
Route::middleware(['auth', 'throttle:60,1'])->group(function () {
    // 点击 'auth' 或 'throttle' 跳转
});

// 3. 排除中间件
Route::group([...])->withoutMiddleware(['throttle']); // 点击 'throttle' 跳转

// 4. 带参数的中间件
Route::middleware(['throttle:200,1,user_id,api_merchant'])->group(function () {
    // 点击 'throttle' 跳转到中间件定义
});
```

#### 支持的命令格式示例
```php
// 1. 基础命令
$schedule->command('upload:ai-ident-image')->daily();

// 2. 带参数的命令
$schedule->command('update:platform-item-tag-new -r real')->daily();

// 3. 复杂命令名
$schedule->command('sync:bs:share:page:data')->hourly();

// 4. 带多个参数的命令
$schedule->command('sync:material-tech-data all 1')->everyMinute();
```

## ⚙️ 命令 / Commands

- `Laravel Jump: Show Logs` - 查看扩展活动日志 / View extension activity logs
- `Laravel Jump: Clear Cache` - 清除解析的路由/中间件缓存 / Clear parsed route/middleware cache
- `Laravel Jump: Rescan Project` - 强制重新扫描所有Laravel文件 / Force rescan of all Laravel files
- `Laravel Jump: Show Statistics` - 显示解析统计信息 / Display parsing statistics

## 🔧 技术实现 / Technical Implementation

### 核心架构 / Core Architecture
- **智能解析器**: 基于正则表达式的智能代码解析，支持复杂Laravel语法
- **命名空间栈**: 精确管理嵌套路由组的命名空间，确保跳转准确性
- **缓存系统**: 高效的解析结果缓存，支持实时更新和增量更新
- **文件监控**: 基于VS Code API的文件变化监控，自动更新缓存

- **Smart Parser**: Regex-based intelligent code parsing supporting complex Laravel syntax
- **Namespace Stack**: Precise management of nested route group namespaces for accurate jumping
- **Caching System**: Efficient parsing result caching with real-time and incremental updates
- **File Monitoring**: VS Code API-based file change monitoring with automatic cache updates

### 解析能力 / Parsing Capabilities
- **路由解析**: 支持Route::方法、$api变量、match方法等多种路由定义格式
- **中间件解析**: 支持路由组配置、链式调用、排除中间件等多种中间件格式
- **命令解析**: 支持定时任务到命令类的精确匹配，基于$signature属性
- **命名空间解析**: 智能处理绝对命名空间和相对命名空间的转换

- **Route Parsing**: Supports Route::methods, $api variables, match methods and various route definition formats
- **Middleware Parsing**: Supports route group config, chained calls, withoutMiddleware and various middleware formats
- **Command Parsing**: Supports precise matching from scheduled tasks to command classes based on $signature property
- **Namespace Parsing**: Intelligently handles absolute and relative namespace conversions

### 性能优化 / Performance Optimization
- **增量更新**: 只更新变化的文件，避免全量重新解析
- **智能缓存**: 基于文件修改时间的智能缓存策略
- **异步处理**: 非阻塞的文件解析和缓存更新
- **内存管理**: 高效的缓存数据结构，最小化内存占用

- **Incremental Updates**: Only updates changed files, avoiding full re-parsing
- **Smart Caching**: Intelligent caching strategy based on file modification time
- **Async Processing**: Non-blocking file parsing and cache updates
- **Memory Management**: Efficient cache data structures with minimal memory usage

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