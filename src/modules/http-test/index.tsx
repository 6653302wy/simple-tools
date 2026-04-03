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
    'h-full min-h-0 w-full flex-1 rounded-2xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const responseTextareaClassName =
    'h-full min-h-[22rem] w-full flex-1 rounded-[1.5rem] border border-neutral-j bg-fill-a px-4 py-4 text-body-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-3xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const tabClassName = 'rounded-full border px-3 py-1.5 text-body-sm transition whitespace-nowrap';

const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((method) => ({
    label: method,
    value: method,
}));
const contentTypeOptions = [
    { label: 'None', value: 'none' },
    { label: 'JSON (application/json)', value: 'application/json' },
    {
        label: 'Form URL Encoded (application/x-www-form-urlencoded)',
        value: 'application/x-www-form-urlencoded',
    },
    { label: 'Form Data (multipart/form-data)', value: 'multipart/form-data' },
    { label: 'Plain Text (text/plain)', value: 'text/plain' },
    { label: 'HTML (text/html)', value: 'text/html' },
    { label: 'XML (application/xml)', value: 'application/xml' },
    { label: 'XML (text/xml)', value: 'text/xml' },
    { label: 'Binary (application/octet-stream)', value: 'application/octet-stream' },
];

type HttpResponsePayload = {
    body: string;
    durationMs: number;
    headers: Record<string, string>;
    ok: boolean;
    responseBytes: number;
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

function getBodyPlaceholder(contentType: string, fallback: string) {
    switch (contentType) {
        case 'application/json':
            return '{\n  "name": "simple-tools"\n}';
        case 'application/x-www-form-urlencoded':
            return 'name=simple-tools&lang=zh';
        case 'multipart/form-data':
            return 'name=simple-tools\nlang=zh';
        case 'text/plain':
            return 'plain text payload';
        case 'text/html':
            return '<div>Hello HTTP</div>';
        case 'application/xml':
        case 'text/xml':
            return '<root>\n  <name>simple-tools</name>\n</root>';
        case 'application/octet-stream':
            return 'raw-binary-content';
        default:
            return fallback;
    }
}

function syncHeadersWithContentType(headersText: string, nextContentType: string) {
    let nextHeaders: Record<string, string> = {};

    try {
        const parsed = headersText.trim() ? JSON.parse(headersText) : {};

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            nextHeaders = Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, String(value)]));
        }
    } catch {
        nextHeaders = {};
    }

    if (nextContentType === 'none') {
        delete nextHeaders['Content-Type'];
        delete nextHeaders['content-type'];
    } else {
        delete nextHeaders['content-type'];
        nextHeaders['Content-Type'] = nextContentType;
    }

    return JSON.stringify(nextHeaders, null, 2);
}

