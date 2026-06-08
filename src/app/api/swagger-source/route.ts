import type { NextRequest } from 'next/server';
import { isLanguage, type Language } from '@/services/i18n/constant';
import { translate } from '@/services/i18n/messages';

export const dynamic = 'force-dynamic';

const MAX_SWAGGER_BYTES = 1024 * 1024 * 2;
const SWAGGER_URL_PATTERNS = [/(?:url|configUrl)\s*:\s*["']([^"']+)["']/g, /"(?:url|configUrl)"\s*:\s*"([^"]+)"/g];

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

function isSwaggerSpecDocument(content: string) {
    try {
        const parsed = JSON.parse(content) as unknown;

        return Boolean(
            parsed && typeof parsed === 'object' && ('paths' in parsed || 'openapi' in parsed || 'swagger' in parsed),
        );
    } catch {
        return false;
    }
}

function decodeSwaggerUrl(value: string) {
    return value
        .replace(/\\\//g, '/')
        .replace(/\\u002f/gi, '/')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .trim();
}

function extractSwaggerJsonUrls(content: string, baseUrl: URL) {
    const urls = new Set<string>();

    for (const pattern of SWAGGER_URL_PATTERNS) {
        pattern.lastIndex = 0;

        for (const match of content.matchAll(pattern)) {
            const rawUrl = decodeSwaggerUrl(match[1] ?? '');

            if (!rawUrl || rawUrl.startsWith('data:') || rawUrl.includes('{')) {
                continue;
            }

            try {
                const resolvedUrl = new URL(rawUrl, baseUrl);

                if (['http:', 'https:'].includes(resolvedUrl.protocol)) {
                    urls.add(resolvedUrl.toString());
                }
            } catch {
                // Ignore malformed Swagger UI entries and continue scanning.
            }
        }
    }

    return [...urls].sort((left, right) => {
        const leftLooksJson = /(?:openapi|swagger|api-docs|doc\.json|\.json)(?:[?#/]|$)/i.test(left);
        const rightLooksJson = /(?:openapi|swagger|api-docs|doc\.json|\.json)(?:[?#/]|$)/i.test(right);

        return Number(rightLooksJson) - Number(leftLooksJson);
    });
}

async function fetchSwaggerText(url: URL) {
    const upstream = await fetch(url, {
        cache: 'no-store',
        headers: {
            Accept: 'application/json, application/vnd.oai.openapi+json, text/html, text/plain',
        },
        signal: AbortSignal.timeout(15000),
    });

    if (!upstream.ok) {
        throw new Error('fetch_failed');
    }

    return readLimitedText(upstream);
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
        const content = await fetchSwaggerText(targetUrl);

        if (isSwaggerSpecDocument(content)) {
            return Response.json({ content });
        }

        for (const jsonUrl of extractSwaggerJsonUrls(content, targetUrl).slice(0, 8)) {
            try {
                const jsonContent = await fetchSwaggerText(new URL(jsonUrl));

                if (isSwaggerSpecDocument(jsonContent)) {
                    return Response.json({ content: jsonContent });
                }
            } catch (candidateError) {
                if (candidateError instanceof Error && candidateError.message === 'too_large') {
                    throw candidateError;
                }
            }
        }

        return Response.json({ message: translate(language, 'api.swaggerFetchFailed') }, { status: 400 });
    } catch (error) {
        const message =
            error instanceof Error && error.message === 'too_large'
                ? translate(language, 'api.swaggerTooLarge')
                : translate(language, 'api.swaggerFetchFailed');

        return Response.json({ message }, { status: 400 });
    }
}
