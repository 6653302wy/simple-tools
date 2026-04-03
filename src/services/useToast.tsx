'use client';

import {
    createContext,
    type FC,
    type PropsWithChildren,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import { type ToastItem, type ToastType, ToastViewport } from '@/components/Toast';

type ShowToastOptions = {
    type?: ToastType;
    message: string;
    duration?: number;
};

const TOAST_EXIT_DURATION_MS = 300;

type ToastContextValue = {
    showToast: (options: ShowToastOptions) => string;
    dismissToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue>({
    showToast: () => '',
    dismissToast: () => {},
});

/** 全局 Toast Provider */
export const ToastProvider: FC<PropsWithChildren> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastItem[]>([]);
    const timersRef = useRef<Map<string, number>>(new Map());

    const dismissToast = useCallback((id: string) => {
        setToasts((currentToasts) =>
            currentToasts.map((toast) => (toast.id === id ? { ...toast, phase: 'leaving' } : toast)),
        );

        const timerId = timersRef.current.get(id);

        if (timerId) {
            window.clearTimeout(timerId);
            timersRef.current.delete(id);
        }

        const exitTimerId = window.setTimeout(() => {
            setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id));
            timersRef.current.delete(id);
        }, TOAST_EXIT_DURATION_MS);

        timersRef.current.set(id, exitTimerId);
    }, []);

    const showToast = useCallback(
        ({ type = 'info', message, duration }: ShowToastOptions) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

            setToasts((currentToasts) => [...currentToasts, { id, type, message, phase: 'entering' }]);

            window.requestAnimationFrame(() => {
                setToasts((currentToasts) =>
                    currentToasts.map((toast) => (toast.id === id ? { ...toast, phase: 'visible' } : toast)),
                );
            });

            if (type !== 'loading') {
                const timeoutMs = duration ?? 2200;
                const timerId = window.setTimeout(() => {
                    dismissToast(id);
                }, timeoutMs);

                timersRef.current.set(id, timerId);
            }

            return id;
        },
        [dismissToast],
    );

    useEffect(() => {
        return () => {
            for (const timerId of timersRef.current.values()) {
                window.clearTimeout(timerId);
            }

            timersRef.current.clear();
        };
    }, []);

    const value = useMemo(
        () => ({
            showToast,
            dismissToast,
        }),
        [dismissToast, showToast],
    );

    return (
        <ToastContext value={value}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismissToast} />
        </ToastContext>
    );
};

/** 全局 Toast Hook */
export function useToast() {
    return useContext(ToastContext);
}
