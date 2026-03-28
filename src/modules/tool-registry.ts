import type { LocalizedText } from '@/services/i18n/constant';

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
    title: LocalizedText;
    description: LocalizedText;
};

const toolModuleRegistry: ToolModule[] = [
    {
        sort: 10,
        slug: 'timestamp',
        href: '/timestamp',
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
        badge: 'QR',
        title: { zh: '二维码生成与反解', en: 'QR Code Tool' },
        description: {
            zh: '生成二维码图片，或从本地/网络图片中反解析二维码内容。',
            en: 'Generate QR codes or decode them from local and remote images.',
        },
    },
    {
        sort: 40,
        slug: 'base64',
        href: '/base64',
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
        badge: 'MD',
        title: { zh: 'Markdown 实时预览', en: 'Markdown Preview' },
        description: {
            zh: '实时编辑 Markdown，预览渲染效果，并复制输出 HTML。',
            en: 'Edit Markdown live, preview rendering, and copy the output.',
        },
    },
    {
        sort: 70,
        slug: 'network-speed',
        href: '/network-speed',
        badge: 'NET',
        title: { zh: '网络测速工具', en: 'Network Probe' },
        description: {
            zh: '测试 IP、域名或 URL 的响应耗时、解析 IP 与采样下载速率。',
            en: 'Measure latency, resolved IP and sampled throughput for IPs, domains or URLs.',
        },
    },
];

export const toolModules = [...toolModuleRegistry].sort((previousTool, nextTool) => previousTool.sort - nextTool.sort);

export const defaultToolHref = toolModules[0].href;

export function getToolModule(slug: ToolModuleSlug) {
    return toolModules.find((tool) => tool.slug === slug) ?? toolModules[0];
}
