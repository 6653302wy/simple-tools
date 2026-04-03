'use client';

import { cva } from 'class-variance-authority';
import type * as React from 'react';
import { forwardRef } from 'react';
import { cn } from '@/libs/utils';
import { Loading, type LoadingVariant } from '../Loading';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'plain';

const buttonVariants = cva(
    'w-fit inline-flex items-center justify-center gap-2 rounded-full text-title-md px-4 py-[9.5px] whitespace-nowrap cursor-pointer disabled:pointer-events-none disabled:cursor-not-allowed  ',
    {
        variants: {
            variant: {
                primary: `text-neutral-h bg-primary-400
                        hover:bg-[linear-gradient(116deg,_#76C560_13.49%,_#34AF61_85.18%)]
                        active:bg-bg-primary-500
                        disabled:bg-primary-200
                        disabled:border-none
                        `,
                secondary: `bg-fill-b text-text-e
                            hover:bg-fill-c
                            active:bg-fill-d
                            disabled:text-text-c
                            disabled:bg-fill-c`,
                outline: `bg-transparent text-primary-400 border border-primary-400
                            hover:border-primary-300
                            hover:text-primary-300
                            active:border-primary-600 
                            active:text-primary-600
                            disabled:border-primary-200 
                            disabled: text-primary-200`,
                text: `bg-transparent text-primary-400
                        hover:text-primary-300
                        active:text-primary-600
                        disabled:text-primary-200`,
                plain: `bg-transparent border-transparent
                        hover:bg-transparent
                        active:bg-transparent
                        disabled:bg-transparent`,
            },
        },
        defaultVariants: {
            variant: 'primary',
        },
    },
);

const primaryLoadingVariants = ['primary', 'text', 'outline'];
const loadingVariant = (variant: ButtonVariant): LoadingVariant => {
    if (primaryLoadingVariants.includes(variant)) {
        return 'primary';
    }
    return 'secondary';
};

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'> {
    variant?: ButtonVariant;
    type?: React.ButtonHTMLAttributes<HTMLButtonElement>['type'];
    /** 将按钮宽度调整为其父宽度的选项 */
    block?: boolean;
    /** 加载状态 该状态下按钮为disable */
    loading?: boolean;
    icon?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
}
/**
 * 公共按钮组件
 * @returns
 */
export const Button = forwardRef<HTMLButtonElement, React.PropsWithChildren<ButtonProps>>(
    (
        { children, variant = 'primary', type = 'button', onClick, disabled, loading, className, icon, block, ...rest },
        ref,
    ) => {
        const isDisabled = disabled || loading;

        return (
            <button
                ref={ref}
                type={type}
                className={cn(
                    buttonVariants({ variant }),
                    className,
                    block && 'w-full ',
                    loading && 'pointer-events-none cursor-not-allowed ',
                )}
                onClick={(event) => {
                    if (!isDisabled) {
                        onClick?.(event);
                    }
                }}
                disabled={isDisabled}
                aria-disabled={isDisabled}
                {...rest}
            >
                {loading && <Loading className="size-4 " variant={loadingVariant(variant)} />}
                {Boolean(icon) && icon}
                {children}
            </button>
        );
    },
);

Button.displayName = 'Button';
