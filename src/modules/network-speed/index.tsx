'use client';

import { useState } from 'react';
import { Button } from '@/components/Button';
import { ModuleIntro } from '@/components/ModuleIntro';
import { useI18n } from '@/services/i18n';

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

type ProbeResponse = {
    input: string;
    normalizedUrl: string;
    hostname: string;
    protocol: string;
    resolvedAddress: string | null;
    method: 'HEAD' | 'GET';
    status: number;
    ok: boolean;
    dnsMs: number | null;
    headerMs: number;
    totalMs: number;
    sampleBytes: number;
    sampleMbps: number | null;
};

function formatDuration(value: number | null) {
    if (value === null) {
        return '--';
    }

    return `${value.toFixed(value >= 100 ? 0 : 1)} ms`;
}

function formatSampleMbps(value: number | null) {
    if (value === null) {
        return '--';
    }

    return `${value.toFixed(value >= 100 ? 0 : 2)} Mbps`;
}

export function NetworkSpeedTool() {
    const { language, t } = useI18n();
    const [target, setTarget] = useState('https://example.com');
    const [result, setResult] = useState<ProbeResponse | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleProbe() {
        if (!target.trim()) {
            setError(t('network.invalidTarget'));
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/network-probe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ language, target }),
            });

            const payload = (await response.json()) as ProbeResponse | { message?: string };

            if (!response.ok) {
                throw new Error(
                    'message' in payload ? payload.message || t('network.probeFailed') : t('network.probeFailed'),
                );
            }

            setResult(payload as ProbeResponse);
        } catch (probeError) {
            setResult(null);
            setError(probeError instanceof Error ? probeError.message : t('network.probeFailed'));
        } finally {
            setLoading(false);
        }
    }

    const metricRows = result
        ? [
              { label: t('network.normalizedUrl'), value: result.normalizedUrl },
              { label: t('network.resolvedAddress'), value: result.resolvedAddress ?? '--' },
              { label: t('network.dnsMs'), value: formatDuration(result.dnsMs) },
              { label: t('network.headerMs'), value: formatDuration(result.headerMs) },
              { label: t('network.totalMs'), value: formatDuration(result.totalMs) },
              { label: t('network.sampleMbps'), value: formatSampleMbps(result.sampleMbps) },
          ]
        : [];

    return (
        <section className="space-y-4">
            <ModuleIntro badge="NET" title={t('network.introTitle')} description={t('network.introDescription')} />

            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <section className={panelClassName}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('network.inputTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('network.inputDescription')}</p>
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="network-target-input">
                            {t('network.target')}
                        </label>
                        <input
                            id="network-target-input"
                            className={inputClassName}
                            value={target}
                            onChange={(event) => {
                                setTarget(event.target.value);
                            }}
                            placeholder={t('network.targetPlaceholder')}
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button loading={loading} onClick={() => void handleProbe()}>
                            {t('network.startProbe')}
                        </Button>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-lg border border-error bg-[rgba(235,51,51,0.08)] px-4 py-3 text-body-pc-md text-error">
                            {error}
                        </p>
                    )}
                </section>

                <section className={panelClassName}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('network.resultTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('network.resultDescription')}</p>
                        </div>
                        {result && (
                            <div className="rounded-full border border-primary-200 bg-primary-100 px-4 py-2 text-body-sm text-primary-700">
                                {`${result.status} ${result.ok ? t('network.ok') : t('network.fail')}`}
                            </div>
                        )}
                    </div>

                    {result ? (
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {metricRows.map((row) => (
                                <div key={row.label} className="rounded-xl border border-neutral-j bg-fill-b px-3 py-3">
                                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">{row.label}</p>
                                    <p className="mt-1.5 break-all text-body-pc-md text-text-e">{row.value}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="mt-4 rounded-xl border border-dashed border-primary-200 bg-primary-100/40 px-4 py-8 text-center text-body-pc-md text-text-d">
                            {t('network.waitingResult')}
                        </div>
                    )}
                </section>
            </section>
        </section>
    );
}
