'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';
import { HttpRequestPanel } from './components/HttpRequestPanel';
import { HttpResponsePanel } from './components/HttpResponsePanel';
import { inputClassName, methodOptions } from './constants';
import type { HttpResponsePayload, RequestEditorTab, ResponseViewerTab } from './types';
import { getBodyPlaceholder, stringifyHeaders, syncHeadersWithContentType } from './utils';

export function HttpTestClient() {
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
        <section className="flex min-h-0 flex-1 flex-col gap-4">
            <section className="rounded-3xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]">
                <div className="grid gap-3 xl:grid-cols-[11rem_minmax(0,1fr)_auto]">
                    <Select className="h-12" value={method} options={methodOptions} onValueChange={setMethod} />
                    <input
                        className={cn(
                            inputClassName,
                            'h-12 rounded-[2rem] px-6 text-body-pc-md font-normal text-text-d',
                        )}
                        value={url}
                        onChange={(event) => {
                            setUrl(event.target.value);
                        }}
                        placeholder={t('httpTest.urlPlaceholder')}
                    />
                    <Button
                        loading={loading}
                        className="h-12 w-full rounded-[2rem] px-7 xl:w-auto"
                        onClick={() => void handleSend()}
                    >
                        {t('httpTest.send')}
                    </Button>
                </div>

                {error ? (
                    <p className="mt-3 rounded-2xl border border-error bg-[rgba(235,51,51,0.08)] px-4 py-3 text-body-pc-md text-error">
                        {error}
                    </p>
                ) : null}
            </section>

            <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
                <HttpRequestPanel
                    contentType={contentType}
                    headersText={headersText}
                    bodyText={bodyText}
                    bodyDisabled={bodyDisabled}
                    bodyPlaceholder={bodyPlaceholder}
                    requestTab={requestTab}
                    onContentTypeChange={(value) => {
                        setContentType(value);
                        setHeadersText((current) => syncHeadersWithContentType(current, value));
                    }}
                    onHeadersChange={setHeadersText}
                    onBodyChange={setBodyText}
                    onRequestTabChange={setRequestTab}
                />

                <HttpResponsePanel
                    responseData={responseData}
                    responseHeaders={responseHeaders}
                    responseBodyText={responseBodyText}
                    responseHeaderCount={responseHeaderCount}
                    responseTab={responseTab}
                    responseCopyText={responseCopyText}
                    onResponseTabChange={setResponseTab}
                />
            </section>
        </section>
    );
}
