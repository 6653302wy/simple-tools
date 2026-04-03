import { cookies } from 'next/headers';
import { DEFAULT_LANGUAGE, isLanguage, type Language } from './constant';
import { translate } from './messages';

export async function getServerLanguage() {
    const cookieStore = await cookies();
    const cookieLanguage = cookieStore.get('i18n_language')?.value;

    return isLanguage(cookieLanguage) ? cookieLanguage : DEFAULT_LANGUAGE;
}

export async function getServerT(languageInput?: Language) {
    const language = languageInput ?? (await getServerLanguage());

    return {
        language,
        t: (key: string, variables?: Record<string, string | number>) => translate(language, key, variables),
    } satisfies {
        language: Language;
        t: (key: string, variables?: Record<string, string | number>) => string;
    };
}
