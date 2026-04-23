import type { LocalizedText } from '@/services/i18n/constant';

export type ToolModuleSlug =
    | 'timestamp'
    | 'exchange-rate'
    | 'qrcode'
    | 'image-watermark'
    | 'image-unwatermark'
    | 'image-crop'
    | 'xhs-unwatermark'
    | 'base64'
    | 'json-tools'
    | 'markdown'
    | 'local-network'
    | 'network-speed'
    | 'http-test'
    | 'websocket-test';

export type ToolCategory = 'text' | 'image' | 'network';
export type ToolCategoryFilter = ToolCategory | 'all';

export type ToolModule = {
    sort: number;
    slug: ToolModuleSlug;
    href: `/${ToolModuleSlug}`;
    category: ToolCategory;
    badge: string;
    title: LocalizedText;
    description: LocalizedText;
};

export const toolCategoryOrder: ToolCategory[] = ['text', 'image', 'network'];
export const toolCategoryFilterOrder: ToolCategoryFilter[] = ['all', ...toolCategoryOrder];

const toolModuleRegistry: ToolModule[] = [
    {
        sort: 10,
        slug: 'timestamp',
        href: '/timestamp',
        category: 'text',
        badge: 'TIME',
        title: { zh: '时间戳转换', en: 'Timestamp Converter' },
        description: {
            zh: '在秒、毫秒、UTC 和本地时间之间快速换算。',
            en: 'Convert between seconds, milliseconds, UTC and local time.',
        },
    },
    {
        sort: 60,
        slug: 'exchange-rate',
        href: '/exchange-rate',
        category: 'text',
        badge: 'FX',
        title: { zh: '汇率转换', en: 'Exchange Rates' },
        description: {
            zh: '基于可编辑参考汇率，在常用币种间即时换算。',
            en: 'Convert between common currencies with editable reference rates.',
        },
    },
    {
        sort: 30,
        slug: 'qrcode',
        href: '/qrcode',
        category: 'image',
        badge: 'QR',
        title: { zh: '二维码生成与反解', en: 'QR Code Tool' },
        description: {
            zh: '生成二维码图片，或从本地/网络图片中反解析二维码内容。',
            en: 'Generate QR codes or decode them from local and remote images.',
        },
    },
    {
        sort: 35,
        slug: 'image-watermark',
        href: '/image-watermark',
        category: 'image',
        badge: 'WM',
        title: { zh: '图片加水印', en: 'Image Watermark' },
        description: {
            zh: '上传图片并添加文字水印，实时预览后下载处理结果。',
            en: 'Upload an image, add a text watermark, preview it live, and download the result.',
        },
    },
    {
        sort: 36,
        slug: 'image-unwatermark',
        href: '/image-unwatermark',
        category: 'image',
        badge: 'CLEAN',
        title: { zh: '图片去水印', en: 'Image Watermark Remover' },
        description: {
            zh: '框选水印区域，使用邻近画面进行本地修复，并下载处理结果。',
            en: 'Select a watermark area, repair it with nearby pixels locally, and download the result.',
        },
    },
    {
        sort: 37,
        slug: 'image-crop',
        href: '/image-crop',
        category: 'image',
        badge: 'CROP',
        title: { zh: '图片裁剪', en: 'Image Crop' },
        description: {
            zh: '上传图片后进行裁剪、旋转、缩放，并下载导出结果。',
            en: 'Upload an image, crop it, rotate and zoom it, then download the result.',
        },
    },
    {
        sort: 29,
        slug: 'xhs-unwatermark',
        href: '/xhs-unwatermark',
        category: 'image',
        badge: 'XHS',
        title: { zh: '小红书去水印', en: 'XHS Watermark Remover' },
        description: {
            zh: '粘贴小红书分享链接，解析图片、视频和 Live Photo 原始资源。',
            en: 'Paste an XHS share link and extract original image, video and Live Photo media.',
        },
    },
    {
        sort: 40,
        slug: 'base64',
        href: '/base64',
        category: 'text',
        badge: 'B64',
        title: { zh: 'Base64 编解码', en: 'Base64 Tool' },
        description: {
            zh: '支持文字 Base64 转换，以及本地或网络图片转 Base64。',
            en: 'Encode text and convert local or remote images to Base64.',
        },
    },
    {
        sort: 50,
        slug: 'json-tools',
        href: '/json-tools',
        category: 'text',
        badge: 'JSON',
        title: { zh: 'JSON 校验与格式化', en: 'JSON Tools' },
        description: {
            zh: '校验 JSON 合法性，并快速格式化或压缩输出。',
            en: 'Validate JSON and quickly format or compress the output.',
        },
    },
    {
        sort: 20,
        slug: 'markdown',
        href: '/markdown',
        category: 'text',
        badge: 'MD',
        title: { zh: 'Markdown 实时预览', en: 'Markdown Preview' },
        description: {
            zh: '实时编辑 Markdown，预览渲染效果，并复制输出 HTML。',
            en: 'Edit Markdown live, preview rendering, and copy the output.',
        },
    },
    {
        sort: 85,
        slug: 'local-network',
        href: '/local-network',
        category: 'network',
        badge: 'LAN',
        title: { zh: '本地网络测试', en: 'Local Network Test' },
        description: {
            zh: '检测当前浏览器公网出口、IPv4/IPv6 可达性与 WebRTC 地址暴露情况。',
            en: 'Inspect public egress IPs, IPv4/IPv6 reachability and WebRTC address exposure in the browser.',
        },
    },
    {
        sort: 90,
        slug: 'network-speed',
        href: '/network-speed',
        category: 'network',
        badge: 'PING',
        title: { zh: 'Ping 测试', en: 'Global Ping Test' },
        description: {
            zh: '基于开源探针网络，从全球主要国家和地区节点测试目标延迟与丢包。',
            en: 'Measure latency and packet loss from major countries and regions worldwide through an open-source probe network.',
        },
    },
    {
        sort: 70,
        slug: 'http-test',
        href: '/http-test',
        category: 'network',
        badge: 'HTTP',
        title: { zh: 'HTTP 测试', en: 'HTTP Tester' },
        description: {
            zh: '发起 HTTP 请求，查看状态码、响应头、响应体和耗时。',
            en: 'Send HTTP requests and inspect status, headers, body and timing.',
        },
    },
    {
        sort: 80,
        slug: 'websocket-test',
        href: '/websocket-test',
        category: 'network',
        badge: 'WS',
        title: { zh: 'WebSocket 测试', en: 'WebSocket Tester' },
        description: {
            zh: '连接 WebSocket 服务，发送消息并查看双向通信日志。',
            en: 'Connect to a WebSocket service, send messages and inspect bidirectional logs.',
        },
    },
];

export const toolModules = [...toolModuleRegistry].sort((previousTool, nextTool) => previousTool.sort - nextTool.sort);

export const defaultToolHref = toolModules[0].href;

export function getToolModule(slug: ToolModuleSlug) {
    return toolModules.find((tool) => tool.slug === slug) ?? toolModules[0];
}

export function getToolsByCategory(category: ToolCategory) {
    return toolModules.filter((tool) => tool.category === category);
}

export function isToolCategory(value: string | null | undefined): value is ToolCategory {
    return value === 'text' || value === 'image' || value === 'network';
}

export function normalizeToolCategoryFilter(value: string | null | undefined): ToolCategoryFilter {
    return isToolCategory(value) ? value : 'all';
}
