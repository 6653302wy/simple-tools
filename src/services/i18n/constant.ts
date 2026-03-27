export type Language = 'zh' | 'en';

export type LocalizedText = Record<Language, string>;

export const DEFAULT_LANGUAGE: Language = 'zh';

export const LANGUAGE_OPTIONS: Array<{ label: string; value: Language }> = [
    { label: '中', value: 'zh' },
    { label: 'EN', value: 'en' },
];

export function isLanguage(value: unknown): value is Language {
    return value === 'zh' || value === 'en';
}

export function resolveLocalizedText(language: Language, text: LocalizedText) {
    return text[language];
}
