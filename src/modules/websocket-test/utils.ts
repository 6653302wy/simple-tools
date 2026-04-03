import type { LogEntry, SocketStatus } from './types';

export const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
export const compactTextareaClassName =
    'mt-2 min-h-0 w-full flex-1 rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';

export function nowLabel() {
    return new Date().toLocaleTimeString();
}

export function getLogToneClass(type: LogEntry['type']) {
    if (type === 'incoming') {
        return 'border-primary-200 bg-primary-100/55';
    }

    if (type === 'outgoing') {
        return 'border-[rgba(59,130,246,0.18)] bg-[rgba(59,130,246,0.08)]';
    }

    return 'border-neutral-j bg-fill-b';
}

export function getLogLabelClass(type: LogEntry['type']) {
    if (type === 'incoming') {
        return 'text-primary-700';
    }

    if (type === 'outgoing') {
        return 'text-[rgb(29,78,216)]';
    }

    return 'text-text-c';
}

export function getSocketStatusKey(status: SocketStatus) {
    return status === 'idle'
        ? 'websocket.statusIdle'
        : status === 'connecting'
          ? 'websocket.statusConnecting'
          : status === 'open'
            ? 'websocket.statusOpen'
            : status === 'closed'
              ? 'websocket.statusClosed'
              : 'websocket.statusError';
}
