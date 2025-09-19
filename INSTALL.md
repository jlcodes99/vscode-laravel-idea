# Laravel Idea VSCode 插件安装与使用指南

## 🚀 快速安装

### 方法一：开发模式安装（推荐用于测试）

1. **打开插件目录**
   ```bash
   cd /private/var/www/leixiaoan-api/vscode-laravel-router-extension
   ```

2. **安装依赖并编译**
   ```bash
   npm install
   npm run compile
   ```

3. **在VSCode中调试运行**
   - 用VSCode打开插件目录
   - 按 `F5` 启动插件调试模式
   - 会自动打开一个新的VSCode窗口，插件已在其中激活

### 方法二：打包安装（推荐用于生产）

1. **安装vsce打包工具**
   ```bash
   npm install -g vsce
   ```

2. **打包插件**
   ```bash
   cd /private/var/www/leixiaoan-api/vscode-laravel-router-extension
   ./build.sh
   ```

3. **安装插件包**
   ```bash
   code --install-extension laravel-idea-vscode-1.0.0.vsix
   ```

## 💡 使用方法

### 1. 悬浮提示功能
- 将鼠标悬停在路由定义上
- 会显示控制器和方法信息
- 提示按住Alt键可跳转

### 2. 精确跳转功能
- **控制器跳转**：按住 `Alt` 键点击控制器名称（如：`ErpAnjieliConsignmentAccountController`）
- **方法跳转**：按住 `Alt` 键点击方法名称（如：`setDefault`）
- 光标会精确定位到控制器类名或方法名的开始位置
- ⚠️ 注意：只能点击控制器名和方法名，路径部分（如：`set-default`）不可点击

### 3. 反向跳转功能（增强！）
- **Alt+点击**：在控制器文件中按住 `Alt` 键点击类名或方法名
- 从控制器类名或方法定义处跳回对应的路由文件
- 光标会精确定位到路由中的控制器名或方法名位置
- **原生选择器**：当控制器有多个路由时，会使用VSCode原生的"Go to Definition"选择器
- **命名空间匹配**：通过命名空间进行精确匹配，避免不同命名空间下同名控制器/方法的误跳转

### 4. 支持的路由格式

```php
// ✅ API路由格式
$api->get('users', 'UserController@index');
$api->post('users', 'UserController@store');
$api->put('users/{id}', 'UserController@update');
$api->delete('users/{id}', 'UserController@destroy');

// ✅ 标准路由格式  
Route::get('users', 'UserController@index');
Route::post('users', 'UserController@store');

// ✅ 控制器@方法格式
'UserController@index'
'StaffNotificationsController@getNotify'
```

## ⚙️ 配置选项

在VSCode设置中可以配置以下选项：

```json
{
  "laravelIdeaVscode.appPath": "app",
  "laravelIdeaVscode.controllerPath": "app/Api/Controllers",
  "laravelIdeaVscode.routePath": "routes"
}
```

### 配置说明：
- `appPath`: Laravel应用目录路径
- `controllerPath`: 控制器目录路径  
- `routePath`: 路由文件目录路径

## 🔧 开发调试

### 启动调试模式
1. 用VSCode打开插件项目目录
2. 按 `F5` 或选择"调试" > "启动调试"
3. 会打开新的VSCode窗口进行插件测试

### 实时编译
```bash
npm run watch
```

### 查看日志
- 打开VSCode开发者工具：`Help` > `Toggle Developer Tools`
- 在控制台中查看插件日志

## 🎯 测试插件

1. **在调试窗口中打开Laravel项目**
2. **打开路由文件**（如：`routes/api.php`）
3. **测试悬浮功能**：鼠标悬停在路由定义上
4. **测试跳转功能**：按住Alt键点击路由定义

### 测试用例

在你的路由文件中找到类似这样的代码：
```php
$api->post('set-default', 'ErpAnjieliConsignmentAccountController@setDefault');
```

**正确的使用方式：**
- ⚠️ **不能点击**：`set` 或 `default`（路径部分）
- ✅ **可以点击**：`ErpAnjieliConsignmentAccountController`（控制器名）
- ✅ **可以点击**：`setDefault`（方法名）

**功能测试：**
1. **悬停测试**：鼠标悬停在 `ErpAnjieliConsignmentAccountController` 上应显示控制器信息
2. **控制器跳转**：Alt+点击 `ErpAnjieliConsignmentAccountController` 跳转到类定义
3. **方法跳转**：Alt+点击 `setDefault` 跳转到方法定义
4. **反向跳转**：在控制器文件中 Alt+点击类名或方法名跳回路由
5. **多路由选择**：当一个控制器有多个路由时，会弹出选择列表（显示HTTP方法、路径和行号）

**光标定位测试：**
- 跳转到控制器时，光标应该在 `ErpAnjieliConsignmentAccountController` 的开头
- 跳转到方法时，光标应该在 `setDefault` 的开头

## 🐛 故障排除

### 跳转不工作？
1. 检查控制器文件是否存在
2. 检查控制器路径配置是否正确
3. 查看开发者工具控制台的错误信息

### 悬浮提示不显示？
1. 确保在PHP文件中使用
2. 确保路由格式正确
3. 重启VSCode窗口

### 编译错误？
1. 确保已安装所有依赖：`npm install`
2. 检查TypeScript版本兼容性
3. 清理并重新编译：`rm -rf out/ && npm run compile`

## 📝 更新日志

### v1.0.0 (2025-01-18)
- 🎉 初始版本发布
- ✨ 支持Laravel路由跳转功能
- ✨ 支持悬浮提示
- ✨ 支持多种路由格式
- 🎯 支持Alt+点击跳转
- 📁 智能文件搜索功能
- 🔄 **新增**：反向跳转功能（从控制器跳回路由）
- 🎯 **优化**：精确定位光标到类名和方法名开头
- ⚠️ **修复**：防止路径部分被误点击
- ⌨️ **新增**：快捷键 `Ctrl+Alt+R` 支持

---

**作者**: lijie  
**项目**: leixiaoan-api  
**日期**: 2025/01/18