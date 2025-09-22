/**
 * Laravel IDE扩展 - 类型定义
 * 
 * 包含所有接口和类型定义，为各个模块提供类型支持
 * 
 * @author lijie
 */

export interface ParsedRoute {
    method: string;
    path: string;
    controller: string;
    action: string;
    namespace: string;
    file: string;
    line: number;
    column: number;
}

export interface ParsedMiddleware {
    name: string;          // 中间件名称 (不含参数)
    fullName: string;      // 完整中间件名称 (含参数)
    type: 'group' | 'chain' | 'without';  // 中间件类型
    file: string;          // 所在文件
    line: number;          // 所在行号
    startPos: number;      // 中间件名称开始位置
    endPos: number;        // 中间件名称结束位置
}

export interface MiddlewareDefinition {
    name: string;          // 中间件名称
    className: string;     // 对应的类名
    file: string;          // Kernel.php文件路径
    line: number;          // 定义所在行
    startPos: number;      // 名称开始位置
    endPos: number;        // 名称结束位置
}

export interface LaravelCache {
    routes: Map<string, ParsedRoute[]>;
    middlewares: Map<string, ParsedMiddleware[]>;
    middlewareDefinitions: Map<string, MiddlewareDefinition>;
    commands: Map<string, ParsedCommand[]>;
    commandDefinitions: Map<string, CommandDefinition>;
    lastUpdate: number;
}

export interface RouteInfo {
    controller?: string;
    action?: string;
    middleware?: string;
    command?: string;
    type: 'controller' | 'method' | 'middleware' | 'command';
}

export interface ControllerInfo {
    controller: string;
    method?: string;
    type: 'class' | 'method';
}

export interface ParsedCommand {
    commandName: string;    // 命令名称：upload:ai-ident-image
    signature: string;      // 完整签名：upload:ai-ident-image {param}
    file: string;           // 所在文件
    line: number;           // 所在行号
    startPos: number;       // 命令名称开始位置
    endPos: number;         // 命令名称结束位置
    type: 'schedule' | 'signature';  // 定义类型
}

export interface CommandDefinition {
    commandName: string;    // 命令名称
    className: string;      // 类名
    file: string;           // Command类文件路径
    line: number;           // 类定义所在行
    signatureLine?: number; // $signature属性所在行
}
