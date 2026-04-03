import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { LocalNetworkClient } from './LocalNetworkClient';

export async function LocalNetworkTool({ language }: { language: Language }) {
    const { t } = await getServerT(language);
    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="LAN"
                title={t('localNetwork.introTitle')}
                description={t('localNetwork.introDescription')}
            />
            <LocalNetworkClient />
        </section>
    );
}
