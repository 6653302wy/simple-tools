'use client';

import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { ToolPanel } from '@/components/ToolPanel';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';
import { contentTypeOptions, tabClassName, textareaClassName } from '../constants';
import type { RequestEditorTab } from '../types';

type HttpRequestPanelProps = {
    contentType: string;
    headersText: string;
    bodyText: string;
    bodyDisabled: boolean;
    bodyPlaceholder: string;
    requestTab: RequestEditorTab;
    onContentTypeChange: (value: string) => void;
    onHeadersChange: (value: string) => void;
    onBodyChange: (value: string) => void;
    onRequestTabChange: (value: RequestEditorTab) => void;
};

export function HttpRequestPanel({
    contentType,
    headersText,
    bodyText,
    bodyDisabled,
    bodyPlaceholder,
    requestTab,
    onContentTypeChange,
    onHeadersChange,
    onBodyChange,
    onRequestTabChange,
}: HttpRequestPanelProps) {
    const { t } = useI18n();

    return (
        <ToolPanel
            className="flex h-full min-h-0 flex-col"
            title={t('httpTest.requestTitle')}
            description={t('httpTest.requestDescription')}
            action={
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
                            onRequestTabChange('headers');
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
                            onRequestTabChange('body');
                        }}
                    >
                        {t('httpTest.body')}
                    </Button>
                </div>
            }
            bodyClassName="flex min-h-0 flex-1 flex-col p-4 pt-0"
        >
            <section className="flex min-h-0 flex-1 flex-col">
                <div className="flex min-h-0 flex-1 flex-col rounded-[1.5rem] border border-neutral-j bg-fill-b p-3">
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                        <p className="text-body-sm text-text-c">
                            {requestTab === 'headers' ? t('httpTest.headers') : t('httpTest.body')}
                        </p>
                        <div className="w-full sm:w-[18rem]">
                            <Select
                                className="h-11"
                                value={contentType}
                                options={contentTypeOptions.map((item) => ({
                                    label: item.value === 'none' ? t('httpTest.contentTypeNone') : item.label,
                                    value: item.value,
                                }))}
                                onValueChange={onContentTypeChange}
                            />
                        </div>
                    </div>

                    {requestTab === 'headers' ? (
                        <div className="flex min-h-0 flex-1 flex-col gap-2">
                            <textarea
                                className={textareaClassName}
                                value={headersText}
                                onChange={(event) => {
                                    onHeadersChange(event.target.value);
                                }}
                                placeholder={t('httpTest.headersPlaceholder')}
                            />
                        </div>
                    ) : (
                        <div className="flex min-h-0 flex-1 flex-col gap-2">
                            <textarea
                                className={cn(textareaClassName, bodyDisabled && 'cursor-not-allowed opacity-60')}
                                value={bodyDisabled ? '' : bodyText}
                                onChange={(event) => {
                                    onBodyChange(event.target.value);
                                }}
                                placeholder={bodyPlaceholder}
                                disabled={bodyDisabled}
                            />
                        </div>
                    )}
                </div>
            </section>
        </ToolPanel>
    );
}
