import { DEFAULT_LANGUAGE, isLanguage, type Language } from './constant';

export const supportedLanguages: Language[] = ['zh', 'en'];

export function normalizeLanguage(value: string | undefined | null) {
    return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}

export function buildLocalizedHref(language: Language, href: string) {
    const normalizedHref = href.startsWith('/') ? href : `/${href}`;

    return `/${language}${normalizedHref === '/' ? '' : normalizedHref}`;
}

export function stripLanguagePrefix(pathname: string) {
    const segments = pathname.split('/').filter(Boolean);
    const firstSegment = segments[0];

    if (!isLanguage(firstSegment)) {
        return pathname;
    }

    const nextPath = `/${segments.slice(1).join('/')}`;

    return nextPath === '/' ? '/' : nextPath.replace(/\/$/, '') || '/';
}
