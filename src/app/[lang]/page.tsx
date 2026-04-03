import { redirect } from 'next/navigation';
import { defaultToolHref } from '@/modules/tool-registry';
import { isLanguage } from '@/services/i18n/constant';
import { generateStaticParams as generateLanguageStaticParams } from './route-params';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return generateLanguageStaticParams();
}

export default async function LocalizedHomePage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params;

    redirect(`/${isLanguage(lang) ? lang : 'zh'}${defaultToolHref}`);
}
