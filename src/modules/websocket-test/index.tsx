'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { CopyButton } from '@/components/CopyButton';
import { ModuleIntro } from '@/components/ModuleIntro';
import { ScrollArea } from '@/components/ScrollArea';
import { useI18n } from '@/services/i18n';

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const compactTextareaClassName =
    'mt-2 min-h-0 w-full flex-1 rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

type SocketStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

type LogEntry = {
    type: 'incoming' | 'outgoing' | 'system';
    message: string;
    time: string;
};

function nowLabel() {
    return new Date().toLocaleTimeString();
}

function getLogToneClass(type: LogEntry['type']) {
    if (type === 'incoming') {
        return 'border-primary-200 bg-primary-100/55';
    }

    if (type === 'outgoing') {
        return 'border-[rgba(59,130,246,0.18)] bg-[rgba(59,130,246,0.08)]';
    }

    return 'border-neutral-j bg-fill-b';
}

function getLogLabelClass(type: LogEntry['type']) {
    if (type === 'incoming') {
        return 'text-primary-700';
    }

    if (type === 'outgoing') {
        return 'text-[rgb(29,78,216)]';
    }

    return 'text-text-c';
}

export function WebSocketTestTool() {
    const { t } = useI18n();
    const socketRef = useRef<WebSocket | null>(null);
    const activeSocketIdRef = useRef(0);
    const [url, setUrl] = useState('wss://ws.postman-echo.com/raw');
    const [protocols, setProtocols] = useState('');
    const [messageInput, setMessageInput] = useState('');
    const [status, setStatus] = useState<SocketStatus>('idle');
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [error, setError] = useState('');

    useEffect(() => {
        return () => {
            socketRef.current?.close();
            socketRef.current = null;
        };
    }, []);

    const logText = useMemo(
        () => logs.map((entry) => `[${entry.time}] ${t(`websocket.${entry.type}`)}: ${entry.message}`).join('\n'),
        [logs, t],
    );

    function appendLog(type: LogEntry['type'], message: string) {
        setLogs((currentLogs) => [
            {
                type,
                message,
                time: nowLabel(),
            },
            ...currentLogs,
        ]);
    }

    function connectSocket() {
        if (!/^wss?:\/\//i.test(url.trim())) {
            setError(t('websocket.invalidUrl'));
            return;
        }

        try {
            activeSocketIdRef.current += 1;
            setError('');
            setStatus('connecting');
            socketRef.current?.close();

            const nextSocket = protocols.trim()
                ? new WebSocket(
                      url.trim(),
                      protocols
                          .split(',')
                          .map((item) => item.trim())
                          .filter(Boolean),
                  )
                : new WebSocket(url.trim());
            const socketId = activeSocketIdRef.current;

            nextSocket.onopen = () => {
                if (socketId !== activeSocketIdRef.current) {
                    return;
                }

                setStatus('open');
                setError('');
                appendLog('system', t('websocket.connected'));
            };

            nextSocket.onmessage = (event) => {
                if (socketId !== activeSocketIdRef.current) {
                    return;
                }

                appendLog('incoming', String(event.data));
            };

            nextSocket.onerror = () => {
                if (socketId !== activeSocketIdRef.current) {
                    return;
                }

                setStatus('error');
                setError(t('websocket.statusError'));
                appendLog('system', t('websocket.statusError'));
            };

            nextSocket.onclose = () => {
                if (socketId !== activeSocketIdRef.current) {
                    return;
                }

                setStatus('closed');
                socketRef.current = null;
                appendLog('system', t('websocket.disconnected'));
            };

            socketRef.current = nextSocket;
        } catch (socketError) {
            setStatus('error');
            setError(socketError instanceof Error ? socketError.message : t('websocket.invalidUrl'));
        }
    }

    function disconnectSocket() {
        activeSocketIdRef.current += 1;
        setStatus('closed');
        socketRef.current?.close();
        socketRef.current = null;
    }

    function sendMessage() {
        if (!messageInput.trim()) {
            setError(t('websocket.emptyMessage'));
            return;
        }

        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) {
            setError(t('websocket.sendFailed'));
            return;
        }

        socketRef.current.send(messageInput);
        appendLog('outgoing', messageInput);
        setMessageInput('');
        setError('');
    }

    const statusLabel = t(
        status === 'idle'
            ? 'websocket.statusIdle'
            : status === 'connecting'
              ? 'websocket.statusConnecting'
              : status === 'open'
                ? 'websocket.statusOpen'
                : status === 'closed'
                  ? 'websocket.statusClosed'
                  : 'websocket.statusError',
    );
    const canConnect = status !== 'connecting' && status !== 'open';
    const canDisconnect = status === 'connecting' || status === 'open' || socketRef.current !== null;
    const canSend = status === 'open';
    const isConnected = status === 'open';

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="WS" title={t('websocket.introTitle')} description={t('websocket.introDescription')} />

            <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
                <section className={`${panelClassName} flex min-h-0 flex-col overflow-hidden`}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('websocket.connectionTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('websocket.connectionDescription')}</p>
                        </div>
                        <div className="rounded-full border border-primary-200 bg-primary-100 px-4 py-2 text-body-sm text-primary-700">
                            {`${t('websocket.status')}: ${statusLabel}`}
                        </div>
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="ws-url">
                            {t('websocket.url')}
                        </label>
                        <input
                            id="ws-url"
                            className={inputClassName}
                            value={url}
                            onChange={(event) => {
                                setUrl(event.target.value);
                            }}
                            placeholder={t('websocket.urlPlaceholder')}
                        />
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="ws-protocols">
                            {t('websocket.protocols')}
                        </label>
                        <input
                            id="ws-protocols"
                            className={inputClassName}
                            value={protocols}
                            onChange={(event) => {
                                setProtocols(event.target.value);
                            }}
                            placeholder={t('websocket.protocolsPlaceholder')}
                        />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                            variant={isConnected ? 'secondary' : 'primary'}
                            disabled={!canConnect}
                            onClick={connectSocket}
                        >
                            {status === 'closed' || status === 'error'
                                ? t('websocket.reconnect')
                                : t('websocket.connect')}
                        </Button>
                        <Button
                            variant={isConnected ? 'primary' : 'secondary'}
                            disabled={!canDisconnect}
                            onClick={disconnectSocket}
                        >
                            {t('websocket.disconnect')}
                        </Button>
                    </div>

                    {error && (
                        <p className="mt-4 rounded-lg border border-error bg-[rgba(235,51,51,0.08)] px-4 py-3 text-body-pc-md text-error">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 flex min-h-0 flex-1 flex-col">
                        <p className="text-title-lg text-text-e">{t('websocket.messageTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('websocket.messageDescription')}</p>

                        <label className="mt-4 block text-body-sm text-text-c" htmlFor="ws-message">
                            {t('websocket.messageInput')}
                        </label>
                        <textarea
                            id="ws-message"
                            className={compactTextareaClassName}
                            value={messageInput}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' && !event.shiftKey) {
                                    event.preventDefault();
                                    sendMessage();
                                }
                            }}
                            onChange={(event) => {
                                setMessageInput(event.target.value);
                            }}
                            placeholder={t('websocket.messagePlaceholder')}
                        />

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button disabled={!canSend} onClick={sendMessage}>
                                {t('websocket.send')}
                            </Button>
                            <ClearButton
                                label={t('httpTest.clear')}
                                onClick={() => {
                                    setMessageInput('');
                                }}
                            />
                        </div>
                    </div>
                </section>

                <section className={`${panelClassName} flex min-h-0 flex-col overflow-hidden`}>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('websocket.logsTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('websocket.logsDescription')}</p>
                        </div>

                        <div className="flex gap-2">
                            {logs.length ? <CopyButton text={logText} className="px-3 py-2 text-body-sm" /> : null}
                            <ClearButton
                                className="px-3 py-2 text-body-sm"
                                label={t('websocket.clear')}
                                onClick={() => {
                                    setLogs([]);
                                }}
                            />
                        </div>
                    </div>

                    <div className="mt-4 h-[min(42rem,calc(100vh-22rem))] min-h-[20rem] min-w-0">
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
                </section>
            </section>
        </section>
    );
}
