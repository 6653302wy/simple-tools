import type {
    AddressRecord,
    DiagnosticsResult,
    GeoPayload,
    IpifyPayload,
    LeakAddress,
    ProtocolFamily,
    RouteRow,
} from './types';

export const panelClassName = 'rounded-3xl border border-neutral-j bg-fill-a shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
export const infoCardClassName =
    'rounded-2xl border border-neutral-j bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(236,245,239,0.96)_100%)] p-4';
export const sourceLinkClassName =
    'inline-flex items-center rounded-full border border-primary-200 bg-primary-100/65 px-3 py-1.5 text-body-sm text-primary-700 transition hover:border-primary-300 hover:bg-primary-100';

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

export function formatLocation(record: AddressRecord | null) {
    const parts = [record?.country, record?.region, record?.city].filter(Boolean);

    return parts.length ? parts.join(' / ') : '--';
}

export function formatNetwork(record: AddressRecord | null) {
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

export async function collectIceLeaks() {
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

export async function buildDiagnostics(t: (key: string, variables?: Record<string, string | number>) => string) {
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

export function buildVerdict(
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
