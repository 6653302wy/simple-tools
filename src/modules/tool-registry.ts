export type ToolModuleSlug = 'timestamp' | 'exchange-rate' | 'qrcode' | 'base64' | 'json-tools';

export type ToolModule = {
    slug: ToolModuleSlug;
    href: `/modules/${ToolModuleSlug}`;
    badge: string;
    title: string;
    description: string;
};

export const toolModules: ToolModule[] = [
    {
        slug: 'timestamp',
        href: '/modules/timestamp',
        badge: 'TIME',
        title: '时间戳转换',
        description: '在秒、毫秒、UTC 和本地时间之间快速换算。',
    },
    {
        slug: 'exchange-rate',
        href: '/modules/exchange-rate',
        badge: 'FX',
        title: '汇率转换',
        description: '基于可编辑参考汇率，在常用币种间即时换算。',
    },
    {
        slug: 'qrcode',
        href: '/modules/qrcode',
        badge: 'QR',
        title: '二维码生成与反解',
        description: '生成二维码图片，或从本地/网络图片中反解析二维码内容。',
    },
    {
        slug: 'base64',
        href: '/modules/base64',
        badge: 'B64',
        title: 'Base64 编解码',
        description: '支持文字 Base64 转换，以及本地或网络图片转 Base64。',
    },
    {
        slug: 'json-tools',
        href: '/modules/json-tools',
        badge: 'JSON',
        title: 'JSON 校验与格式化',
        description: '校验 JSON 合法性，并快速格式化或压缩输出。',
    },
];

export const defaultToolHref = toolModules[0].href;

export function getToolModule(slug: ToolModuleSlug) {
    return toolModules.find((tool) => tool.slug === slug) ?? toolModules[0];
}
