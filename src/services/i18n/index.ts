'use client';

import { useMemo } from 'react';
import { DEFAULT_LANGUAGE, type Language } from './constant';

/** 当前语言 */
export function useI18nLanguage(): Language {
    return DEFAULT_LANGUAGE;
}

/** 当前时区 */
export function useI18nTimezone() {
    return useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);
}
