'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { CopyButton } from '@/components/CopyButton';
import { ModuleIntro } from '@/components/ModuleIntro';
import { cn } from '@/libs/utils';
import { NetworkGeoMap } from '@/modules/network-speed/components/NetworkGeoMap';
import { type CountryKey, networkCountries, networkCountryOrder } from '@/modules/network-speed/countries';
import type { GlobalPingResponse } from '@/modules/network-speed/types';
import { useI18n } from '@/services/i18n';
import { resolveLocalizedText } from '@/services/i18n/constant';

const inputClassName =
    'h-14 w-full rounded-2xl border border-neutral-j bg-fill-b px-4 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-3xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const toggleClassName = 'rounded-full border px-3.5 py-1.5 text-body-xs transition whitespace-nowrap';
const compactButtonClassName = 'h-11 px-4';
const compactChipClassName = 'px-3 py-1.5 text-body-xs';

type DetailFilterKey = 'all' | CountryKey;

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

export function NetworkSpeedTool() {
    const { language, t } = useI18n();
    const [target, setTarget] = useState('');
    const [focusCountry, setFocusCountry] = useState<CountryKey | null>(null);
    const [detailFilter, setDetailFilter] = useState<DetailFilterKey>('all');
    const [result, setResult] = useState<GlobalPingResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [continuous, setContinuous] = useState(false);
    const timerRef = useRef<number | null>(null);
    const continuousRef = useRef(false);
    const isSingleRunning = loading && !continuous;
    const isContinuousRunning = loading && continuous;

    const countryLabels = useMemo(
        () =>
            Object.fromEntries(
                networkCountries.map((country) => [country.key, resolveLocalizedText(language, country.label)]),
            ) as Record<CountryKey, string>,
        [language],
    );

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

    function clearLoopTimer() {
        if (timerRef.current) {
            window.clearTimeout(timerRef.current);
            timerRef.current = null;
        }
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

    async function runTest(nextFocusCountry: CountryKey | null = focusCountry) {
        const countries = networkCountryOrder;

        if (!target.trim()) {
            setError(t('network.invalidTarget'));
            stopContinuous();
            return;
        }

        try {
            clearLoopTimer();
            setLoading(true);
            setError('');

            const response = await fetch('/api/global-ping', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    language,
                    target,
                    countries,
                    focusCountry: nextFocusCountry,
                }),
            });

            const payload = (await response.json()) as GlobalPingResponse | { message?: string };

            if (!response.ok) {
                throw new Error(
                    'message' in payload ? payload.message || t('network.probeFailed') : t('network.probeFailed'),
                );
            }

            const probePayload = payload as GlobalPingResponse;

            setResult(probePayload);
            setFocusCountry(probePayload.focusCountry);
            setDetailFilter(probePayload.focusCountry ?? 'all');
        } catch (probeError) {
            setResult(null);
            setError(probeError instanceof Error ? probeError.message : t('network.probeFailed'));
        } finally {
            setLoading(false);
            scheduleNextRun();
        }
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

    const currentProbes = result?.probes ?? [];
    const currentCountrySummaries = result?.countries ?? [];
    const filteredProbes = currentProbes
        .filter((probe) => detailFilter === 'all' || probe.countryKey === detailFilter)
        .sort((previousProbe, nextProbe) => {
            return (previousProbe.avgMs ?? Number.POSITIVE_INFINITY) - (nextProbe.avgMs ?? Number.POSITIVE_INFINITY);
        });

    return (
        <section className="space-y-4 pb-4">
            <ModuleIntro badge="PING" title={t('network.introTitle')} description={t('network.introDescription')} />

            <section className={cn(panelClassName, 'space-y-4')}>
                <section className="space-y-2">
                    <label className="text-body-sm text-text-c" htmlFor="global-ping-target-input">
                        {t('network.target')}
                    </label>

                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
                        <input
                            id="global-ping-target-input"
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
                    </div>
                </section>

                {error && (
                    <p className="rounded-2xl border border-error bg-[rgba(235,51,51,0.08)] px-4 py-3 text-body-pc-md text-error">
                        {error}
                    </p>
                )}
            </section>

            <section className={cn(panelClassName, 'space-y-4')}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-title-lg text-text-e">{t('network.mapTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('network.mapDescription')}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {focusCountry ? (
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-100 px-3 py-1.5 text-body-xs text-primary-700">
                                <span>{`${t('network.focusedMode')}: ${countryLabels[focusCountry]}`}</span>
                                <Button
                                    variant="plain"
                                    className="rounded-full border border-primary-200 bg-fill-a px-2.5 py-1 text-body-xs text-primary-700 hover:bg-primary-100"
                                    onClick={() => {
                                        setFocusCountry(null);
                                        setDetailFilter('all');
                                        setError('');
                                    }}
                                >
                                    {t('network.backToOverview')}
                                </Button>
                            </div>
                        ) : null}

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
                </div>
                <div className="overflow-hidden rounded-[2rem] border border-neutral-j bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(226,244,231,0.95))] p-1">
                    <NetworkGeoMap
                        summaries={currentCountrySummaries}
                        probes={currentProbes}
                        focusCountry={focusCountry}
                        countryLabels={countryLabels}
                        onDrillDown={(countryKey) => {
                            setFocusCountry(countryKey);
                            setDetailFilter(countryKey);
                            setError('');
                        }}
                    />
                </div>
            </section>

            <section className={cn(panelClassName, 'space-y-4')}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-title-lg text-text-e">{t('network.ipStatsTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('network.ipStatsDescription')}</p>
                    </div>

                    {result?.ipDistribution.length ? (
                        <CopyButton
                            text={result.ipDistribution.map((item) => item.address).join('\n')}
                            className={compactChipClassName}
                            idleLabel={t('network.copyIps')}
                        />
                    ) : null}
                </div>

                {result?.ipDistribution.length ? (
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                        {result.ipDistribution.map((distributionItem) => (
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
                        <Button
                            variant="plain"
                            className={cn(
                                toggleClassName,
                                detailFilter === 'all'
                                    ? 'border-primary-200 bg-primary-100 text-primary-700'
                                    : 'border-neutral-j bg-fill-b text-text-d hover:bg-fill-a',
                            )}
                            onClick={() => {
                                setDetailFilter('all');
                            }}
                        >
                            {t('network.summaryAll')}
                        </Button>
                        {currentCountrySummaries.map((countrySummary) => (
                            <Button
                                key={countrySummary.key}
                                variant="plain"
                                className={cn(
                                    toggleClassName,
                                    detailFilter === countrySummary.key
                                        ? 'border-primary-200 bg-primary-100 text-primary-700'
                                        : 'border-neutral-j bg-fill-b text-text-d hover:bg-fill-a',
                                )}
                                onClick={() => {
                                    setDetailFilter(countrySummary.key);
                                }}
                            >
                                {countryLabels[countrySummary.key]}
                            </Button>
                        ))}
                    </div>
                </div>

                <div className="overflow-hidden rounded-[1.5rem] border border-neutral-j bg-fill-b">
                    <div className="hidden grid-cols-[minmax(0,1.2fr)_0.95fr_1fr_1.15fr_0.72fr_1.1fr] gap-3 border-b border-neutral-j bg-fill-a px-4 py-3 text-[11px] leading-4 font-medium tracking-[0.08em] text-text-c lg:grid">
                        <p>{t('network.columnPoint')}</p>
                        <p>{t('network.columnCountry')}</p>
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
                                    className="grid gap-3 px-4 py-3 text-body-sm text-text-d lg:grid-cols-[minmax(0,1.2fr)_0.95fr_1fr_1.15fr_0.72fr_1.1fr] lg:items-center"
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
                                            {t('network.columnCountry')}
                                        </p>
                                        <p className="break-words text-text-d">
                                            {probe.countryKey === 'other'
                                                ? probe.countryCode || '--'
                                                : countryLabels[probe.countryKey]}
                                        </p>
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
