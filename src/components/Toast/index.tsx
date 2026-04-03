'use client';

import { cn } from '@/libs/utils';

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'loading';

export type ToastItem = {
    id: string;
    type: ToastType;
    message: string;
    phase: 'entering' | 'visible' | 'leaving';
};

interface ToastViewportProps {
    toasts: ToastItem[];
    onDismiss: (id: string) => void;
}

function getToastTone(type: ToastType) {
    if (type === 'success') {
        return {
            circleClassName: 'bg-[rgb(0,181,42)] text-neutral-h',
            symbol: '✓',
        };
    }

    if (type === 'warning') {
        return {
            circleClassName: 'bg-[rgb(255,132,0)] text-neutral-h',
            symbol: '!',
        };
    }

    if (type === 'error') {
        return {
            circleClassName: 'bg-[rgb(235,51,51)] text-neutral-h',
            symbol: '×',
        };
    }

    if (type === 'loading') {
        return {
            circleClassName:
                'border-[5px] border-[rgba(0,155,57,0.14)] border-t-primary-400 bg-transparent text-transparent',
            symbol: '',
        };
    }

    return {
        circleClassName: 'bg-[rgb(37,99,235)] text-neutral-h',
        symbol: 'i',
    };
}

function ToastIcon({ type }: { type: ToastType }) {
    const tone = getToastTone(type);

    if (type === 'loading') {
        return <span className={cn('inline-flex size-6 animate-spin rounded-full', tone.circleClassName)} />;
    }

    return (
        <span
            className={cn(
                'inline-flex size-6 items-center justify-center rounded-full text-body-md',
                tone.circleClassName,
            )}
        >
            {tone.symbol}
        </span>
    );
}

/** 全局 Toast 视图 */
export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
    return (
        <div className="pointer-events-none fixed right-6 top-6 z-[90] flex w-[min(20rem,calc(100vw-2.5rem))] flex-col gap-3">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={cn(
                        'pointer-events-auto flex items-center gap-4 rounded-[1.25rem] border border-neutral-j bg-fill-a px-5 py-4 shadow-[0_18px_42px_rgba(13,21,18,0.12)] transition-all duration-300 ease-out will-change-transform',
                        toast.phase === 'entering' && 'translate-x-10 opacity-0',
                        toast.phase === 'visible' && 'translate-x-0 opacity-100',
                        toast.phase === 'leaving' && 'translate-x-10 opacity-0',
                    )}
                    role={toast.type === 'error' || toast.type === 'warning' ? 'alert' : 'status'}
                    aria-live={toast.type === 'error' || toast.type === 'warning' ? 'assertive' : 'polite'}
                >
                    <ToastIcon type={toast.type} />
                    <p className="min-w-0 flex-1 text-title-md text-text-e">{toast.message}</p>
                    <button
                        type="button"
                        className="sr-only"
                        onClick={() => {
                            onDismiss(toast.id);
                        }}
                    >
                        dismiss
                    </button>
                </div>
            ))}
        </div>
    );
}
