'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';

type CopyButtonStatus = 'idle' | 'copied' | 'error';

interface CopyButtonProps {
    text: string;
    disabled?: boolean;
    idleLabel?: string;
    copiedLabel?: string;
    errorLabel?: string;
    className?: string;
}

async function copyText(text: string) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
}

/** 复制按钮 */
export function CopyButton({
    text,
    disabled,
    idleLabel = '复制结果',
    copiedLabel = '已复制',
    errorLabel = '复制失败',
    className,
}: CopyButtonProps) {
    const [status, setStatus] = useState<CopyButtonStatus>('idle');
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
            }
        };
    }, []);

    async function handleCopy() {
        if (!text.trim()) {
            return;
        }

        try {
            await copyText(text);
            setStatus('copied');

            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
            }

            timerRef.current = window.setTimeout(() => {
                setStatus('idle');
            }, 1800);
        } catch {
            setStatus('error');
        }
    }

    const label = status === 'copied' ? copiedLabel : status === 'error' ? errorLabel : idleLabel;

    return (
        <Button
            variant="secondary"
            className={className}
            disabled={disabled || !text.trim()}
            onClick={() => void handleCopy()}
        >
            {label}
        </Button>
    );
}
