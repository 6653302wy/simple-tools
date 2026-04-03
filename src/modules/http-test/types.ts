export type HttpResponsePayload = {
    body: string;
    durationMs: number;
    headers: Record<string, string>;
    ok: boolean;
    responseBytes: number;
    status: number;
    statusText: string;
    truncated: boolean;
};

export type RequestEditorTab = 'headers' | 'body';
export type ResponseViewerTab = 'body' | 'headers';
