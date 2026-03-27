import type { FC } from 'react';

type ModuleIntroProps = {
    badge: string;
    title: string;
    description: string;
};

/** 工具页顶部简介 */
export const ModuleIntro: FC<ModuleIntroProps> = ({ badge, title, description }) => {
    return (
        <section className="rounded-2xl border border-primary-200 bg-[linear-gradient(135deg,var(--fill-a)_0%,rgba(225,238,229,0.92)_100%)] px-5 py-4 shadow-[0_16px_42px_rgba(0,54,22,0.08)]">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-5">
                <div className="min-w-0">
                    <span className="inline-flex whitespace-nowrap rounded-full bg-primary-400 px-3 py-1 text-body-xs tracking-[0.24em] text-text-a">
                        {badge}
                    </span>
                    <h1
                        className="mt-3 text-headline-sm text-primary-700"
                        style={{ fontFamily: 'var(--font-rajdhani)' }}
                    >
                        {title}
                    </h1>
                </div>

                <p className="w-full text-body-pc-md leading-6 text-text-d lg:max-w-2xl">{description}</p>
            </div>
        </section>
    );
};
