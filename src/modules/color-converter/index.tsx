import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { ColorConverterClient } from './ColorConverterClient';

export async function ColorConverterTool({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="COLOR" title={t('color.introTitle')} description={t('color.introDescription')} />
            <ColorConverterClient />
        </section>
    );
}
