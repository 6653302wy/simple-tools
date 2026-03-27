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

export function I18nProvider({ children }: PropsWithChildren) {
    const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

    useEffect(() => {
        try {
            const storedLanguage = window.localStorage.getItem(StorageEnum.I18nLanguage);

            if (isLanguage(storedLanguage)) {
                setLanguageState(storedLanguage);
            }
        } catch {
            // Ignore localStorage read issues.
        }
    }, []);

    useEffect(() => {
        try {
            window.localStorage.setItem(StorageEnum.I18nLanguage, language);
        } catch {
            // Ignore localStorage write issues.
        }

        document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
        document.documentElement.dataset.language = language;
    }, [language]);

    const setLanguage = useCallback((nextLanguage: Language) => {
        setLanguageState(nextLanguage);
    }, []);

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
