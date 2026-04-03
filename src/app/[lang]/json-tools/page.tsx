import { generateStaticParams as generateLanguageStaticParams } from '../route-params';
import { createLocalizedToolPage } from '../tool-page';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
    return generateLanguageStaticParams();
}

export default createLocalizedToolPage('json-tools');
