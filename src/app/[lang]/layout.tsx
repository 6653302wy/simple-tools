import { notFound } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Layout } from '@/Layout';
import { I18nProvider } from '@/services/i18n';
import { isLanguage } from '@/services/i18n/constant';
import { generateStaticParams as generateLanguageStaticParams } from './route-params';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return generateLanguageStaticParams();
}

export default async function LanguageLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;

    if (!isLanguage(lang)) {
        notFound();
    }

    return (
        <I18nProvider initialLanguage={lang}>
            <ThemeProvider>
                <Layout>{children}</Layout>
            </ThemeProvider>
        </I18nProvider>
    );
}
