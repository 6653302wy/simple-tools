import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { Base64ToolClient } from './Base64ToolClient';

export async function Base64Tool({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="B64" title={t('base64.introTitle')} description={t('base64.introDescription')} />
            <Base64ToolClient />
        </section>
    );
}
