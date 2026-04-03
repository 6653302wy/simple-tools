'use client';

import { Button } from '@/components/Button';
import { CopyButton } from '@/components/CopyButton';
import { ToolPanel } from '@/components/ToolPanel';
import { cn } from '@/libs/utils';
import type { DiagnosticsResult } from '../types';
import { formatLocation, formatNetwork, infoCardClassName, sourceLinkClassName } from '../utils';

type LocalNetworkOverviewPanelProps = {
    diagnostics: DiagnosticsResult | null;
    verdict: string;
    loading: boolean;
    error: string;
    t: (key: string, variables?: Record<string, string | number>) => string;
    onRefresh: () => void;
};

export function LocalNetworkOverviewPanel({
    diagnostics,
    verdict,
    loading,
    error,
    t,
    onRefresh,
}: LocalNetworkOverviewPanelProps) {
    return (
        <ToolPanel
            className="overflow-hidden p-0"
            title={t('localNetwork.networkTitle')}
            description={
                <>
                    <span>{t('localNetwork.networkDescription')}</span>
                    {diagnostics?.updatedAt ? (
                        <span className="mt-2 block text-body-sm text-text-c">{`${t('localNetwork.updatedAt')}: ${diagnostics.updatedAt}`}</span>
                    ) : null}
                </>
            }
            action={
                <div className="flex flex-wrap items-center gap-2">
                    <a className={sourceLinkClassName} href="https://www.geojs.io/" rel="noreferrer" target="_blank">
                        {t('localNetwork.sourceGeojs')}
                    </a>
                    <a className={sourceLinkClassName} href="https://www.ipify.org/" rel="noreferrer" target="_blank">
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
                    <Button className="h-10 px-4" loading={loading} onClick={onRefresh}>
                        <span className="text-body-sm">
                            {loading ? t('localNetwork.refreshing') : t('localNetwork.refresh')}
                        </span>
                    </Button>
                </div>
            }
            headerClassName="border-b border-neutral-j p-4"
            bodyClassName="p-0"
        >
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
        </ToolPanel>
    );
}
