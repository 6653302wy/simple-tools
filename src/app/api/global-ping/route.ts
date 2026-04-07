import net from 'node:net';
import { performance } from 'node:perf_hooks';
import type { NextRequest } from 'next/server';
import {
    type CountryKey,
    isCountryKey,
    networkCountries,
    networkCountryCodeMap,
    networkCountryMap,
} from '@/modules/network-speed/countries';
import { isLanguage } from '@/services/i18n/constant';
import { translate } from '@/services/i18n/messages';

export const dynamic = 'force-dynamic';

const GLOBALPING_BASE_URL = 'https://api.globalping.io/v1';
const GLOBALPING_REQUEST_TIMEOUT_MS = 12000;
const GLOBALPING_POLL_INTERVAL_MS = 1400;
const GLOBALPING_POLL_TIMEOUT_MS = 16000;
const DEFAULT_PACKET_COUNT = 3;

type GlobalpingLocation = {
    city?: string;
    country?: string;
    magic?: string;
    limit: number;
};

type GlobalpingMeasurementResponse = {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    target: string;
    probesCount: number;
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
    };
    result?: {
        status?: string | null;
        resolvedAddress?: string | null;
        timings?: Array<{
            ttl?: number;
            rtt?: number;
        }> | null;
        stats?: {
            min?: number;
            max?: number;
            avg?: number;
            loss?: number;
        } | null;
    };
};

type ProbeEntry = {
    id: string;
    countryKey: CountryKey | 'other';
    countryCode: string;
    city: string;
    state: string | null;
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

type CountrySummary = {
    key: CountryKey;
    count: number;
    pending: number;
    packetLossAlerts: number;
    avgMs: number | null;
    fastestLabel: string;
    slowestLabel: string;
};

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

function parseRequestedCountries(value: unknown) {
    if (!Array.isArray(value)) {
        return networkCountries.map((country) => country.key);
    }

    const requested = value.filter((item): item is CountryKey => typeof item === 'string' && isCountryKey(item));

    return requested.length ? requested : networkCountries.map((country) => country.key);
}

function buildLocations(requestedCountries: CountryKey[], focusCountry: CountryKey | null) {
    const countries = focusCountry ? [focusCountry] : requestedCountries;

    return countries.flatMap((countryKey) => {
        const country = networkCountryMap[countryKey];
        const locations = focusCountry === countryKey ? country.drillLocations : country.overviewLocations;

        return locations.map((location) => ({
            city: location.city,
            country: location.country,
            limit: location.limit ?? 1,
        })) satisfies GlobalpingLocation[];
    });
}

function resolveCountryKey(countryCode: string | null | undefined) {
    if (!countryCode) {
        return 'other' as const;
    }

    return networkCountryCodeMap[countryCode] ?? ('other' as const);
}

function resolveLocationLabel(probe: GlobalpingProbeResult['probe']) {
    const parts = [probe?.city?.trim(), probe?.state?.trim(), probe?.country?.trim(), probe?.network?.trim()].filter(
        Boolean,
    );

    return parts.join(' · ');
}

function normalizeProbeResult(item: GlobalpingProbeResult, index: number): ProbeEntry {
    const probe = item.probe;
    const result = item.result;
    const stats = result?.stats;
    const countryCode = probe?.country ?? '';

    return {
        id: `${countryCode || 'unknown'}-${probe?.city ?? 'probe'}-${index}`,
        countryKey: resolveCountryKey(countryCode),
        countryCode,
        city: probe?.city ?? 'Unknown',
        state: probe?.state ?? null,
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

function buildCountrySummaries(probes: ProbeEntry[]) {
    return networkCountries
        .map((country) => {
            const items = probes.filter((probe) => probe.countryKey === country.key);
            const completedItems = items.filter((item) => item.avgMs !== null && item.status === 'finished');
            const sortedCompletedItems = [...completedItems].sort((previousItem, nextItem) => {
                return (previousItem.avgMs ?? Number.POSITIVE_INFINITY) - (nextItem.avgMs ?? Number.POSITIVE_INFINITY);
            });
            const averageValues = completedItems
                .map((item) => item.avgMs)
                .filter((value): value is number => value !== null && Number.isFinite(value));

            return {
                key: country.key,
                count: items.length,
                pending: items.filter((item) => item.status !== 'finished').length,
                packetLossAlerts: items.filter((item) => item.packetLoss > 0).length,
                avgMs: averageValues.length
                    ? averageValues.reduce((total, currentValue) => total + currentValue, 0) / averageValues.length
                    : null,
                fastestLabel: sortedCompletedItems[0]?.locationLabel ?? '--',
                slowestLabel: sortedCompletedItems.at(-1)?.locationLabel ?? '--',
            } satisfies CountrySummary;
        })
        .filter((summary) => summary.count > 0)
        .sort((previousRow, nextRow) => {
            return (previousRow.avgMs ?? Number.POSITIVE_INFINITY) - (nextRow.avgMs ?? Number.POSITIVE_INFINITY);
        });
}

async function createMeasurement(target: string, requestedCountries: CountryKey[], focusCountry: CountryKey | null) {
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
            locations: buildLocations(requestedCountries, focusCountry),
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
    requestedCountries: CountryKey[],
    focusCountry: CountryKey | null,
) {
    const requestedCount = buildLocations(requestedCountries, focusCountry).reduce(
        (total, location) => total + location.limit,
        0,
    );
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
        focusCountry,
        requestedCountries,
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
        countries: buildCountrySummaries(probes),
        ipDistribution,
        probes,
    };
}

export async function POST(request: NextRequest) {
    const payload = (await request.json().catch(() => null)) as {
        language?: string;
        target?: string;
        countries?: CountryKey[];
        focusCountry?: CountryKey | null;
    } | null;
    const language = isLanguage(payload?.language) ? payload.language : 'zh';
    const input = payload?.target?.trim() ?? '';
    const normalizedTarget = normalizeTarget(input);
    const requestedCountries = parseRequestedCountries(payload?.countries);
    const focusCountry = isCountryKey(payload?.focusCountry ?? null) ? (payload?.focusCountry ?? null) : null;

    if (!normalizedTarget) {
        return Response.json({ message: translate(language, 'api.globalPingMissingTarget') }, { status: 400 });
    }

    if (!requestedCountries.length && !focusCountry) {
        return Response.json({ message: translate(language, 'api.globalPingMissingCarrier') }, { status: 400 });
    }

    try {
        const createdMeasurement = await createMeasurement(normalizedTarget, requestedCountries, focusCountry);
        const measurement = await waitForMeasurement(createdMeasurement.id);

        if (!measurement) {
            throw new Error(translate(language, 'api.globalPingTimeout'));
        }

        return Response.json(
            buildResponsePayload(input, normalizedTarget, measurement, requestedCountries, focusCountry),
        );
    } catch (error) {
        const message =
            error instanceof Error && error.message ? error.message : translate(language, 'api.globalPingFailed');

        return Response.json({ message }, { status: 400 });
    }
}
