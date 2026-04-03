import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { MarkdownToolClient } from './MarkdownToolClient';

export async function MarkdownTool({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="MD" title={t('markdown.introTitle')} description={t('markdown.introDescription')} />
            <MarkdownToolClient />
        </section>
    );
}
