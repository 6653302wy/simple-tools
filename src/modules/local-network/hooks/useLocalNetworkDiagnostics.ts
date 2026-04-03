'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/services/i18n';
import type { DiagnosticsResult, LeakResult } from '../types';
import { buildDiagnostics, buildVerdict, collectIceLeaks } from '../utils';

export function useLocalNetworkDiagnostics() {
    const { t } = useI18n();
    const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null);
    const [leaks, setLeaks] = useState<{ ipv4: LeakResult; ipv6: LeakResult }>({
        ipv4: { supported: true, addresses: [] },
        ipv6: { supported: true, addresses: [] },
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const runDiagnostics = useCallback(async () => {
        setLoading(true);
        setError('');

        const [remoteResult, leakResult] = await Promise.all([buildDiagnostics(t), collectIceLeaks()]);

        setDiagnostics(remoteResult);
        setLeaks(leakResult);
        setLoading(false);
    }, [t]);

    useEffect(() => {
        void runDiagnostics().catch((nextError) => {
            setError(nextError instanceof Error ? nextError.message : t('localNetwork.fetchFailed'));
            setLoading(false);
        });
    }, [runDiagnostics, t]);

    const verdict = useMemo(() => buildVerdict(diagnostics, t), [diagnostics, t]);

    return {
        diagnostics,
        leaks,
        loading,
        error,
        verdict,
        setLoading,
        setError,
        runDiagnostics,
    };
}
