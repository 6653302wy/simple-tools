'use client';

import Image from 'next/image';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';
import { useToast } from '@/services/useToast';
import copyImg from './assets/copy.png';

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
export function CopyButton({ text, disabled, idleLabel, copiedLabel, errorLabel, className }: CopyButtonProps) {
    const { t } = useI18n();
    const { showToast } = useToast();

    async function handleCopy() {
        if (!text.trim()) {
            return;
        }

        try {
            await copyText(text);

            showToast({
                type: 'success',
                message: copiedLabel ?? t('common.copied'),
            });
        } catch {
            showToast({
                type: 'error',
                message: errorLabel ?? t('common.copyFailed'),
            });
        }
    }

    const disabledState = disabled || !text.trim();

    return (
        <button
            type="button"
            aria-label={idleLabel ?? t('common.copyResult')}
            title={idleLabel ?? t('common.copyResult')}
            disabled={disabledState}
            className={cn(
                'inline-flex h-9 min-w-9 shrink-0 items-center justify-center self-center rounded-full transition',
                disabledState ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-fill-b active:bg-fill-c',
                className,
            )}
            onClick={() => {
                void handleCopy();
            }}
        >
            <Image className="pointer-events-none size-6" src={copyImg} alt="Copy" />
        </button>
    );
}
