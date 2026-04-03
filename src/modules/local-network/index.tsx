'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { CopyButton } from '@/components/CopyButton';
import { ModuleIntro } from '@/components/ModuleIntro';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';

const panelClassName = 'rounded-3xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const infoCardClassName =
    'rounded-2xl border border-neutral-j bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(236,245,239,0.96)_100%)] p-4';
const sourceLinkClassName =
    'inline-flex items-center rounded-full border border-primary-200 bg-primary-100/65 px-3 py-1.5 text-body-sm text-primary-700 transition hover:border-primary-300 hover:bg-primary-100';

type ProtocolFamily = 'ipv4' | 'ipv6';

type AddressRecord = {
    ip: string;
    family: ProtocolFamily;
    city: string | null;
    region: string | null;
    country: string | null;
    organization: string | null;
    timezone: string | null;
    sourceLabel: string;
};

type RouteRow = {
    key: string;
    badge: string;
    badgeClassName: string;
    title: string;
    description: string;
    ipv4: AddressRecord | null;
    ipv6: AddressRecord | null;
};

type LeakAddress = {
    address: string;
    family: ProtocolFamily;
    visibility: 'public' | 'private';
};

type LeakResult = {
    supported: boolean;
    addresses: LeakAddress[];
};

type DiagnosticsResult = {
    current: AddressRecord | null;
    ipv4: AddressRecord | null;
    ipv6: AddressRecord | null;
    routes: RouteRow[];
    updatedAt: string;
};

type GeoPayload = {
    ip?: unknown;
    city?: unknown;
    region?: unknown;
    country?: unknown;
    organization?: unknown;
    organization_name?: unknown;
    timezone?: unknown;
};

type IpifyPayload = {
    ip?: unknown;
};

function toText(value: unknown) {
    return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function detectFamily(ip: string): ProtocolFamily | null {
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
        return 'ipv4';
    }

    if (ip.includes(':')) {
        return 'ipv6';
    }

    return null;
}

function createAbortSignal(timeoutMs = 4000) {
    if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
        return AbortSignal.timeout(timeoutMs);
    }

    return undefined;
}

async function fetchJson<T>(url: string) {
    try {
        const response = await fetch(url, {
            cache: 'no-store',
            headers: {
                Accept: 'application/json',
            },
            signal: createAbortSignal(),
        });

        if (!response.ok) {
            return null;
        }

        return (await response.json()) as T;
    } catch {
        return null;
    }
}

function parseGeoRecord(payload: GeoPayload | null, sourceLabel: string) {
    const ip = toText(payload?.ip);

    if (!ip) {
        return null;
    }

    const family = detectFamily(ip);

    if (!family) {
        return null;
    }

    return {
        ip,
        family,
        city: toText(payload?.city),
        region: toText(payload?.region),
        country: toText(payload?.country),
        organization: toText(payload?.organization_name) ?? toText(payload?.organization),
        timezone: toText(payload?.timezone),
        sourceLabel,
    } satisfies AddressRecord;
}

async function lookupGeoRecord(ip: string, sourceLabel: string) {
    const payload = await fetchJson<GeoPayload>(`https://get.geojs.io/v1/ip/geo.json?ip=${encodeURIComponent(ip)}`);

    return parseGeoRecord(payload, sourceLabel);
}

function parseIpifyAddress(payload: IpifyPayload | null, fallbackFamily: ProtocolFamily) {
    const ip = toText(payload?.ip);

    if (!ip) {
        return null;
    }

    return {
        ip,
        family: detectFamily(ip) ?? fallbackFamily,
    };
}

function formatLocation(record: AddressRecord | null) {
    const parts = [record?.country, record?.region, record?.city].filter(Boolean);

    return parts.length ? parts.join(' / ') : '--';
}

function formatNetwork(record: AddressRecord | null) {
    const parts = [record?.organization, record?.timezone].filter(Boolean);

    return parts.length ? parts.join(' · ') : '--';
}

function isPrivateIpv4(address: string) {
    const [first = 0, second = 0] = address.split('.').map((part) => Number.parseInt(part, 10));

    return (
        first === 10 ||
        first === 127 ||
        first === 0 ||
        (first === 169 && second === 254) ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 168) ||
        (first === 100 && second >= 64 && second <= 127)
    );
}

function isPrivateIpv6(address: string) {
    const normalizedAddress = address.toLowerCase();

    return (
        normalizedAddress === '::1' ||
        normalizedAddress.startsWith('fc') ||
        normalizedAddress.startsWith('fd') ||
        normalizedAddress.startsWith('fe80') ||
        normalizedAddress.startsWith('::ffff:127.')
    );
}

