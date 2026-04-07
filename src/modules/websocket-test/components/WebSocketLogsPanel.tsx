'use client';

import { ClearButton } from '@/components/ClearButton';
import { CopyButton } from '@/components/CopyButton';
import { ScrollArea } from '@/components/ScrollArea';
import { ToolPanel } from '@/components/ToolPanel';
import { useI18n } from '@/services/i18n';
import type { LogEntry } from '../types';
import { getLogLabelClass, getLogToneClass } from '../utils';

type WebSocketLogsPanelProps = {
    logs: LogEntry[];
    logText: string;
    onClear: () => void;
};

export function WebSocketLogsPanel({ logs, logText, onClear }: WebSocketLogsPanelProps) {
    const { t } = useI18n();

    return (
        <ToolPanel
            className="flex min-h-0 flex-col overflow-hidden"
            title={t('websocket.logsTitle')}
            description={t('websocket.logsDescription')}
            action={
                <div className="flex gap-2">
                    {logs.length ? <CopyButton text={logText} className="px-3 py-2 text-body-sm" /> : null}
                    <ClearButton className="px-3 py-2 text-body-sm" label={t('websocket.clear')} onClick={onClear} />
                </div>
            }
            bodyClassName="min-h-0 flex-1 p-4 pt-0"
        >
            <div className="h-[min(34rem,calc(100vh-26rem))] min-h-[16rem] min-w-0">
                {logs.length ? (
                    <ScrollArea
                        className="h-full rounded-xl border border-neutral-j bg-fill-b"
                        viewportClassName="h-full"
                        contentClassName="h-auto min-h-0 space-y-3 p-3"
                    >
                        {logs.map((entry, index) => (
                            <div
                                key={`${entry.time}-${index}`}
                                className={`rounded-xl border px-3 py-3 ${getLogToneClass(entry.type)}`}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <p
                                        className={`text-body-xs uppercase tracking-[0.18em] ${getLogLabelClass(entry.type)}`}
                                    >
                                        {t(`websocket.${entry.type}`)}
                                    </p>
                                    <p className="text-body-xs text-text-c">{entry.time}</p>
                                </div>
                                <p className="mt-1.5 break-all text-body-pc-md text-text-e">{entry.message}</p>
                            </div>
                        ))}
                    </ScrollArea>
                ) : (
                    <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-primary-200 bg-primary-100/40 px-4 py-8 text-center text-body-pc-md text-text-d">
                        {t('websocket.waiting')}
                    </div>
                )}
            </div>
        </ToolPanel>
    );
}
