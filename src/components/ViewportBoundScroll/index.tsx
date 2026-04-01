'use client';

import { type PropsWithChildren, useEffect, useRef, useState } from 'react';
import { cn } from '@/libs/utils';

interface ViewportBoundScrollProps {
    className?: string;
    contentClassName?: string;
    minHeight?: number;
}

/** 按内容高度与可视区域高度自动取较小值的滚动容器 */
export function ViewportBoundScroll({
    children,
    className,
    contentClassName,
    minHeight = 0,
}: PropsWithChildren<ViewportBoundScrollProps>) {
    const outerRef = useRef<HTMLDivElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const frameRef = useRef<number | null>(null);
    const [height, setHeight] = useState<number | null>(null);
    const [scrollable, setScrollable] = useState(false);

    useEffect(() => {
        function measure() {
            if (frameRef.current) {
                window.cancelAnimationFrame(frameRef.current);
            }

            frameRef.current = window.requestAnimationFrame(() => {
                frameRef.current = null;

                const outerElement = outerRef.current;
                const contentElement = contentRef.current;

                if (!outerElement || !contentElement) {
                    return;
                }

                const viewportAvailableHeight = Math.max(
                    window.innerHeight - outerElement.getBoundingClientRect().top,
                    minHeight,
                );
                const contentHeight = contentElement.scrollHeight;
                const nextHeight = Math.min(contentHeight, viewportAvailableHeight);

                setHeight(nextHeight);
                setScrollable(contentHeight > viewportAvailableHeight + 1);
            });
        }

        measure();

        const resizeObserver = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);

        if (resizeObserver) {
            if (outerRef.current) {
                resizeObserver.observe(outerRef.current);
            }

            if (contentRef.current) {
                resizeObserver.observe(contentRef.current);
            }
        }

        window.addEventListener('resize', measure);

        return () => {
            if (frameRef.current) {
                window.cancelAnimationFrame(frameRef.current);
            }

            resizeObserver?.disconnect();
            window.removeEventListener('resize', measure);
        };
    }, [minHeight]);

    return (
        <div
            ref={outerRef}
            className={cn('h-full  self-start py-3 rounded-lg', className)}
            style={height ? { height: `${height}px` } : undefined}
        >
            <div
                ref={contentRef}
                className={cn(
                    scrollable ? 'h-full overflow-y-auto overscroll-contain' : 'overflow-visible',
                    contentClassName,
                )}
            >
                {children}
            </div>
        </div>
    );
}
