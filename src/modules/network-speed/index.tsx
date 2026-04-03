'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { CopyButton } from '@/components/CopyButton';
import { ModuleIntro } from '@/components/ModuleIntro';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';

const inputClassName =
    'h-14 w-full rounded-2xl border border-neutral-j bg-fill-b px-4 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-3xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const toggleClassName = 'rounded-full border px-3.5 py-1.5 text-body-xs transition whitespace-nowrap';
const compactButtonClassName = 'h-11 px-4';
const compactChipClassName = 'px-3 py-1.5 text-body-xs';

type CarrierFilterKey = 'telecom' | 'unicom' | 'mobile' | 'edge';
type DetailFilterKey = 'all' | CarrierFilterKey;
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

type ProbeEntry = {
    id: string;
    zone: ZoneKey;
    carrierKey: CarrierFilterKey | 'other';
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

type ChinaPingResponse = {
    input: string;
    normalizedTarget: string;
    measurementId: string;
    measurementStatus: string;
    createdAt: string;
    updatedAt: string;
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
    summary: {
        chinaCarriers: AggregateEntry[];
        chinaRegions: AggregateEntry[];
        edgeRegions: AggregateEntry[];
    };
    ipDistribution: Array<{
        address: string;
        count: number;
        percentage: number;
    }>;
    probes: ProbeEntry[];
};

type RunHistoryEntry = {
    measurementId: string;
    timestamp: string;
    avgMs: number | null;
    completed: number;
};

const carrierFilterOrder: CarrierFilterKey[] = ['telecom', 'unicom', 'mobile', 'edge'];
const latencyLegend = [
    { label: '<= 50ms', className: 'bg-[rgb(16,185,129)]' },
    { label: '51ms - 100ms', className: 'bg-[rgb(74,222,128)]' },
    { label: '101ms - 200ms', className: 'bg-[rgb(190,242,100)]' },
    { label: '201ms - 250ms', className: 'bg-[rgb(250,204,21)]' },
    { label: '> 250ms', className: 'bg-[rgb(251,146,60)]' },
    { label: '丢包/失败', className: 'bg-[rgb(239,68,68)]' },
] as const;

function formatMs(value: number | null) {
    if (value === null) {
        return '--';
    }

    return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ms`;
}

function formatPercent(value: number) {
    return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
}

function getLatencyToneClass(avgMs: number | null, packetLoss = 0, status = 'finished') {
    if (status !== 'finished' || packetLoss >= 100) {
        return 'bg-[rgb(239,68,68)]';
    }

    if (packetLoss > 0) {
        return 'bg-[rgb(248,113,113)]';
    }

    if (avgMs === null) {
        return 'bg-fill-d';
    }

    if (avgMs <= 50) {
        return 'bg-[rgb(16,185,129)]';
    }

    if (avgMs <= 100) {
        return 'bg-[rgb(74,222,128)]';
    }

    if (avgMs <= 200) {
        return 'bg-[rgb(190,242,100)]';
    }

    if (avgMs <= 250) {
        return 'bg-[rgb(250,204,21)]';
    }

    return 'bg-[rgb(251,146,60)]';
}

function buildSummary(entries: ProbeEntry[], key: string, zone: ZoneKey): AggregateEntry {
    const completedEntries = entries.filter((entry) => entry.status === 'finished' && entry.avgMs !== null);
    const sortedEntries = [...completedEntries].sort((previousEntry, nextEntry) => {
        return (previousEntry.avgMs ?? Number.POSITIVE_INFINITY) - (nextEntry.avgMs ?? Number.POSITIVE_INFINITY);
    });
    const averageValues = completedEntries
        .map((entry) => entry.avgMs)
        .filter((value): value is number => value !== null && Number.isFinite(value));

    return {
        key,
        zone,
        count: entries.length,
        pending: entries.filter((entry) => entry.status !== 'finished').length,
        packetLossAlerts: entries.filter((entry) => entry.packetLoss > 0).length,
        avgMs: averageValues.length
            ? averageValues.reduce((total, currentValue) => total + currentValue, 0) / averageValues.length
            : null,
        fastestLabel: sortedEntries[0]?.locationLabel ?? '--',
        slowestLabel: sortedEntries.at(-1)?.locationLabel ?? '--',
    };
}

function projectPoint(longitude: number | null, latitude: number | null) {
    if (longitude === null || latitude === null) {
        return null;
    }

    const minLon = 72;
    const maxLon = 136;
    const minLat = 3;
    const maxLat = 54;

    return {
        x: ((longitude - minLon) / (maxLon - minLon)) * 100,
        y: (1 - (latitude - minLat) / (maxLat - minLat)) * 100,
    };
}

export function NetworkSpeedTool() {
    const { language, t } = useI18n();
    const [target, setTarget] = useState('');
    const [selectedCarriers, setSelectedCarriers] = useState<Record<CarrierFilterKey, boolean>>({
        telecom: true,
        unicom: true,
        mobile: true,
        edge: true,
    });
    const [result, setResult] = useState<ChinaPingResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [zone, setZone] = useState<ZoneKey>('china');
    const [detailFilter, setDetailFilter] = useState<DetailFilterKey>('all');
    const [continuous, setContinuous] = useState(false);
    const [runHistory, setRunHistory] = useState<RunHistoryEntry[]>([]);
    const timerRef = useRef<number | null>(null);
    const continuousRef = useRef(false);
    const isSingleRunning = loading && !continuous;
    const isContinuousRunning = loading && continuous;

    useEffect(() => {
        continuousRef.current = continuous;
    }, [continuous]);

    useEffect(() => {
        return () => {
            if (timerRef.current) {
                window.clearTimeout(timerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (zone === 'edge' && detailFilter !== 'all' && detailFilter !== 'edge') {
            setDetailFilter('all');
        }
    }, [detailFilter, zone]);

    const carrierLabels: Record<CarrierFilterKey, string> = {
        telecom: t('network.carrierTelecom'),
        unicom: t('network.carrierUnicom'),
        mobile: t('network.carrierMobile'),
        edge: t('network.carrierEdge'),
    };

    const regionLabels: Record<RegionKey, string> = {
        north: t('network.regionNorth'),
        east: t('network.regionEast'),
        south: t('network.regionSouth'),
        central: t('network.regionCentral'),
        southwest: t('network.regionSouthwest'),
        northwest: t('network.regionNorthwest'),
        northeast: t('network.regionNortheast'),
        hkmo_tw: t('network.regionHkmoTw'),
        overseas: t('network.regionOverseas'),
    };

    function clearLoopTimer() {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
    }

    function getSelectedCarriers() {
        return carrierFilterOrder.filter((carrierKey) => selectedCarriers[carrierKey]);
    }

    function scheduleNextRun() {
        clearLoopTimer();

        if (!continuousRef.current) {
            return;
        }

        timerRef.current = window.setTimeout(() => {
            void runTest();
        }, 8000);
    }

    function stopContinuous() {
        clearLoopTimer();
        continuousRef.current = false;
        setContinuous(false);
    }

    async function runTest() {
        const carriers = getSelectedCarriers();

        if (!target.trim()) {
            setError(t('network.invalidTarget'));
            stopContinuous();
            return;
        }

        if (!carriers.length) {
            setError(t('network.selectCarrier'));
            stopContinuous();
            return;
        }

        try {
            clearLoopTimer();
            setLoading(true);
            setError('');

            const response = await fetch('/api/china-ping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language,
                    target,
                    carriers,
                }),
            });

            const payload = (await response.json()) as ChinaPingResponse | { message?: string };

            if (!response.ok) {
                throw new Error(
                    'message' in payload ? payload.message || t('network.probeFailed') : t('network.probeFailed'),
                );
            }

            const probePayload = payload as ChinaPingResponse;

            setResult(probePayload);
            setRunHistory((previousHistory) => {
                return [
                    {
                        measurementId: probePayload.measurementId,
                        timestamp: probePayload.updatedAt,
                        avgMs: probePayload.totals.avgMs,
                        completed: probePayload.totals.completed,
                    },
                    ...previousHistory.filter(
                        (historyItem) => historyItem.measurementId !== probePayload.measurementId,
                    ),
                ].slice(0, 6);
            });

            const hasZoneEntries = probePayload.probes.some((probe) => probe.zone === zone);

            if (!hasZoneEntries) {
                setZone(probePayload.probes.some((probe) => probe.zone === 'edge') ? 'edge' : 'china');
            }
        } catch (probeError) {
            setResult(null);
            setError(probeError instanceof Error ? probeError.message : t('network.probeFailed'));
        } finally {
            setLoading(false);
            scheduleNextRun();
        }
    }

    function toggleCarrier(carrierKey: CarrierFilterKey) {
        setSelectedCarriers((previousValue) => ({
            ...previousValue,
            [carrierKey]: !previousValue[carrierKey],
        }));
    }

    function toggleContinuous() {
        const nextValue = !continuousRef.current;

        setContinuous(nextValue);
        continuousRef.current = nextValue;

        if (!nextValue) {
            clearLoopTimer();
            return;
        }

        if (!loading) {
            void runTest();
        }
    }

    const chinaProbes = useMemo(() => result?.probes.filter((probe) => probe.zone === 'china') ?? [], [result]);
    const edgeProbes = useMemo(() => result?.probes.filter((probe) => probe.zone === 'edge') ?? [], [result]);
    const zoneProbes = zone === 'china' ? chinaProbes : edgeProbes;
    const filteredProbes = zoneProbes
        .filter((probe) => detailFilter === 'all' || probe.carrierKey === detailFilter)
        .sort((previousProbe, nextProbe) => {
            return (previousProbe.avgMs ?? Number.POSITIVE_INFINITY) - (nextProbe.avgMs ?? Number.POSITIVE_INFINITY);
        });

    const zoneOverviewSummary = useMemo(() => {
        return buildSummary(zoneProbes, 'all', zone);
    }, [zone, zoneProbes]);

    const zoneIpDistribution = useMemo(() => {
        const distribution = new Map<string, number>();

        for (const probe of zoneProbes) {
            if (!probe.resolvedAddress) {
                continue;
            }

            distribution.set(probe.resolvedAddress, (distribution.get(probe.resolvedAddress) ?? 0) + 1);
        }

        return Array.from(distribution.entries())
            .map(([address, count]) => ({
                address,
                count,
                percentage: zoneProbes.length ? (count / zoneProbes.length) * 100 : 0,
            }))
            .sort((previousItem, nextItem) => nextItem.count - previousItem.count);
    }, [zoneProbes]);

    const zoneAverageMs = useMemo(() => {
        const values = zoneProbes
            .map((probe) => probe.avgMs)
            .filter((value): value is number => value !== null && Number.isFinite(value));

        if (!values.length) {
            return null;
        }

        return values.reduce((total, currentValue) => total + currentValue, 0) / values.length;
    }, [zoneProbes]);

    const activeZoneLabel = zone === 'china' ? t('network.zoneChina') : t('network.zoneEdge');

    return (
        <section className="space-y-4 pb-4">
            <ModuleIntro badge="PING" title={t('network.introTitle')} description={t('network.introDescription')} />

            <section className={cn(panelClassName, 'space-y-4')}>
                <section className="space-y-2">
                    <label className="text-body-sm text-text-c" htmlFor="china-ping-target-input">
                        {t('network.target')}
                    </label>

                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                        <input
                            id="china-ping-target-input"
                            className={inputClassName}
                            value={target}
                            onChange={(event) => {
                                setTarget(event.target.value);
                            }}
                            placeholder={t('network.targetPlaceholder')}
                        />

                        <div className="flex flex-wrap items-center gap-2 xl:self-center">
                            <Button
                                className={compactButtonClassName}
                                loading={isSingleRunning}
                                disabled={continuous || isContinuousRunning}
                                onClick={() => void runTest()}
                            >
                                <span className="text-body-sm">{t('network.singleTest')}</span>
                            </Button>
                            <Button
                                variant={continuous ? 'secondary' : 'outline'}
                                className={cn(compactButtonClassName, !continuous && 'text-primary-600')}
                                loading={isContinuousRunning}
                                disabled={isSingleRunning}
                                onClick={toggleContinuous}
                            >
                                <span className="text-body-sm">
                                    {continuous ? t('network.stopContinuous') : t('network.continuousTest')}
                                </span>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-body-sm text-text-c">
                        <span>{t('network.controlHint')}</span>
                        <a
                            className="text-primary-500 transition hover:text-primary-300"
                            href={result?.shareUrl ?? 'https://globalping.io'}
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t('network.openResult')}
                        </a>
                        <a
                            className="text-primary-500 transition hover:text-primary-300"
                            href="https://github.com/jsdelivr/globalping"
                            target="_blank"
                            rel="noreferrer"
                        >
                            {t('network.openSource')}
                        </a>
                    </div>
                </section>

                <section className="flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-body-sm text-text-c">{t('network.carriers')}</span>
                    {carrierFilterOrder.map((carrierKey) => {
                        const isActive = selectedCarriers[carrierKey];

                        return (
                            <Button
                                key={carrierKey}
                                variant="plain"
                                className={cn(
                                    toggleClassName,
                                    isActive
                                        ? 'border-primary-200 bg-primary-100 text-primary-700'
                                        : 'border-neutral-j bg-fill-b text-text-d hover:bg-fill-a',
                                )}
                                onClick={() => {
                                    toggleCarrier(carrierKey);
                                }}
                            >
                                {carrierLabels[carrierKey]}
                            </Button>
                        );
                    })}
                </section>

                {runHistory.length > 0 && (
                    <section className="flex flex-wrap gap-2">
                        {runHistory.map((historyItem) => (
                            <div
                                key={historyItem.measurementId}
                                className="rounded-full border border-neutral-j bg-fill-b px-3 py-1.5 text-body-xs text-text-d"
                            >
                                {`${new Date(historyItem.timestamp).toLocaleTimeString(
                                    language === 'zh' ? 'zh-CN' : 'en-US',
                                    {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                        second: '2-digit',
                                    },
                                )} · ${formatMs(historyItem.avgMs)} · ${historyItem.completed}${t('network.pointsSuffix')}`}
                            </div>
                        ))}
                    </section>
                )}

                {error && (
                    <p className="rounded-2xl border border-error bg-[rgba(235,51,51,0.08)] px-4 py-3 text-body-pc-md text-error">
                        {error}
                    </p>
                )}
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.98fr)_minmax(0,1.12fr)]">
                <section className={cn(panelClassName, 'space-y-4')}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('network.mapTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('network.mapDescription')}</p>
                        </div>

                        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-j bg-fill-b px-3 py-1.5 text-body-xs text-text-d">
                            <span
                                className={cn(
                                    'inline-flex size-2.5 rounded-full',
                                    continuous ? 'animate-pulse bg-primary-400' : 'bg-fill-d',
                                )}
                            />
                            {continuous ? t('network.continuousRunning') : t('network.continuousIdle')}
                        </div>
                    </div>

                    <div className="relative h-[28rem] overflow-hidden rounded-[2rem] border border-neutral-j bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(226,244,231,0.95))]">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(51,175,97,0.12),transparent_32%),radial-gradient(circle_at_82%_18%,rgba(0,97,186,0.12),transparent_28%),radial-gradient(circle_at_58%_70%,rgba(255,199,0,0.16),transparent_34%)]" />
                        {[20, 40, 60, 80].map((line) => (
                            <div
                                key={`horizontal-${line}`}
                                className="absolute left-0 right-0 border-t border-dashed border-[rgba(13,21,18,0.08)]"
                                style={{ top: `${line}%` }}
                            />
                        ))}
                        {[20, 40, 60, 80].map((line) => (
                            <div
                                key={`vertical-${line}`}
                                className="absolute bottom-0 top-0 border-l border-dashed border-[rgba(13,21,18,0.08)]"
                                style={{ left: `${line}%` }}
                            />
                        ))}

                        <span className="absolute left-[18%] top-[18%] text-body-xs text-text-c">
                            {t('network.regionNorth')}
                        </span>
                        <span className="absolute left-[30%] top-[40%] text-body-xs text-text-c">
                            {t('network.regionNorthwest')}
                        </span>
                        <span className="absolute left-[44%] top-[52%] text-body-xs text-text-c">
                            {t('network.regionCentral')}
                        </span>
                        <span className="absolute left-[60%] top-[38%] text-body-xs text-text-c">
                            {t('network.regionEast')}
                        </span>
                        <span className="absolute left-[60%] top-[68%] text-body-xs text-text-c">
                            {t('network.regionSouth')}
                        </span>
                        <span className="absolute left-[80%] top-[58%] text-body-xs text-text-c">
                            {t('network.regionHkmoTw')}
                        </span>

                        {zoneProbes.length > 0 ? (
                            zoneProbes.map((probe) => {
                                const position = projectPoint(probe.longitude, probe.latitude);

                                if (!position) {
                                    return null;
                                }

                                return (
                                    <div
                                        key={probe.id}
                                        className="absolute -translate-x-1/2 -translate-y-1/2"
                                        style={{ left: `${position.x}%`, top: `${position.y}%` }}
                                    >
                                        <div
                                            className={cn(
                                                'mx-auto size-3 rounded-full ring-4 ring-white/80 shadow-[0_8px_20px_rgba(13,21,18,0.12)]',
                                                getLatencyToneClass(probe.avgMs, probe.packetLoss, probe.status),
                                            )}
                                        />
                                        <div className="mt-2 min-w-[5rem] rounded-full bg-fill-a/95 px-2 py-1 text-center text-[11px] leading-tight text-text-d shadow-[0_12px_28px_rgba(13,21,18,0.08)]">
                                            <p className="font-medium text-text-e">{probe.city}</p>
                                            <p>{formatMs(probe.avgMs)}</p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-body-pc-md text-text-d">
                                {t('network.waitingResult')}
                            </div>
                        )}

                        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                            {latencyLegend.map((legendItem) => (
                                <div
                                    key={legendItem.label}
                                    className="inline-flex items-center gap-2 rounded-full bg-fill-a/92 px-3 py-2 text-body-xs text-text-d shadow-[0_10px_24px_rgba(13,21,18,0.06)]"
                                >
                                    <span className={cn('inline-flex size-2.5 rounded-full', legendItem.className)} />
                                    {legendItem.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className={cn(panelClassName, 'space-y-4')}>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex rounded-full border border-neutral-j bg-fill-b p-1">
                            <Button
                                variant="plain"
                                className={cn(
                                    toggleClassName,
                                    zone === 'china'
                                        ? 'border-primary-200 bg-primary-100 text-primary-700'
                                        : 'border-transparent text-text-d hover:bg-fill-a',
                                )}
                                onClick={() => {
                                    setZone('china');
                                }}
                            >
                                {t('network.zoneChina')}
                            </Button>
                            <Button
                                variant="plain"
                                className={cn(
                                    toggleClassName,
                                    zone === 'edge'
                                        ? 'border-primary-200 bg-primary-100 text-primary-700'
                                        : 'border-transparent text-text-d hover:bg-fill-a',
                                )}
                                onClick={() => {
                                    setZone('edge');
                                }}
                            >
                                {t('network.zoneEdge')}
                            </Button>
                        </div>

                        <div className="flex items-center gap-2.5 text-body-xs text-text-d">
                            <span>{`${result?.totals.received ?? 0}${t('network.pointsSuffix')}${t('network.progressLabel')}`}</span>
                            <div className="h-2.5 w-36 overflow-hidden rounded-full bg-fill-b">
                                <div
                                    className="h-full rounded-full bg-[linear-gradient(90deg,#7ACC63,#33AF61)] transition-all"
                                    style={{ width: `${result?.totals.progressPercent ?? 0}%` }}
                                />
                            </div>
                            <span className="text-primary-500">{`${result?.totals.progressPercent ?? 0}%`}</span>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-j bg-fill-b px-4 py-3">
                            <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                {t('network.metricPoints')}
                            </p>
                            <p className="mt-1.5 text-body-pc-md text-text-e">{zoneProbes.length}</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-j bg-fill-b px-4 py-3">
                            <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                {t('network.metricAverage')}
                            </p>
                            <p className="mt-1.5 text-body-pc-md text-text-e">{formatMs(zoneAverageMs)}</p>
                        </div>
                        <div className="rounded-2xl border border-neutral-j bg-fill-b px-4 py-3">
                            <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                {t('network.metricLossAlerts')}
                            </p>
                            <p className="mt-1.5 text-body-pc-md text-text-e">
                                {zoneProbes.filter((probe) => probe.packetLoss > 0).length}
                            </p>
                        </div>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-3">
                        <div className="rounded-[1.5rem] border border-neutral-j bg-fill-b px-4 py-4">
                            <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                {t('network.summaryAverage')}
                            </p>
                            <p className="mt-2 text-title-lg text-text-e">{formatMs(zoneOverviewSummary.avgMs)}</p>
                            <p className="mt-2 text-body-sm text-text-d">{activeZoneLabel}</p>
                        </div>

                        <div className="rounded-[1.5rem] border border-neutral-j bg-fill-b px-4 py-4">
                            <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                {t('network.summaryFastest')}
                            </p>
                            <p className="mt-2 break-words text-body-pc-md text-text-d">
                                {zoneOverviewSummary.fastestLabel}
                            </p>
                            <p className="mt-2 text-body-sm text-text-c">{activeZoneLabel}</p>
                        </div>

                        <div className="rounded-[1.5rem] border border-neutral-j bg-fill-b px-4 py-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                    {t('network.summarySlowest')}
                                </p>
                                {zoneOverviewSummary.packetLossAlerts > 0 && (
                                    <span className="rounded-full bg-[rgba(235,51,51,0.1)] px-2 py-0.5 text-body-xs text-error">
                                        {`${zoneOverviewSummary.packetLossAlerts}${t('network.lossBadge')}`}
                                    </span>
                                )}
                            </div>
                            <p className="mt-2 break-words text-body-pc-md text-text-d">
                                {zoneOverviewSummary.slowestLabel}
                            </p>
                            <p className="mt-2 text-body-sm text-text-c">{activeZoneLabel}</p>
                        </div>
                    </div>
                </section>
            </section>

            <section className={cn(panelClassName, 'space-y-4')}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-title-lg text-text-e">{t('network.ipStatsTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('network.ipStatsDescription')}</p>
                    </div>

                    <CopyButton
                        text={zoneIpDistribution.map((item) => item.address).join('\n')}
                        className={compactChipClassName}
                        idleLabel={t('network.copyIps')}
                    />
                </div>

                {zoneIpDistribution.length > 0 ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {zoneIpDistribution.map((distributionItem) => (
                            <div
                                key={distributionItem.address}
                                className="rounded-2xl border border-neutral-j bg-fill-b px-4 py-3"
                            >
                                <p className="text-body-pc-md text-text-e">{distributionItem.address}</p>
                                <p className="mt-1 text-body-sm text-primary-500">
                                    {formatPercent(distributionItem.percentage)}
                                </p>
                                <p className="mt-1 text-body-xs text-text-c">{`${distributionItem.count}${t('network.pointsSuffix')}`}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="rounded-2xl border border-dashed border-neutral-j bg-fill-b px-4 py-8 text-center text-body-pc-md text-text-d">
                        {t('network.waitingResult')}
                    </div>
                )}
            </section>

            <section className={cn(panelClassName, 'space-y-4')}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-title-lg text-text-e">{t('network.detailsTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('network.detailsDescription')}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {(['all', ...carrierFilterOrder] as DetailFilterKey[]).map((filterKey) => {
                            const isActive = detailFilter === filterKey;

                            return (
                                <Button
                                    key={filterKey}
                                    variant="plain"
                                    className={cn(
                                        toggleClassName,
                                        isActive
                                            ? 'border-primary-200 bg-primary-100 text-primary-700'
                                            : 'border-neutral-j bg-fill-b text-text-d hover:bg-fill-a',
                                    )}
                                    onClick={() => {
                                        setDetailFilter(filterKey);
                                    }}
                                >
                                    {filterKey === 'all' ? t('network.summaryAll') : carrierLabels[filterKey]}
                                </Button>
                            );
                        })}
                    </div>
                </div>

                <div className="overflow-hidden rounded-[1.5rem] border border-neutral-j bg-fill-b">
                    <div className="hidden grid-cols-[minmax(0,1.35fr)_0.78fr_0.9fr_1fr_1.15fr_0.72fr_1.2fr] gap-3 border-b border-neutral-j bg-fill-a px-4 py-3 text-[11px] leading-4 font-medium tracking-[0.08em] text-text-c lg:grid">
                        <p>{t('network.columnPoint')}</p>
                        <p>{t('network.columnCarrier')}</p>
                        <p>{t('network.columnRegion')}</p>
                        <p>{t('network.columnIp')}</p>
                        <p>{t('network.columnTiming')}</p>
                        <p>{t('network.columnLoss')}</p>
                        <p>{t('network.columnNetwork')}</p>
                    </div>

                    {filteredProbes.length > 0 ? (
                        <div className="divide-y divide-neutral-j/80">
                            {filteredProbes.map((probe) => (
                                <div
                                    key={probe.id}
                                    className="grid gap-3 px-4 py-3 text-body-sm text-text-d lg:grid-cols-[minmax(0,1.35fr)_0.78fr_0.9fr_1fr_1.15fr_0.72fr_1.2fr] lg:items-center"
                                >
                                    <div className="min-w-0">
                                        <div className="flex items-start gap-2.5">
                                            <span
                                                className={cn(
                                                    'mt-1 inline-flex size-2.5 shrink-0 rounded-full',
                                                    getLatencyToneClass(probe.avgMs, probe.packetLoss, probe.status),
                                                )}
                                            />
                                            <div className="min-w-0">
                                                <p className="break-words text-body-pc-md text-text-d">{probe.city}</p>
                                                <p className="mt-0.5 break-words text-body-sm text-text-c">
                                                    {probe.locationLabel}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="min-w-0 lg:block">
                                        <p className="mb-1 text-body-xs text-text-c lg:hidden">
                                            {t('network.columnCarrier')}
                                        </p>
                                        <p className="break-words text-text-d">{probe.carrierLabel}</p>
                                    </div>

                                    <div className="min-w-0 lg:block">
                                        <p className="mb-1 text-body-xs text-text-c lg:hidden">
                                            {t('network.columnRegion')}
                                        </p>
                                        <p className="break-words text-text-d">{regionLabels[probe.regionKey]}</p>
                                    </div>

                                    <div className="min-w-0 lg:block">
                                        <p className="mb-1 text-body-xs text-text-c lg:hidden">
                                            {t('network.columnIp')}
                                        </p>
                                        <p className="break-all text-text-d">{probe.resolvedAddress ?? '--'}</p>
                                    </div>

                                    <div className="min-w-0 lg:block">
                                        <p className="mb-1 text-body-xs text-text-c lg:hidden">
                                            {t('network.columnTiming')}
                                        </p>
                                        <p className="break-words text-text-d">
                                            {`${formatMs(probe.avgMs)} · ${formatMs(probe.minMs)} / ${formatMs(probe.maxMs)}`}
                                        </p>
                                    </div>

                                    <div className="min-w-0 lg:block">
                                        <p className="mb-1 text-body-xs text-text-c lg:hidden">
                                            {t('network.columnLoss')}
                                        </p>
                                        <span
                                            className={cn(
                                                'inline-flex rounded-full px-2 py-0.5 text-body-xs',
                                                probe.packetLoss > 0
                                                    ? 'bg-[rgba(235,51,51,0.1)] text-error'
                                                    : 'bg-primary-100 text-primary-700',
                                            )}
                                        >
                                            {`${probe.packetLoss.toFixed(probe.packetLoss >= 10 ? 0 : 1)}%`}
                                        </span>
                                    </div>

                                    <div className="min-w-0 lg:block">
                                        <p className="mb-1 text-body-xs text-text-c lg:hidden">
                                            {t('network.columnNetwork')}
                                        </p>
                                        <p className="break-words text-text-d">
                                            {probe.network || `AS${probe.asn ?? '--'}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-10 text-center text-body-pc-md text-text-d">
                            {t('network.waitingResult')}
                        </div>
                    )}
                </div>
            </section>
        </section>
    );
}
