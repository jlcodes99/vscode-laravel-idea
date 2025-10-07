# 🚀 Learvel Idea - Laravel 智能导航扩展

[![Version](https://img.shields.io/visual-studio-marketplace/v/jlcodes.learvel-idea?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jlcodes.learvel-idea)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/jlcodes.learvel-idea?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jlcodes.learvel-idea)
[![License](https://img.shields.io/github/license/jlcodes99/vscode-learvel-idea?style=flat-square)](LICENSE)

> **专为 Laravel 开发者打造的智能代码导航工具**  
> 让路由、中间件、命令、配置之间的跳转变得前所未有的简单！

A powerful Laravel development extension that provides intelligent navigation and code jumping capabilities between routes, middleware, commands, and configurations.

---

### 🔥 最佳实践推荐 / Best Practice

> **💡 建议与 [PHP Tools](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.phptools-vscode) 插件配合使用**  
> 
> **Learvel Idea** 专注于 Laravel 框架特性的智能导航，是对 PHP Tools 在 Laravel 框架支持上的完美补充。  
> **两者组合使用，打造 VS Code 最强 Laravel 开发环境！** 🚀
> 
> **Recommended to use with [PHP Tools](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.phptools-vscode)**
> 
> **Learvel Idea** focuses on Laravel framework-specific navigation, perfectly complementing PHP Tools.  
> **Together, they create the ultimate Laravel development experience in VS Code!** 🚀

---

## 📖 目录 / Table of Contents

- [为什么选择 Learvel Idea](#-为什么选择-learvel-idea--why-choose-learvel-idea)
- [快速开始](#-快速开始--quick-start)
- [核心功能](#-核心功能--core-features)
- [使用指南](#-使用指南--usage-guide)
- [实际案例](#-实际案例--real-world-examples)
- [技术实现](#-技术实现--technical-details)
- [常见问题](#-常见问题--troubleshooting)

---

## 🎯 为什么选择 Learvel Idea / Why Choose Learvel Idea

### 🎪 完美搭档 / Perfect Partnership

> **💎 专业的事交给专业的工具做**
> 
> 在 Laravel 开发中，PHP Tools 提供了优秀的 PHP 语言支持，但对于 Laravel 框架特有的路由、中间件、命令等特性支持有限。**Learvel Idea 正是为了填补这一空白而生！**
> 
> - **PHP Tools** 👉 负责 PHP 语言层面（类、方法、变量、命名空间等）
> - **Learvel Idea** 👉 专注 Laravel 框架层面（路由、中间件、命令、配置等）
> 
> **两者配合，才是 VS Code 下最强的 Laravel 开发组合！**

### 开发痛点 / Development Pain Points

在大型 Laravel 项目中，即使有了 PHP Tools，你是否仍然遇到这些框架层面的问题？

Even with PHP Tools, do you still encounter these Laravel framework-specific issues?

- ❌ 路由定义在 `routes/api.php`，控制器在 `app/Api/Controllers/V1/Erp/`，PHP Tools 无法识别字符串形式的路由定义
- ❌ 中间件配置散落在多个路由文件中，想找某个中间件的所有使用位置需要全局搜索
- ❌ 定时任务配置在 `Kernel.php`，命令类在 `Commands/` 目录，两者通过字符串关联，无法智能跳转
- ❌ 配置项在代码中使用 `config('aliyun.oss.bucket')`，PHP Tools 无法解析这种动态配置调用

### 解决方案 / Solutions

✅ **一键跳转** - Ctrl+点击即可在路由、控制器、中间件、命令之间自由跳转  
✅ **双向导航** - 不仅可以从路由跳转到控制器，还能从控制器反向查找所有相关路由  
✅ **实时解析** - 文件修改后自动更新缓存，无需手动刷新  
✅ **智能匹配** - 支持复杂的命名空间、嵌套路由组、带参数的中间件等  
✅ **无缝集成** - 与 PHP Tools 完美配合，互不干扰，共同提供完整开发体验

---

## 🚀 快速开始 / Quick Start

### 💡 重要提示 / Important Notice

> **🔥 推荐配合使用 / Recommended Combo**  
> 
> **本扩展专为 Laravel 框架优化，强烈建议配合 [PHP Tools](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.phptools-vscode) 插件使用！**
> 
> **Learvel Idea** 专注于 Laravel 特有的路由、中间件、命令等框架层面的智能跳转，完美补充了 PHP Tools 在 Laravel 框架特性上的不足。两者配合使用，将为你提供最完整的 Laravel 开发体验：
> 
> - ✅ **PHP Tools**: 提供 PHP 语言的智能感知、代码补全、类跳转、重构等基础能力
> - ✅ **Learvel Idea**: 提供 Laravel 框架的路由跳转、中间件导航、命令跳转、配置导航等专属功能
> 
> **This extension is specifically optimized for Laravel framework. We strongly recommend using it together with [PHP Tools](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.phptools-vscode)!**
> 
> **Learvel Idea** focuses on Laravel-specific intelligent navigation for routes, middleware, commands, etc., perfectly complementing PHP Tools' capabilities. Together, they provide the most complete Laravel development experience:
> 
> - ✅ **PHP Tools**: PHP language intelligence, code completion, class navigation, refactoring, etc.
> - ✅ **Learvel Idea**: Laravel framework-specific route navigation, middleware jumps, command jumps, config navigation, etc.

### 安装 / Installation

1. 打开 VS Code，进入扩展市场 (Ctrl+Shift+X)
2. 搜索 "Learvel Idea"
3. 点击"安装"按钮
4. **[推荐]** 同时安装 "PHP Tools" 插件以获得完整开发体验
5. 打开你的 Laravel 项目，即刻享受智能跳转！

### 立即体验 / Try It Now

```php
// 在 routes/api.php 中，按住 Ctrl 并点击控制器名
Route::post('/users/create', 'UserController@store');
//                            👆 点击这里跳转到控制器方法

// 在 UserController.php 中，点击方法名查找对应路由
public function store() { }
//              👆 点击这里查找所有相关路由

// 在路由中，点击中间件名跳转到定义
Route::middleware(['auth', 'throttle:60,1'])->group(function () {
//                  👆                👆
//            跳转到 Kernel.php   跳转到 Kernel.php
});

// 在定时任务中，点击命令名跳转到命令类
$schedule->command('sync:user-data')->daily();
//                  👆 点击这里跳转到命令类
```

---

## ✨ 核心功能 / Core Features

### 1️⃣ 路由 ↔ 控制器跳转 / Route ↔ Controller Navigation

#### 支持的路由格式 / Supported Route Formats

本扩展支持 Laravel 所有主流路由定义格式：

```php
// ✅ Route:: 静态方法格式 - 标准 Laravel 路由
Route::get('/users/{id}', 'UserController@show');
Route::post('/users', 'UserController@store');
Route::put('/users/{id}', 'UserController@update');
Route::delete('/users/{id}', 'UserController@destroy');

// ✅ $api 变量格式 - API 路由推荐写法
$api->get('user-list', 'UserController@list');
$api->post('user-create', 'UserController@store');
$api->put('user-update', 'UserController@update');
$api->delete('user-delete', 'UserController@destroy');

// ✅ match 方法 - 支持多种 HTTP 方法
Route::match(['get', 'post'], '/path', 'Controller@method');
$api->match(['get', 'post'], 'path', 'Controller@method');

// ✅ 支持的所有 HTTP 方法
// get, post, put, delete, patch, options, any, match
```

#### Controller@action 语法支持 / Controller@action Syntax

**完整支持** `'Controller@method'` 语法格式：

```php
// 示例 1：简单路由
$api->post('batch-add-goods', 'GoodsController@batchAddGoods');
//          👆 路由路径          👆 控制器名  👆 方法名
//          (无跳转)            (跳转到类)  (跳转到方法)

// 示例 2：嵌套路由组（自动解析命名空间）
Route::group([
    'namespace' => '\App\Api\Controllers\OpenApi',
    'prefix' => 'v1',
], function (Illuminate\Routing\Router $api) {
    $api->post('task-list', 'GoodsController@taskList');
    //                      👆 自动解析为: \App\Api\Controllers\OpenApi\GoodsController
});
```

#### 双向导航 / Bidirectional Navigation

```php
// 👉 从路由跳转到控制器
// routes/api.php
Route::post('/users/create', 'UserController@store');
//                            👆 Ctrl+点击跳转到 UserController::store()

// 👈 从控制器跳转到路由
// app/Http/Controllers/UserController.php
class UserController extends Controller
{
    public function store() { }
    //     👆 Ctrl+点击查找所有使用此方法的路由
}
```

#### 智能命名空间解析 / Intelligent Namespace Resolution

```php
// 支持多层嵌套路由组，自动构建完整命名空间
Route::group([
    'namespace' => '\App\Api\Controllers\V1',  // 第1层命名空间
    'prefix' => 'v1',
], function ($api) {
    $api->group(['namespace' => 'Erp', 'prefix' => 'erp'], function ($api) {  // 第2层
        $api->group(['namespace' => 'Warehouse', 'prefix' => 'warehouse'], function ($api) {  // 第3层
            // 最终命名空间: \App\Api\Controllers\V1\Erp\Warehouse
            $api->post('check/list', 'CheckController@list');
            //                       👆 跳转到: \App\Api\Controllers\V1\Erp\Warehouse\CheckController
        });
    });
});
```

---

### 2️⃣ 中间件导航 / Middleware Navigation

#### 从路由跳转到中间件定义 / Jump from Routes to Middleware

```php
// 在路由文件中
Route::group([
    'middleware' => ['checkUserLogin', 'throttle:200,1,user_id'],
    //               👆 Ctrl+点击       👆 Ctrl+点击
    //               跳转到 Kernel.php   跳转到 Kernel.php
], function ($api) {
    // ...
});

// 支持链式中间件
Route::middleware(['auth', 'verified'])
//                  👆        👆
//              Ctrl+点击跳转到定义
    ->group(function () {
        // ...
});

// 支持排除中间件
Route::group([...])->withoutMiddleware(['throttle']);
//                                      👆 Ctrl+点击跳转
```

#### 从中间件定义跳转到所有使用位置 / Jump from Middleware to All Usage

```php
// 在 app/Http/Kernel.php 中
protected $routeMiddleware = [
    'checkUserLogin' => CheckUserLoginMiddleware::class,
    //👆 Ctrl+点击查找所有使用此中间件的路由
    
    'openApiAuth' => OpenApiAuth::class,
    //👆 Ctrl+点击查找所有使用位置
    
    'throttle' => \Illuminate\Routing\Middleware\ThrottleRequests::class,
    //👆 Ctrl+点击查找所有使用位置（包括带参数的调用）
];
```

#### 实时解析模式 / Real-time Parsing

**重要特性**：中间件跳转采用实时解析模式，即使路由文件修改后也能精准跳转！

Important: Middleware navigation uses real-time parsing - accurate jumps even after route file modifications!

```php
// 工作原理 / How it works:
// 1. 从缓存中快速获取路由文件列表
// 2. 实时读取文件内容进行精准匹配
// 3. 无需手动刷新缓存，始终保持准确性
```

---

### 3️⃣ 定时任务 ↔ 命令类跳转 / Schedule ↔ Command Navigation

#### 从定时任务跳转到命令类 / Jump from Schedule to Command

```php
// 在 app/Console/Kernel.php 中
protected function schedule(Schedule $schedule)
{
    // 基础命令
    $schedule->command('upload:ai-ident-image')->daily();
    //                  👆 Ctrl+点击跳转到 UploadAiIdentImageCommand
    
    // 带参数的命令
    $schedule->command('update:platform-item-tag-new -r real')->daily();
    //                  👆 Ctrl+点击跳转到 UpdatePlatformItemTagNewCommand
    
    // 复杂命令名
    $schedule->command('sync:bs:share:page:data')->hourly();
    //                  👆 Ctrl+点击跳转到 SyncBsSharePageDataCommand
}
```

#### 从命令类跳转到定时任务 / Jump from Command to Schedule

```php
// 在 app/Console/Commands/UploadAiIdentImageCommand.php 中
class UploadAiIdentImageCommand extends Command
//    👆 Ctrl+点击类名查找对应的定时任务定义
{
    protected $signature = 'upload:ai-ident-image';
    
    public function handle()
    {
        // 命令逻辑
    }
}
```

#### 智能命令名匹配 / Smart Command Name Matching

扩展会自动处理命令名到类名的转换：

- `upload:ai-ident-image` → `UploadAiIdentImageCommand`
- `sync:bs:share:page:data` → `SyncBsSharePageDataCommand`
- `update:platform-item-tag-new` → `UpdatePlatformItemTagNewCommand`

---

### 4️⃣ 配置导航 / Configuration Navigation

#### 从配置文件跳转到使用位置 / Jump from Config to Usage

```php
// 在 config/aliyun.php 中
return [
    'access_key_id' => env('ALIYUN_ACCESS_KEY_ID', ''),
    //👆 Ctrl+点击查找所有使用 config('aliyun.access_key_id') 的位置
    
    'oss' => [
        'region' => env('ALIYUN_OSS_REGION', 'oss-cn-beijing'),
        //👆 Ctrl+点击查找所有使用 config('aliyun.oss.region') 的位置
        
        'bucket' => env('ALIYUN_OSS_BUCKET', ''),
        //👆 Ctrl+点击查找所有使用位置
    ],
];
```

#### 从代码跳转到配置定义 / Jump from Code to Config

```php
// 在任意 PHP 文件中
$accessKeyId = config('aliyun.access_key_id');
//                     👆 Ctrl+点击跳转到 config/aliyun.php

$region = config('aliyun.oss.region');
//                👆 Ctrl+点击跳转到配置文件的具体位置

$bucket = config('aliyun.oss.bucket');
//                👆 Ctrl+点击跳转到配置定义
```

#### 智能过滤 / Smart Filtering

**自动跳过被注释的配置调用**，只跳转到实际生效的代码：

```php
// ❌ 被注释的调用会被忽略
// $key = config('aliyun.access_key_id');

// ✅ 只跳转到未注释的实际调用
$key = config('aliyun.access_key_id');
```

---

## 📚 使用指南 / Usage Guide

### 基础操作 / Basic Operations

#### 1. Ctrl+点击跳转 / Ctrl+Click Navigation

**Windows/Linux**: `Ctrl + 鼠标左键点击`  
**macOS**: `Cmd + 鼠标左键点击`

```php
// 点击不同位置会有不同的跳转效果
$api->post('batch-add-goods', 'GoodsController@batchAddGoods');
//          👆 无跳转              👆 跳转到类定义    👆 跳转到方法定义
```

#### 2. 查看所有使用位置 / Find All Usages

点击控制器方法名、中间件名、命令类名，扩展会列出所有使用该元素的位置：

```php
// 在控制器中
public function batchAddGoods() { }
//              👆 Ctrl+点击 → 显示所有使用此方法的路由

// 在 Kernel.php 中
'checkUserLogin' => CheckUserLoginMiddleware::class,
//👆 Ctrl+点击 → 显示所有使用此中间件的路由
```

### 高级用法 / Advanced Usage

#### 复杂路由组解析 / Complex Route Group Parsing

```php
// 扩展能够智能解析多层嵌套的路由组
Route::group([
    'namespace' => '\App\Api\Controllers\V1',
    'prefix' => 'v1',
    'middleware' => ['checkUserLogin', 'throttle:200,1,user_id'],
], function ($api) {
    $api->group(['namespace' => 'Merchant', 'prefix' => 'merchant'], function ($api) {
    $api->group(['namespace' => 'Erp', 'prefix' => 'erp'], function ($api) {
            // 自动解析完整命名空间: \App\Api\Controllers\V1\Merchant\Erp
            $api->post('order/list', 'OrderController@list');
            //                       👆 精准跳转到: \App\Api\Controllers\V1\Merchant\Erp\OrderController
        });
    });
});
```

#### 带参数的中间件跳转 / Middleware with Parameters

```php
// 支持各种带参数的中间件格式
Route::middleware([
    'throttle:200,1,user_id',           // ✅ 支持
    'throttle:200,1,user_id,api_merchant',  // ✅ 支持
    'cache:300',                        // ✅ 支持
    'role:admin,editor',                // ✅ 支持
])->group(function () {
    // 点击任意中间件名都能正确跳转
});
```

---

## 💼 实际案例 / Real World Examples

### 案例 1：雷小安 API 项目路由跳转 / Route Navigation in Leixiaoan API

```php
// 文件: routes/open.php
Route::group([
    'namespace' => '\App\Api\Controllers\OpenApi',
    'prefix' => 'v1',
    'middleware' => ['openApiAuth'],  // 👈 点击跳转到中间件定义
], function (Illuminate\Routing\Router $api) {
    
    $api->group(['prefix' => 'goods'], function (Illuminate\Routing\Router $api) {
        // ✅ 所有以下路由均支持智能跳转
        $api->post('batch-add-goods', 'GoodsController@batchAddGoods');
        //                            👆 点击跳转到: \App\Api\Controllers\OpenApi\GoodsController::batchAddGoods()
        
        $api->post('batch-update-goods', 'GoodsController@batchUpdateGoods');
        $api->post('task-list', 'GoodsController@taskList');
        $api->post('goods-list', 'GoodsController@goodsList');
        $api->post('batch-on-sale', 'GoodsController@batchOnSale');
        $api->post('batch-off-sale', 'GoodsController@batchOffSale');
    });
    
    $api->group(['prefix' => 'order'], function (Illuminate\Routing\Router $api) {
        $api->post('create', 'OrderController@create');
        $api->post('list', 'OrderController@list');
        $api->post('detail', 'OrderController@detail');
    });
});
```

```php
// 文件: app/Api/Controllers/OpenApi/GoodsController.php
namespace App\Api\Controllers\OpenApi;

class GoodsController extends ApiController
{
    // 👈 点击方法名查找对应路由
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
```

---

### 案例 2：内部版路由与中间件跳转 / Internal API Routes and Middleware

```php
// 文件: routes/api.php
Route::group([
    'namespace' => '\App\Api\Controllers\V1',
    'prefix' => 'v1',
    'middleware' => ['checkUserLogin', 'throttle:200,1,user_id'],
    //               👆 点击跳转到定义  👆 点击跳转到定义
], function ($api) {
    
    // ERP 仓库管理模块
    $api->group(['namespace' => 'Erp', 'prefix' => 'erp'], function ($api) {
        $api->post('warehouse-check/list', 'ErpWarehouseCheckController@list');
        //                                  👆 跳转到: \App\Api\Controllers\V1\Erp\ErpWarehouseCheckController::list()
        
        $api->post('warehouse-check/detail', 'ErpWarehouseCheckController@detail');
        $api->post('warehouse-check/create', 'ErpWarehouseCheckController@create');
        $api->post('warehouse-check/update', 'ErpWarehouseCheckController@update');
    });
    
    // 鉴定管理模块
    $api->group(['namespace' => 'Ident', 'prefix' => 'ident'], function ($api) {
        $api->post('listing-audit/list', 'ListingAuditController@list');
        //                                👆 跳转到: \App\Api\Controllers\V1\Ident\ListingAuditController::list()
        
        $api->post('listing-audit/detail', 'ListingAuditController@detail');
        $api->post('listing-audit/audit', 'ListingAuditController@audit');
    });
});
```

```php
// 文件: app/Http/Kernel.php
protected $routeMiddleware = [
    'checkUserLogin' => CheckUserLoginMiddleware::class,
    //👆 Ctrl+点击 → 查找所有使用此中间件的路由（实时解析，立即显示结果）
    
    'openApiAuth' => OpenApiAuth::class,
    //👆 Ctrl+点击 → 查找 routes/open.php 中的所有使用位置
    
    'xiaoeCheckLoginNew' => XiaoeLoginMiddlewareNew::class,
    //👆 Ctrl+点击 → 查找商家版路由中的所有使用位置
    
    'merchantIdempotency' => IdempotencyMidleware::class,
    'staffPermissions' => StaffPermissionsMiddleware::class,
    'anjieliCheckUserLogin' => AnjieliLoginMiddleware::class,
];
```

---

### 案例 3：定时任务与命令类跳转 / Scheduled Tasks and Commands

```php
// 文件: app/Console/Kernel.php
protected function schedule(Schedule $schedule)
{
    // AI 鉴定图片上传任务
    $schedule->command('upload:ai-ident-image')->daily();
    //                  👆 点击跳转到: app/Console/Commands/UploadAiIdentImageCommand.php
    
    // 百思分享页面数据同步
    $schedule->command('sync:bs:share:page:data')->hourly();
    //                  👆 点击跳转到: app/Console/Commands/SyncBsSharePageDataCommand.php
    
    // 平台商品标签更新（带参数）
    $schedule->command('update:platform-item-tag-new -r real')->daily();
    //                  👆 点击跳转到: app/Console/Commands/UpdatePlatformItemTagNewCommand.php
    
    // 材质技术数据同步（带多个参数）
    $schedule->command('sync:material-tech-data all 1')->everyMinute();
    //                  👆 点击跳转到: app/Console/Commands/SyncMaterialTechDataCommand.php
    
    // 订单自动取消任务
    $schedule->command('order:auto-cancel')->everyFiveMinutes();
    //                  👆 点击跳转到命令类
}
```

```php
// 文件: app/Console/Commands/UploadAiIdentImageCommand.php
namespace App\Console\Commands;

use Illuminate\Console\Command;

class UploadAiIdentImageCommand extends Command
//    👆 Ctrl+点击类名 → 查找 Kernel.php 中对应的定时任务
{
    protected $signature = 'upload:ai-ident-image';
    protected $description = '上传 AI 鉴定图片';
    
    public function handle()
    {
        // 命令执行逻辑
        $this->info('开始上传 AI 鉴定图片...');
        // ...
    }
}
```

---

### 案例 4：配置文件跳转 / Configuration Navigation

```php
// 文件: config/aliyun.php
return [
    'access_key_id' => env('ALIYUN_ACCESS_KEY_ID', ''),
    //👆 Ctrl+点击 → 查找所有使用 config('aliyun.access_key_id') 的位置
    
    'access_key_secret' => env('ALIYUN_ACCESS_KEY_SECRET', ''),
    //👆 Ctrl+点击 → 查找所有使用位置
    
    'oss' => [
        'region' => env('ALIYUN_OSS_REGION', 'oss-cn-beijing'),
        //👆 Ctrl+点击 → 查找所有使用 config('aliyun.oss.region') 的位置
        
        'bucket' => env('ALIYUN_OSS_BUCKET', ''),
        //👆 Ctrl+点击 → 查找所有使用位置
        
        'endpoint' => env('ALIYUN_OSS_ENDPOINT', ''),
        'cdn_domain' => env('ALIYUN_OSS_CDN_DOMAIN', ''),
    ],
    
    'vod' => [
        'region' => env('ALIYUN_VOD_REGION', 'cn-shanghai'),
        'template_group_id' => env('ALIYUN_VOD_TEMPLATE_GROUP_ID', ''),
    ],
];
```

```php
// 文件: app/Services/Aliyun/OssService.php
namespace App\Services\Aliyun;

class OssService
{
    public function __construct()
    {
        // 👈 Ctrl+点击配置键跳转到配置文件
        $this->accessKeyId = config('aliyun.access_key_id');
        //                          👆 跳转到 config/aliyun.php 的第3行
        
        $this->accessKeySecret = config('aliyun.access_key_secret');
        //                              👆 跳转到 config/aliyun.php 的第4行
        
        $this->region = config('aliyun.oss.region');
        //                     👆 跳转到 config/aliyun.php 的第7行
        
        $this->bucket = config('aliyun.oss.bucket');
        //                     👆 跳转到 config/aliyun.php 的第10行
    }
}
```

---

## ⚙️ 扩展命令 / Extension Commands

打开命令面板（Ctrl+Shift+P / Cmd+Shift+P）输入以下命令：

| 命令 / Command | 说明 / Description |
|----------------|-------------------|
| `Laravel Jump: Show Logs` | 查看扩展活动日志，用于调试和问题排查 |
| `Laravel Jump: Clear Cache` | 清除所有解析缓存，强制重新解析 |
| `Laravel Jump: Rescan Project` | 重新扫描整个项目的 Laravel 文件 |
| `Laravel Jump: Show Statistics` | 显示解析统计信息（路由数、中间件数、命令数等） |

---

## ⚙️ 配置选项 / Configuration

扩展提供了丰富的配置选项，可以根据项目实际情况进行调整。

### 路径匹配配置 / Path Pattern Configuration

打开 VS Code 设置（File > Preferences > Settings），搜索 "Learvel Idea"，可以配置以下选项：

| 配置项 / Setting | 默认值 / Default | 说明 / Description |
|-----------------|------------------|-------------------|
| `learvelIdea.routeFilePattern` | `/routes/` | 路由文件路径匹配模式 |
| `learvelIdea.controllerFilePattern` | `Controller` | 控制器文件名匹配模式 |
| `learvelIdea.commandFilePattern` | `/Console/Commands/` | 命令文件路径匹配模式 |
| `learvelIdea.consoleKernelPattern` | `/Console/Kernel.php` | Console Kernel 文件路径 |
| `learvelIdea.httpKernelPattern` | `/Http/Kernel.php` | Http Kernel 文件路径 |
| `learvelIdea.configFilePattern` | `/config/` | 配置文件路径匹配模式 |

### 项目目录配置 / Directory Configuration

| 配置项 / Setting | 默认值 / Default | 说明 / Description |
|-----------------|------------------|-------------------|
| `learvelIdea.appPath` | `app` | Laravel 应用目录路径 |
| `learvelIdea.controllerPath` | `app/Api/Controllers` | 控制器目录路径 |
| `learvelIdea.routePath` | `routes` | 路由文件目录路径 |

### 快捷键配置 / Keybinding Configuration

| 配置项 / Setting | 默认值 / Default | 说明 / Description |
|-----------------|------------------|-------------------|
| `learvelIdea.enablePhpStormKeybindings` | `false` | 启用 PHPStorm 风格快捷键（基础版本） |
| `learvelIdea.enablePhpStormAdvancedKeybindings` | `false` | 启用 PHPStorm 风格快捷键（高级版本） |

**PHPStorm 风格快捷键（高级版本）包含：**
- `Option+Cmd+L` (Mac) / `Alt+Ctrl+L` (Windows/Linux) - 格式化代码
- `Ctrl+D` - 复制当前行
- `Ctrl+Y` - 删除当前行
- 更多快捷键...

### 配置示例 / Configuration Example

如果您的项目结构不同于标准 Laravel，可以自定义路径模式：

```json
{
  "learvelIdea.routeFilePattern": "/custom-routes/",
  "learvelIdea.controllerFilePattern": "MyController",
  "learvelIdea.controllerPath": "app/MyApp/Controllers"
}
```

---

## 🔧 技术实现 / Technical Details

### 核心架构 / Core Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Learvel Idea Extension                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Route Parser │  │  Middleware  │  │   Command    │  │
│  │              │  │    Parser    │  │    Parser    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         └─────────────────┼──────────────────┘          │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Namespace Stack │                    │
│                  │  (命名空间栈管理)  │                    │
│                  └────────┬────────┘                    │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  Cache System   │                    │
│                  │  (缓存系统)      │                    │
│                  └────────┬────────┘                    │
│                           │                             │
│                  ┌────────▼────────┐                    │
│                  │  File Monitor   │                    │
│                  │  (文件监控)      │                    │
│                  └─────────────────┘                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 解析能力 / Parsing Capabilities

#### 1. 路由解析 / Route Parsing

- ✅ 支持 `Route::get/post/put/delete/patch/options/any/match` 格式
- ✅ 支持 `$api->get/post/put/delete/patch/options/any/match` 格式
- ✅ 完整支持 `'Controller@method'` 语法
- ✅ 智能解析多层嵌套路由组
- ✅ 自动构建完整命名空间路径
- ✅ 精准定位控制器类和方法

#### 2. 中间件解析 / Middleware Parsing

- ✅ 支持路由组中间件配置（`'middleware' => ['auth']`）
- ✅ 支持链式中间件调用（`->middleware(['auth'])`）
- ✅ 支持排除中间件（`->withoutMiddleware(['throttle'])`）
- ✅ 支持带参数的中间件（`'throttle:200,1,user_id'`）
- ✅ 实时解析模式，无需手动刷新缓存

#### 3. 命令解析 / Command Parsing

- ✅ 基于 `$signature` 属性精确匹配
- ✅ 自动处理命令名到类名的转换（kebab-case → PascalCase）
- ✅ 支持带参数和选项的命令
- ✅ 支持复杂的命令名格式（如 `sync:bs:share:page:data`）

#### 4. 配置解析 / Config Parsing

- ✅ 支持多级配置键（如 `aliyun.oss.bucket`）
- ✅ 智能过滤被注释的配置调用
- ✅ 双向跳转（配置 ↔ 使用位置）
- ✅ 实时扫描和索引更新

### 性能优化 / Performance Optimization

#### 智能缓存策略 / Smart Caching

```typescript
// 缓存结构示例
{
  routes: {
    filePath: string,
    lastModified: number,
    routes: RouteDefinition[]
  },
  middleware: {
    filePath: string,
    lastModified: number,
    definitions: MiddlewareDefinition[]
  },
  commands: {
    filePath: string,
    lastModified: number,
    commands: CommandDefinition[]
  }
}
```

#### 增量更新 / Incremental Updates

- **文件监控**: 监听 `routes/`, `app/Api/Controllers/`, `app/Console/` 等目录的文件变化
- **智能更新**: 只更新修改的文件，避免全量重新解析
- **性能优先**: 异步处理文件解析，不阻塞 UI

#### 内存管理 / Memory Management

- 使用高效的数据结构存储解析结果
- 自动清理过期缓存
- 最小化内存占用

---

## 📁 支持的文件类型 / Supported File Types

| 文件类型 / File Type | 路径模式 / Path Pattern | 说明 / Description |
|---------------------|------------------------|-------------------|
| **路由文件** | `routes/*.php` | API 路由、Web 路由、自定义路由等 |
| **控制器** | `app/Api/Controllers/**/*.php`<br>`app/Http/Controllers/**/*.php` | 所有控制器文件，支持多层目录 |
| **中间件** | `app/Http/Middleware/**/*.php` | 自定义中间件 |
| **命令** | `app/Console/Commands/**/*.php` | Artisan 命令类 |
| **配置文件** | `config/**/*.php` | 所有配置文件 |
| **内核文件** | `app/Http/Kernel.php`<br>`app/Console/Kernel.php` | HTTP 内核和控制台内核 |

---

## ❓ 常见问题 / Troubleshooting

### 问题 1: 点击跳转没有反应 / Navigation Not Working

**可能原因 / Possible Causes:**
- ❌ 不是 Laravel 项目
- ❌ 缓存未初始化
- ❌ 文件路径不正确

**解决方案 / Solutions:**

1. 确认项目根目录有 `artisan` 文件
2. 打开命令面板，执行 `Laravel Jump: Rescan Project` 重新扫描
3. 执行 `Laravel Jump: Show Logs` 查看错误日志
4. 检查文件路径是否符合 Laravel 标准结构

### 问题 2: 中间件跳转显示位置不准确 / Middleware Jump Location Inaccurate

**解决方案 / Solutions:**

中间件跳转采用**实时解析模式**，理论上始终准确。如果出现问题：

1. 执行 `Laravel Jump: Clear Cache` 清除缓存
2. 执行 `Laravel Jump: Rescan Project` 重新扫描
3. 检查路由文件语法是否正确

### 问题 3: 扩展运行缓慢 / Extension Running Slow

**可能原因 / Possible Causes:**
- ❌ 项目文件过多
- ❌ 缓存数据量过大
- ❌ 频繁的文件变化

**解决方案 / Solutions:**

1. 执行 `Laravel Jump: Clear Cache` 清除缓存
2. 关闭不需要的文件监控（通过 VS Code 设置）
3. 检查 `Laravel Jump: Show Statistics` 查看解析统计

### 问题 4: 命名空间解析错误 / Namespace Resolution Error

**解决方案 / Solutions:**

1. 检查路由组的 `namespace` 配置是否正确
2. 确认控制器文件的命名空间与实际目录结构一致
3. 执行 `Laravel Jump: Rescan Project` 重新扫描

---

## 🛠️ 开发路线图 / Roadmap

### 已完成 / Completed
- ✅ 路由 ↔ 控制器双向跳转
- ✅ 中间件导航（实时解析）
- ✅ 定时任务 ↔ 命令类跳转
- ✅ 配置文件导航
- ✅ 智能命名空间解析
- ✅ Controller@action 语法支持
- ✅ 多层嵌套路由组支持

### 计划中 / Planned
- 🔄 模型关联关系跳转
- 🔄 视图文件跳转
- 🔄 事件监听器跳转
- 🔄 服务提供者跳转
- 🔄 Eloquent 查询构建器智能提示
- 🔄 Blade 模板语法支持

---

## 🤝 贡献 / Contributing

欢迎贡献代码、报告问题或提出建议！

Contributions, issues, and feature requests are welcome!

### 贡献指南 / Contribution Guidelines

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 提交 Pull Request

### 报告问题 / Report Issues

在 [GitHub Issues](https://github.com/jlcodes99/vscode-learvel-idea/issues) 提交问题时，请提供：

- VS Code 版本
- 扩展版本
- Laravel 版本
- 问题描述和复现步骤
- 相关代码示例

---

## 📜 许可证 / License

本项目基于 [MIT License](LICENSE) 开源。

This project is licensed under the MIT License.

---

## 💖 致谢 / Acknowledgments

感谢所有使用和支持 Learvel Idea 的开发者！

Thanks to all developers who use and support Learvel Idea!

**如果这个扩展对你有帮助，请在 [VS Code 市场](https://marketplace.visualstudio.com/items?itemName=jlcodes.learvel-idea) 给个五星好评 ⭐️**

**If this extension helps you, please give it a 5-star rating on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=jlcodes.learvel-idea) ⭐️**

---

<div align="center">

**为 Laravel 开发者用心制作 ❤️**

**Made with ❤️ for Laravel Developers**

[官网](https://github.com/jlcodes99/vscode-learvel-idea) • [文档](https://github.com/jlcodes99/vscode-learvel-idea/wiki) • [问题反馈](https://github.com/jlcodes99/vscode-learvel-idea/issues)

</div>