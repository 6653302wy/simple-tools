import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ToolModuleSlug } from '@/modules/tool-registry';
import { StorageEnum } from '@/services/types';
import { buildLocalizedHref, normalizeLanguage } from '@/services/i18n/routing';

export function createLegacyToolRedirectPage(slug: ToolModuleSlug) {
    return async function LegacyToolRedirectPage() {
        const cookieStore = await cookies();
        const language = normalizeLanguage(cookieStore.get(StorageEnum.I18nLanguage)?.value);

        redirect(buildLocalizedHref(language, `/${slug}`));
    };
}