function classifyLeakAddress(address: string) {
    const family = detectFamily(address);

    if (!family) {
        return null;
    }

    return {
        address,
        family,
        visibility:
            family === 'ipv4'
                ? isPrivateIpv4(address)
                    ? 'private'
                    : 'public'
                : isPrivateIpv6(address)
                  ? 'private'
                  : 'public',
    } satisfies LeakAddress;
}

function parseCandidateAddress(candidateLine: string) {
    const segments = candidateLine.trim().split(/\s+/);
    const address = segments[4];

    if (!address || address.endsWith('.local')) {
        return null;
    }

    return classifyLeakAddress(address);
}

async function collectIceLeaks() {
    if (typeof window === 'undefined' || typeof window.RTCPeerConnection === 'undefined') {
        return {
            ipv4: { supported: false, addresses: [] },
            ipv6: { supported: false, addresses: [] },
        };
    }

    const detectedAddresses = new Map<string, LeakAddress>();

    try {
        const connection = new window.RTCPeerConnection({
            iceServers: [],
        });

        connection.createDataChannel('local-network-probe');
        connection.onicecandidate = (event) => {
            const candidate = event.candidate?.candidate;

            if (!candidate) {
                return;
            }

            const parsedCandidate = parseCandidateAddress(candidate);

            if (parsedCandidate) {
                detectedAddresses.set(parsedCandidate.address, parsedCandidate);
            }
        };

        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);
        await new Promise((resolve) => {
            window.setTimeout(resolve, 1400);
        });
        connection.close();
    } catch {
        return {
            ipv4: { supported: false, addresses: [] },
            ipv6: { supported: false, addresses: [] },
        };
    }

    const allAddresses = [...detectedAddresses.values()];

    return {
        ipv4: {
            supported: true,
            addresses: allAddresses.filter((item) => item.family === 'ipv4'),
        },
        ipv6: {
            supported: true,
            addresses: allAddresses.filter((item) => item.family === 'ipv6'),
        },
    };
}

async function buildDiagnostics(t: (key: string, variables?: Record<string, string | number>) => string) {
    const [currentGeoPayload, geoIpv4Payload, geoIpv6Payload, ipifyIpv4Payload, ipifyIpv6Payload, ipifyDualPayload] =
        await Promise.all([
            fetchJson<GeoPayload>('https://get.geojs.io/v1/ip/geo.json'),
            fetchJson<GeoPayload>('https://ipv4.geojs.io/v1/ip/geo.json'),
            fetchJson<GeoPayload>('https://ipv6.geojs.io/v1/ip/geo.json'),
            fetchJson<IpifyPayload>('https://api.ipify.org?format=json'),
            fetchJson<IpifyPayload>('https://api6.ipify.org?format=json'),
            fetchJson<IpifyPayload>('https://api64.ipify.org?format=json'),
        ]);

    const geoCurrent = parseGeoRecord(currentGeoPayload, 'GeoJS');
    const geoIpv4 = parseGeoRecord(geoIpv4Payload, 'GeoJS');
    const geoIpv6 = parseGeoRecord(geoIpv6Payload, 'GeoJS');
    const ipifyIpv4Address = parseIpifyAddress(ipifyIpv4Payload, 'ipv4');
    const ipifyIpv6Address = parseIpifyAddress(ipifyIpv6Payload, 'ipv6');
    const ipifyDualAddress = parseIpifyAddress(ipifyDualPayload, 'ipv4') ?? parseIpifyAddress(ipifyDualPayload, 'ipv6');

    const pendingGeoLookups = new Map<string, Promise<AddressRecord | null>>();

    [ipifyIpv4Address?.ip, ipifyIpv6Address?.ip, ipifyDualAddress?.ip].forEach((ip) => {
        if (ip && !pendingGeoLookups.has(ip)) {
            pendingGeoLookups.set(ip, lookupGeoRecord(ip, 'ipify'));
        }
    });

    const geoLookupEntries = await Promise.all(
        [...pendingGeoLookups.entries()].map(async ([ip, promise]) => [ip, await promise] as const),
    );
    const geoLookupMap = new Map(geoLookupEntries);

    const ipifyIpv4 = ipifyIpv4Address ? (geoLookupMap.get(ipifyIpv4Address.ip) ?? null) : null;
    const ipifyIpv6 = ipifyIpv6Address ? (geoLookupMap.get(ipifyIpv6Address.ip) ?? null) : null;
    const ipifyDual = ipifyDualAddress ? (geoLookupMap.get(ipifyDualAddress.ip) ?? null) : null;
    const current = geoCurrent ?? ipifyDual;
    const routes: RouteRow[] = [
        {
            key: 'default',
            badge: 'DEF',
            badgeClassName: 'border-primary-200 bg-primary-100 text-primary-700',
            title: t('localNetwork.currentRoute'),
            description: t('localNetwork.currentRouteHint'),
            ipv4: current?.family === 'ipv4' ? current : null,
            ipv6: current?.family === 'ipv6' ? current : null,
        },
        {
            key: 'geojs',
            badge: 'GJ',
            badgeClassName: 'border-[rgba(34,197,94,0.22)] bg-[rgba(34,197,94,0.12)] text-primary-700',
            title: t('localNetwork.geoRoute'),
            description: t('localNetwork.geoRouteHint'),
            ipv4: geoIpv4,
            ipv6: geoIpv6,
        },
        {
            key: 'ipify',
            badge: 'IP',
            badgeClassName: 'border-[rgba(59,130,246,0.22)] bg-[rgba(59,130,246,0.12)] text-[rgb(29,78,216)]',
            title: t('localNetwork.ipifyRoute'),
            description: t('localNetwork.ipifyRouteHint'),
            ipv4: ipifyIpv4,
            ipv6: ipifyIpv6,
        },
        {
            key: 'ipify-dual',
            badge: 'DU',
            badgeClassName: 'border-[rgba(245,158,11,0.24)] bg-[rgba(245,158,11,0.12)] text-[rgb(180,83,9)]',
            title: t('localNetwork.ipifyCurrentRoute'),
            description: t('localNetwork.ipifyCurrentRouteHint'),
            ipv4: ipifyDual?.family === 'ipv4' ? ipifyDual : null,
            ipv6: ipifyDual?.family === 'ipv6' ? ipifyDual : null,
        },
    ];

    if (!current && !geoIpv4 && !geoIpv6 && !ipifyIpv4 && !ipifyIpv6) {
        throw new Error(t('localNetwork.fetchFailed'));
    }

    return {
        current,
        ipv4: geoIpv4 ?? ipifyIpv4,
        ipv6: geoIpv6 ?? ipifyIpv6,
        routes,
        updatedAt: new Date().toLocaleTimeString(),
    } satisfies DiagnosticsResult;
}

