import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { SwaggerCodegenClient } from './SwaggerCodegenClient';

export async function SwaggerCodegenTool({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="SWG" title={t('swagger.introTitle')} description={t('swagger.introDescription')} />
            <SwaggerCodegenClient />
        </section>
    );
}
