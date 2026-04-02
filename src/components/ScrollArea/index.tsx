'use client';

import { ScrollArea as RadixScrollArea } from 'radix-ui';
import type { PropsWithChildren } from 'react';
import { cn } from '@/libs/utils';

interface ScrollAreaProps {
    className?: string;
    viewportClassName?: string;
    contentClassName?: string;
}

/** 公共滚动容器 */
export function ScrollArea({
    children,
    className,
    viewportClassName,
    contentClassName,
}: PropsWithChildren<ScrollAreaProps>) {
    return (
        <RadixScrollArea.Root className={cn('relative h-full overflow-hidden', className)}>
            <RadixScrollArea.Viewport
                className={cn('scroll-area-viewport h-full w-full rounded-[inherit]', viewportClassName)}
            >
                <div className={cn('h-full min-h-full', contentClassName)}>{children}</div>
            </RadixScrollArea.Viewport>

            <RadixScrollArea.Scrollbar
                orientation="vertical"
                className="flex w-2.5 touch-none select-none p-[3px] transition-colors"
            >
                <RadixScrollArea.Thumb className="relative flex-1 rounded-full bg-[rgba(125,145,128,0.42)] hover:bg-[rgba(125,145,128,0.62)]" />
            </RadixScrollArea.Scrollbar>

            <RadixScrollArea.Scrollbar
                orientation="horizontal"
                className="flex h-2.5 touch-none select-none p-[3px] transition-colors"
            >
                <RadixScrollArea.Thumb className="relative flex-1 rounded-full bg-[rgba(125,145,128,0.42)] hover:bg-[rgba(125,145,128,0.62)]" />
            </RadixScrollArea.Scrollbar>
            <RadixScrollArea.Corner className="bg-transparent" />
        </RadixScrollArea.Root>
    );
}
