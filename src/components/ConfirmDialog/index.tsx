'use client';

import { Dialog as RadixDialog } from 'radix-ui';
import { Button } from '@/components/Button';
import { useI18n } from '@/services/i18n';

interface ConfirmDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

/** 通用确认弹窗 */
export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const { t } = useI18n();

    return (
        <RadixDialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel()}>
            <RadixDialog.Portal>
                <RadixDialog.Overlay className="fixed inset-0 z-50 bg-neutral-p/44 backdrop-blur-[2px]" />
                <RadixDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl border border-neutral-j bg-fill-a p-5 shadow-[0_28px_64px_rgba(0,54,22,0.16)]">
                    <RadixDialog.Title className="text-title-xl text-text-e">{title}</RadixDialog.Title>
                    <RadixDialog.Description className="mt-3 text-body-pc-md leading-7 text-text-d">
                        {description}
                    </RadixDialog.Description>

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <Button variant="secondary" onClick={onCancel}>
                            {cancelLabel ?? t('common.continueEditing')}
                        </Button>
                        <Button onClick={onConfirm}>{confirmLabel ?? t('common.leave')}</Button>
                    </div>
                </RadixDialog.Content>
            </RadixDialog.Portal>
        </RadixDialog.Root>
    );
}
