import type { FC } from 'react';

type ModuleIntroProps = {
    badge: string;
    title: string;
    description: string;
};

/** 工具页顶部简介 */
export const ModuleIntro: FC<ModuleIntroProps> = ({ badge, title, description }) => {
    return (
        <section className="rounded-xl border border-primary-200 bg-[linear-gradient(135deg,var(--fill-a)_0%,rgba(225,238,229,0.86)_100%)] px-3.5 py-2 shadow-[0_8px_18px_rgba(0,54,22,0.05)]">
            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div className="flex min-w-0 items-center gap-2">
                    <span className="inline-flex shrink-0 whitespace-nowrap rounded-full bg-primary-400 px-2 py-0.5 text-body-xs tracking-[0.16em] text-text-a">
                        {badge}
                    </span>
                    <h1
                        className="truncate text-title-md text-primary-700"
                        style={{ fontFamily: 'var(--font-rajdhani)' }}
                    >
                        {title}
                    </h1>
                </div>

                <p className="min-w-0 truncate text-body-sm leading-4 text-text-d sm:max-w-[65%] sm:text-right">
                    {description}
                </p>
            </div>
        </section>
    );
};
