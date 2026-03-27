'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/libs/utils';
import { toolModules } from '@/modules/tool-registry';
import { useNavTransition } from '@/services/useNavTransition';

/** 左侧菜单 */
export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { startTransition } = useNavTransition();

    return (
        <aside className="rounded-2xl border border-neutral-j bg-[linear-gradient(180deg,var(--fill-a)_0%,rgba(198,236,211,0.58)_100%)] p-2 shadow-[0_24px_56px_rgba(0,54,22,0.08)] xl:rounded-3xl xl:p-4">
            <nav className="space-y-3">
                {toolModules.map((tool, index) => {
                    const isActive = pathname.startsWith(tool.href);

                    return (
                        <button
                            key={tool.slug}
                            type="button"
                            aria-label={tool.title}
                            title={tool.title}
                            onClick={() => {
                                if (isActive) {
                                    return;
                                }

                                startTransition(() => {
                                    router.push(tool.href);
                                });
                            }}
                            className={cn(
                                'group flex w-full items-center justify-center rounded-xl border p-2.5 text-left transition duration-200 xl:items-start xl:justify-start xl:gap-3 xl:p-4',
                                isActive
                                    ? 'border-primary-500 bg-primary-400 text-text-a shadow-[0_18px_32px_rgba(0,155,57,0.22)]'
                                    : 'border-transparent bg-fill-a hover:border-primary-200 hover:bg-primary-100/60',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                                    isActive
                                        ? 'border-neutral-h bg-neutral-a text-text-a'
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
                                    <h3 className="text-title-sm text-inherit">{tool.title}</h3>
                                </div>
                                <p
                                    className={cn(
                                        'mt-2 text-body-pc-md leading-6',
                                        isActive ? 'text-text-a/84' : 'text-text-d',
                                    )}
                                >
                                    {tool.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </nav>
        </aside>
    );
}
