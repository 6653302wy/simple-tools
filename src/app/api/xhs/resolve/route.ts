import type { XhsResolvedMedia, XhsResolvePayload } from '@/modules/xhs-unwatermark/types';
import {
    apiError,
    extractFirstXhsUrl,
    getPayloadLanguage,
    isAllowedXhsPageUrl,
    safeFileName,
    xhsRequestHeaders,
} from '../shared';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const REQUEST_TIMEOUT_MS = 15000;

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
    return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function asArray(value: unknown): unknown[] {
    return Array.isArray(value) ? value : [];
}

function asString(value: unknown) {
    return typeof value === 'string' ? value : '';
}

function asNumber(value: unknown) {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function getPath(source: unknown, path: Array<string | number>) {
    return path.reduce<unknown>((current, key) => {
        if (Array.isArray(current) && typeof key === 'number') {
            return current[key];
        }

        if (isObject(current) && typeof key === 'string') {
            return current[key];
        }

        return undefined;
    }, source);
}

async function fetchText(url: string, accept = xhsRequestHeaders.Accept) {
    const headers = new Headers({ ...xhsRequestHeaders, Accept: accept });
    const cookie = process.env.XHS_COOKIE?.trim();

    if (cookie) {
        headers.set('Cookie', cookie);
    }

    const response = await fetch(url, {
        cache: 'no-store',
        headers,
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new Error('fetch-failed');
    }

    return {
        text: await response.text(),
        url: response.url || url,
    };
}

function stripScriptTag(script: string) {
    return script
        .replace(/^<script[^>]*>/i, '')
        .replace(/<\/script>$/i, '')
        .trim();
}

function parseInitialState(html: string) {
    const scripts = html.match(/<script[^>]*>[\s\S]*?<\/script>/gi) ?? [];
    const initialStateScript = scripts
        .map(stripScriptTag)
        .find((script) => script.includes('window.__INITIAL_STATE__'));

    if (!initialStateScript) {
        return null;
    }

    const assignmentIndex = initialStateScript.indexOf('window.__INITIAL_STATE__');
    const equalsIndex = initialStateScript.indexOf('=', assignmentIndex);

    if (equalsIndex < 0) {
        return null;
    }

    let payload = initialStateScript.slice(equalsIndex + 1).trim();

    if (payload.endsWith(';')) {
        payload = payload.slice(0, -1).trim();
    }

    try {
        return JSON.parse(payload) as JsonObject;
    } catch {
        try {
            return JSON.parse(payload.replace(/\bundefined\b/g, 'null')) as JsonObject;
        } catch {
            return null;
        }
    }
}

function findNoteData(initialState: JsonObject) {
    const mobileNote = getPath(initialState, ['noteData', 'data', 'noteData']);

    if (isObject(mobileNote)) {
        return mobileNote;
    }

    const noteDetailMap = getPath(initialState, ['note', 'noteDetailMap']);

    if (!isObject(noteDetailMap)) {
        return null;
    }

    for (const item of Object.values(noteDetailMap)) {
        const note = isObject(item) ? item.note : null;

        if (isObject(note)) {
            return note;
        }
    }

    return null;
}

function extractImageToken(rawUrl: string) {
    if (!rawUrl) {
        return '';
    }

    const withoutSuffix = rawUrl.split('?')[0]?.split('!')[0] ?? rawUrl;

    try {
        const url = new URL(withoutSuffix);
        const segments = url.pathname.split('/').filter(Boolean);

        if (segments.length >= 3 && /^sns-webpic/i.test(url.hostname)) {
            return segments.slice(2).join('/');
        }

        return segments.join('/');
    } catch {
        return withoutSuffix.split('/').filter(Boolean).slice(2).join('/');
    }
}

function getImageUrl(item: unknown) {
    const urlDefault = asString(getPath(item, ['urlDefault']));
    const url = asString(getPath(item, ['url']));
    const token = extractImageToken(urlDefault || url);

    if (token) {
        return `https://sns-img-bd.xhscdn.com/${token}`;
    }

    return urlDefault || url;
}

function getBestStreamUrl(stream: unknown) {
    if (!isObject(stream)) {
        return '';
    }

    return asString(stream.masterUrl) || asString(getPath(stream, ['backupUrls', 0]));
}

function getLiveMotionUrl(item: unknown) {
    const h264 = asArray(getPath(item, ['stream', 'h264']));
    const h265 = asArray(getPath(item, ['stream', 'h265']));
    const candidates = [...h264, ...h265]
        .map((stream) => ({
            height: asNumber(getPath(stream, ['height'])) ?? 0,
            size: asNumber(getPath(stream, ['size'])) ?? 0,
            url: getBestStreamUrl(stream),
            width: asNumber(getPath(stream, ['width'])) ?? 0,
        }))
        .filter((stream) => stream.url);

    candidates.sort((previous, next) => {
        const previousPixels = previous.width * previous.height;
        const nextPixels = next.width * next.height;

        return previousPixels - nextPixels || previous.size - next.size;
    });

    return candidates.at(-1);
}

function buildImageMedia(note: JsonObject, baseFileName: string) {
    const images = asArray(note.imageList);
    const media: XhsResolvedMedia[] = [];

    images.forEach((item, index) => {
        const imageUrl = getImageUrl(item);

        if (!imageUrl) {
            return;
        }

        const groupId = `image-${index + 1}`;
        const width = asNumber(getPath(item, ['width']));
        const height = asNumber(getPath(item, ['height']));
        const liveMotion = getLiveMotionUrl(item);

        media.push({
            extension: 'jpg',
            fileName: `${baseFileName}_${String(index + 1).padStart(2, '0')}.jpg`,
            groupId,
            height,
            id: `${groupId}-image`,
            kind: liveMotion ? 'live-photo-image' : 'image',
            mimeType: 'image/*',
            qualityLabel: width && height ? `${width} x ${height}` : undefined,
            url: imageUrl,
            width,
        });

        if (liveMotion) {
            media.push({
                extension: 'mp4',
                fileName: `${baseFileName}_${String(index + 1).padStart(2, '0')}-live.mp4`,
                groupId,
                height: liveMotion.height || undefined,
                id: `${groupId}-motion`,
                kind: 'live-photo-motion',
                mimeType: 'video/mp4',
                qualityLabel:
                    liveMotion.width && liveMotion.height ? `${liveMotion.width} x ${liveMotion.height}` : undefined,
                size: liveMotion.size || undefined,
                url: liveMotion.url,
                width: liveMotion.width || undefined,
            });
        }
    });

    return media;
}

function getVideoCandidates(note: JsonObject) {
    const streamRoot = getPath(note, ['video', 'media', 'stream']);
    const streams = [
        ...asArray(getPath(streamRoot, ['h264'])),
        ...asArray(getPath(streamRoot, ['h265'])),
        ...asArray(getPath(streamRoot, ['av1'])),
    ];
    const candidates = streams
        .map((stream) => ({
            bitrate: asNumber(getPath(stream, ['videoBitrate'])) ?? 0,
            codec: asString(getPath(stream, ['videoCodec'])),
            height: asNumber(getPath(stream, ['height'])) ?? 0,
            qualityType: asString(getPath(stream, ['qualityType'])),
            size: asNumber(getPath(stream, ['size'])) ?? 0,
            url: getBestStreamUrl(stream),
            width: asNumber(getPath(stream, ['width'])) ?? 0,
        }))
        .filter((stream) => stream.url);
    const originVideoKey = asString(getPath(note, ['video', 'consumer', 'originVideoKey']));

    if (originVideoKey) {
        candidates.push({
            bitrate: 0,
            codec: '',
            height: 0,
            qualityType: 'origin',
            size: 0,
            url: `https://sns-video-bd.xhscdn.com/${originVideoKey}`,
            width: 0,
        });
    }

    candidates.sort((previous, next) => {
        const previousPixels = previous.width * previous.height;
        const nextPixels = next.width * next.height;

        return previousPixels - nextPixels || previous.bitrate - next.bitrate || previous.size - next.size;
    });

    return candidates;
}

function buildVideoMedia(note: JsonObject, baseFileName: string) {
    const bestVideo = getVideoCandidates(note).at(-1);

    if (!bestVideo) {
        return [];
    }

    return [
        {
            extension: 'mp4',
            fileName: `${baseFileName}.mp4`,
            height: bestVideo.height || undefined,
            id: 'video-1',
            kind: 'video',
            mimeType: 'video/mp4',
            qualityLabel:
                bestVideo.width && bestVideo.height
                    ? `${bestVideo.width} x ${bestVideo.height}${bestVideo.codec ? ` ${bestVideo.codec}` : ''}`
                    : bestVideo.qualityType || undefined,
            size: bestVideo.size || undefined,
            url: bestVideo.url,
            width: bestVideo.width || undefined,
        } satisfies XhsResolvedMedia,
    ];
}

function getNoteType(note: JsonObject, media: XhsResolvedMedia[]) {
    if (note.type === 'video') {
        return 'video';
    }

    if (media.some((item) => item.kind === 'live-photo-motion')) {
        return 'livePhoto';
    }

    if (media.length > 0) {
        return 'image';
    }

    return 'unknown';
}

async function resolveXhsUrl(input: string) {
    const firstUrl = extractFirstXhsUrl(input);

    if (!firstUrl) {
        return null;
    }

    const url = new URL(firstUrl);

    if (!isAllowedXhsPageUrl(url)) {
        return null;
    }

    if (url.hostname.toLowerCase() !== 'xhslink.com') {
        return url.href;
    }

    const resolved = await fetchText(url.href, '*/*');
    const resolvedUrl = new URL(resolved.url);

    return isAllowedXhsPageUrl(resolvedUrl) ? resolvedUrl.href : null;
}

export async function POST(request: Request) {
    const payload = (await request.json().catch(() => null)) as { content?: string; language?: string } | null;
    const language = getPayloadLanguage(payload?.language);
    const content = payload?.content?.trim();

    if (!content) {
        return apiError(language, 'api.xhsMissingContent');
    }

    try {
        const resolvedUrl = await resolveXhsUrl(content);

        if (!resolvedUrl) {
            return apiError(language, 'api.xhsInvalidUrl');
        }

        const htmlResponse = await fetchText(resolvedUrl);
        const initialState = parseInitialState(htmlResponse.text);

        if (!initialState) {
            return apiError(language, 'api.xhsNoInitialState');
        }

        const note = findNoteData(initialState);

        if (!note) {
            return apiError(language, 'api.xhsResolveFailed');
        }

        const noteId = asString(note.noteId) || asString(note.id) || 'xhs-note';
        const title = asString(note.title) || asString(note.desc).slice(0, 48) || noteId;
        const baseFileName = safeFileName(`${noteId}-${title}`, noteId);
        const imageMedia = buildImageMedia(note, baseFileName);
        const videoMedia = note.type === 'video' ? buildVideoMedia(note, baseFileName) : [];
        const media = [...videoMedia, ...imageMedia];

        if (!media.length) {
            return apiError(language, 'api.xhsNoMedia');
        }

        const result: XhsResolvePayload = {
            media,
            note: {
                authorId: asString(getPath(note, ['user', 'userId'])) || undefined,
                authorName:
                    asString(getPath(note, ['user', 'nickname'])) ||
                    asString(getPath(note, ['user', 'nickName'])) ||
                    undefined,
                description: asString(note.desc) || undefined,
                noteId,
                sourceUrl: resolvedUrl,
                title,
                type: getNoteType(note, media),
            },
            resolvedUrl: htmlResponse.url,
            warnings: [],
        };

        return Response.json(result);
    } catch {
        return apiError(language, 'api.xhsResolveFailed');
    }
}
