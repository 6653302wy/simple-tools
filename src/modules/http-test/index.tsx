import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { HttpTestClient } from './HttpTestClient';

export async function HttpTestTool({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="HTTP" title={t('httpTest.introTitle')} description={t('httpTest.introDescription')} />
            <HttpTestClient />
        </section>
    );
}
