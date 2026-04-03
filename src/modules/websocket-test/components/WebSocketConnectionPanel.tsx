'use client';

import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { ToolPanel } from '@/components/ToolPanel';
import { useI18n } from '@/services/i18n';
import type { SocketStatus } from '../types';
import { compactTextareaClassName, inputClassName } from '../utils';

type WebSocketConnectionPanelProps = {
    url: string;
    protocols: string;
    messageInput: string;
    statusLabel: string;
    status: SocketStatus;
    error: string;
    canConnect: boolean;
    canDisconnect: boolean;
    canSend: boolean;
    isConnected: boolean;
    onUrlChange: (value: string) => void;
    onProtocolsChange: (value: string) => void;
    onMessageChange: (value: string) => void;
    onConnect: () => void;
    onDisconnect: () => void;
    onSend: () => void;
    onClearMessage: () => void;
};

export function WebSocketConnectionPanel({
    url,
    protocols,
    messageInput,
    statusLabel,
    status,
    error,
    canConnect,
    canDisconnect,
    canSend,
    isConnected,
    onUrlChange,
    onProtocolsChange,
    onMessageChange,
    onConnect,
    onDisconnect,
    onSend,
    onClearMessage,
}: WebSocketConnectionPanelProps) {
    const { t } = useI18n();

    return (
        <ToolPanel
            className="flex min-h-0 flex-col overflow-hidden"
            title={t('websocket.connectionTitle')}
            description={t('websocket.connectionDescription')}
            action={
                <div className="rounded-full border border-primary-200 bg-primary-100 px-4 py-2 text-body-sm text-primary-700">
                    {`${t('websocket.status')}: ${statusLabel}`}
                </div>
            }
            bodyClassName="min-h-0 flex-1 p-4 pt-0"
        >
            <div className="min-h-0 flex-1">
                <div>
                    <label className="text-body-sm text-text-c" htmlFor="ws-url">
                        {t('websocket.url')}
                    </label>
                    <input
                        id="ws-url"
                        className={inputClassName}
                        value={url}
                        onChange={(event) => {
                            onUrlChange(event.target.value);
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
                            onProtocolsChange(event.target.value);
                        }}
                        placeholder={t('websocket.protocolsPlaceholder')}
                    />
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button variant={isConnected ? 'secondary' : 'primary'} disabled={!canConnect} onClick={onConnect}>
                        {status === 'closed' || status === 'error' ? t('websocket.reconnect') : t('websocket.connect')}
                    </Button>
                    <Button
                        variant={isConnected ? 'primary' : 'secondary'}
                        disabled={!canDisconnect}
                        onClick={onDisconnect}
                    >
                        {t('websocket.disconnect')}
                    </Button>
                </div>

                {error ? (
                    <p className="mt-4 rounded-lg border border-error bg-[rgba(235,51,51,0.08)] px-4 py-3 text-body-pc-md text-error">
                        {error}
                    </p>
                ) : null}

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
                                onSend();
                            }
                        }}
                        onChange={(event) => {
                            onMessageChange(event.target.value);
                        }}
                        placeholder={t('websocket.messagePlaceholder')}
                    />

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button disabled={!canSend} onClick={onSend}>
                            {t('websocket.send')}
                        </Button>
                        <ClearButton label={t('httpTest.clear')} onClick={onClearMessage} />
                    </div>
                </div>
            </div>
        </ToolPanel>
    );
}
