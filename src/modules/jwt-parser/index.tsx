import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { JwtParserClient } from './JwtParserClient';

export async function JwtParserTool({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="JWT" title={t('jwt.introTitle')} description={t('jwt.introDescription')} />
            <JwtParserClient />
        </section>
    );
}
