import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ToolModuleSlug } from '@/modules/tool-registry';
import { buildLocalizedHref, normalizeLanguage } from '@/services/i18n/routing';
import { StorageEnum } from '@/services/types';

export function createLegacyToolRedirectPage(slug: ToolModuleSlug) {
    return async function LegacyToolRedirectPage() {
        const cookieStore = await cookies();
        const language = normalizeLanguage(cookieStore.get(StorageEnum.I18nLanguage)?.value);

        redirect(buildLocalizedHref(language, `/${slug}`));
    };
}
