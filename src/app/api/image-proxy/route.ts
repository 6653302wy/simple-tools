import type { NextRequest } from 'next/server';
import { isLanguage, type Language } from '@/services/i18n/constant';
import { translate } from '@/services/i18n/messages';

export const dynamic = 'force-dynamic';

function isPrivateHostname(hostname: string) {
    const normalized = hostname.toLowerCase();

    if (normalized === 'localhost' || normalized === '::1' || normalized.endsWith('.local')) {
        return true;
    }

    if (/^127\./.test(normalized) || /^10\./.test(normalized) || /^192\.168\./.test(normalized)) {
        return true;
    }

    const privateRange = normalized.match(/^172\.(\d{1,3})\./);

    if (privateRange) {
        const secondOctet = Number(privateRange[1]);

        return secondOctet >= 16 && secondOctet <= 31;
    }

    return false;
}

export async function GET(request: NextRequest) {
    const imageUrl = request.nextUrl.searchParams.get('url');
    const language = isLanguage(request.nextUrl.searchParams.get('lang'))
        ? (request.nextUrl.searchParams.get('lang') as Language)
        : 'zh';

    if (!imageUrl) {
        return Response.json({ message: translate(language, 'api.missingImageUrl') }, { status: 400 });
    }

    let targetUrl: URL;

    try {
        targetUrl = new URL(imageUrl);
    } catch {
        return Response.json({ message: translate(language, 'api.invalidImageUrl') }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        return Response.json({ message: translate(language, 'api.imageProtocolNotAllowed') }, { status: 400 });
    }

    if (isPrivateHostname(targetUrl.hostname)) {
        return Response.json({ message: translate(language, 'api.privateNetworkNotAllowed') }, { status: 400 });
    }

    const upstream = await fetch(targetUrl, {
        cache: 'no-store',
        headers: {
            Accept: 'image/*',
        },
    });

    if (!upstream.ok) {
        return Response.json({ message: translate(language, 'api.imageFetchFailed') }, { status: 400 });
    }

    const contentType = upstream.headers.get('content-type') ?? '';

    if (!contentType.startsWith('image/')) {
        return Response.json({ message: translate(language, 'api.imageNotValid') }, { status: 400 });
    }

    const imageBuffer = await upstream.arrayBuffer();

    return new Response(imageBuffer, {
        status: 200,
        headers: {
            'Cache-Control': 'no-store',
            'Content-Type': contentType,
        },
    });
}