function buildVerdict(
    diagnostics: DiagnosticsResult | null,
    t: (key: string, variables?: Record<string, string | number>) => string,
) {
    if (!diagnostics) {
        return t('localNetwork.connectionUnknown');
    }

    if (diagnostics.ipv4 && diagnostics.ipv6) {
        if (diagnostics.current?.family === 'ipv6') {
            return t('localNetwork.preferIpv6');
        }

        if (diagnostics.current?.family === 'ipv4') {
            return t('localNetwork.preferIpv4');
        }

        return t('localNetwork.dualStack');
    }

    if (diagnostics.ipv6) {
        return t('localNetwork.ipv6Only');
    }

    if (diagnostics.ipv4) {
        return t('localNetwork.ipv4Only');
    }

    return t('localNetwork.connectionUnknown');
}

function renderAddressCell(
    t: (key: string, variables?: Record<string, string | number>) => string,
    family: ProtocolFamily,
    record: AddressRecord | null,
) {
    return (
        <div className="rounded-2xl border border-neutral-j bg-fill-b/70 p-4">
            <div className="flex items-center justify-between gap-3">
                <p className="text-body-sm text-text-c">{family === 'ipv4' ? 'IPv4' : 'IPv6'}</p>
                {record?.ip ? <CopyButton className="h-9 px-3 text-body-sm" text={record.ip} /> : null}
            </div>

            <p className={cn('mt-3 break-all text-title-md', record?.ip ? 'text-primary-600' : 'text-text-c')}>
                {record?.ip ?? t('localNetwork.unavailable')}
            </p>

            <div className="mt-4 space-y-2 text-body-pc-md text-text-d">
                <p>{`${t('localNetwork.location')}: ${formatLocation(record)}`}</p>
                <p>{`${t('localNetwork.routeNetwork')}: ${formatNetwork(record)}`}</p>
                <p>{`${t('localNetwork.routeSource')}: ${record?.sourceLabel ?? '--'}`}</p>
            </div>
        </div>
    );
}

