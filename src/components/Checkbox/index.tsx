'use client';

import { type FC, useEffect, useState } from 'react';
import { cn } from '@/libs/utils';
import { Checked } from '../icons/Checked';
import { UnChecked } from '../icons/UnChecked';

interface Props {
    /** 是否禁用 */
    disabled?: boolean;
    /** 是否选中 */
    checked?: boolean;
    /** 是否默认选中 */
    defaultChecked?: boolean;
    /** 标签 */
    label?: string;
    /** 样式 */
    className?: string;
    /** 回调 */
    onChange?: (checked: boolean) => void;
}

/**
 * 复选框组件
 * TODO: disabled 样式
 * @returns
 */
export const Checkbox: FC<Props> = ({ disabled, checked, defaultChecked, label, className, onChange }) => {
    const [isChecked, setIsChecked] = useState<boolean>(defaultChecked ?? false);

    useEffect(() => {
        if (checked !== undefined) {
            setIsChecked(checked);
        }
    }, [checked]);

    const handleChange = () => {
        if (disabled) {
            return;
        }
        const next = !isChecked;
        setIsChecked(next);
        onChange?.(next);
    };

    return (
        <div className={cn('flex items-center gap-2', className)}>
            <button
                type="button"
                onClick={handleChange}
                className={cn(disabled ? 'cursor-not-allowed' : 'cursor-pointer')}
            >
                {isChecked ? <Checked className="text-body-md" /> : <UnChecked className="text-body-sm" />}
            </button>
            {label && <span className="text-auxiliary text-Dark-text">{label}</span>}
        </div>
    );
};
