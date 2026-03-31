'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { CopyButton } from '@/components/CopyButton';
import { ModuleIntro } from '@/components/ModuleIntro';
import { Select } from '@/components/Select';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';

const inputClassName =
    'w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const textareaClassName =
    'h-full min-h-64 w-full rounded-2xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-3xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const tabClassName = 'rounded-full border px-3 py-1.5 text-body-sm transition whitespace-nowrap';

const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((method) => ({
    label: method,
    value: method,
}));

type HttpResponsePayload = {
    body: string;
    contentType: string;
    durationMs: number;
    finalUrl: string;
    headers: Record<string, string>;
    ok: boolean;
    status: number;
    statusText: string;
    truncated: boolean;
};

type RequestEditorTab = 'headers' | 'body';
type ResponseViewerTab = 'body' | 'headers';

function stringifyHeaders(headers: Record<string, string>) {
    return JSON.stringify(headers, null, 2);
}

function getStatusToneClass(status: number) {
    if (status >= 200 && status < 300) {
        return 'border-primary-200 bg-primary-100 text-primary-700';
    }

    if (status >= 300 && status < 400) {
        return 'border-[rgba(217,119,6,0.18)] bg-[rgba(245,158,11,0.12)] text-[rgb(180,83,9)]';
    }

    return 'border-[rgba(235,51,51,0.18)] bg-[rgba(235,51,51,0.08)] text-error';
}

