import type { CountryKey } from './countries';

export type CountrySummary = {
    key: CountryKey;
    count: number;
    pending: number;
    packetLossAlerts: number;
    avgMs: number | null;
    fastestLabel: string;
    slowestLabel: string;
};

export type ProbeEntry = {
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

export type GlobalPingResponse = {
    input: string;
    normalizedTarget: string;
    measurementId: string;
    measurementStatus: string;
    createdAt: string;
    updatedAt: string;
    focusCountry: CountryKey | null;
    requestedCountries: CountryKey[];
    shareUrl: string;
    source: {
        name: string;
        website: string;
        repository: string;
    };
    totals: {
        requested: number;
        received: number;
        completed: number;
        pending: number;
        packetLossAlerts: number;
        progressPercent: number;
        avgMs: number | null;
    };
    countries: CountrySummary[];
    ipDistribution: Array<{
        address: string;
        count: number;
        percentage: number;
    }>;
    probes: ProbeEntry[];
};
