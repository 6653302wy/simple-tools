export type SocketStatus = 'idle' | 'connecting' | 'open' | 'closed' | 'error';

export type LogEntry = {
    type: 'incoming' | 'outgoing' | 'system';
    message: string;
    time: string;
};
