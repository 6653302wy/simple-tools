import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { ExchangeRateClient } from './ExchangeRateClient';

export async function ExchangeRateConverter({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="MODULE / FX"
                title={t('exchangeRate.introTitle')}
                description={t('exchangeRate.introDescription')}
            />
            <ExchangeRateClient />
        </section>
    );
}
