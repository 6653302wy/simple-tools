'use client';

import { WebSocketConnectionPanel } from './components/WebSocketConnectionPanel';
import { WebSocketLogsPanel } from './components/WebSocketLogsPanel';
import { useWebSocketSession } from './hooks/useWebSocketSession';

export function WebSocketTestClient() {
    const {
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
    } = useWebSocketSession();

    return (
        <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <WebSocketConnectionPanel
                url={url}
                protocols={protocols}
                messageInput={messageInput}
                status={status}
                statusLabel={statusLabel}
                error={error}
                canConnect={canConnect}
                canDisconnect={canDisconnect}
                canSend={canSend}
                isConnected={isConnected}
                onUrlChange={setUrl}
                onProtocolsChange={setProtocols}
                onMessageChange={setMessageInput}
                onConnect={connectSocket}
                onDisconnect={disconnectSocket}
                onSend={sendMessage}
                onClearMessage={() => {
                    setMessageInput('');
                }}
            />

            <WebSocketLogsPanel
                logs={logs}
                logText={logText}
                onClear={() => {
                    setLogs([]);
                }}
            />
        </section>
    );
}
