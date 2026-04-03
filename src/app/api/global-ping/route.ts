import net from 'node:net';
import { performance } from 'node:perf_hooks';
import type { NextRequest } from 'next/server';
import { isLanguage } from '@/services/i18n/constant';
import { translate } from '@/services/i18n/messages';

export const dynamic = 'force-dynamic';

const GLOBALPING_BASE_URL = 'https://api.globalping.io/v1';
const GLOBALPING_REQUEST_TIMEOUT_MS = 12000;
const GLOBALPING_POLL_INTERVAL_MS = 1400;
const GLOBALPING_POLL_TIMEOUT_MS = 16000;
const DEFAULT_PACKET_COUNT = 3;

type RequestedCarrierKey = 'telecom' | 'unicom' | 'mobile' | 'edge';
type CarrierKey = RequestedCarrierKey | 'other';
type ZoneKey = 'china' | 'edge';
type RegionKey =
    | 'north'
    | 'east'
    | 'south'
    | 'central'
    | 'southwest'
    | 'northwest'
    | 'northeast'
    | 'hkmo_tw'
    | 'overseas';

type GlobalpingLocation = {
    magic: string;
    limit: number;
};

type GlobalpingMeasurementResponse = {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    target: string;
    probesCount: number;
    locations: Array<GlobalpingLocation>;
    results: GlobalpingProbeResult[];
};

type GlobalpingProbeResult = {
    probe?: {
        continent?: string | null;
        region?: string | null;
        country?: string | null;
        city?: string | null;
        state?: string | null;
        asn?: number | null;
        longitude?: number | null;
        latitude?: number | null;
        network?: string | null;
        resolvers?: string[] | null;
    };
    result?: {
        status?: string | null;
        rawOutput?: string | null;
        resolvedAddress?: string | null;
        resolvedHostname?: string | null;
        timings?: Array<{
            ttl?: number;
            rtt?: number;
        }> | null;
        stats?: {
            min?: number;
            max?: number;
            avg?: number;
            total?: number;
            loss?: number;
            rcv?: number;
            drop?: number;
        } | null;
    };
};

type ProbeEntry = {
    id: string;
    zone: ZoneKey;
    carrierKey: CarrierKey;
    carrierLabel: string;
    regionKey: RegionKey;
    countryCode: string;
    city: string;
    locationLabel: string;
    network: string;
    asn: number | null;
    latitude: number | null;
    longitude: number | null;
    resolvedAddress: string | null;
    packetLoss: number;
    avgMs: number | null;
    minMs: number | null;
    maxMs: number | null;
    status: string;
    timingsCount: number;
};

type AggregateEntry = {
    key: string;
    zone: ZoneKey;
    count: number;
    pending: number;
    packetLossAlerts: number;
    avgMs: number | null;
    fastestLabel: string;
    slowestLabel: string;
};

const carrierLocations: Record<RequestedCarrierKey, GlobalpingLocation[]> = {
    telecom: [{ magic: 'North America', limit: 3 }],
    unicom: [{ magic: 'Europe', limit: 3 }],
    mobile: [{ magic: 'Asia', limit: 3 }],
    edge: [
        { magic: 'Oceania', limit: 2 },
        { magic: 'South America', limit: 1 },
        { magic: 'Africa', limit: 1 },
    ],
};
const northAmericaCountryCodes = new Set(['US', 'CA', 'MX']);
const middleEastCountryCodes = new Set(['AE', 'SA', 'QA', 'KW', 'OM', 'BH', 'IL', 'JO', 'LB', 'IQ']);

function normalizeContinent(continent: string | null | undefined) {
    return continent?.trim().toUpperCase() ?? '';
}

function isNorthAmericaContinent(continent: string) {
    return continent === 'NA' || continent === 'NORTH AMERICA';
}

function isEuropeContinent(continent: string) {
    return continent === 'EU' || continent === 'EUROPE';
}

function isAsiaContinent(continent: string) {
    return continent === 'AS' || continent === 'ASIA';
}

function isOceaniaContinent(continent: string) {
    return continent === 'OC' || continent === 'OCEANIA';
}

function isSouthAmericaContinent(continent: string) {
    return continent === 'SA' || continent === 'SOUTH AMERICA';
}

