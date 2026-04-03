export type ProtocolFamily = 'ipv4' | 'ipv6';

export type AddressRecord = {
    ip: string;
    family: ProtocolFamily;
    city: string | null;
    region: string | null;
    country: string | null;
    organization: string | null;
    timezone: string | null;
    sourceLabel: string;
};

export type RouteRow = {
    key: string;
    badge: string;
    badgeClassName: string;
    title: string;
    description: string;
    ipv4: AddressRecord | null;
    ipv6: AddressRecord | null;
};

export type LeakAddress = {
    address: string;
    family: ProtocolFamily;
    visibility: 'public' | 'private';
};

export type LeakResult = {
    supported: boolean;
    addresses: LeakAddress[];
};

export type DiagnosticsResult = {
    current: AddressRecord | null;
    ipv4: AddressRecord | null;
    ipv6: AddressRecord | null;
    routes: RouteRow[];
    updatedAt: string;
};

export type GeoPayload = {
    ip?: unknown;
    city?: unknown;
    region?: unknown;
    country?: unknown;
    organization?: unknown;
    organization_name?: unknown;
    timezone?: unknown;
};

export type IpifyPayload = {
    ip?: unknown;
};
