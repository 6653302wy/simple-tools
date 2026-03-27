export type ToolModuleSlug = 'timestamp' | 'exchange-rate';

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
];

export const defaultToolHref = toolModules[0].href;

export function getToolModule(slug: ToolModuleSlug) {
    return toolModules.find((tool) => tool.slug === slug) ?? toolModules[0];
}