function renderLeakPanel(
    title: string,
    leakResult: LeakResult,
    t: (key: string, variables?: Record<string, string | number>) => string,
) {
    const summaryLabel = !leakResult.supported
        ? t('localNetwork.browserUnsupported')
        : leakResult.addresses.length
          ? t('localNetwork.leakDetected', { count: leakResult.addresses.length })
          : t('localNetwork.leakNotDetected');
    const hasPublicAddress = leakResult.addresses.some((item) => item.visibility === 'public');

    return (
        <section className={panelClassName}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-title-lg text-text-e">{title}</p>
                    <p className="mt-1 text-body-pc-md text-text-d">{t('localNetwork.leakDescription')}</p>
                </div>
                {leakResult.addresses.length ? (
                    <CopyButton
                        className="h-10 px-3 text-body-sm"
                        text={leakResult.addresses.map((item) => item.address).join('\n')}
                    />
                ) : null}
            </div>

            <div className="mt-4 rounded-2xl border border-neutral-j bg-fill-b/70 p-4">
                <p className="text-title-md text-text-e">{summaryLabel}</p>
                <p className={cn('mt-2 text-body-pc-md', hasPublicAddress ? 'text-[rgb(220,38,38)]' : 'text-text-d')}>
                    {hasPublicAddress ? t('localNetwork.leakPublic') : t('localNetwork.leakPrivate')}
                </p>
                <p className="mt-2 text-body-sm leading-6 text-text-c">{t('localNetwork.leakNote')}</p>

                {leakResult.addresses.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {leakResult.addresses.map((item) => (
                            <span
                                key={`${title}-${item.address}`}
                                className={cn(
                                    'inline-flex items-center rounded-full border px-3 py-1.5 text-body-sm',
                                    item.visibility === 'public'
                                        ? 'border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.1)] text-[rgb(220,38,38)]'
                                        : 'border-primary-200 bg-primary-100 text-primary-700',
                                )}
                            >
                                {`${item.address} · ${item.visibility === 'public' ? t('localNetwork.publicAddress') : t('localNetwork.privateAddress')}`}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
}

export function LocalNetworkTool() {
    const { t } = useI18n();
    const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null);
    const [leaks, setLeaks] = useState<{ ipv4: LeakResult; ipv6: LeakResult }>({
        ipv4: { supported: true, addresses: [] },
        ipv6: { supported: true, addresses: [] },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const runDiagnostics = useCallback(async () => {
        setLoading(true);
        setError('');

        const [remoteResult, leakResult] = await Promise.all([buildDiagnostics(t), collectIceLeaks()]);

        setDiagnostics(remoteResult);
        setLeaks(leakResult);
        setLoading(false);
    }, [t]);

    useEffect(() => {
        void runDiagnostics().catch((nextError) => {
            setError(nextError instanceof Error ? nextError.message : t('localNetwork.fetchFailed'));
            setLoading(false);
        });
    }, [runDiagnostics, t]);

    const verdict = useMemo(() => buildVerdict(diagnostics, t), [diagnostics, t]);

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="LAN"
                title={t('localNetwork.introTitle')}
                description={t('localNetwork.introDescription')}
            />

            <section className={`${panelClassName} overflow-hidden p-0`}>
                <div className="flex flex-col gap-4 border-b border-neutral-j px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                        <p className="text-title-lg text-text-e">{t('localNetwork.networkTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('localNetwork.networkDescription')}</p>
                        {diagnostics?.updatedAt ? (
                            <p className="mt-2 text-body-sm text-text-c">{`${t('localNetwork.updatedAt')}: ${diagnostics.updatedAt}`}</p>
                        ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        <a
                            className={sourceLinkClassName}
                            href="https://www.geojs.io/"
                            rel="noreferrer"
                            target="_blank"
                        >
                            {t('localNetwork.sourceGeojs')}
                        </a>
                        <a
                            className={sourceLinkClassName}
                            href="https://www.ipify.org/"
                            rel="noreferrer"
                            target="_blank"
                        >
                            {t('localNetwork.sourceIpify')}
                        </a>
                        <a
                            className={sourceLinkClassName}
                            href="https://developer.mozilla.org/docs/Web/API/WebRTC_API"
                            rel="noreferrer"
                            target="_blank"
                        >
                            {t('localNetwork.sourceWebrtc')}
                        </a>
                        <Button
                            className="h-10 px-4"
                            loading={loading}
                            onClick={() => {
                                void runDiagnostics().catch((nextError) => {
                                    setError(
                                        nextError instanceof Error ? nextError.message : t('localNetwork.fetchFailed'),
                                    );
                                    setLoading(false);
                                });
                            }}
                        >
                            <span className="text-body-sm">
                                {loading ? t('localNetwork.refreshing') : t('localNetwork.refresh')}
                            </span>
                        </Button>
                    </div>
                </div>

                {error ? (
                    <p className="border-b border-neutral-j bg-[rgba(235,51,51,0.06)] px-4 py-3 text-body-pc-md text-error">
                        {error}
                    </p>
                ) : null}

                <div className="grid gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.15fr)]">
                    <div className={infoCardClassName}>
                        <p className="text-body-sm text-text-c">{t('localNetwork.localIpv4')}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <p
                                className={cn(
                                    'break-all text-title-lg',
                                    diagnostics?.ipv4 ? 'text-primary-600' : 'text-text-c',
                                )}
                            >
                                {diagnostics?.ipv4?.ip ?? t('localNetwork.unavailable')}
                            </p>
                            {diagnostics?.ipv4?.ip ? (
                                <CopyButton className="h-9 px-3 text-body-sm" text={diagnostics.ipv4.ip} />
                            ) : null}
                        </div>
                        <div className="mt-4 space-y-2 text-body-pc-md text-text-d">
                            <p>{`${t('localNetwork.location')}: ${formatLocation(diagnostics?.ipv4 ?? null)}`}</p>
                            <p>{`${t('localNetwork.routeNetwork')}: ${formatNetwork(diagnostics?.ipv4 ?? null)}`}</p>
                        </div>
                    </div>

                    <div className={infoCardClassName}>
                        <p className="text-body-sm text-text-c">{t('localNetwork.localIpv6')}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                            <p
                                className={cn(
                                    'break-all text-title-lg',
                                    diagnostics?.ipv6 ? 'text-primary-600' : 'text-text-c',
                                )}
                            >
                                {diagnostics?.ipv6?.ip ?? t('localNetwork.unavailable')}
                            </p>
                            {diagnostics?.ipv6?.ip ? (
                                <CopyButton className="h-9 px-3 text-body-sm" text={diagnostics.ipv6.ip} />
                            ) : null}
                        </div>
                        <div className="mt-4 space-y-2 text-body-pc-md text-text-d">
                            <p>{`${t('localNetwork.location')}: ${formatLocation(diagnostics?.ipv6 ?? null)}`}</p>
                            <p>{`${t('localNetwork.routeNetwork')}: ${formatNetwork(diagnostics?.ipv6 ?? null)}`}</p>
                        </div>
                    </div>

                    <div className={infoCardClassName}>
                        <p className="text-body-sm text-text-c">{t('localNetwork.connection')}</p>
                        <div className="mt-3 rounded-2xl border border-primary-200 bg-primary-100/65 px-4 py-3">
                            <p className="text-title-md text-primary-700">{verdict}</p>
                        </div>
                        <div className="mt-4 space-y-2 text-body-pc-md text-text-d">
                            <p>{`${t('localNetwork.location')}: ${formatLocation(diagnostics?.current ?? null)}`}</p>
                            <p>{`${t('localNetwork.routeNetwork')}: ${formatNetwork(diagnostics?.current ?? null)}`}</p>
                            <p>{`${t('localNetwork.routeSource')}: ${diagnostics?.current?.sourceLabel ?? '--'}`}</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className={`${panelClassName} overflow-hidden p-0`}>
                <div className="border-b border-neutral-j px-4 py-4">
                    <p className="text-title-lg text-text-e">{t('localNetwork.routeTitle')}</p>
                    <p className="mt-1 text-body-pc-md text-text-d">{t('localNetwork.routeDescription')}</p>
                </div>

                <div className="divide-y divide-neutral-j/70">
                    {diagnostics?.routes.length ? (
                        diagnostics.routes.map((row) => (
                            <div
                                key={row.key}
                                className="grid gap-4 px-4 py-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1fr)_minmax(0,1fr)]"
                            >
                                <div className="min-w-0">
                                    <div className="flex items-center gap-3">
                                        <span
                                            className={cn(
                                                'inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-title-sm',
                                                row.badgeClassName,
                                            )}
                                            style={{ fontFamily: 'var(--font-rajdhani)' }}
                                        >
                                            {row.badge}
                                        </span>
                                        <div className="min-w-0">
                                            <p className="text-title-md text-text-e">{row.title}</p>
                                            <p className="mt-1 text-body-pc-md text-text-d">{row.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {renderAddressCell(t, 'ipv4', row.ipv4)}
                                {renderAddressCell(t, 'ipv6', row.ipv6)}
                            </div>
                        ))
                    ) : (
                        <div className="px-4 py-5 text-body-pc-md text-text-c">{t('localNetwork.waiting')}</div>
                    )}
                </div>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                {renderLeakPanel(t('localNetwork.ipv4LeakTitle'), leaks.ipv4, t)}
                {renderLeakPanel(t('localNetwork.ipv6LeakTitle'), leaks.ipv6, t)}
            </section>
        </section>
    );
}
