import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { YamlToolsClient } from './YamlToolsClient';

export async function YamlTools({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="YAML" title={t('yaml.introTitle')} description={t('yaml.introDescription')} />
            <YamlToolsClient />
        </section>
    );
}
