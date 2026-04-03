import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { type FunctionComponent, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { cn } from '@/libs/utils';
import { defaultToolHref, type ToolModule, toolModules } from '@/modules/tool-registry';
import { useI18n } from '@/services/i18n';
import { LANGUAGE_OPTIONS, resolveLocalizedText } from '@/services/i18n/constant';
import { buildLocalizedHref, stripLanguagePrefix } from '@/services/i18n/routing';
import { useLeaveConfirm } from '@/services/useLeaveConfirm';
import { useNavTransition } from '@/services/useNavTransition';
import { Logo } from './components/Logo';

function normalizeSearchText(value: string) {
    return value.trim().toLowerCase();
}

function buildSearchIndex(tool: ToolModule) {
    return normalizeSearchText(
        [tool.slug, tool.badge, tool.title.zh, tool.title.en, tool.description.zh, tool.description.en].join(' '),
    );
}

/** 头部 */
export const Header: FunctionComponent = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { language, setLanguage, t } = useI18n();
    const { confirmLeave } = useLeaveConfirm();
    const { startTransition } = useNavTransition();
    const searchRef = useRef<HTMLDivElement | null>(null);
    const resultItemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [navigationMode, setNavigationMode] = useState<'keyboard' | 'pointer'>('pointer');
    const normalizedQuery = normalizeSearchText(query);
    const normalizedPathname = stripLanguagePrefix(pathname);

    const filteredTools = useMemo(() => {
        if (!normalizedQuery) {
            return toolModules;
        }

        return toolModules.filter((tool) => buildSearchIndex(tool).includes(normalizedQuery));
    }, [normalizedQuery]);

    useEffect(() => {
        function handlePointerDown(event: PointerEvent) {
            if (!searchRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        window.addEventListener('pointerdown', handlePointerDown);

        return () => {
            window.removeEventListener('pointerdown', handlePointerDown);
        };
    }, []);

    useEffect(() => {
        if (filteredTools.length === 0) {
            if (activeIndex !== -1) {
                setActiveIndex(-1);
            }

            return;
        }

        if (activeIndex >= filteredTools.length) {
            setActiveIndex(filteredTools.length - 1);
        }
    }, [activeIndex, filteredTools]);

    useEffect(() => {
        if (!open || activeIndex < 0) {
            return;
        }

        resultItemRefs.current[activeIndex]?.scrollIntoView({
            block: 'nearest',
        });
    }, [activeIndex, open]);

    function navigateToTool(tool: ToolModule) {
        setOpen(false);
        setQuery('');
        setActiveIndex(-1);
        setNavigationMode('pointer');
        const nextHref = buildLocalizedHref(language, tool.href);

        if (normalizedPathname.startsWith(tool.href)) {
            return;
        }

        confirmLeave(() => {
            startTransition(() => {
                router.push(nextHref);
            });
        });
    }

    return (
        <section className="sticky top-0 z-40 border-b border-primary-200 bg-fill-a/95 backdrop-blur">
            <section className="mx-auto flex h-14 w-full max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                <Link
                    href={buildLocalizedHref(language, defaultToolHref)}
                    className="flex shrink-0 items-center gap-3 text-text-e"
                >
                    <Logo />
                    <div>
                        <p className="text-body-xs uppercase tracking-[0.22em] text-primary-500">
                            {t('common.appTitle')}
                        </p>
                        <h1 className="text-title-md text-primary-700">{t('common.workspaceTitle')}</h1>
                    </div>
                </Link>

                <div className="hidden min-w-0 flex-1 items-center justify-end gap-3 sm:flex">
                    <div ref={searchRef} className="relative w-full max-w-xl">
                        <input
                            value={query}
                            onFocus={() => {
                                setOpen(true);
                                setActiveIndex(-1);
                                setNavigationMode('pointer');
                            }}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                setOpen(true);
                                setActiveIndex(-1);
                                setNavigationMode('pointer');
                            }}
                            onKeyDown={(event) => {
                                if (event.key === 'ArrowDown') {
                                    event.preventDefault();
                                    setOpen(true);
                                    setNavigationMode('keyboard');
                                    setActiveIndex((currentIndex) =>
                                        filteredTools.length
                                            ? (currentIndex + 1 + filteredTools.length) % filteredTools.length
                                            : -1,
                                    );
                                    return;
                                }

                                if (event.key === 'ArrowUp') {
                                    event.preventDefault();
                                    setOpen(true);
                                    setNavigationMode('keyboard');
                                    setActiveIndex((currentIndex) =>
                                        filteredTools.length
                                            ? currentIndex <= 0
                                                ? filteredTools.length - 1
                                                : currentIndex - 1
                                            : -1,
                                    );
                                    return;
                                }

                                if (event.key === 'Escape') {
                                    setOpen(false);
                                    setActiveIndex(-1);
                                    setNavigationMode('pointer');
                                    return;
                                }

                                const selectedTool = filteredTools[activeIndex] ?? filteredTools[0];

                                if (event.key === 'Enter' && selectedTool) {
                                    event.preventDefault();
                                    navigateToTool(selectedTool);
                                }
                            }}
                            placeholder={t('common.searchPlaceholder')}
                            aria-label={t('common.searchTools')}
                            className="h-11 w-full rounded-full border border-primary-200 bg-fill-b px-4 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a"
                        />

                        {open && (
                            <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-full overflow-hidden rounded-2xl border border-neutral-j bg-fill-a p-2 shadow-[0_24px_56px_rgba(0,54,22,0.12)]">
                                {filteredTools.length ? (
                                    <div className="max-h-80 space-y-1 overflow-y-auto">
                                        {filteredTools.map((tool, index) => {
                                            const isActive = normalizedPathname.startsWith(tool.href);
                                            const isHighlighted = index === activeIndex;

                                            return (
                                                <Button
                                                    key={tool.slug}
                                                    ref={(element) => {
                                                        resultItemRefs.current[index] = element;
                                                    }}
                                                    variant="plain"
                                                    onMouseMove={() => {
                                                        setNavigationMode('pointer');
                                                    }}
                                                    onMouseEnter={() => {
                                                        setNavigationMode('pointer');
                                                        setActiveIndex(index);
                                                    }}
                                                    onClick={() => {
                                                        navigateToTool(tool);
                                                    }}
                                                    className={cn(
                                                        'flex w-full items-start gap-3 rounded-xl border px-3 py-3 text-left text-body-sm whitespace-normal transition',
                                                        isHighlighted
                                                            ? 'border-primary-200 bg-primary-100/80'
                                                            : isActive
                                                              ? 'border-primary-200 bg-primary-100/60'
                                                              : navigationMode === 'pointer'
                                                                ? 'border-transparent hover:border-primary-100 hover:bg-fill-b'
                                                                : 'border-transparent',
                                                    )}
                                                >
                                                    <span
                                                        className={cn(
                                                            'inline-flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-body-xs',
                                                            isHighlighted
                                                                ? 'border-primary-200 bg-fill-a text-primary-700'
                                                                : isActive
                                                                  ? 'border-primary-200 bg-fill-a text-primary-600'
                                                                  : 'border-primary-100 bg-primary-100 text-primary-600',
                                                        )}
                                                        style={{ fontFamily: 'var(--font-rajdhani)' }}
                                                    >
                                                        {tool.badge}
                                                    </span>

                                                    <span className="min-w-0 flex-1">
                                                        <span className="block text-title-sm text-text-e">
                                                            {resolveLocalizedText(language, tool.title)}
                                                        </span>
                                                        <span className="mt-1 block text-body-sm text-text-d">
                                                            {resolveLocalizedText(language, tool.description)}
                                                        </span>
                                                    </span>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="rounded-xl bg-fill-b px-4 py-5 text-center text-body-pc-md text-text-d">
                                        {t('common.searchNoResults')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="min-w-[11.5rem] rounded-full border border-primary-200 bg-primary-100 px-4 py-2 sm:flex sm:items-center sm:gap-3">
                        <span
                            className="text-title-sm text-primary-700"
                            style={{ fontFamily: 'var(--font-rajdhani)' }}
                        >{`${toolModules.length}`}</span>
                        <span className="text-body-pc-md text-text-d">
                            {t('common.modulesCount', { count: toolModules.length })}
                        </span>
                    </div>

                    <div className="inline-flex w-[7.5rem] shrink-0 items-center gap-1 rounded-full border border-primary-200 bg-fill-b p-1">
                        {LANGUAGE_OPTIONS.map((option) => {
                            const isActive = option.value === language;

                            return (
                                <Button
                                    key={option.value}
                                    variant="plain"
                                    onClick={() => {
                                        const currentSearch = searchParams.toString();
                                        const nextHref = buildLocalizedHref(option.value, normalizedPathname);

                                        setLanguage(option.value);
                                        startTransition(() => {
                                            router.replace(currentSearch ? `${nextHref}?${currentSearch}` : nextHref);
                                        });
                                    }}
                                    className={cn(
                                        'flex-1 px-3 py-1.5 text-center text-body-sm',
                                        isActive
                                            ? 'bg-primary-400 text-text-a hover:bg-primary-400 hover:text-text-a'
                                            : 'text-text-d transition hover:bg-primary-100',
                                    )}
                                    aria-label={`${t('common.language')} ${option.label}`}
                                >
                                    {option.label}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            </section>
        </section>
    );
};
