export const inputClassName =
    'w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
export const textareaClassName =
    'h-full min-h-0 w-full flex-1 rounded-2xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
export const responseTextareaClassName =
    'h-full min-h-0 w-full flex-1 rounded-[1.5rem] border border-neutral-j bg-fill-a px-4 py-4 text-body-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
export const tabClassName = 'rounded-full border px-3 py-1.5 text-body-sm transition whitespace-nowrap';

export const methodOptions = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'].map((method) => ({
    label: method,
    value: method,
}));

export const contentTypeOptions = [
    { label: 'None', value: 'none' },
    { label: 'JSON (application/json)', value: 'application/json' },
    {
        label: 'Form URL Encoded (application/x-www-form-urlencoded)',
        value: 'application/x-www-form-urlencoded',
    },
    { label: 'Form Data (multipart/form-data)', value: 'multipart/form-data' },
    { label: 'Plain Text (text/plain)', value: 'text/plain' },
    { label: 'HTML (text/html)', value: 'text/html' },
    { label: 'XML (application/xml)', value: 'application/xml' },
    { label: 'XML (text/xml)', value: 'text/xml' },
    { label: 'Binary (application/octet-stream)', value: 'application/octet-stream' },
];
