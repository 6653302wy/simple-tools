'use client';

import { useI18n } from '@/services/i18n';
import { LocalNetworkLeakPanel } from './components/LocalNetworkLeakPanel';
import { LocalNetworkOverviewPanel } from './components/LocalNetworkOverviewPanel';
import { LocalNetworkRoutesPanel } from './components/LocalNetworkRoutesPanel';
import { useLocalNetworkDiagnostics } from './hooks/useLocalNetworkDiagnostics';

export function LocalNetworkClient() {
    const { t } = useI18n();
    const { diagnostics, leaks, loading, error, verdict, setLoading, setError, runDiagnostics } =
        useLocalNetworkDiagnostics();

    return (
        <>
            <LocalNetworkOverviewPanel
                diagnostics={diagnostics}
                verdict={verdict}
                loading={loading}
                error={error}
                t={t}
                onRefresh={() => {
                    void runDiagnostics().catch((nextError) => {
                        setError(nextError instanceof Error ? nextError.message : t('localNetwork.fetchFailed'));
                        setLoading(false);
                    });
                }}
            />

            <LocalNetworkRoutesPanel diagnostics={diagnostics} t={t} />

            <section className="grid gap-4 xl:grid-cols-2">
                <LocalNetworkLeakPanel title={t('localNetwork.ipv4LeakTitle')} leakResult={leaks.ipv4} t={t} />
                <LocalNetworkLeakPanel title={t('localNetwork.ipv6LeakTitle')} leakResult={leaks.ipv6} t={t} />
            </section>
        </>
    );
}
