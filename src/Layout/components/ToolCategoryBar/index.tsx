'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/Button';
import { cn } from '@/libs/utils';
import { normalizeToolCategoryFilter, type ToolCategoryFilter, toolCategoryFilterOrder } from '@/modules/tool-registry';
import { useI18n } from '@/services/i18n';
import { type LocalizedText, resolveLocalizedText } from '@/services/i18n/constant';
import { useNavTransition } from '@/services/useNavTransition';

const categoryLabels: Record<ToolCategoryFilter, LocalizedText> = {
    all: { zh: '全部', en: 'All' },
    text: { zh: '文本工具', en: 'Text Tools' },
    image: { zh: '图片工具', en: 'Image Tools' },
    network: { zh: '网络工具', en: 'Network Tools' },
    developer: { zh: '开发工具', en: 'Developer Tools' },
};

export function ToolCategoryBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { language } = useI18n();
    const { startTransition } = useNavTransition();
    const activeCategory = normalizeToolCategoryFilter(searchParams.get('tools'));

    return (
        <section className="border-b border-primary-200 bg-fill-a/92 backdrop-blur">
            <div className="mx-auto flex w-full max-w-[1440px] gap-2 overflow-x-auto px-4 py-1.5 sm:px-6 lg:px-8">
                {toolCategoryFilterOrder.map((category) => {
                    const isActive = category === activeCategory;

                    return (
                        <Button
                            key={category}
                            variant="plain"
                            onClick={() => {
                                const nextParams = new URLSearchParams(searchParams.toString());

                                if (category === 'all') {
                                    nextParams.delete('tools');
                                } else {
                                    nextParams.set('tools', category);
                                }

                                const nextQuery = nextParams.toString();

                                startTransition(() => {
                                    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname);
                                });
                            }}
                            className={cn(
                                'min-w-[4.75rem] rounded-full border px-3 py-1 text-body-sm whitespace-nowrap shadow-[0_4px_10px_rgba(0,54,22,0.05)] transition sm:min-w-[5.75rem]',
                                isActive
                                    ? 'border-primary-300 bg-primary-300 text-neutral-h hover:border-primary-300 hover:bg-primary-300 hover:text-neutral-h'
                                    : 'border-primary-200 bg-fill-a text-text-d hover:border-primary-300 hover:bg-primary-100',
                            )}
                        >
                            {resolveLocalizedText(language, categoryLabels[category])}
                        </Button>
                    );
                })}
            </div>
        </section>
    );
}
