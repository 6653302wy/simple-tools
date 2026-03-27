export type ToolModuleSlug =
    | 'timestamp'
    | 'exchange-rate'
    | 'qrcode'
    | 'base64'
    | 'json-tools'
    | 'markdown'
    | 'network-speed';

export type ToolModule = {
    sort: number;
    slug: ToolModuleSlug;
    href: `/${ToolModuleSlug}`;
    badge: string;
    title: string;
    description: string;
};

const toolModuleRegistry: ToolModule[] = [
    {
        sort: 10,
        slug: 'timestamp',
        href: '/timestamp',
        badge: 'TIME',
        title: '时间戳转换',
        description: '在秒、毫秒、UTC 和本地时间之间快速换算。',
    },
    {
        sort: 20,
        slug: 'exchange-rate',
        href: '/exchange-rate',
        badge: 'FX',
        title: '汇率转换',
        description: '基于可编辑参考汇率，在常用币种间即时换算。',
    },
    {
        sort: 30,
        slug: 'qrcode',
        href: '/qrcode',
        badge: 'QR',
        title: '二维码生成与反解',
        description: '生成二维码图片，或从本地/网络图片中反解析二维码内容。',
    },
    {
        sort: 40,
        slug: 'base64',
        href: '/base64',
        badge: 'B64',
        title: 'Base64 编解码',
        description: '支持文字 Base64 转换，以及本地或网络图片转 Base64。',
    },
    {
        sort: 50,
        slug: 'json-tools',
        href: '/json-tools',
        badge: 'JSON',
        title: 'JSON 校验与格式化',
        description: '校验 JSON 合法性，并快速格式化或压缩输出。',
    },
    {
        sort: 60,
        slug: 'markdown',
        href: '/markdown',
        badge: 'MD',
        title: 'Markdown 实时预览',
        description: '实时编辑 Markdown，预览渲染效果，并复制输出 HTML。',
    },
    {
        sort: 70,
        slug: 'network-speed',
        href: '/network-speed',
        badge: 'NET',
        title: '网络测速工具',
        description: '测试 IP、域名或 URL 的响应耗时、解析 IP 与采样下载速率。',
    },
];

export const toolModules = [...toolModuleRegistry].sort((previousTool, nextTool) => previousTool.sort - nextTool.sort);

export const defaultToolHref = toolModules[0].href;

export function getToolModule(slug: ToolModuleSlug) {
    return toolModules.find((tool) => tool.slug === slug) ?? toolModules[0];
}
