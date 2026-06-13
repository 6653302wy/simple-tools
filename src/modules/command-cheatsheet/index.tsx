import { ModuleIntro } from '@/components/ModuleIntro';
import type { Language } from '@/services/i18n/constant';
import { getServerT } from '@/services/i18n/server';
import { CommandCheatsheetClient } from './CommandCheatsheetClient';

export async function CommandCheatsheetTool({ language }: { language: Language }) {
    const { t } = await getServerT(language);

    return (
        <section className="flex h-[calc(100dvh-12rem)] min-h-0 flex-col gap-4 overflow-hidden">
            <ModuleIntro
                badge="CMD"
                title={t('commandCheatsheet.introTitle')}
                description={t('commandCheatsheet.introDescription')}
            />
            <CommandCheatsheetClient />
        </section>
    );
}
