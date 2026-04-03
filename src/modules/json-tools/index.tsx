import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { JsonToolsClient } from './JsonToolsClient';

export async function JsonTools({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="JSON" title={t('json.introTitle')} description={t('json.introDescription')} />
            <JsonToolsClient />
        </section>
    );
}
