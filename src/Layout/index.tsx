'use client';

import type { FC, PropsWithChildren } from 'react';
import { ScrollArea } from '@/components/ScrollArea';
import { LeaveConfirmProvider } from '@/services/useLeaveConfirm';
import { TransitionProvider } from '@/services/useNavTransition';
import { ToastProvider } from '@/services/useToast';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TopProgressBar } from './components/TopProgressBar';

/**
 * layout.tsx的布局
 */
export const Layout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <TransitionProvider>
            <LeaveConfirmProvider>
                <ToastProvider>
                    <section className="flex h-full min-h-0 flex-col overflow-hidden bg-[var(--background)]">
                        <Header />
                        <TopProgressBar />
                        <section className="mx-auto flex min-h-0 w-full max-w-[1800px] flex-1 gap-4 px-4 py-4 sm:px-6 lg:px-8 2xl:max-w-[1920px]">
                            <div className="w-[4.75rem] shrink-0 xl:w-[20rem] 2xl:w-[21rem]">
                                <div className="h-full min-h-0 rounded-2xl bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.68),transparent_30%),linear-gradient(180deg,rgba(236,248,240,0.96)_0%,rgba(225,243,231,0.9)_100%)] xl:rounded-3xl">
                                    <Sidebar />
                                </div>
                            </div>

                            <div className="flex min-w-0 flex-1 min-h-0">
                                <ScrollArea
                                    className="h-full min-h-0 min-w-0 flex-1 rounded-3xl border border-neutral-j bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(246,246,247,0.92)_100%)] shadow-[0_28px_70px_rgba(0,54,22,0.08)]"
                                    viewportClassName="h-full"
                                    contentClassName="min-w-0 p-4 sm:p-5 lg:p-6"
                                >
                                    {children}
                                </ScrollArea>
                            </div>
                        </section>
                    </section>
                </ToastProvider>
            </LeaveConfirmProvider>
        </TransitionProvider>
    );
};
