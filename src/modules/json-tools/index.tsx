'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { CopyButton } from '@/components/CopyButton';
import { ModuleIntro } from '@/components/ModuleIntro';
import { useI18n } from '@/services/i18n';
import { useLeaveConfirm } from '@/services/useLeaveConfirm';

const textareaClassName =
    'mt-2 min-h-0 w-full flex-1 rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

const sampleJson = `{
  "tool": "simple-tools",
  "modules": ["timestamp", "exchange-rate", "qrcode"],
  "enabled": true
}`;

export function JsonTools() {
    const { t } = useI18n();
    const localizedSampleJson = useMemo(() => sampleJson, []);
    const [source, setSource] = useState(localizedSampleJson);
    const [result, setResult] = useState('');
    const [status, setStatus] = useState(t('json.statusIdle'));
    const { setGuard } = useLeaveConfirm();
    const isDirty = source !== localizedSampleJson;

    useEffect(() => {
        setGuard({
            active: isDirty,
            title: t('json.dirtyTitle'),
            description: t('json.dirtyDescription'),
        });

        return () => {
            setGuard({
                active: false,
                title: '',
                description: '',
            });
        };
    }, [isDirty, setGuard, t]);

    useEffect(() => {
        if (!isDirty) {
            setStatus(t('json.statusIdle'));
        }
    }, [isDirty, t]);

    function parseSource() {
        return JSON.parse(source);
    }

    function handleValidate() {
        try {
            parseSource();
            setStatus(t('json.statusValid'));
            setResult('');
        } catch (error) {
            setStatus(error instanceof Error ? error.message : t('json.statusValidateFailed'));
        }
    }

    function handleFormat() {
        try {
            const parsed = parseSource();

            setResult(JSON.stringify(parsed, null, 2));
            setStatus(t('json.statusFormatted'));
        } catch (error) {
            setStatus(error instanceof Error ? error.message : t('json.statusFormatFailed'));
        }
    }

    function handleCompress() {
        try {
            const parsed = parseSource();

            setResult(JSON.stringify(parsed));
            setStatus(t('json.statusCompressed'));
        } catch (error) {
            setStatus(error instanceof Error ? error.message : t('json.statusCompressFailed'));
        }
    }

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="JSON" title={t('json.introTitle')} description={t('json.introDescription')} />

            <section className={`${panelClassName} flex min-h-0 flex-1 flex-col`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-title-lg text-text-e">{t('json.panelTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('json.panelDescription')}</p>
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={handleValidate}>{t('json.validate')}</Button>
                    <Button onClick={handleFormat}>{t('json.format')}</Button>
                    <Button onClick={handleCompress}>{t('json.compress')}</Button>
                </div>

                <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
                    <div className="flex min-h-0 flex-col xl:flex-1">
                        <div className="flex min-h-12 items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <label className="text-body-sm text-text-c" htmlFor="json-source">
                                    {t('json.inputJson')}
                                </label>
                                <div className="mt-1 h-8 rounded-full opacity-0" aria-hidden="true" />
                            </div>
                            <div className="w-[7.5rem] shrink-0" aria-hidden="true" />
                        </div>
                        <textarea
                            id="json-source"
                            className={textareaClassName}
                            value={source}
                            onChange={(event) => {
                                setSource(event.target.value);
                            }}
                            placeholder={t('json.inputPlaceholder')}
                        />
                    </div>

                    <div className="flex min-h-0 flex-col xl:flex-1">
                        <div className="flex min-h-12 items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <label className="text-body-sm text-text-c" htmlFor="json-result">
                                    {t('json.resultTitle')}
                                </label>
                                <div className="mt-1 max-w-full truncate rounded-full bg-primary-100 px-4 py-2 text-body-sm text-primary-700">
                                    {status}
                                </div>
                            </div>

                            {result ? (
                                <CopyButton
                                    text={result}
                                    className="shrink-0 px-3 py-2 text-body-sm"
                                    idleLabel={t('common.copyResult')}
                                />
                            ) : null}
                        </div>
                        <textarea
                            id="json-result"
                            className={textareaClassName}
                            value={result}
                            readOnly
                            placeholder={t('json.resultPlaceholder')}
                        />
                    </div>
                </div>
            </section>
        </section>
    );
}