function isAfricaContinent(continent: string) {
    return continent === 'AF' || continent === 'AFRICA';
}

function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTarget(target: string) {
    const trimmedTarget = target.trim();

    if (!trimmedTarget) {
        return null;
    }

    if (net.isIP(trimmedTarget)) {
        return trimmedTarget;
    }

    const candidateInputs = /^https?:\/\//i.test(trimmedTarget) ? [trimmedTarget] : [`https://${trimmedTarget}`];

    for (const candidateInput of candidateInputs) {
        try {
            const url = new URL(candidateInput);

            if (net.isIP(url.hostname)) {
                return url.hostname;
            }

            if (url.hostname) {
                return url.hostname;
            }
        } catch {
            // Ignore invalid candidate and continue.
        }
    }

    return /^[a-z0-9.-]+$/i.test(trimmedTarget) ? trimmedTarget : null;
}

function buildLocations(requestedCarriers: RequestedCarrierKey[]) {
    return requestedCarriers.flatMap((carrierKey) => carrierLocations[carrierKey]);
}

function parseRequestedCarriers(value: unknown) {
    if (!Array.isArray(value)) {
        return ['telecom', 'unicom', 'mobile', 'edge'] satisfies RequestedCarrierKey[];
    }

    const allowed = new Set<RequestedCarrierKey>(['telecom', 'unicom', 'mobile', 'edge']);
    const requested = value.filter((item): item is RequestedCarrierKey => {
        return typeof item === 'string' && allowed.has(item as RequestedCarrierKey);
    });

    return requested.length ? requested : (['telecom', 'unicom', 'mobile', 'edge'] satisfies RequestedCarrierKey[]);
}

function resolveCarrier(probe: GlobalpingProbeResult['probe']) {
    const countryCode = probe?.country ?? '';
    const continent = normalizeContinent(probe?.continent);

    if (isNorthAmericaContinent(continent) || northAmericaCountryCodes.has(countryCode)) {
        return {
            zone: 'china' as const,
            carrierKey: 'telecom' as const,
            carrierLabel: 'North America',
        };
    }

    if (isEuropeContinent(continent)) {
        return {
            zone: 'china' as const,
            carrierKey: 'unicom' as const,
            carrierLabel: 'Europe',
        };
    }

    if (isAsiaContinent(continent) && !middleEastCountryCodes.has(countryCode)) {
        return {
            zone: 'china' as const,
            carrierKey: 'mobile' as const,
            carrierLabel: 'Asia Pacific',
        };
    }

    return {
        zone: 'edge' as const,
        carrierKey: 'edge' as const,
        carrierLabel: 'Extended Regions',
    };
}

function resolveRegion(probe: GlobalpingProbeResult['probe']) {
    const countryCode = probe?.country ?? '';
    const continent = normalizeContinent(probe?.continent);

    if (isNorthAmericaContinent(continent) || northAmericaCountryCodes.has(countryCode)) {
        return 'north' satisfies RegionKey;
    }

    if (isEuropeContinent(continent)) {
        return 'east' satisfies RegionKey;
    }

    if (middleEastCountryCodes.has(countryCode)) {
        return 'northeast' satisfies RegionKey;
    }

    if (isAsiaContinent(continent)) {
        return 'south' satisfies RegionKey;
    }

    if (isOceaniaContinent(continent)) {
        return 'central' satisfies RegionKey;
    }

    if (isSouthAmericaContinent(continent)) {
        return 'southwest' satisfies RegionKey;
    }

    if (isAfricaContinent(continent)) {
        return 'northwest' satisfies RegionKey;
    }

    if (countryCode === 'SG' || countryCode === 'HK' || countryCode === 'JP') {
        return 'hkmo_tw' satisfies RegionKey;
    }

    return 'overseas';
}

function resolveLocationLabel(probe: GlobalpingProbeResult['probe']) {
    const city = probe?.city?.trim();
    const countryCode = probe?.country?.trim();
    const network = probe?.network?.trim();
    const parts = [city, countryCode, network].filter(Boolean);

    return parts.join(' · ');
}

