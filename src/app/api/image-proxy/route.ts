import type { NextRequest } from 'next/server';

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

    if (!imageUrl) {
        return Response.json({ message: 'Missing image url.' }, { status: 400 });
    }

    let targetUrl: URL;

    try {
        targetUrl = new URL(imageUrl);
    } catch {
        return Response.json({ message: 'Invalid image url.' }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        return Response.json({ message: 'Only http and https are allowed.' }, { status: 400 });
    }

    if (isPrivateHostname(targetUrl.hostname)) {
        return Response.json({ message: 'Private network addresses are not allowed.' }, { status: 400 });
    }

    const upstream = await fetch(targetUrl, {
        cache: 'no-store',
        headers: {
            Accept: 'image/*',
        },
    });

    if (!upstream.ok) {
        return Response.json({ message: 'Unable to fetch remote image.' }, { status: 400 });
    }

    const contentType = upstream.headers.get('content-type') ?? '';

    if (!contentType.startsWith('image/')) {
        return Response.json({ message: 'The remote resource is not an image.' }, { status: 400 });
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
