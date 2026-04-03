import net from 'node:net';
import { performance } from 'node:perf_hooks';
import type { NextRequest } from 'next/server';
import { isLanguage, type Language } from '@/services/i18n/constant';
import { translate } from '@/services/i18n/messages';

export const dynamic = 'force-dynamic';

const REQUEST_TIMEOUT_MS = 15000;
const MIN_REQUEST_TIMEOUT_MS = 3000;
const MAX_REQUEST_TIMEOUT_MS = 60000;
const MAX_RESPONSE_BYTES = 1024 * 512;
const ALLOWED_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS']);
const HOP_BY_HOP_HEADERS = new Set(['host', 'connection', 'content-length', 'transfer-encoding', 'upgrade']);
const ALLOWED_REDIRECT_MODES = new Set(['follow', 'manual', 'error']);

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

async function readResponseBody(response: Response) {
    const contentType = response.headers.get('content-type') ?? '';

    if (!response.body) {
        return {
            body: '',
            bytes: 0,
            contentType,
            truncated: false,
        };
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    let truncated = false;

    try {
        while (totalBytes < MAX_RESPONSE_BYTES) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            chunks.push(value);
            totalBytes += value.byteLength;

            if (totalBytes >= MAX_RESPONSE_BYTES) {
                truncated = true;
                await reader.cancel();
                break;
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

    const isTextual =
        contentType.includes('json') ||
        contentType.startsWith('text/') ||
        contentType.includes('xml') ||
        contentType.includes('javascript') ||
        contentType.includes('x-www-form-urlencoded');

    if (!isTextual) {
        return {
            body: `[binary response omitted, ${totalBytes} bytes]`,
            bytes: totalBytes,
            contentType,
            truncated,
        };
    }

    return {
        body: new TextDecoder().decode(merged),
        bytes: totalBytes,
        contentType,
        truncated,
    };
}

function normalizeHeaders(input: unknown) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
        return null;
    }

    return Object.fromEntries(
        Object.entries(input).flatMap(([key, value]) => {
            if (typeof key !== 'string' || value == null || value === '') {
                return [];
            }

            return [[key, String(value)]];
        }),
    );
}

function buildMultipartFormData(body: string) {
    const formData = new FormData();
    const lines = body
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);
    let appendedCount = 0;

    for (const line of lines) {
        const separatorIndex = line.indexOf('=');

        if (separatorIndex <= 0) {
            continue;
        }

        const key = line.slice(0, separatorIndex).trim();
        const value = line.slice(separatorIndex + 1).trim();

        if (!key) {
            continue;
        }

        formData.append(key, value);
        appendedCount += 1;
    }

    if (!appendedCount && body.trim()) {
        formData.append('content', body.trim());
    }

    return formData;
}

function buildRequestBody(method: string, contentType: string | undefined, body: string | undefined) {
    if (method === 'GET' || method === 'HEAD') {
        return undefined;
    }

    if (contentType === 'multipart/form-data') {
        return buildMultipartFormData(body ?? '');
    }

    return body ?? '';
}

export async function POST(request: NextRequest) {
    const payload = (await request.json().catch(() => null)) as {
        acceptType?: string;
        body?: string;
        contentType?: string;
        headers?: Record<string, string>;
        language?: string;
        method?: string;
        redirectMode?: string;
        timeoutMs?: number;
        url?: string;
    } | null;
    const language: Language = isLanguage(payload?.language) ? payload.language : 'zh';
    const method = payload?.method?.toUpperCase() ?? 'GET';
    const urlInput = payload?.url?.trim();
    const redirectMode = ALLOWED_REDIRECT_MODES.has(payload?.redirectMode ?? '')
        ? (payload?.redirectMode as RequestRedirect)
        : 'follow';
    const timeoutMs = Math.min(
        MAX_REQUEST_TIMEOUT_MS,
        Math.max(MIN_REQUEST_TIMEOUT_MS, Number(payload?.timeoutMs) || REQUEST_TIMEOUT_MS),
    );

    if (!urlInput) {
        return Response.json({ message: translate(language, 'api.requestMissingUrl') }, { status: 400 });
    }

    if (!ALLOWED_METHODS.has(method)) {
        return Response.json({ message: translate(language, 'api.requestFailed') }, { status: 400 });
    }

    let targetUrl: URL;

    try {
        targetUrl = new URL(urlInput);
    } catch {
        return Response.json({ message: translate(language, 'api.requestInvalidUrl') }, { status: 400 });
    }

    if (!['http:', 'https:'].includes(targetUrl.protocol)) {
        return Response.json({ message: translate(language, 'api.requestProtocolNotAllowed') }, { status: 400 });
    }

    if (
        isPrivateHostname(targetUrl.hostname) ||
        (net.isIP(targetUrl.hostname) && isPrivateHostname(targetUrl.hostname))
    ) {
        return Response.json({ message: translate(language, 'api.requestPrivateNetworkBlocked') }, { status: 400 });
    }

    const normalizedHeaders = normalizeHeaders(payload?.headers);

    if (payload?.headers && !normalizedHeaders) {
        return Response.json({ message: translate(language, 'api.requestHeadersInvalid') }, { status: 400 });
    }

    const forwardedHeaders = new Headers();

    for (const [key, value] of Object.entries(normalizedHeaders ?? {})) {
        if (!value || HOP_BY_HOP_HEADERS.has(key.toLowerCase())) {
            continue;
        }

        forwardedHeaders.set(key, value);
    }

    if (payload?.acceptType && !forwardedHeaders.has('Accept')) {
        forwardedHeaders.set('Accept', payload.acceptType);
    }

    if (payload?.contentType && !forwardedHeaders.has('Content-Type') && method !== 'GET' && method !== 'HEAD') {
        forwardedHeaders.set('Content-Type', payload.contentType);
    }

    if (payload?.contentType === 'multipart/form-data') {
        forwardedHeaders.delete('Content-Type');
        forwardedHeaders.delete('content-type');
    }

    const requestBody = buildRequestBody(method, payload?.contentType, payload?.body);

    const startTime = performance.now();

    try {
        const response = await fetch(targetUrl, {
            method,
            headers: forwardedHeaders,
            body: requestBody,
            redirect: redirectMode,
            cache: 'no-store',
            signal: AbortSignal.timeout(timeoutMs),
        });
        const durationMs = performance.now() - startTime;
        const parsedBody = await readResponseBody(response);

        return Response.json({
            body: parsedBody.body,
            durationMs,
            headers: Object.fromEntries(response.headers.entries()),
            responseBytes: parsedBody.bytes,
            ok: response.ok,
            status: response.status,
            statusText: response.statusText,
            truncated: parsedBody.truncated,
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : translate(language, 'api.requestFailed');

        return Response.json({ message }, { status: 400 });
    }
}
