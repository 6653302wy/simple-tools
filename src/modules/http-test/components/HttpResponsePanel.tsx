'use client';

import { Button } from '@/components/Button';
import { CopyButton } from '@/components/CopyButton';
import { ToolPanel } from '@/components/ToolPanel';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';
import { responseTextareaClassName } from '../constants';
import type { HttpResponsePayload, ResponseViewerTab } from '../types';
import { getStatusToneClass } from '../utils';

type HttpResponsePanelProps = {
    responseData: HttpResponsePayload | null;
    responseHeaders: string;
    responseBodyText: string;
    responseHeaderCount: number;
    responseTab: ResponseViewerTab;
    responseCopyText: string;
    onResponseTabChange: (value: ResponseViewerTab) => void;
};

export function HttpResponsePanel({
    responseData,
    responseHeaders,
    responseBodyText,
    responseHeaderCount,
    responseTab,
    responseCopyText,
    onResponseTabChange,
}: HttpResponsePanelProps) {
    const { t } = useI18n();

    return (
        <ToolPanel
            className="flex h-full min-h-0 flex-col"
            title={<span className="text-title-md">{t('httpTest.responseTitle')}</span>}
            description={<span className="text-body-sm">{t('httpTest.responseDescription')}</span>}
            action={
                responseData ? (
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
                ) : null
            }
            bodyClassName="flex min-h-0 flex-1 flex-col p-4 pt-0"
        >
            {responseData ? (
                <div className="flex min-h-0 flex-1 flex-col gap-4">
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
                                onResponseTabChange('body');
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
                                onResponseTabChange('headers');
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
                                <textarea className={responseTextareaClassName} value={responseBodyText} readOnly />
                            </div>
                        ) : (
                            <div className="flex min-h-0 flex-1 flex-col gap-2">
                                <div className="flex items-center justify-between gap-3">
                                    <p className="text-body-sm text-text-c">{t('httpTest.responseHeaders')}</p>
                                    <CopyButton text={responseHeaders} className="px-3 py-2 text-body-sm" />
                                </div>
                                <textarea className={responseTextareaClassName} value={responseHeaders} readOnly />
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="flex h-full min-h-0 flex-1 items-center justify-center rounded-[1.5rem] border border-dashed border-primary-200 bg-primary-100/40 px-4 py-12 text-center text-body-pc-md text-text-d">
                    {t('httpTest.waiting')}
                </div>
            )}
        </ToolPanel>
    );
}
