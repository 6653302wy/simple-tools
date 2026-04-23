import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { XhsUnwatermarkClient } from './XhsUnwatermarkClient';

export async function XhsUnwatermarkTool({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro
                badge="XHS"
                title={t('xhsUnwatermark.introTitle')}
                description={t('xhsUnwatermark.introDescription')}
            />
            <XhsUnwatermarkClient />
        </section>
    );
}
