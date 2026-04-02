'use client';

import { cva } from 'class-variance-authority';
import { Select as RadixSelect } from 'radix-ui';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';
import { ArrowDown } from '../icons/ArrowDown';

export type SelectOption = {
    label: string;
    value: string;
    disabled?: boolean;
};

interface SelectProps {
    id?: string;
    name?: string;
    value?: string;
    defaultValue?: string;
    disabled?: boolean;
    placeholder?: string;
    options: SelectOption[];
    className?: string;
    contentClassName?: string;
    onValueChange?: (value: string) => void;
}

const triggerVariants = cva(
    'inline-flex h-11 w-full min-w-0 items-center justify-between gap-2 rounded-lg border border-neutral-j bg-fill-b px-3 text-body-sm text-text-e outline-none transition',
    {
        variants: {
            variant: {
                default:
                    'data-[placeholder]:text-text-c hover:bg-fill-a focus:border-primary-400 disabled:pointer-events-none disabled:bg-fill-c disabled:text-text-c',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
);

/**
 * 公共下拉选择组件
 */
export function Select({
    id,
    name,
    value,
    defaultValue,
    disabled,
    placeholder,
    options,
    className,
    contentClassName,
    onValueChange,
}: SelectProps) {
    const { t } = useI18n();
    const resolvedPlaceholder = placeholder ?? t('common.selectPlaceholder');

    return (
        <RadixSelect.Root
            name={name}
            value={value}
            defaultValue={defaultValue}
            disabled={disabled}
            onValueChange={onValueChange}
        >
            <RadixSelect.Trigger id={id} className={cn(triggerVariants(), className)} aria-label={resolvedPlaceholder}>
                <RadixSelect.Value
                    className="min-w-0 flex-1 truncate text-left text-body-sm whitespace-nowrap"
                    placeholder={resolvedPlaceholder}
                />
                <RadixSelect.Icon asChild>
                    <ArrowDown className="shrink-0 text-body-sm text-text-c" />
                </RadixSelect.Icon>
            </RadixSelect.Trigger>

            <RadixSelect.Portal>
                <RadixSelect.Content
                    position="popper"
                    sideOffset={8}
                    className={cn(
                        'z-50 max-h-72 min-w-[10rem] overflow-hidden rounded-xl border border-neutral-j bg-fill-a p-1 shadow-[0_18px_40px_rgba(0,54,22,0.12)]',
                        'w-[var(--radix-select-trigger-width)]',
                        contentClassName,
                    )}
                >
                    <RadixSelect.Viewport>
                        {options.map((option) => (
                            <RadixSelect.Item
                                key={option.value}
                                value={option.value}
                                disabled={option.disabled}
                                className={cn(
                                    'relative flex w-full min-w-0 cursor-default select-none items-center rounded-lg py-2 pl-9 pr-3 text-body-sm text-text-e outline-none transition',
                                    'data-highlighted:bg-primary-100 data-highlighted:text-primary-700',
                                    'data-state-checked:bg-primary-100/70 data-state-checked:text-primary-700',
                                    'data-disabled:pointer-events-none data-disabled:text-text-c',
                                )}
                            >
                                <span className="absolute left-3 inline-flex items-center justify-center text-body-sm text-primary-500">
                                    <RadixSelect.ItemIndicator>✓</RadixSelect.ItemIndicator>
                                </span>
                                <RadixSelect.ItemText className="block truncate text-body-sm whitespace-nowrap">
                                    {option.label}
                                </RadixSelect.ItemText>
                            </RadixSelect.Item>
                        ))}
                    </RadixSelect.Viewport>
                </RadixSelect.Content>
            </RadixSelect.Portal>
        </RadixSelect.Root>
    );
}
