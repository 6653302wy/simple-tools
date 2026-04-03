import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
    extend: {
        classGroups: {
            /** 避免tailwind-merge将所有-text-*合并 */
            'font-size': [
                'text-auxiliary',
                'text-auxiliary-medium',
                'text-auxiliary-bold',
                'text-body',
                'text-body-bold',
                'text-title-sm',
                'text-title-sm-bold',
                'text-title-md',
                'text-title-md-bold',
                'text-title-lg',
                'text-title-lg-bold',
            ],
        },
    },
});

/** 类合并 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** 延迟ms毫秒的promise */
export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
