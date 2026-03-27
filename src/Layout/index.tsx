'use client';

import type { FC, PropsWithChildren } from 'react';
import { TransitionProvider } from '@/services/useNavTransition';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TopProgressBar } from './components/TopProgressBar';

/**
 * layout.tsx的布局
 */
export const Layout: FC<PropsWithChildren> = ({ children }) => {
    return (
        <TransitionProvider>
            <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(198,236,211,0.72),transparent_28%),linear-gradient(180deg,var(--fill-b)_0%,var(--fill-a)_55%,var(--fill-b)_100%)]">
                <Header />
                <TopProgressBar />
                <section className="mx-auto flex w-full max-w-[1440px] flex-1 px-4 pb-8 pt-6 sm:px-6 lg:px-8">
                    <section className="grid w-full gap-5 lg:grid-cols-[292px_minmax(0,1fr)] lg:items-start">
                        <div className="lg:sticky lg:top-16">
                            <Sidebar />
                        </div>

                        <section className="min-w-0 rounded-[28px] border border-neutral-j bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(246,246,247,0.92)_100%)] p-4 shadow-[0_28px_70px_rgba(0,54,22,0.08)] sm:p-6 lg:min-h-[calc(100vh-8.5rem)] lg:p-8">
                            {children}
                        </section>
                    </section>
                </section>
            </section>
        </TransitionProvider>
    );
};
