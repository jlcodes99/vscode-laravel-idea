# 🚀 Learvel Idea

[![Version](https://img.shields.io/visual-studio-marketplace/v/jlcodes.learvel-idea?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jlcodes.learvel-idea)
[![Downloads](https://img.shields.io/visual-studio-marketplace/d/jlcodes.learvel-idea?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jlcodes.learvel-idea)
[![Rating](https://img.shields.io/visual-studio-marketplace/r/jlcodes.learvel-idea?style=flat-square)](https://marketplace.visualstudio.com/items?itemName=jlcodes.learvel-idea)
[![License](https://img.shields.io/github/license/jlcodes99/vscode-learvel-idea?style=flat-square)](LICENSE)

<div align="center">

**🌐 Language / 语言选择**

[English](#english) | [中文](#中文)

</div>

---

## English

**Learvel Idea** is a powerful Laravel development enhancement extension for Visual Studio Code that provides intelligent navigation between routes and controllers, along with PHPStorm-style keybindings.

### ✨ Features

- 🎯 **Smart Navigation**: Jump from routes to controllers and vice versa with namespace-aware precision
- 🔍 **Middleware Support**: Navigate to middleware definitions and find their usage locations
- ⚡ **PHPStorm Keybindings**: Optional PHPStorm-style keyboard shortcuts for familiar workflow
- 🎨 **Hover Information**: Rich hover tooltips showing controller and method information
- 🔗 **Reverse Navigation**: Jump from controller methods back to their route definitions
- 📁 **Multi-namespace Support**: Handles complex Laravel project structures with multiple namespaces

### 🚀 Installation

1. Open Visual Studio Code
2. Go to Extensions (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. Search for "Learvel Idea"
4. Click Install

Or install via command line:
```bash
code --install-extension jlcodes.learvel-idea
```

### 📖 Usage

#### Route Navigation
- **Alt + Click** on controller names in route files to jump to controller methods
- **Alt + Click** on method names to jump directly to the method implementation
- **Alt + Click** on middleware names to view their definitions

#### Controller Navigation
- **Alt + Click** on class names or method names in controllers to find their route definitions
- If multiple routes are found, VSCode will show a selection menu

#### Hover Information
- Hover over route definitions to see controller and method information
- Hover over middleware names to see parameter details

### ⚙️ Configuration

Configure the extension through VS Code settings:

```json
{
    "learvelIdea.appPath": "app",
    "learvelIdea.controllerPath": "app/Api/Controllers", 
    "learvelIdea.routePath": "routes",
    "learvelIdea.enablePhpStormKeybindings": false,
    "learvelIdea.enablePhpStormAdvancedKeybindings": false
}
```

#### Configuration Options

| Setting | Description | Default |
|---------|-------------|---------|
| `learvelIdea.appPath` | Laravel application directory path | `"app"` |
| `learvelIdea.controllerPath` | Controller directory path | `"app/Api/Controllers"` |
| `learvelIdea.routePath` | Route files directory path | `"routes"` |
| `learvelIdea.enablePhpStormKeybindings` | Enable basic PHPStorm-style keybindings | `false` |
| `learvelIdea.enablePhpStormAdvancedKeybindings` | Enable advanced PHPStorm keybindings (may conflict) | `false` |

### ⌨️ PHPStorm Keybindings

Enable PHPStorm-style keybindings through settings:

#### Basic Keybindings
- `Ctrl+Shift+O` / `Cmd+Shift+O` - Quick Open
- `Ctrl+R` / `Cmd+R` - Find and Replace
- `Ctrl+G` / `Cmd+G` - Go to Line
- `Alt+1` - Explorer Panel
- `Alt+9` - Terminal Panel

#### Advanced Keybindings (Optional)
- `Ctrl+D` / `Cmd+D` - Duplicate Line
- `Ctrl+Y` / `Cmd+Backspace` - Delete Line
- `F9` - Toggle Breakpoint
- `F8` - Step Over (Debug)

### 🛠️ Development

#### Prerequisites
- Node.js 16+
- Visual Studio Code
- TypeScript

#### Setup
```bash
git clone https://github.com/jlcodes99/vscode-learvel-idea.git
cd vscode-learvel-idea
npm install
npm run compile
```

#### Build
```bash
npm run vscode:prepublish
```

### 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📝 License

This project is licensed under the [MIT License](LICENSE).

### 🙏 Acknowledgments

- Inspired by PHPStorm's Laravel plugin functionality
- Built for the Laravel developer community

---

## 中文

**Learvel Idea** 是一个强大的 Laravel 开发增强扩展，为 Visual Studio Code 提供路由和控制器之间的智能导航，以及 PHPStorm 风格的快捷键绑定。

### ✨ 功能特性

- 🎯 **智能导航**: 在路由和控制器之间进行命名空间感知的精确跳转
- 🔍 **中间件支持**: 导航到中间件定义并查找其使用位置
- ⚡ **PHPStorm 快捷键**: 可选的 PHPStorm 风格键盘快捷键，保持熟悉的工作流程
- 🎨 **悬浮信息**: 丰富的悬浮提示显示控制器和方法信息
- 🔗 **反向导航**: 从控制器方法跳转回其路由定义
- 📁 **多命名空间支持**: 处理具有多个命名空间的复杂 Laravel 项目结构

### 🚀 安装方法

1. 打开 Visual Studio Code
2. 进入扩展面板 (`Ctrl+Shift+X` / `Cmd+Shift+X`)
3. 搜索 "Learvel Idea"
4. 点击安装

或通过命令行安装：
```bash
code --install-extension jlcodes.learvel-idea
```

### 📖 使用方法

#### 路由导航
- 在路由文件中 **Alt + 点击** 控制器名称可跳转到控制器方法
- **Alt + 点击** 方法名称可直接跳转到方法实现
- **Alt + 点击** 中间件名称可查看其定义

#### 控制器导航
- 在控制器中 **Alt + 点击** 类名或方法名可查找其路由定义
- 如果找到多个路由，VSCode 会显示选择菜单

#### 悬浮信息
- 悬浮在路由定义上可查看控制器和方法信息
- 悬浮在中间件名称上可查看参数详情

### ⚙️ 配置选项

通过 VS Code 设置配置扩展：

```json
{
    "learvelIdea.appPath": "app",
    "learvelIdea.controllerPath": "app/Api/Controllers", 
    "learvelIdea.routePath": "routes",
    "learvelIdea.enablePhpStormKeybindings": false,
    "learvelIdea.enablePhpStormAdvancedKeybindings": false
}
```

#### 配置说明

| 设置项 | 描述 | 默认值 |
|--------|------|--------|
| `learvelIdea.appPath` | Laravel 应用目录路径 | `"app"` |
| `learvelIdea.controllerPath` | 控制器目录路径 | `"app/Api/Controllers"` |
| `learvelIdea.routePath` | 路由文件目录路径 | `"routes"` |
| `learvelIdea.enablePhpStormKeybindings` | 启用基础 PHPStorm 风格快捷键 | `false` |
| `learvelIdea.enablePhpStormAdvancedKeybindings` | 启用高级 PHPStorm 快捷键（可能冲突） | `false` |

### ⌨️ PHPStorm 快捷键

通过设置启用 PHPStorm 风格快捷键：

#### 基础快捷键
- `Ctrl+Shift+O` / `Cmd+Shift+O` - 快速打开
- `Ctrl+R` / `Cmd+R` - 查找和替换
- `Ctrl+G` / `Cmd+G` - 跳转到行
- `Alt+1` - 资源管理器面板
- `Alt+9` - 终端面板

#### 高级快捷键（可选）
- `Ctrl+D` / `Cmd+D` - 复制行
- `Ctrl+Y` / `Cmd+Backspace` - 删除行
- `F9` - 切换断点
- `F8` - 单步跳过（调试）

### 🛠️ 开发

#### 环境要求
- Node.js 16+
- Visual Studio Code
- TypeScript

#### 设置
```bash
git clone https://github.com/jlcodes99/vscode-learvel-idea.git
cd vscode-learvel-idea
npm install
npm run compile
```

#### 构建
```bash
npm run vscode:prepublish
```

### 🤝 贡献

欢迎贡献！请随时提交 Pull Request。

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启 Pull Request

### 📝 许可证

本项目采用 [MIT 许可证](LICENSE)。

### 🙏 致谢

- 灵感来源于 PHPStorm 的 Laravel 插件功能
- 为 Laravel 开发者社区而构建

---

<div align="center">

**Made with ❤️ for Laravel developers**

</div>