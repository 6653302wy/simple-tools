import type { PropsWithChildren, ReactNode } from 'react';
import { cn } from '@/libs/utils';

const defaultPanelClassName = 'rounded-3xl border border-neutral-j bg-fill-a shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

type ToolPanelProps = PropsWithChildren<{
    title?: ReactNode;
    description?: ReactNode;
    action?: ReactNode;
    className?: string;
    headerClassName?: string;
    bodyClassName?: string;
}>;

export function ToolPanel({
    title,
    description,
    action,
    className,
    headerClassName,
    bodyClassName,
    children,
}: ToolPanelProps) {
    return (
        <section className={cn(defaultPanelClassName, className)}>
            {title || description || action ? (
                <div className={cn('flex items-start justify-between gap-4 p-4', headerClassName)}>
                    <div className="min-w-0">
                        {title ? <p className="text-title-lg text-text-e">{title}</p> : null}
                        {description ? <p className="mt-1 text-body-pc-md text-text-d">{description}</p> : null}
                    </div>
                    {action ? <div className="shrink-0">{action}</div> : null}
                </div>
            ) : null}

            <div className={cn(!(title || description || action) && 'p-4', bodyClassName)}>{children}</div>
        </section>
    );
}
