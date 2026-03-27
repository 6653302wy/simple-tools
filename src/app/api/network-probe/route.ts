import dns from 'node:dns/promises';
import net from 'node:net';
import { performance } from 'node:perf_hooks';
import type { NextRequest } from 'next/server';
import { isLanguage, type Language } from '@/services/i18n/constant';
import { translate } from '@/services/i18n/messages';

export const dynamic = 'force-dynamic';

const REQUEST_TIMEOUT_MS = 8000;
const MAX_SAMPLE_BYTES = 256 * 1024;

type ProbeResult = {
    input: string;
    normalizedUrl: string;
    hostname: string;
    protocol: string;
    resolvedAddress: string | null;
    method: 'HEAD' | 'GET';
    status: number;
    ok: boolean;
    dnsMs: number | null;
    headerMs: number;
    totalMs: number;
    sampleBytes: number;
    sampleMbps: number | null;
};

function normalizeCandidates(target: string) {
    const trimmedTarget = target.trim();

    if (!trimmedTarget) {
        return [];
    }

    if (/^https?:\/\//i.test(trimmedTarget)) {
        try {
            return [new URL(trimmedTarget)];
        } catch {
            return [];
        }
    }

    const candidates: URL[] = [];

    for (const protocol of ['https:', 'http:']) {
        try {
            candidates.push(new URL(`${protocol}//${trimmedTarget}`));
        } catch {
            // Ignore invalid candidate and try the next protocol.
        }
    }

    return candidates;
}

async function resolveHostname(hostname: string) {
    if (net.isIP(hostname)) {
        return { address: hostname, dnsMs: 0 };
    }

    const dnsStart = performance.now();
    const resolved = await dns.lookup(hostname);
    const dnsMs = performance.now() - dnsStart;

    return {
        address: resolved.address,
        dnsMs,
    };
}

async function readBodySample(response: Response) {
    if (!response.body) {
        return 0;
    }

    const reader = response.body.getReader();
    let totalBytes = 0;

    try {
        while (totalBytes < MAX_SAMPLE_BYTES) {
            const { done, value } = await reader.read();

            if (done) {
                break;
            }

            totalBytes += value.byteLength;

            if (totalBytes >= MAX_SAMPLE_BYTES) {
                await reader.cancel();
                break;
            }
        }
    } finally {
        reader.releaseLock();
    }

    return totalBytes;
}

async function measureRequest(url: URL, method: 'HEAD' | 'GET', resolvedAddress: string | null, dnsMs: number | null) {
    const start = performance.now();
    const response = await fetch(url, {
        method,
        redirect: 'follow',
        cache: 'no-store',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    const headerMs = performance.now() - start;
    const sampleBytes = method === 'GET' ? await readBodySample(response) : 0;
    const totalMs = performance.now() - start;

    return {
        input: url.href,
        normalizedUrl: response.url || url.href,
        hostname: url.hostname,
        protocol: url.protocol.replace(':', ''),
        resolvedAddress,
        method,
        status: response.status,
        ok: response.ok,
        dnsMs,
        headerMs,
        totalMs,
        sampleBytes,
        sampleMbps: sampleBytes > 0 && totalMs > 0 ? (sampleBytes * 8) / (totalMs / 1000) / 1000 / 1000 : null,
    } satisfies ProbeResult;
}

async function probeTarget(target: string, language: Language) {
    const candidates = normalizeCandidates(target);

    if (!candidates.length) {
        throw new Error(translate(language, 'api.invalidProbeTarget'));
    }

    let lastError: Error | null = null;

    for (const candidate of candidates) {
        try {
            const resolved = await resolveHostname(candidate.hostname);

            const headResult = await measureRequest(candidate, 'HEAD', resolved.address, resolved.dnsMs);

            if (headResult.status !== 405 && headResult.status !== 501) {
                return headResult;
            }

            return await measureRequest(candidate, 'GET', resolved.address, resolved.dnsMs);
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(translate(language, 'api.probeFailed'));
        }
    }

    throw lastError ?? new Error(translate(language, 'api.probeFailed'));
}

export async function POST(request: NextRequest) {
    const payload = (await request.json().catch(() => null)) as { language?: string; target?: string } | null;
    const target = payload?.target?.trim();
    const language = isLanguage(payload?.language) ? payload.language : 'zh';

    if (!target) {
        return Response.json({ message: translate(language, 'api.probeMissingTarget') }, { status: 400 });
    }

    try {
        const result = await probeTarget(target, language);

        return Response.json(result);
    } catch (error) {
        const message = error instanceof Error ? error.message : translate(language, 'api.probeFailed');

        return Response.json({ message }, { status: 400 });
    }
}