function normalizeProbeResult(item: GlobalpingProbeResult, index: number): ProbeEntry {
    const probe = item.probe;
    const result = item.result;
    const carrier = resolveCarrier(probe);
    const stats = result?.stats;

    return {
        id: `${probe?.country ?? 'unknown'}-${probe?.city ?? 'probe'}-${index}`,
        zone: carrier.zone,
        carrierKey: carrier.carrierKey,
        carrierLabel: carrier.carrierLabel,
        regionKey: resolveRegion(probe),
        countryCode: probe?.country ?? '',
        city: probe?.city ?? 'Unknown',
        locationLabel: resolveLocationLabel(probe),
        network: probe?.network ?? '',
        asn: probe?.asn ?? null,
        latitude: probe?.latitude ?? null,
        longitude: probe?.longitude ?? null,
        resolvedAddress: result?.resolvedAddress ?? null,
        packetLoss: typeof stats?.loss === 'number' ? stats.loss : 0,
        avgMs: typeof stats?.avg === 'number' ? stats.avg : null,
        minMs: typeof stats?.min === 'number' ? stats.min : null,
        maxMs: typeof stats?.max === 'number' ? stats.max : null,
        status: result?.status ?? 'unknown',
        timingsCount: result?.timings?.length ?? 0,
    };
}

function buildAggregateEntries(entries: ProbeEntry[], zone: ZoneKey, groupBy: 'carrierKey' | 'regionKey') {
    const aggregateMap = new Map<string, ProbeEntry[]>();

    for (const entry of entries) {
        if (entry.zone !== zone) {
            continue;
        }

        const key = entry[groupBy];
        const currentEntries = aggregateMap.get(key) ?? [];
        currentEntries.push(entry);
        aggregateMap.set(key, currentEntries);
    }

    return Array.from(aggregateMap.entries())
        .map(([key, items]) => {
            const completedItems = items.filter((item) => item.avgMs !== null && item.status === 'finished');
            const sortedCompletedItems = [...completedItems].sort((previousItem, nextItem) => {
                return (previousItem.avgMs ?? Number.POSITIVE_INFINITY) - (nextItem.avgMs ?? Number.POSITIVE_INFINITY);
            });
            const averageValues = completedItems
                .map((item) => item.avgMs)
                .filter((value): value is number => value !== null && Number.isFinite(value));

            return {
                key,
                zone,
                count: items.length,
                pending: items.filter((item) => item.status !== 'finished').length,
                packetLossAlerts: items.filter((item) => item.packetLoss > 0).length,
                avgMs: averageValues.length
                    ? averageValues.reduce((total, currentValue) => total + currentValue, 0) / averageValues.length
                    : null,
                fastestLabel: sortedCompletedItems[0]?.locationLabel ?? '--',
                slowestLabel: sortedCompletedItems.at(-1)?.locationLabel ?? '--',
            } satisfies AggregateEntry;
        })
        .sort((previousRow, nextRow) => {
            return (previousRow.avgMs ?? Number.POSITIVE_INFINITY) - (nextRow.avgMs ?? Number.POSITIVE_INFINITY);
        });
}

async function createMeasurement(target: string, requestedCarriers: RequestedCarrierKey[]) {
    const response = await fetch(`${GLOBALPING_BASE_URL}/measurements`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(GLOBALPING_REQUEST_TIMEOUT_MS),
        body: JSON.stringify({
            target,
            type: 'ping',
            locations: buildLocations(requestedCarriers),
            measurementOptions: {
                packets: DEFAULT_PACKET_COUNT,
            },
        }),
    });

    if (!response.ok) {
        throw new Error(`Globalping create failed with status ${response.status}`);
    }

    return (await response.json()) as Pick<GlobalpingMeasurementResponse, 'id' | 'probesCount'>;
}

