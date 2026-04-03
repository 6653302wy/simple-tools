'use client';

import { ToolPanel } from '@/components/ToolPanel';
import { cn } from '@/libs/utils';
import type { DiagnosticsResult } from '../types';
import { LocalNetworkAddressCell } from './LocalNetworkAddressCell';

type LocalNetworkRoutesPanelProps = {
    diagnostics: DiagnosticsResult | null;
    t: (key: string, variables?: Record<string, string | number>) => string;
};

export function LocalNetworkRoutesPanel({ diagnostics, t }: LocalNetworkRoutesPanelProps) {
    return (
        <ToolPanel
            className="overflow-hidden p-0"
            title={t('localNetwork.routeTitle')}
            description={t('localNetwork.routeDescription')}
            headerClassName="border-b border-neutral-j p-4"
            bodyClassName="p-0"
        >
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

                            <LocalNetworkAddressCell t={t} family="ipv4" record={row.ipv4} />
                            <LocalNetworkAddressCell t={t} family="ipv6" record={row.ipv6} />
                        </div>
                    ))
                ) : (
                    <div className="px-4 py-5 text-body-pc-md text-text-c">{t('localNetwork.waiting')}</div>
                )}
            </div>
        </ToolPanel>
    );
}
