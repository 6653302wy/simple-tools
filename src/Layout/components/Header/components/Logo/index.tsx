import type { FunctionComponent } from 'react';

/** Logo */
export const Logo: FunctionComponent = () => {
    return (
        <span
            role="img"
            aria-label="tools"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-[1.4rem] leading-none shadow-[inset_0_0_0_1px_var(--primary-200)]"
        >
            🛠
        </span>
    );
};
