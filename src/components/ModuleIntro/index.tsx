import type { FC } from 'react';

type ModuleIntroProps = {
    badge: string;
    title: string;
    description: string;
};

/** 工具页顶部简介 */
export const ModuleIntro: FC<ModuleIntroProps> = ({ badge, title, description }) => {
    return (
        <section className="rounded-[28px] border border-primary-200 bg-[linear-gradient(135deg,var(--fill-a)_0%,rgba(225,238,229,0.92)_100%)] p-6 shadow-[0_20px_54px_rgba(0,54,22,0.08)]">
            <span className="inline-flex rounded-full bg-primary-400 px-3 py-1 text-body-xs tracking-[0.24em] text-text-a">
                {badge}
            </span>
            <h1 className="mt-4 text-headline-sm text-primary-700" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                {title}
            </h1>
            <p className="mt-3 w-full text-body-pc-md leading-7 text-text-d">{description}</p>
        </section>
    );
};
