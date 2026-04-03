'use client';

import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { StorageEnum } from '@/services/types';
import { DEFAULT_LANGUAGE, isLanguage, type Language } from './constant';
import { translate } from './messages';

type I18nContextValue = {
    language: Language;
    setLanguage: (nextLanguage: Language) => void;
    t: (key: string, variables?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue>({
    language: DEFAULT_LANGUAGE,
    setLanguage: () => {},
    t: (key) => key,
});

type I18nProviderProps = PropsWithChildren<{
    initialLanguage?: Language;
}>;

export function I18nProvider({ children, initialLanguage = DEFAULT_LANGUAGE }: I18nProviderProps) {
    const [language, setLanguageState] = useState<Language>(initialLanguage);

    useEffect(() => {
        setLanguageState(initialLanguage);
    }, [initialLanguage]);

    useEffect(() => {
        try {
            window.localStorage.setItem(StorageEnum.I18nLanguage, language);
        } catch {
            // Ignore localStorage write issues.
        }

        document.cookie = `${StorageEnum.I18nLanguage}=${language}; path=/; max-age=31536000; samesite=lax`;

        document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
        document.documentElement.dataset.language = language;
    }, [language]);

    const setLanguage = useCallback(
        (nextLanguage: Language) => {
            if (!isLanguage(nextLanguage) || nextLanguage === language) {
                return;
            }

            setLanguageState(nextLanguage);
        },
        [language],
    );

    const t = useCallback(
        (key: string, variables?: Record<string, string | number>) => translate(language, key, variables),
        [language],
    );

    const value = useMemo(
        () => ({
            language,
            setLanguage,
            t,
        }),
        [language, setLanguage, t],
    );

    return <I18nContext value={value}>{children}</I18nContext>;
}

export function useI18n() {
    return useContext(I18nContext);
}

/** 当前语言 */
export function useI18nLanguage() {
    return useI18n().language;
}

/** 当前时区 */
export function useI18nTimezone() {
    return useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC', []);
}
