'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef } from 'react';
import { ScrollArea } from '@/components/ScrollArea';
import { cn } from '@/libs/utils';
import { isExternalToolModule, normalizeToolCategoryFilter, toolModules } from '@/modules/tool-registry';
import { useI18n } from '@/services/i18n';
import { resolveLocalizedText } from '@/services/i18n/constant';
import { buildLocalizedHref, stripLanguagePrefix } from '@/services/i18n/routing';
import { useLeaveConfirm } from '@/services/useLeaveConfirm';
import { useNavTransition } from '@/services/useNavTransition';

/** 左侧菜单 */
export function Sidebar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const navRef = useRef<HTMLElement | null>(null);
    const { language } = useI18n();
    const { startTransition } = useNavTransition();
    const { confirmLeave } = useLeaveConfirm();
    const normalizedPathname = stripLanguagePrefix(pathname);
    const activeCategoryFilter = normalizeToolCategoryFilter(searchParams.get('tools'));
    const visibleTools = useMemo(
        () =>
            activeCategoryFilter === 'all'
                ? toolModules
                : toolModules.filter((tool) => tool.category === activeCategoryFilter),
        [activeCategoryFilter],
    );

    useEffect(() => {
        void pathname;
        const viewport = navRef.current?.closest('[data-radix-scroll-area-viewport]') as HTMLElement | null;
        const activeItem = navRef.current?.querySelector<HTMLElement>('[data-active="true"]');

        if (!viewport || !activeItem) {
            return;
        }

        const viewportRect = viewport.getBoundingClientRect();
        const activeRect = activeItem.getBoundingClientRect();
        const nextScrollTop =
            viewport.scrollTop + activeRect.top - viewportRect.top - viewport.clientHeight / 2 + activeRect.height / 2;

        viewport.scrollTo({
            top: Math.max(0, nextScrollTop),
            behavior: 'smooth',
        });
    }, [pathname]);

    return (
        <ScrollArea
            className="h-full rounded-2xl border border-neutral-j shadow-[0_24px_56px_rgba(0,54,22,0.08)] xl:rounded-3xl"
            viewportClassName="h-full"
            contentClassName="p-2 xl:p-4"
        >
            <nav ref={navRef} className="space-y-3">
                {visibleTools.map((tool, index) => {
                    const isExternal = isExternalToolModule(tool);
                    const isActive = !isExternal && normalizedPathname.startsWith(tool.href);

                    return (
                        <button
                            key={tool.slug}
                            type="button"
                            data-active={isActive ? 'true' : 'false'}
                            aria-label={resolveLocalizedText(language, tool.title)}
                            title={resolveLocalizedText(language, tool.title)}
                            onClick={() => {
                                if (isExternal) {
                                    window.open(tool.href, '_blank', 'noopener,noreferrer');
                                    return;
                                }

                                if (isActive) {
                                    return;
                                }

                                confirmLeave(() => {
                                    startTransition(() => {
                                        const currentQuery = searchParams.toString();
                                        const nextHref = buildLocalizedHref(language, tool.href);
                                        router.push(currentQuery ? `${nextHref}?${currentQuery}` : nextHref);
                                    });
                                });
                            }}
                            className={cn(
                                'group flex w-full items-center justify-center rounded-xl border p-2.5 text-left transition duration-200 xl:items-start xl:justify-start xl:gap-3 xl:p-4',
                                isActive
                                    ? 'border-primary-400 bg-primary-300 text-neutral-h shadow-[0_5px_8px_rgba(15,23,42,0.16)]'
                                    : 'border-transparent bg-fill-a hover:border-primary-200 hover:bg-primary-100/60 shadow-[0_4px_8px_rgba(15,23,42,0.1)]',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                                    isActive
                                        ? 'border-neutral-h bg-neutral-a text-neutral-h'
                                        : 'border-primary-200 bg-primary-100 text-primary-600',
                                )}
                            >
                                <span
                                    className="text-body-sm whitespace-nowrap"
                                    style={{ fontFamily: 'var(--font-rajdhani)' }}
                                >
                                    {tool.badge}
                                </span>
                            </div>

                            <div className="hidden min-w-0 flex-1 xl:block">
                                <div className="flex items-center gap-2">
                                    <span className="text-body-xs text-inherit/70">{`0${index + 1}`}</span>
                                    <h3 className="text-title-sm text-inherit">
                                        {resolveLocalizedText(language, tool.title)}
                                    </h3>
                                </div>
                                <p
                                    className={cn(
                                        'mt-2 text-body-pc-md leading-6',
                                        isActive ? 'text-text-a/84' : 'text-text-d',
                                    )}
                                >
                                    {resolveLocalizedText(language, tool.description)}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </nav>
        </ScrollArea>
    );
}
