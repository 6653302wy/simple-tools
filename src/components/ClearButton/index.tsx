'use client';

import type * as React from 'react';
import { Button } from '@/components/Button';
import { useI18n } from '@/services/i18n';

interface ClearButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'> {
    label?: string;
}

/** 通用清空按钮 */
export function ClearButton({ label, className, onClick, ...rest }: ClearButtonProps) {
    const { t } = useI18n();

    return (
        <Button variant="secondary" type="button" className={className} onClick={onClick} {...rest}>
            {label ?? t('common.clear')}
        </Button>
    );
}