async function fetchMeasurement(measurementId: string) {
    const response = await fetch(`${GLOBALPING_BASE_URL}/measurements/${measurementId}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(GLOBALPING_REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
        throw new Error(`Globalping fetch failed with status ${response.status}`);
    }

    return (await response.json()) as GlobalpingMeasurementResponse;
}

async function waitForMeasurement(measurementId: string) {
    const startedAt = performance.now();
    let latestMeasurement: GlobalpingMeasurementResponse | null = null;

    while (performance.now() - startedAt < GLOBALPING_POLL_TIMEOUT_MS) {
        latestMeasurement = await fetchMeasurement(measurementId);

        if (latestMeasurement.status === 'finished' || latestMeasurement.status === 'failed') {
            return latestMeasurement;
        }

        await sleep(GLOBALPING_POLL_INTERVAL_MS);
    }

    return latestMeasurement;
}

function buildResponsePayload(
    input: string,
    normalizedTarget: string,
    measurement: GlobalpingMeasurementResponse,
    requestedCarriers: RequestedCarrierKey[],
) {
    const requestedCount = buildLocations(requestedCarriers).reduce((total, location) => total + location.limit, 0);
    const probes = measurement.results.map((item, index) => normalizeProbeResult(item, index));
    const completedCount = probes.filter((probe) => probe.status === 'finished').length;
    const progressPercent =
        measurement.status === 'finished' ? 100 : Math.min(99, Math.round((completedCount / requestedCount) * 100));
    const ips = new Map<string, number>();

    for (const probe of probes) {
        if (!probe.resolvedAddress) {
            continue;
        }

        ips.set(probe.resolvedAddress, (ips.get(probe.resolvedAddress) ?? 0) + 1);
    }

    const ipDistribution = Array.from(ips.entries())
        .map(([address, count]) => ({
            address,
            count,
            percentage: completedCount ? (count / completedCount) * 100 : 0,
        }))
        .sort((previousItem, nextItem) => nextItem.count - previousItem.count);

    const chinaCarrierRows = buildAggregateEntries(probes, 'china', 'carrierKey').filter(
        (entry) => entry.key !== 'other',
    );
    const chinaRegionRows = buildAggregateEntries(probes, 'china', 'regionKey');
    const edgeRegionRows = buildAggregateEntries(probes, 'edge', 'regionKey');
    const averageValues = probes
        .map((probe) => probe.avgMs)
        .filter((value): value is number => value !== null && Number.isFinite(value));

    return {
        input,
        normalizedTarget,
        measurementId: measurement.id,
        measurementStatus: measurement.status,
        createdAt: measurement.createdAt,
        updatedAt: measurement.updatedAt,
        shareUrl: `https://globalping.io/?measurement=${measurement.id}`,
        source: {
            name: 'Globalping',
            website: 'https://globalping.io',
            repository: 'https://github.com/jsdelivr/globalping',
        },
        totals: {
            requested: requestedCount,
            received: probes.length,
            completed: completedCount,
            pending: probes.filter((probe) => probe.status !== 'finished').length,
            packetLossAlerts: probes.filter((probe) => probe.packetLoss > 0).length,
            progressPercent,
            avgMs: averageValues.length
                ? averageValues.reduce((total, currentValue) => total + currentValue, 0) / averageValues.length
                : null,
        },
        summary: {
            chinaCarriers: chinaCarrierRows,
            chinaRegions: chinaRegionRows,
            edgeRegions: edgeRegionRows,
        },
        ipDistribution,
        probes,
    };
}

export async function POST(request: NextRequest) {
    const payload = (await request.json().catch(() => null)) as {
        language?: string;
        target?: string;
        carriers?: RequestedCarrierKey[];
    } | null;
    const language = isLanguage(payload?.language) ? payload.language : 'zh';
    const input = payload?.target?.trim() ?? '';
    const normalizedTarget = normalizeTarget(input);
    const requestedCarriers = parseRequestedCarriers(payload?.carriers);

    if (!normalizedTarget) {
        return Response.json({ message: translate(language, 'api.globalPingMissingTarget') }, { status: 400 });
    }

    if (!requestedCarriers.length) {
        return Response.json({ message: translate(language, 'api.globalPingMissingCarrier') }, { status: 400 });
    }

    try {
        const createdMeasurement = await createMeasurement(normalizedTarget, requestedCarriers);
        const measurement = await waitForMeasurement(createdMeasurement.id);

        if (!measurement) {
            throw new Error(translate(language, 'api.globalPingTimeout'));
        }

        return Response.json(buildResponsePayload(input, normalizedTarget, measurement, requestedCarriers));
    } catch (error) {
        const message =
            error instanceof Error && error.message ? error.message : translate(language, 'api.globalPingFailed');

        return Response.json({ message }, { status: 400 });
    }
}
