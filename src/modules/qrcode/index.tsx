import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { QrCodeToolClient } from './QrCodeToolClient';

export async function QrCodeTool({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="space-y-4">
            <ModuleIntro badge="QR" title={t('qrcode.introTitle')} description={t('qrcode.introDescription')} />
            <QrCodeToolClient />
        </section>
    );
}
