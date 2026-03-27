import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 类合并 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/** 延迟ms毫秒的promise */
export function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
