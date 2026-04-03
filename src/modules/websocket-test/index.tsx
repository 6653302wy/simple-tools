import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { WebSocketTestClient } from './WebSocketTestClient';

export async function WebSocketTestTool({ language }: { language: Language }) {
    const { t } = await getServerT(language);
    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="WS" title={t('websocket.introTitle')} description={t('websocket.introDescription')} />
            <WebSocketTestClient />
        </section>
    );
}
