import { notFound } from 'next/navigation';
import { ToolRouteRenderer } from '@/modules/runtime/ToolRouteRenderer';
import type { ToolModuleSlug } from '@/modules/tool-registry';
import { isLanguage } from '@/services/i18n/constant';

export function createLocalizedToolPage(slug: ToolModuleSlug) {
    return async function ToolPage({ params }: { params: Promise<{ lang: string }> }) {
        const { lang } = await params;

        if (!isLanguage(lang)) {
            notFound();
        }

        return <ToolRouteRenderer slug={slug} language={lang} />;
    };
}
