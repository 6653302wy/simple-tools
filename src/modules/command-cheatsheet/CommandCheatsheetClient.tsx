'use client';

import { useMemo, useState } from 'react';
import { CopyButton } from '@/components/CopyButton';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';
import { type LocalizedText, resolveLocalizedText } from '@/services/i18n/constant';
import { type CommandCategory, commandCategoryLabels, commandCategoryOrder, commandEntries } from './commands';

type CategoryFilter = CommandCategory | 'all';

const categoryFilters: CategoryFilter[] = ['all', ...commandCategoryOrder];
const categoryAllLabel: LocalizedText = { zh: '全部', en: 'All' };
const panelClassName = 'rounded-xl border border-neutral-j bg-fill-a p-3 shadow-[0_8px_20px_rgba(0,54,22,0.06)]';
const commandBlockClassName =
    'mt-2 max-h-44 w-full min-w-0 max-w-full overflow-y-auto overflow-x-hidden whitespace-pre-wrap break-words rounded-lg border border-neutral-j bg-fill-b px-2.5 py-2 font-mono text-[12px] leading-5 text-text-e [overflow-wrap:anywhere] [scrollbar-gutter:stable]';

function getCategoryLabel(category: CategoryFilter) {
    return category === 'all' ? categoryAllLabel : commandCategoryLabels[category];
}

export function CommandCheatsheetClient() {
    const { language, t } = useI18n();
    const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
    const [query, setQuery] = useState('');
    const normalizedQuery = query.trim().toLowerCase();

    const visibleCommands = useMemo(() => {
        return commandEntries.filter((entry) => {
            const matchesCategory = activeCategory === 'all' || entry.category === activeCategory;

            if (!matchesCategory) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            const searchableText = [
                resolveLocalizedText(language, entry.title),
                resolveLocalizedText(language, entry.description),
                resolveLocalizedText(language, commandCategoryLabels[entry.category]),
                entry.command,
                entry.note ? resolveLocalizedText(language, entry.note) : '',
                ...entry.tags,
            ]
                .join(' ')
                .toLowerCase();

            return searchableText.includes(normalizedQuery);
        });
    }, [activeCategory, language, normalizedQuery]);

    return (
        <section className="flex h-full min-h-0 flex-1 flex-col gap-3 overflow-hidden">
            <section className={cn(panelClassName, 'shrink-0')}>
                <label className="block" aria-label={t('commandCheatsheet.search')}>
                    <input
                        className="h-10 w-full rounded-[2rem] border border-neutral-j bg-fill-b px-4 text-body-sm text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a"
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value);
                        }}
                        placeholder={t('commandCheatsheet.searchPlaceholder')}
                    />
                </label>
            </section>

            <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden xl:flex-row">
                <aside className={cn(panelClassName, 'shrink-0 xl:sticky xl:top-0 xl:w-52 xl:self-start')}>
                    <p className="text-title-sm text-text-e">{t('commandCheatsheet.categoryTitle')}</p>
                    <div className="mt-3 grid gap-1.5">
                        {categoryFilters.map((category) => {
                            const count =
                                category === 'all'
                                    ? commandEntries.length
                                    : commandEntries.filter((entry) => entry.category === category).length;

                            return (
                                <button
                                    key={category}
                                    type="button"
                                    className={cn(
                                        'flex items-center justify-between gap-2 rounded-lg border px-2.5 py-1.5 text-left text-body-sm transition',
                                        activeCategory === category
                                            ? 'border-primary-300 bg-primary-100 text-primary-700'
                                            : 'border-neutral-j bg-fill-b text-text-d hover:border-primary-200 hover:bg-primary-100/50',
                                    )}
                                    onClick={() => {
                                        setActiveCategory(category);
                                    }}
                                >
                                    <span>{resolveLocalizedText(language, getCategoryLabel(category))}</span>
                                    <span className="rounded-full bg-fill-a px-2 py-0.5 text-body-xs text-text-c">
                                        {count}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
                    <div className="mb-2 flex shrink-0 items-center justify-between gap-3">
                        <p className="text-body-sm text-text-d">
                            {t('commandCheatsheet.resultCount', { count: visibleCommands.length })}
                        </p>
                    </div>

                    {visibleCommands.length > 0 ? (
                        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden pr-1">
                            <div className="flex min-w-0 flex-col gap-3">
                                {visibleCommands.map((entry) => (
                                    <article key={entry.id} className={cn(panelClassName, 'min-w-0 overflow-hidden')}>
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span className="rounded-full bg-primary-100 px-2 py-0.5 text-body-xs text-primary-700">
                                                        {resolveLocalizedText(
                                                            language,
                                                            commandCategoryLabels[entry.category],
                                                        )}
                                                    </span>
                                                    <h2 className="text-title-sm text-text-e">
                                                        {resolveLocalizedText(language, entry.title)}
                                                    </h2>
                                                </div>
                                                <p className="mt-1 text-body-sm leading-5 text-text-d">
                                                    {resolveLocalizedText(language, entry.description)}
                                                </p>
                                            </div>

                                            <CopyButton
                                                text={entry.command}
                                                idleLabel={t('commandCheatsheet.copyCommand')}
                                                className="mt-0 h-8 min-w-8"
                                            />
                                        </div>

                                        <pre className={commandBlockClassName}>
                                            <code className="block min-w-0 max-w-full whitespace-pre-wrap break-words [overflow-wrap:anywhere]">
                                                {entry.command}
                                            </code>
                                        </pre>

                                        {entry.note ? (
                                            <p className="mt-2 rounded-lg border border-warning bg-[rgba(255,199,0,0.12)] px-2.5 py-1.5 text-body-xs leading-5 text-text-d">
                                                {resolveLocalizedText(language, entry.note)}
                                            </p>
                                        ) : null}
                                    </article>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div
                            className={cn(
                                panelClassName,
                                'flex min-h-0 flex-1 items-center justify-center text-text-d',
                            )}
                        >
                            {t('commandCheatsheet.empty')}
                        </div>
                    )}
                </section>
            </section>
        </section>
    );
}
