'use client';

import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/libs/utils';
import { toolModules } from '@/modules/tool-registry';
import { useNavTransition } from '@/services/useNavTransition';

/** 左侧菜单 */
export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { isPending, startTransition } = useNavTransition();

    return (
        <aside className="rounded-lg border border-neutral-j bg-[linear-gradient(180deg,var(--fill-a)_0%,rgba(198,236,211,0.58)_100%)] p-4 shadow-[0_24px_56px_rgba(0,54,22,0.08)]">
            <div className="rounded-md border border-neutral-j bg-fill-a p-4">
                <p className="text-body-xs uppercase tracking-[0.24em] text-primary-500">{`Tools Workspace`}</p>
                <h2 className="mt-3 text-title-xl text-primary-700" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    Modules
                </h2>
                <p className="mt-2 text-body-pc-md text-text-d">左侧选择工具，右侧即时完成对应换算与处理。</p>
            </div>

            <nav className="mt-4 space-y-3">
                {toolModules.map((tool, index) => {
                    const isActive = pathname.startsWith(tool.href);

                    return (
                        <button
                            key={tool.slug}
                            type="button"
                            onClick={() => {
                                if (isActive) {
                                    return;
                                }

                                startTransition(() => {
                                    router.push(tool.href);
                                });
                            }}
                            className={cn(
                                'group flex w-full items-start gap-3 rounded-lg border p-4 text-left transition duration-200',
                                isActive
                                    ? 'border-primary-500 bg-primary-400 text-text-a shadow-[0_18px_32px_rgba(0,155,57,0.22)]'
                                    : 'border-transparent bg-fill-a hover:border-primary-200 hover:bg-primary-100/60',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-md border text-body-sm',
                                    isActive
                                        ? 'border-neutral-h bg-neutral-a text-text-a'
                                        : 'border-primary-200 bg-primary-100 text-primary-600',
                                )}
                                style={{ fontFamily: 'var(--font-rajdhani)' }}
                            >
                                {tool.badge}
                            </div>

                            <div className="min-w-0 flex-1">
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

            <div className="mt-4 rounded-md border border-dashed border-primary-200 bg-fill-a px-4 py-3 text-body-pc-md text-text-d">
                <p className="text-title-sm text-text-e">工作台说明</p>
                <p className="mt-2">汇率工具使用本地参考值，可在工具页中手动调整，不依赖在线接口。</p>
                <p className="mt-2 text-body-xs text-text-c">{isPending ? '正在切换模块...' : '当前模块已就绪。'}</p>
            </div>
        </aside>
    );
}
