'use client';

import { CopyButton } from '@/components/CopyButton';
import { cn } from '@/libs/utils';
import type { AddressRecord, ProtocolFamily } from '../types';
import { formatLocation, formatNetwork } from '../utils';

type LocalNetworkAddressCellProps = {
    t: (key: string, variables?: Record<string, string | number>) => string;
    family: ProtocolFamily;
    record: AddressRecord | null;
};

export function LocalNetworkAddressCell({ t, family, record }: LocalNetworkAddressCellProps) {
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
