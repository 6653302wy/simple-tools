import { buildContentDisposition, isAllowedXhsMediaUrl, xhsRequestHeaders } from '../shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const mediaUrl = requestUrl.searchParams.get('url');
    const fileName = requestUrl.searchParams.get('name') || 'xhs-media';
    const shouldDownload = requestUrl.searchParams.get('download') === '1';

    if (!mediaUrl) {
        return Response.json({ message: 'Missing media URL.' }, { status: 400 });
    }

    let targetUrl: URL;

    try {
        targetUrl = new URL(mediaUrl);
    } catch {
        return Response.json({ message: 'Invalid media URL.' }, { status: 400 });
    }

    if (!isAllowedXhsMediaUrl(targetUrl)) {
        return Response.json({ message: 'Media URL is not allowed.' }, { status: 400 });
    }

    const headers = new Headers({
        Accept: '*/*',
        Referer: xhsRequestHeaders.Referer,
        'User-Agent': xhsRequestHeaders['User-Agent'],
    });
    const range = request.headers.get('range');

    if (range) {
        headers.set('Range', range);
    }

    const upstream = await fetch(targetUrl, {
        cache: 'no-store',
        headers,
        redirect: 'follow',
    });

    if (!upstream.ok && upstream.status !== 206) {
        return Response.json({ message: 'Unable to fetch media.' }, { status: 400 });
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const responseHeaders = new Headers({
        'Cache-Control': 'no-store',
        'Content-Type': contentType,
    });

    for (const headerName of ['accept-ranges', 'content-length', 'content-range']) {
        const value = upstream.headers.get(headerName);

        if (value) {
            responseHeaders.set(headerName, value);
        }
    }

    if (shouldDownload) {
        responseHeaders.set('Content-Disposition', buildContentDisposition(fileName, contentType));
    }

    return new Response(upstream.body, {
        headers: responseHeaders,
        status: upstream.status,
    });
}
