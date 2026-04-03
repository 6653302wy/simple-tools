export function stringifyHeaders(headers: Record<string, string>) {
    return JSON.stringify(headers, null, 2);
}

export function getStatusToneClass(status: number) {
    if (status >= 200 && status < 300) {
        return 'border-primary-200 bg-primary-100 text-primary-700';
    }

    if (status >= 300 && status < 400) {
        return 'border-[rgba(217,119,6,0.18)] bg-[rgba(245,158,11,0.12)] text-[rgb(180,83,9)]';
    }

    return 'border-[rgba(235,51,51,0.18)] bg-[rgba(235,51,51,0.08)] text-error';
}

export function getBodyPlaceholder(contentType: string, fallback: string) {
    switch (contentType) {
        case 'application/json':
            return '{\n  "name": "simple-tools"\n}';
        case 'application/x-www-form-urlencoded':
            return 'name=simple-tools&lang=zh';
        case 'multipart/form-data':
            return 'name=simple-tools\nlang=zh';
        case 'text/plain':
            return 'plain text payload';
        case 'text/html':
            return '<div>Hello HTTP</div>';
        case 'application/xml':
        case 'text/xml':
            return '<root>\n  <name>simple-tools</name>\n</root>';
        case 'application/octet-stream':
            return 'raw-binary-content';
        default:
            return fallback;
    }
}

export function syncHeadersWithContentType(headersText: string, nextContentType: string) {
    let nextHeaders: Record<string, string> = {};

    try {
        const parsed = headersText.trim() ? JSON.parse(headersText) : {};

        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            nextHeaders = Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, String(value)]));
        }
    } catch {
        nextHeaders = {};
    }

    if (nextContentType === 'none') {
        delete nextHeaders['Content-Type'];
        delete nextHeaders['content-type'];
    } else {
        delete nextHeaders['content-type'];
        nextHeaders['Content-Type'] = nextContentType;
    }

    return JSON.stringify(nextHeaders, null, 2);
}
