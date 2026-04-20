/**
 * BOC 调试工具注入脚本
 * 自动识别 HTML 页面并注入 Eruda / vConsole 调试工具
 * 
 * 参数通过 Loon [Argument] 传入，通过 $argument.xxx 获取
 */

var args = $argument;
console.log('[BOC Debugger] $argument: ' + JSON.stringify(args));

var enableEruda = args.enable_eruda !== 'false';
var enableVconsole = args.enable_vconsole !== 'false';

// 检查是否为 HTML 响应
var contentType = ($response.headers['Content-Type'] || '').toLowerCase();
var isHtml = contentType.includes('text/html');

if (!isHtml) {
    $done({});
}

var body = $response.body;
if (!body || typeof body !== 'string') {
    $done({});
}

// 构建注入脚本
var injectScripts = [];

if (enableEruda) {
    injectScripts.push(
        '<script src="https://cdn.jsdelivr.net/npm/eruda"></script>' +
        '<script>eruda.init();</script>'
    );
}

if (enableVconsole) {
    injectScripts.push(
        '<script src="https://cdn.jsdelivr.net/npm/vconsole@latest/dist/vconsole.min.js"></script>' +
        '<script>new window.VConsole();</script>'
    );
}

if (injectScripts.length === 0) {
    $done({});
}

var injectBlock = injectScripts.join('\n');

// 在 </head> 之前注入，如果没有 </head> 则在 <body> 之前注入
if (body.includes('</head>')) {
    body = body.replace('</head>', injectBlock + '\n</head>');
} else if (body.includes('<body')) {
    body = body.replace('<body', injectBlock + '\n<body');
} else {
    body = body + '\n' + injectBlock;
}

console.log('[BOC Debugger] 已注入调试工具: Eruda=' + enableEruda + ', vConsole=' + enableVconsole);

$done({ body: body });
