# Change Log

All notable changes to the **Learvel Idea** extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-19

### 🎉 Initial Release

- **Smart Navigation**: Navigate from routes to controllers and vice versa with namespace-aware precision
- **Middleware Support**: Jump to middleware definitions and find their usage locations  
- **PHPStorm Keybindings**: Optional PHPStorm-style keyboard shortcuts for familiar workflow
- **Hover Information**: Rich hover tooltips showing controller and method information
- **Reverse Navigation**: Jump from controller methods back to their route definitions
- **Multi-namespace Support**: Handles complex Laravel project structures with multiple namespaces

### Features

#### Core Navigation
- Alt+Click navigation from routes to controllers
- Alt+Click navigation from controllers to routes
- Support for complex namespace structures
- Precise method-level navigation

#### Middleware Integration
- Navigate to middleware definitions in Kernel.php
- Find all routes using specific middleware
- Support for parameterized middleware

#### Developer Experience
- Rich hover information with parameter details
- Multiple navigation options with selection menu
- Configurable paths for different project structures
- Optional PHPStorm-style keybindings

#### PHPStorm Keybindings
- Basic keybindings (safe, no conflicts)
- Advanced keybindings (optional, may conflict with VSCode defaults)
- Familiar shortcuts for PHPStorm users

### Configuration
- `learvelIdea.appPath`: Laravel application directory path
- `learvelIdea.controllerPath`: Controller directory path  
- `learvelIdea.routePath`: Route files directory path
- `learvelIdea.enablePhpStormKeybindings`: Enable basic PHPStorm-style keybindings
- `learvelIdea.enablePhpStormAdvancedKeybindings`: Enable advanced PHPStorm keybindings

### Technical Details
- Built with TypeScript for better maintainability
- Namespace-aware navigation engine
- Support for Laravel's route grouping and middleware
- Extensive pattern matching for route definitions
- Optimized file scanning and caching

---

**Note**: This is a complete rewrite and fresh start of the extension, now officially called "Learvel Idea" (previously "Laravel Idea VSCode").