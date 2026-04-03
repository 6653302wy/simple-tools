import { supportedLanguages } from '@/services/i18n/routing';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return supportedLanguages.map((lang) => ({ lang }));
}