export function HttpTestTool() {
    const { language, t } = useI18n();
    const [method, setMethod] = useState('GET');
    const [contentType, setContentType] = useState('application/json');
    const [url, setUrl] = useState('https://httpbin.org/anything');
    const [headersText, setHeadersText] = useState(
        '{\n  "Accept": "application/json",\n  "Content-Type": "application/json"\n}',
    );
    const [bodyText, setBodyText] = useState('');
    const [responseData, setResponseData] = useState<HttpResponsePayload | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [requestTab, setRequestTab] = useState<RequestEditorTab>('headers');
    const [responseTab, setResponseTab] = useState<ResponseViewerTab>('body');

    const responseHeaders = useMemo(() => (responseData ? stringifyHeaders(responseData.headers) : ''), [responseData]);
    const bodyDisabled = method === 'GET' || method === 'HEAD';
    const responseHeaderCount = responseData ? Object.keys(responseData.headers).length : 0;
    const bodyPlaceholder = getBodyPlaceholder(contentType, t('httpTest.bodyPlaceholder'));
    const responseBodyText = responseData
        ? responseData.body
            ? responseData.truncated
                ? `${responseData.body}\n\n${t('httpTest.truncated')}`
                : responseData.body
            : t('httpTest.emptyBody')
        : '';
    const responseCopyText = responseTab === 'headers' ? responseHeaders : responseBodyText;

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
                    contentType: contentType === 'none' ? '' : contentType,
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
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="HTTP" title={t('httpTest.introTitle')} description={t('httpTest.introDescription')} />

            <section className={cn(panelClassName, 'space-y-4')}>
                <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-[8.5rem_14rem_minmax(0,1fr)_auto]">
                    <div className="space-y-2">
                        <p className="text-body-sm text-text-c">{t('httpTest.method')}</p>
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
                    </div>

                    <div className="space-y-2">
                        <p className="text-body-sm text-text-c">{t('httpTest.contentType')}</p>
                        <Select
                            className="h-12"
                            value={contentType}
                            options={contentTypeOptions.map((item) => ({
                                label: item.value === 'none' ? t('httpTest.contentTypeNone') : item.label,
                                value: item.value,
                            }))}
                            onValueChange={(value) => {
                                setContentType(value);
                                setHeadersText((current) => syncHeadersWithContentType(current, value));
                            }}
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-body-sm text-text-c">{t('httpTest.url')}</p>
                        <input
                            className={cn(inputClassName, 'h-12')}
                            value={url}
                            onChange={(event) => {
                                setUrl(event.target.value);
                            }}
                            placeholder={t('httpTest.urlPlaceholder')}
                        />
                    </div>

                    <div className="flex items-end">
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

            <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <section className={cn(panelClassName, 'flex min-h-0 flex-col')}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('httpTest.requestTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('httpTest.requestDescription')}</p>
                        </div>

                        <div className="inline-flex rounded-full border border-neutral-j bg-fill-b p-1">
                            <Button
                                variant="plain"
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
                            </Button>
                            <Button
                                variant="plain"
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
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 grid min-h-0 flex-1 gap-4">
                        <div className="flex min-h-0 flex-1 flex-col rounded-[1.5rem] border border-neutral-j bg-fill-b p-3">
                            {requestTab === 'headers' ? (
                                <div className="flex min-h-0 flex-1 flex-col gap-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-body-sm text-text-c">{t('httpTest.headers')}</p>
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
                                <div className="flex min-h-0 flex-1 flex-col gap-2">
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-body-sm text-text-c">{t('httpTest.body')}</p>
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
                                        placeholder={bodyPlaceholder}
                                        disabled={bodyDisabled}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={cn(panelClassName, 'flex min-h-0 flex-col')}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-title-md text-text-e">{t('httpTest.responseTitle')}</p>
                            <p className="mt-1 text-body-sm text-text-d">{t('httpTest.responseDescription')}</p>
                        </div>

                        {responseData && (
                            <div className="flex items-center gap-2">
                                <CopyButton text={responseCopyText} className="self-center" />
                                <div
                                    className={cn(
                                        'rounded-full border px-3 py-1.5 text-body-xs',
                                        getStatusToneClass(responseData.status),
                                    )}
                                >
                                    {`${responseData.status} ${responseData.statusText}`}
                                </div>
                            </div>
                        )}
                    </div>

                    {responseData ? (
                        <div className="mt-4 grid min-h-0 flex-1 gap-4">
                            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                                <div className="rounded-[1.25rem] border border-neutral-j bg-fill-b px-3 py-2.5">
                                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                        {t('httpTest.duration')}
                                    </p>
                                    <p className="mt-1 text-body-sm text-text-e">{`${responseData.durationMs.toFixed(1)} ms`}</p>
                                </div>
                                <div className="rounded-[1.25rem] border border-neutral-j bg-fill-b px-3 py-2.5">
                                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                        {t('httpTest.responseSize')}
                                    </p>
                                    <p className="mt-1 text-body-sm text-text-e">{`${responseData.responseBytes} B`}</p>
                                </div>
                                <div className="rounded-[1.25rem] border border-neutral-j bg-fill-b px-3 py-2.5">
                                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                        {t('httpTest.responseHeadersCount')}
                                    </p>
                                    <p className="mt-1 text-body-sm text-text-e">{responseHeaderCount}</p>
                                </div>
                            </div>

                            <div className="inline-flex w-fit rounded-full border border-neutral-j bg-fill-b p-0.5">
                                <Button
                                    variant="plain"
                                    className={cn(
                                        'rounded-full border px-2.5 py-1 text-body-xs transition whitespace-nowrap',
                                        responseTab === 'body'
                                            ? 'border-primary-200 bg-primary-100 text-primary-700'
                                            : 'border-transparent text-text-d hover:bg-fill-a',
                                    )}
                                    onClick={() => {
                                        setResponseTab('body');
                                    }}
                                >
                                    {t('httpTest.responseBody')}
                                </Button>
                                <Button
                                    variant="plain"
                                    className={cn(
                                        'rounded-full border px-2.5 py-1 text-body-xs transition whitespace-nowrap',
                                        responseTab === 'headers'
                                            ? 'border-primary-200 bg-primary-100 text-primary-700'
                                            : 'border-transparent text-text-d hover:bg-fill-a',
                                    )}
                                    onClick={() => {
                                        setResponseTab('headers');
                                    }}
                                >
                                    {t('httpTest.responseHeaders')}
                                </Button>
                            </div>

                            <div className="flex min-h-0 flex-1 flex-col rounded-[1.5rem] border border-neutral-j bg-fill-b p-3">
                                {responseTab === 'body' ? (
                                    <div className="flex min-h-0 flex-1 flex-col gap-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-body-sm text-text-c">{t('httpTest.responseBody')}</p>
                                            <CopyButton text={responseBodyText} className="px-3 py-2 text-body-sm" />
                                        </div>
                                        <textarea
                                            className={responseTextareaClassName}
                                            value={responseBodyText}
                                            readOnly
                                        />
                                    </div>
                                ) : (
                                    <div className="flex min-h-0 flex-1 flex-col gap-2">
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="text-body-sm text-text-c">{t('httpTest.responseHeaders')}</p>
                                            <CopyButton text={responseHeaders} className="px-3 py-2 text-body-sm" />
                                        </div>
                                        <textarea
                                            className={responseTextareaClassName}
                                            value={responseHeaders}
                                            readOnly
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="mt-4 flex min-h-0 flex-1 items-center justify-center rounded-[1.5rem] border border-dashed border-primary-200 bg-primary-100/40 px-4 py-12 text-center text-body-pc-md text-text-d">
                            {t('httpTest.waiting')}
                        </div>
                    )}
                </section>
            </section>
        </section>
    );
}
