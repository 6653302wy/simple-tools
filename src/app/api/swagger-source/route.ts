import type { NextRequest } from 'next/server';
import { isLanguage, type Language } from '@/services/i18n/constant';
import { translate } from '@/services/i18n/messages';

export const dynamic = 'force-dynamic';

const MAX_SWAGGER_BYTES = 1024 * 1024 * 2;

async function readLimitedText(response: Response) {
    if (!response.body) {
        return '';
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;

    try {
        while (totalBytes < MAX_SWAGGER_BYTES) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
            totalBytes += value.byteLength;

            if (totalBytes >= MAX_SWAGGER_BYTES) {
                await reader.cancel();
                throw new Error('too_large');
            }
        }
    } finally {
        reader.releaseLock();
    }

    const merged = new Uint8Array(totalBytes);
    let offset = 0;

    for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
    }

    return new TextDecoder().decode(merged);
}

export async function GET(request: NextRequest) {
    const language = isLanguage(request.nextUrl.searchParams.get('lang'))
        ? (request.nextUrl.searchParams.get('lang') as Language)
        : 'zh';
    const swaggerUrl = request.nextUrl.searchParams.get('url');

    if (!swaggerUrl) {
        return Response.json({ message: translate(language, 'api.swaggerMissingUrl') }, { status: 400 });
    }

    let targetUrl: URL;

    try {
        targetUrl = new URL(swaggerUrl);
    } catch {
        return Response.json({ message: translate(language, 'api.swaggerInvalidUrl') }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        return Response.json({ message: translate(language, 'api.swaggerProtocolNotAllowed') }, { status: 400 });
    }

    try {
        const upstream = await fetch(targetUrl, {
            cache: 'no-store',
            headers: {
                Accept: 'application/json, application/vnd.oai.openapi+json, text/plain',
            },
            signal: AbortSignal.timeout(15000),
        });

        if (!upstream.ok) {
            return Response.json({ message: translate(language, 'api.swaggerFetchFailed') }, { status: 400 });
        }

        const content = await readLimitedText(upstream);

        return Response.json({ content });
    } catch (error) {
        const message =
            error instanceof Error && error.message === 'too_large'
                ? translate(language, 'api.swaggerTooLarge')
                : translate(language, 'api.swaggerFetchFailed');

        return Response.json({ message }, { status: 400 });
    }
}