export function HttpTestTool() {
    const { language, t } = useI18n();
    const [method, setMethod] = useState('GET');
    const [url, setUrl] = useState('https://httpbin.org/anything');
    const [headersText, setHeadersText] = useState('{\n  "Accept": "application/json"\n}');
    const [bodyText, setBodyText] = useState('');
    const [responseData, setResponseData] = useState<HttpResponsePayload | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [requestTab, setRequestTab] = useState<RequestEditorTab>('headers');
    const [responseTab, setResponseTab] = useState<ResponseViewerTab>('body');

    const responseHeaders = useMemo(() => (responseData ? stringifyHeaders(responseData.headers) : ''), [responseData]);
    const bodyDisabled = method === 'GET' || method === 'HEAD';
    const responseBodyText = responseData
        ? responseData.body
            ? responseData.truncated
                ? `${responseData.body}\n\n${t('httpTest.truncated')}`
                : responseData.body
            : t('httpTest.emptyBody')
        : '';

    async function handleSend() {
        if (!/^https?:\/\//i.test(url.trim())) {
            setError(t('httpTest.invalidUrl'));
            setResponseData(null);
            return;
        }

        let parsedHeaders: Record<string, string> = {};

        try {
            const parsed = headersText.trim() ? JSON.parse(headersText) : {};

            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                parsedHeaders = Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, String(value)]));
            } else {
                throw new Error();
            }
        } catch {
            setError(t('httpTest.invalidHeaders'));
            setResponseData(null);
            setRequestTab('headers');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/http-request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    body: bodyDisabled ? '' : bodyText,
                    headers: parsedHeaders,
                    language,
                    method,
                    url,
                }),
            });

            const payload = (await response.json()) as HttpResponsePayload | { message?: string };

            if (!response.ok) {
                throw new Error(
                    'message' in payload ? payload.message || t('api.requestFailed') : t('api.requestFailed'),
                );
            }

            setResponseData(payload as HttpResponsePayload);
            setResponseTab('body');
        } catch (requestError) {
            setResponseData(null);
            setError(requestError instanceof Error ? requestError.message : t('api.requestFailed'));
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="space-y-4">
            <ModuleIntro badge="HTTP" title={t('httpTest.introTitle')} description={t('httpTest.introDescription')} />

            <section className={cn(panelClassName, 'space-y-4')}>
                <section className="grid gap-3 lg:grid-cols-[8.5rem_minmax(0,1fr)_auto]">
                    <Select
                        className="h-12"
                        value={method}
                        options={methodOptions}
                        onValueChange={(value) => {
                            setMethod(value);

                            if (value === 'GET' || value === 'HEAD') {
                                setRequestTab('headers');
                            }
                        }}
                    />

                    <input
                        className={cn(inputClassName, 'h-12')}
                        value={url}
                        onChange={(event) => {
                            setUrl(event.target.value);
                        }}
                        placeholder={t('httpTest.urlPlaceholder')}
                    />

                    <div className="flex flex-wrap gap-2">
                        <Button loading={loading} className="h-12 px-5" onClick={() => void handleSend()}>
                            {t('httpTest.send')}
                        </Button>
                    </div>
                </section>

                {error && (
                    <p className="rounded-2xl border border-error bg-[rgba(235,51,51,0.08)] px-4 py-3 text-body-pc-md text-error">
                        {error}
                    </p>
                )}
            </section>

            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <section className={cn(panelClassName, 'min-h-0')}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('httpTest.requestTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('httpTest.requestDescription')}</p>
                        </div>

                        <div className="inline-flex rounded-full border border-neutral-j bg-fill-b p-1">
                            <button
                                type="button"
                                className={cn(
                                    tabClassName,
                                    requestTab === 'headers'
                                        ? 'border-primary-200 bg-primary-100 text-primary-700'
                                        : 'border-transparent text-text-d hover:bg-fill-a',
                                )}
                                onClick={() => {
                                    setRequestTab('headers');
                                }}
                            >
                                {t('httpTest.headers')}
                            </button>
                            <button
                                type="button"
                                className={cn(
                                    tabClassName,
                                    requestTab === 'body'
                                        ? 'border-primary-200 bg-primary-100 text-primary-700'
                                        : 'border-transparent text-text-d hover:bg-fill-a',
                                )}
                                onClick={() => {
                                    setRequestTab('body');
                                }}
                            >
                                {t('httpTest.body')}
                            </button>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-4">
                        <div className="rounded-[1.5rem] border border-neutral-j bg-fill-b p-3">
                            {requestTab === 'headers' ? (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-body-sm text-text-c">{t('httpTest.headers')}</p>
                                        <CopyButton text={headersText} className="px-3 py-2 text-body-sm" />
                                    </div>
                                    <textarea
                                        className={textareaClassName}
                                        value={headersText}
                                        onChange={(event) => {
                                            setHeadersText(event.target.value);
                                        }}
                                        placeholder={t('httpTest.headersPlaceholder')}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-body-sm text-text-c">{t('httpTest.body')}</p>
                                        {!bodyDisabled && (
                                            <CopyButton text={bodyText} className="px-3 py-2 text-body-sm" />
                                        )}
                                    </div>
                                    <textarea
                                        className={cn(
                                            textareaClassName,
                                            bodyDisabled && 'cursor-not-allowed opacity-60',
                                        )}
                                        value={bodyDisabled ? '' : bodyText}
                                        onChange={(event) => {
                                            setBodyText(event.target.value);
                                        }}
                                        placeholder={t('httpTest.bodyPlaceholder')}
                                        disabled={bodyDisabled}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={cn(panelClassName, 'min-h-0')}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('httpTest.responseTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('httpTest.responseDescription')}</p>
                        </div>

                        {responseData && (
                            <div
                                className={cn(
                                    'rounded-full border px-4 py-2 text-body-sm',
                                    getStatusToneClass(responseData.status),
                                )}
                            >
                                {`${responseData.status} ${responseData.statusText}`}
                            </div>
                        )}
                    </div>

                    {responseData ? (
                        <div className="mt-4 grid gap-4">
                            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                <div className="rounded-2xl border border-neutral-j bg-fill-b px-4 py-3">
                                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                        {t('httpTest.status')}
                                    </p>
                                    <p className="mt-1.5 text-body-pc-md text-text-e">{responseData.status}</p>
                                </div>
                                <div className="rounded-2xl border border-neutral-j bg-fill-b px-4 py-3">
                                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                        {t('httpTest.duration')}
                                    </p>
                                    <p className="mt-1.5 text-body-pc-md text-text-e">{`${responseData.durationMs.toFixed(1)} ms`}</p>
                                </div>
                                <div className="rounded-2xl border border-neutral-j bg-fill-b px-4 py-3 sm:col-span-2">
                                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                        {t('httpTest.contentType')}
                                    </p>
                                    <p className="mt-1.5 break-all text-body-pc-md text-text-e">
                                        {responseData.contentType || '--'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-neutral-j bg-fill-b px-4 py-3 sm:col-span-2 xl:col-span-4">
                                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                        {t('httpTest.finalUrl')}
                                    </p>
                                    <p className="mt-1.5 break-all text-body-pc-md text-text-e">
                                        {responseData.finalUrl}
                                    </p>
                                </div>
                            </div>

                            <div className="inline-flex w-fit rounded-full border border-neutral-j bg-fill-b p-1">
                                <button
                                    type="button"
                                    className={cn(
                                        tabClassName,
                                        responseTab === 'body'
                                            ? 'border-primary-200 bg-primary-100 text-primary-700'
                                            : 'border-transparent text-text-d hover:bg-fill-a',
                                    )}
                                    onClick={() => {
                                        setResponseTab('body');
                                    }}
                                >
                                    {t('httpTest.responseBody')}
                                </button>
                                <button
                                    type="button"
                                    className={cn(
                                        tabClassName,
                                        responseTab === 'headers'
                                            ? 'border-primary-200 bg-primary-100 text-primary-700'
                                            : 'border-transparent text-text-d hover:bg-fill-a',
                                    )}
                                    onClick={() => {
                                        setResponseTab('headers');
                                    }}
                                >
                                    {t('httpTest.responseHeaders')}
                                </button>
                            </div>

                            <div className="rounded-[1.5rem] border border-neutral-j bg-fill-b p-3">
                                {responseTab === 'body' ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-body-sm text-text-c">{t('httpTest.responseBody')}</p>
                                            <CopyButton text={responseBodyText} className="px-3 py-2 text-body-sm" />
                                        </div>
                                        <textarea className={textareaClassName} value={responseBodyText} readOnly />
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-body-sm text-text-c">{t('httpTest.responseHeaders')}</p>
                                            <CopyButton text={responseHeaders} className="px-3 py-2 text-body-sm" />
                                        </div>
                                        <textarea className={textareaClassName} value={responseHeaders} readOnly />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 rounded-[1.5rem] border border-dashed border-primary-200 bg-primary-100/40 px-4 py-12 text-center text-body-pc-md text-text-d">
                            {t('httpTest.waiting')}
                        </div>
                    )}
                </section>
            </section>
        </section>
    );
}
