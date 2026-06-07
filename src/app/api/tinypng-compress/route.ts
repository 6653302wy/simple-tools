import { Buffer } from 'node:buffer';
import type { NextRequest } from 'next/server';
import { isLanguage, type Language } from '@/services/i18n/constant';
import { translate } from '@/services/i18n/messages';

export const dynamic = 'force-dynamic';

const TINYPNG_SHRINK_URL = 'https://api.tinify.com/shrink';
const MAX_IMAGE_BYTES = 25 * 1024 * 1024;

function buildAuthorizationHeader(apiKey: string) {
    return `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;
}

async function readTinyPngError(response: Response, language: Language) {
    const payload = (await response.json().catch(() => null)) as { error?: string; message?: string } | null;

    return payload?.message || payload?.error || translate(language, 'api.tinyPngFailed');
}

export async function POST(request: NextRequest) {
    const formData = await request.formData().catch(() => null);
    const languageInput = formData?.get('language');
    const language: Language = isLanguage(languageInput) ? languageInput : 'zh';
    const apiKey = String(formData?.get('apiKey') ?? '').trim();
    const image = formData?.get('image');

    if (!apiKey) {
        return Response.json({ message: translate(language, 'api.tinyPngMissingApiKey') }, { status: 400 });
    }

    if (!(image instanceof File) || !image.type.startsWith('image/')) {
        return Response.json({ message: translate(language, 'api.tinyPngInvalidImage') }, { status: 400 });
    }

    if (image.size > MAX_IMAGE_BYTES) {
        return Response.json({ message: translate(language, 'api.tinyPngImageTooLarge') }, { status: 400 });
    }

    const authorization = buildAuthorizationHeader(apiKey);
    const shrinkResponse = await fetch(TINYPNG_SHRINK_URL, {
        method: 'POST',
        cache: 'no-store',
        headers: {
            Authorization: authorization,
            'Content-Type': image.type || 'application/octet-stream',
        },
        body: await image.arrayBuffer(),
    });

    if (!shrinkResponse.ok) {
        return Response.json({ message: await readTinyPngError(shrinkResponse, language) }, { status: 400 });
    }

    const outputUrl = shrinkResponse.headers.get('location');

    if (!outputUrl) {
        return Response.json({ message: translate(language, 'api.tinyPngMissingOutput') }, { status: 400 });
    }

    const outputResponse = await fetch(outputUrl, {
        cache: 'no-store',
        headers: {
            Authorization: authorization,
        },
    });

    if (!outputResponse.ok) {
        return Response.json({ message: await readTinyPngError(outputResponse, language) }, { status: 400 });
    }

    const outputBuffer = await outputResponse.arrayBuffer();
    const contentType = outputResponse.headers.get('content-type') || image.type || 'application/octet-stream';

    return new Response(outputBuffer, {
        status: 200,
        headers: {
            'Cache-Control': 'no-store',
            'Content-Type': contentType,
        },
    });
}
