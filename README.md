# Laravel Idea - Laravel 智能导航扩展

[![Version](https://img.shields.io/visual-studio-marketplace/v/jlcodes.laravel-idea?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jlcodes.laravel-idea)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/jlcodes.laravel-idea?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jlcodes.laravel-idea)
[![License](https://img.shields.io/github/license/jlcodes99/vscode-laravel-idea?style=flat-square)](LICENSE)

> **专为 Laravel 开发者打造的智能代码导航工具**  
> 简化路由、中间件、命令、配置之间的跳转操作

A powerful Laravel development extension that provides intelligent navigation and code jumping capabilities between routes, middleware, commands, and configurations.

---

### 🔥 最佳实践推荐 / Best Practice

> **💡 建议与 [PHP Tools](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.phptools-vscode) 插件配合使用**  
> 
> **Laravel Idea** 专注于 Laravel 框架特性的智能导航，是对 PHP Tools 在 Laravel 框架支持上的有效补充。  
> **两者组合使用，提供更完整的 Laravel 开发体验。**
> 
> **Recommended to use with [PHP Tools](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.phptools-vscode)**
> 
> **Laravel Idea** focuses on Laravel framework-specific navigation, effectively complementing PHP Tools.  
> **Together, they provide a more complete Laravel development experience.**

---

## 📖 目录 / Table of Contents

- [为什么选择 Laravel Idea](#-为什么选择-laravel-idea--why-choose-laravel-idea)
- [快速开始](#-快速开始--quick-start)
- [关于功能](#-关于功能--about-features)
- [核心功能与使用](#-核心功能与使用--core-features--usage)
- [扩展命令](#%EF%B8%8F-扩展命令--extension-commands)
- [配置选项](#%EF%B8%8F-配置选项--configuration)

---

## 🎯 为什么选择 Laravel Idea / Why Choose Laravel Idea

### 🎪 完美搭档 / Perfect Partnership

> **💎 专业的事交给专业的工具做**
> 
> 在 Laravel 开发中，PHP Tools 提供了优秀的 PHP 语言支持，但对于 Laravel 框架特有的路由、中间件、命令等特性支持有限。**Laravel Idea 正是为了填补这一空白而生！**
> 
> - **PHP Tools** 👉 负责 PHP 语言层面（类、方法、变量、命名空间等）
> - **Laravel Idea** 👉 专注 Laravel 框架层面（路由、中间件、命令、配置等）
> 
> **两者配合，提供更完整的 Laravel 开发体验。**

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
✅ **无缝集成** - 与 PHP Tools 有效配合，互不干扰，共同提供完整开发体验

---

## 快速开始 / Quick Start

### 💡 重要提示 / Important Notice

> **🔥 推荐配合使用 / Recommended Combo**  
> 
> **本扩展专为 Laravel 框架优化，强烈建议配合 [PHP Tools](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.phptools-vscode) 插件使用！**
> 
> **Laravel Idea** 专注于 Laravel 特有的路由、中间件、命令等框架层面的智能跳转，有效补充了 PHP Tools 在 Laravel 框架特性上的不足。两者配合使用，将为你提供更完整的 Laravel 开发体验：
> 
> - ✅ **PHP Tools**: 提供 PHP 语言的智能感知、代码补全、类跳转、重构等基础能力
> - ✅ **Laravel Idea**: 提供 Laravel 框架的路由跳转、中间件导航、命令跳转、配置导航等专属功能
> 
> **This extension is specifically optimized for Laravel framework. We strongly recommend using it together with [PHP Tools](https://marketplace.visualstudio.com/items?itemName=DEVSENSE.phptools-vscode)!**
> 
> **Laravel Idea** focuses on Laravel-specific intelligent navigation for routes, middleware, commands, etc., effectively complementing PHP Tools' capabilities. Together, they provide a more complete Laravel development experience:
> 
> - ✅ **PHP Tools**: PHP language intelligence, code completion, class navigation, refactoring, etc.
> - ✅ **Laravel Idea**: Laravel framework-specific route navigation, middleware jumps, command jumps, config navigation, etc.

### 安装 / Installation

1. 打开 VS Code，进入扩展市场 (Ctrl+Shift+X)
2. 搜索 "Laravel Idea"
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

## 💡 关于功能 / About Features

> **📝 这些功能都来自实际开发痛点**
> 
> 本扩展的所有功能都是作者在日常 Laravel 开发中遇到的真实痛点。我们深知大型 Laravel 项目中代码导航的困难，因此专注于解决这些实际问题。
> 
> **💬 需要其他功能？**  
> 如果你在使用过程中有任何功能需求或改进建议，欢迎在 [GitHub Issues](https://github.com/jlcodes99/vscode-laravel-idea/issues) 留言反馈！我们会根据使用情况和社区反馈持续优化和添加新功能。
> 
> **📝 All features are born from real development pain points**
> 
> Every feature in this extension comes from actual challenges the author faced in daily Laravel development. We understand the difficulties of code navigation in large Laravel projects and focus on solving these real problems.
> 
> **💬 Need other features?**  
> If you have any feature requests or suggestions during use, feel free to leave feedback on [GitHub Issues](https://github.com/jlcodes99/vscode-laravel-idea/issues)! We will continue to optimize and add new features based on usage and community feedback.

---

## ✨ 核心功能与使用 / Core Features & Usage

### 1️⃣ 路由 ↔ 控制器跳转 / Route ↔ Controller Navigation

#### 基本使用 / Basic Usage

**支持的路由格式**：Route::、$api-> 等主流格式，完整支持 `Controller@action` 语法。

```php
// ✅ 标准 Laravel 路由
Route::post('/users', 'UserController@store');
$api->post('user-list', 'UserController@list');

// ✅ 点击不同位置有不同效果
$api->post('batch-add-goods', 'GoodsController@batchAddGoods');
//          👆 无跳转          👆 跳转到类  👆 跳转到方法
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

**双向跳转**：从路由跳转到中间件定义，或从中间件定义查找所有使用位置。

```php
// 路由中点击中间件名跳转
Route::group([
    'middleware' => ['checkUserLogin', 'throttle:200,1,user_id'],
    //               👆 Ctrl+点击跳转到 Kernel.php
], function ($api) { /* ... */ });

// Kernel.php 中点击中间件名查找使用位置
protected $routeMiddleware = [
    'checkUserLogin' => CheckUserLoginMiddleware::class,
    //👆 Ctrl+点击查找所有使用此中间件的路由
];
```

**支持**：链式中间件、withoutMiddleware、带参数的中间件（如 `throttle:200,1`）。采用实时解析，无需刷新缓存。

---

### 3️⃣ 定时任务 ↔ 命令类跳转 / Schedule ↔ Command Navigation

**双向跳转**：从定时任务跳转到命令类，或从命令类查找对应的定时任务。

```php
// Kernel.php 中点击命令名跳转到命令类
$schedule->command('upload:ai-ident-image')->daily();
//                  👆 Ctrl+点击跳转到 UploadAiIdentImageCommand

// 命令类中点击类名查找定时任务
class UploadAiIdentImageCommand extends Command
//    👆 Ctrl+点击查找对应的定时任务
{
    protected $signature = 'upload:ai-ident-image';
}
```

**智能转换**：自动处理命令名到类名的转换（如 `upload:ai-ident-image` → `UploadAiIdentImageCommand`），支持带参数的命令。

---

### 4️⃣ 配置导航 / Configuration Navigation

**双向跳转**：从配置文件跳转到使用位置，或从代码跳转到配置定义。

```php
// config/aliyun.php 中点击键名查找使用位置
return [
    'access_key_id' => env('ALIYUN_ACCESS_KEY_ID', ''),
    //👆 Ctrl+点击查找所有使用 config('aliyun.access_key_id') 的位置
    
    'oss' => [
        'region' => env('ALIYUN_OSS_REGION', ''),
        //👆 支持多级配置键
    ],
];

// 代码中点击配置键跳转到定义
$key = config('aliyun.access_key_id');
//              👆 Ctrl+点击跳转到 config/aliyun.php
```

**智能过滤**：自动跳过被注释的配置调用，只跳转到实际生效的代码。

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

打开 VS Code 设置（File > Preferences > Settings），搜索 "Laravel Idea"，可以配置以下选项：

| 配置项 / Setting | 默认值 / Default | 说明 / Description |
|-----------------|------------------|-------------------|
| `laravelIdea.routeFilePattern` | `/routes/` | 路由文件路径匹配模式 |
| `laravelIdea.controllerFilePattern` | `Controller` | 控制器文件名匹配模式 |
| `laravelIdea.commandFilePattern` | `/Console/Commands/` | 命令文件路径匹配模式 |
| `laravelIdea.consoleKernelPattern` | `/Console/Kernel.php` | Console Kernel 文件路径 |
| `laravelIdea.httpKernelPattern` | `/Http/Kernel.php` | Http Kernel 文件路径 |
| `laravelIdea.configFilePattern` | `/config/` | 配置文件路径匹配模式 |

### 项目目录配置 / Directory Configuration

| 配置项 / Setting | 默认值 / Default | 说明 / Description |
|-----------------|------------------|-------------------|
| `laravelIdea.appPath` | `app` | Laravel 应用目录路径 |
| `laravelIdea.controllerPath` | `app/Api/Controllers` | 控制器目录路径 |
| `laravelIdea.routePath` | `routes` | 路由文件目录路径 |

### 快捷键配置 / Keybinding Configuration

| 配置项 / Setting | 默认值 / Default | 说明 / Description |
|-----------------|------------------|-------------------|
| `laravelIdea.enablePhpStormKeybindings` | `false` | 启用 PHPStorm 风格快捷键（基础版本） |
| `laravelIdea.enablePhpStormAdvancedKeybindings` | `false` | 启用 PHPStorm 风格快捷键（高级版本） |

#### PHPStorm 风格快捷键（基础版本）

| 快捷键 (Mac) | 快捷键 (Windows/Linux) | 功能 | 说明 |
|-------------|----------------------|------|------|
| `Cmd+Shift+O` | `Ctrl+Shift+O` | 快速打开文件 | 打开文件搜索框 |
| `Cmd+R` | `Ctrl+R` | 当前文件查找替换 | 在当前文件中查找和替换 |
| `Cmd+Shift+R` | `Ctrl+Shift+R` | 全局查找替换 | 在所有文件中查找和替换 |
| `Alt+1` | `Alt+1` | 打开文件资源管理器 | 切换到文件树视图 |
| `Alt+9` | `Alt+9` | 切换终端 | 显示/隐藏终端面板 |
| `Cmd+G` | `Ctrl+G` | 跳转到行 | 输入行号快速跳转 |
| `Cmd+Shift+F` | `Ctrl+Shift+F` | 全局搜索 | 在所有文件中搜索 |
| `Cmd+E` | `Ctrl+E` | 最近文件 | 打开最近使用的文件列表 |
| `Cmd+,` | `Ctrl+Alt+S` | 打开设置 | 打开 VS Code 设置 |
| `Alt+3` | `Alt+3` | 打开搜索视图 | 切换到搜索面板 |
| `Alt+5` | `Alt+5` | 打开调试视图 | 切换到调试面板 |
| `Alt+6` | `Alt+6` | 打开版本控制 | 切换到 Git/SCM 面板 |
| `Alt+7` | `Alt+7` | 打开扩展视图 | 切换到扩展管理面板 |
| `F9` | `F9` | 切换断点 | 在当前行添加/删除断点 |
| `F8` | `F8` | 调试步过 | 执行下一步（不进入函数） |
| `F7` | `F7` | 调试步入 | 执行下一步（进入函数） |
| `Shift+F8` | `Shift+F8` | 调试步出 | 跳出当前函数 |

#### PHPStorm 风格快捷键（高级版本）

**⚠️ 注意**：高级版本包含基础版本的所有快捷键，并额外添加以下快捷键（可能与 VS Code 默认快捷键冲突）

| 快捷键 (Mac) | 快捷键 (Windows/Linux) | 功能 | 说明 |
|-------------|----------------------|------|------|
| `Cmd+O` | `Ctrl+N` | 快速打开文件 | 打开文件搜索框（覆盖默认行为） |
| `Cmd+D` | `Ctrl+D` | 复制当前行 | 复制当前行到下一行 |
| `Cmd+Backspace` | `Ctrl+Y` | 删除当前行 | 删除整行内容 |
| `Cmd+Shift+↑` | `Ctrl+Shift+↑` | 向上移动行 | 将当前行向上移动 |
| `Cmd+Shift+↓` | `Ctrl+Shift+↓` | 向下移动行 | 将当前行向下移动 |
| `Cmd+/` | `Ctrl+/` | 行注释 | 添加/删除行注释 |
| `Cmd+Shift+/` | `Ctrl+Shift+/` | 块注释 | 添加/删除块注释 |
| `Cmd+F` | `Ctrl+F` | 当前文件查找 | 在当前文件中查找 |
| `F3` | `F3` | 查找下一个 | 跳转到下一个匹配项 |
| `Shift+F3` | `Shift+F3` | 查找上一个 | 跳转到上一个匹配项 |
| `Cmd+Shift+F12` | `Ctrl+Shift+F12` | 最大化面板 | 切换面板最大化状态 |
| `Cmd+Tab` | `Ctrl+Tab` | 切换最近文件 | 在最近文件间切换 |
| `Option+Cmd+L` | `Alt+Ctrl+L` | 格式化代码 | 有选中时格式化选中内容，无选中时格式化整个文档 |

### 配置示例 / Configuration Example

如果您的项目结构不同于标准 Laravel，可以自定义路径模式：

```json
{
  "laravelIdea.routeFilePattern": "/custom-routes/",
  "laravelIdea.controllerFilePattern": "MyController",
  "laravelIdea.controllerPath": "app/MyApp/Controllers"
}
```

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

在 [GitHub Issues](https://github.com/jlcodes99/vscode-laravel-idea/issues) 提交问题时，请提供：

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

感谢所有使用和支持 Laravel Idea 的开发者！

Thanks to all developers who use and support Laravel Idea!

**如果这个扩展对你有帮助，请在 [VS Code 市场](https://marketplace.visualstudio.com/items?itemName=jlcodes.laravel-idea) 给个五星好评 ⭐️**

**If this extension helps you, please give it a 5-star rating on the [VS Code Marketplace](https://marketplace.visualstudio.com/items?itemName=jlcodes.laravel-idea) ⭐️**

---

<div align="center">

**为 Laravel 开发者用心制作 ❤️**

**Made with ❤️ for Laravel Developers**

[官网](https://github.com/jlcodes99/vscode-laravel-idea) • [文档](https://github.com/jlcodes99/vscode-laravel-idea/wiki) • [问题反馈](https://github.com/jlcodes99/vscode-laravel-idea/issues)

</div>