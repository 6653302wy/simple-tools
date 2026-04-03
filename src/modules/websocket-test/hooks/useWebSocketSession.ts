'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useI18n } from '@/services/i18n';
import type { LogEntry, SocketStatus } from '../types';
import { getSocketStatusKey, nowLabel } from '../utils';

export function useWebSocketSession() {
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

    const statusLabel = t(getSocketStatusKey(status));
    const canConnect = status !== 'connecting' && status !== 'open';
    const canDisconnect = status === 'connecting' || status === 'open' || socketRef.current !== null;
    const canSend = status === 'open';
    const isConnected = status === 'open';

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

    return {
        url,
        protocols,
        messageInput,
        status,
        statusLabel,
        logs,
        logText,
        error,
        canConnect,
        canDisconnect,
        canSend,
        isConnected,
        setUrl,
        setProtocols,
        setMessageInput,
        setLogs,
        connectSocket,
        disconnectSocket,
        sendMessage,
    };
}
