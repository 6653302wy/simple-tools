'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { CopyButton } from '@/components/CopyButton';
import { FileDropzone } from '@/components/FileDropzone';
import { useI18n } from '@/services/i18n';
import { useLeaveConfirm } from '@/services/useLeaveConfirm';
import type { ApiServiceConfig } from './generator';
import { detectSwaggerServices, generateSwaggerTypeScriptSdk } from './generator';

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const textareaClassName =
    'mt-2 min-h-0 w-full flex-1 rounded-xl border border-neutral-j bg-fill-b px-3 py-3 font-mono text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const compactTextareaClassName =
    'min-h-24 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 font-mono text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

type ZipFileEntry = {
    filename: string;
    content: string;
};

let crcTable: Uint32Array | null = null;

function readFileText(file: File) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(String(reader.result ?? ''));
        };
        reader.onerror = () => {
            reject(reader.error ?? new Error('File read failed.'));
        };
        reader.readAsText(file);
    });
}

function downloadTextFile(filename: string, content: string) {
    if (!content.trim()) {
        return;
    }

    const url = URL.createObjectURL(new Blob([content], { type: 'text/typescript;charset=utf-8' }));
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function getCrcTable() {
    if (crcTable) {
        return crcTable;
    }

    const table = new Uint32Array(256);

    for (let index = 0; index < table.length; index += 1) {
        let value = index;

        for (let bit = 0; bit < 8; bit += 1) {
            value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
        }

        table[index] = value >>> 0;
    }

    crcTable = table;
    return table;
}

function getCrc32(bytes: Uint8Array) {
    const table = getCrcTable();
    let crc = 0xffffffff;

    for (const byte of bytes) {
        crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }

    return (crc ^ 0xffffffff) >>> 0;
}

function getDosDateTime(date = new Date()) {
    const year = Math.max(1980, date.getFullYear());
    const dosTime = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
    const dosDate = ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();

    return { dosDate, dosTime };
}

function writeUint16(view: DataView, offset: number, value: number) {
    view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number) {
    view.setUint32(offset, value, true);
}

function concatBytes(chunks: Uint8Array<ArrayBuffer>[]) {
    const totalLength = chunks.reduce((total, chunk) => total + chunk.length, 0);
    const output = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
        output.set(chunk, offset);
        offset += chunk.length;
    }

    return output.buffer;
}

function createZipBlob(files: ZipFileEntry[]) {
    const encoder = new TextEncoder();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    const centralDirectoryChunks: Uint8Array<ArrayBuffer>[] = [];
    const { dosDate, dosTime } = getDosDateTime();
    let offset = 0;

    for (const file of files) {
        const nameBytes = encoder.encode(file.filename);
        const contentBytes = encoder.encode(file.content);
        const crc = getCrc32(contentBytes);

        const localHeader = new Uint8Array(30 + nameBytes.length);
        const localView = new DataView(localHeader.buffer);
        writeUint32(localView, 0, 0x04034b50);
        writeUint16(localView, 4, 20);
        writeUint16(localView, 6, 0x0800);
        writeUint16(localView, 8, 0);
        writeUint16(localView, 10, dosTime);
        writeUint16(localView, 12, dosDate);
        writeUint32(localView, 14, crc);
        writeUint32(localView, 18, contentBytes.length);
        writeUint32(localView, 22, contentBytes.length);
        writeUint16(localView, 26, nameBytes.length);
        writeUint16(localView, 28, 0);
        localHeader.set(nameBytes, 30);
        chunks.push(localHeader, contentBytes);

        const centralHeader = new Uint8Array(46 + nameBytes.length);
        const centralView = new DataView(centralHeader.buffer);
        writeUint32(centralView, 0, 0x02014b50);
        writeUint16(centralView, 4, 20);
        writeUint16(centralView, 6, 20);
        writeUint16(centralView, 8, 0x0800);
        writeUint16(centralView, 10, 0);
        writeUint16(centralView, 12, dosTime);
        writeUint16(centralView, 14, dosDate);
        writeUint32(centralView, 16, crc);
        writeUint32(centralView, 20, contentBytes.length);
        writeUint32(centralView, 24, contentBytes.length);
        writeUint16(centralView, 28, nameBytes.length);
        writeUint16(centralView, 30, 0);
        writeUint16(centralView, 32, 0);
        writeUint16(centralView, 34, 0);
        writeUint16(centralView, 36, 0);
        writeUint32(centralView, 38, 0);
        writeUint32(centralView, 42, offset);
        centralHeader.set(nameBytes, 46);
        centralDirectoryChunks.push(centralHeader);

        offset += localHeader.length + contentBytes.length;
    }

    const centralDirectoryOffset = offset;
    const centralDirectorySize = centralDirectoryChunks.reduce((total, chunk) => total + chunk.length, 0);
    const endRecord = new Uint8Array(22);
    const endView = new DataView(endRecord.buffer);
    writeUint32(endView, 0, 0x06054b50);
    writeUint16(endView, 8, files.length);
    writeUint16(endView, 10, files.length);
    writeUint32(endView, 12, centralDirectorySize);
    writeUint32(endView, 16, centralDirectoryOffset);
    writeUint16(endView, 20, 0);

    return new Blob([concatBytes([...chunks, ...centralDirectoryChunks, endRecord])], { type: 'application/zip' });
}

function downloadZipFile(filename: string, files: ZipFileEntry[]) {
    const validFiles = files.filter((file) => file.content.trim());

    if (!validFiles.length) {
        return;
    }

    const url = URL.createObjectURL(createZipBlob(validFiles));
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function parseRequestHeaders(value: string) {
    if (!value.trim()) {
        return {};
    }

    const parsed = JSON.parse(value) as unknown;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('invalid_headers');
    }

    const headers: Record<string, string> = {};

    for (const [key, headerValue] of Object.entries(parsed)) {
        if (!key.trim() || headerValue === undefined || headerValue === null || typeof headerValue === 'object') {
            throw new Error('invalid_headers');
        }

        headers[key] = String(headerValue);
    }

    return headers;
}

export function SwaggerCodegenClient() {
    const { language, t } = useI18n();
    const [swaggerUrl, setSwaggerUrl] = useState('');
    const [source, setSource] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [requestHeaders, setRequestHeaders] = useState('');
    const [services, setServices] = useState<ApiServiceConfig[]>([]);
    const [servicesVisible, setServicesVisible] = useState(false);
    const [detectedSourceUrl, setDetectedSourceUrl] = useState('');
    const [customRequestFunction, setCustomRequestFunction] = useState('');
    const [models, setModels] = useState('');
    const [apis, setApis] = useState('');
    const [sourceLabel, setSourceLabel] = useState(t('swagger.sourceEmpty'));
    const [status, setStatus] = useState(t('swagger.statusIdle'));
    const [detectingServices, setDetectingServices] = useState(false);
    const [generating, setGenerating] = useState(false);
    const { setGuard } = useLeaveConfirm();
    const hasResult = Boolean(models || apis);
    const isDirty = Boolean(
        source.trim() ||
            baseUrl.trim() ||
            requestHeaders.trim() ||
            services.length > 0 ||
            customRequestFunction.trim() ||
            hasResult,
    );

    useEffect(() => {
        setGuard({
            active: isDirty,
            title: t('swagger.dirtyTitle'),
            description: t('swagger.dirtyDescription'),
        });

        return () => {
            setGuard({
                active: false,
                title: '',
                description: '',
            });
        };
    }, [isDirty, setGuard, t]);

    async function handleFileSelect(files: FileList) {
        const file = files[0];

        if (!file) {
            return;
        }

        try {
            const fileText = await readFileText(file);

            setSource(fileText);
            setSourceLabel(t('swagger.localFileSource', { name: file.name }));
            setStatus(t('swagger.statusLoaded'));
            setDetectedSourceUrl('');
            void detectServicesFromSource(fileText);
        } catch {
            setStatus(t('swagger.fileReadFailed'));
        }
    }

    function getServiceDetectionBaseUrl(sourceUrl = '') {
        for (const value of [baseUrl.trim(), sourceUrl.trim(), swaggerUrl.trim(), 'https://api.example.com']) {
            try {
                return new URL(value).toString();
            } catch {
                // Try the next available source.
            }
        }

        return 'https://api.example.com';
    }

    function applyDetectedServices(sourceText: string, sourceUrl = '') {
        const detectedServices = detectSwaggerServices({
            baseUrl: getServiceDetectionBaseUrl(sourceUrl),
            sourceUrl,
            spec: JSON.parse(sourceText),
        });

        setServices(detectedServices);
        setServicesVisible(true);
        setStatus(t('swagger.statusServicesDetected', { services: detectedServices.length }));
    }

    async function detectServicesFromSource(sourceText: string, sourceUrl = '') {
        try {
            setDetectingServices(true);
            setStatus(t('swagger.statusDetectingServices'));
            applyDetectedServices(sourceText, sourceUrl);
        } catch {
            setServices([]);
            setServicesVisible(false);
            setStatus(t('swagger.servicesDetectFailed'));
        } finally {
            setDetectingServices(false);
        }
    }

    function getServicesForGenerate() {
        if (!servicesVisible) {
            return [];
        }

        return services.map((service, index) => {
            const baseUrl = service.baseUrl.trim();

            if (!baseUrl) {
                throw new Error('invalid_services');
            }

            return {
                baseUrl,
                key: service.key?.trim(),
                name: service.name?.trim() || t('swagger.serviceFallbackName', { index: index + 1 }),
            };
        });
    }

    function updateService(index: number, field: 'baseUrl' | 'name', value: string) {
        setServices((currentServices) =>
            currentServices.map((service, serviceIndex) =>
                serviceIndex === index
                    ? {
                          ...service,
                          [field]: value,
                      }
                    : service,
            ),
        );
    }

    function addService() {
        setServicesVisible(true);
        setServices((currentServices) => [
            ...currentServices,
            {
                baseUrl: '',
                name: t('swagger.serviceFallbackName', { index: currentServices.length + 1 }),
            },
        ]);
    }

    function removeService(index: number) {
        setServices((currentServices) => currentServices.filter((_, serviceIndex) => serviceIndex !== index));
    }

    async function fetchRemoteSourceText() {
        const params = new URLSearchParams({
            lang: language,
            url: swaggerUrl.trim(),
        });
        const response = await fetch(`/api/swagger-source?${params.toString()}`);
        const payload = (await response.json()) as { content?: string; message?: string };

        if (!response.ok) {
            throw new Error(payload.message || t('swagger.fetchFailed'));
        }

        return payload.content ?? '';
    }

    async function handleDetectServicesFromUrl() {
        const normalizedSwaggerUrl = swaggerUrl.trim();

        if (
            !normalizedSwaggerUrl ||
            detectingServices ||
            (servicesVisible && detectedSourceUrl === normalizedSwaggerUrl)
        ) {
            return;
        }

        try {
            setDetectingServices(true);
            setStatus(t('swagger.statusDetectingServices'));
            const sourceText = await fetchRemoteSourceText();

            setSource(sourceText);
            setSourceLabel(t('swagger.remoteUrlSource'));
            applyDetectedServices(sourceText, normalizedSwaggerUrl);
            setDetectedSourceUrl(normalizedSwaggerUrl);
        } catch (error) {
            setServices([]);
            setServicesVisible(false);
            setStatus(error instanceof Error ? error.message : t('swagger.servicesDetectFailed'));
        } finally {
            setDetectingServices(false);
        }
    }

    async function resolveSourceText() {
        if (!swaggerUrl.trim()) {
            return source;
        }

        const sourceText = await fetchRemoteSourceText();

        setSource(sourceText);
        setSourceLabel(t('swagger.remoteUrlSource'));

        return sourceText;
    }

    async function handleGenerate() {
        if (!swaggerUrl.trim() && !source.trim()) {
            setStatus(t('swagger.emptySource'));
            return;
        }

        if (!baseUrl.trim()) {
            setStatus(t('swagger.emptyBaseUrl'));
            return;
        }

        try {
            setGenerating(true);
            setStatus(swaggerUrl.trim() ? t('swagger.statusFetching') : t('swagger.statusGenerating'));
            const parsedRequestHeaders = parseRequestHeaders(requestHeaders);
            const parsedServices = getServicesForGenerate();
            const sourceText = await resolveSourceText();
            const generated = generateSwaggerTypeScriptSdk({
                baseUrl,
                customRequestFunction,
                requestHeaders: parsedRequestHeaders,
                services: parsedServices,
                spec: JSON.parse(sourceText),
            });

            setModels(generated.models);
            setApis(generated.apis);
            setServices(generated.services);
            setServicesVisible(true);
            setStatus(
                t('swagger.statusGenerated', {
                    models: generated.summary.modelCount,
                    operations: generated.summary.operationCount,
                    services: generated.summary.serviceCount,
                    title: generated.summary.title,
                }),
            );
        } catch (error) {
            setModels('');
            setApis('');
            setStatus(
                error instanceof Error && error.message === 'invalid_headers'
                    ? t('swagger.headersInvalid')
                    : error instanceof Error && error.message === 'invalid_services'
                      ? t('swagger.servicesInvalid')
                      : error instanceof Error
                        ? error.message
                        : t('swagger.generateFailed'),
            );
        } finally {
            setGenerating(false);
        }
    }

    function handleClear() {
        setSwaggerUrl('');
        setSource('');
        setBaseUrl('');
        setRequestHeaders('');
        setServices([]);
        setServicesVisible(false);
        setDetectedSourceUrl('');
        setCustomRequestFunction('');
        setModels('');
        setApis('');
        setSourceLabel(t('swagger.sourceEmpty'));
        setStatus(t('swagger.statusIdle'));
    }

    return (
        <section className="flex min-h-0 flex-1 flex-col gap-4">
            <section className={`${panelClassName} grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,0.45fr)]`}>
                <div>
                    <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto_auto]">
                        <div className="min-w-0">
                            <label className="text-body-sm text-text-c" htmlFor="swagger-url">
                                {t('swagger.swaggerUrl')}
                            </label>
                            <input
                                id="swagger-url"
                                className={inputClassName}
                                value={swaggerUrl}
                                onChange={(event) => {
                                    setSwaggerUrl(event.target.value);
                                    setServices([]);
                                    setServicesVisible(false);
                                    setDetectedSourceUrl('');
                                }}
                                onBlur={() => {
                                    void handleDetectServicesFromUrl();
                                }}
                                onKeyDown={(event) => {
                                    if (event.key === 'Enter') {
                                        event.currentTarget.blur();
                                    }
                                }}
                                placeholder={t('swagger.swaggerUrlPlaceholder')}
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <span className="pb-[11px] text-body-sm text-text-d">{t('swagger.or')}</span>
                            <FileDropzone
                                accept="application/json,.json"
                                className="h-11"
                                label={t('swagger.uploadJson')}
                                onFilesSelect={(files) => {
                                    void handleFileSelect(files);
                                }}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button
                                loading={generating}
                                className="h-11"
                                onClick={() => {
                                    void handleGenerate();
                                }}
                            >
                                {t('swagger.generate')}
                            </Button>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-3 xl:grid-cols-2">
                        <div>
                            <label className="text-body-sm text-text-c" htmlFor="swagger-base-url">
                                {t('swagger.baseUrl')}
                            </label>
                            <input
                                id="swagger-base-url"
                                className={inputClassName}
                                value={baseUrl}
                                onChange={(event) => {
                                    setBaseUrl(event.target.value);
                                }}
                                placeholder={t('swagger.baseUrlPlaceholder')}
                            />
                        </div>
                        <div>
                            <label className="text-body-sm text-text-c" htmlFor="swagger-custom-request">
                                {t('swagger.customRequest')}
                            </label>
                            <input
                                id="swagger-custom-request"
                                className={inputClassName}
                                value={customRequestFunction}
                                onChange={(event) => {
                                    setCustomRequestFunction(event.target.value);
                                }}
                                placeholder={t('swagger.customRequestPlaceholder')}
                            />
                        </div>
                        <div className="xl:col-span-2">
                            <label className="text-body-sm text-text-c" htmlFor="swagger-request-headers">
                                {t('swagger.requestHeaders')}
                            </label>
                            <div className="relative mt-2">
                                <textarea
                                    id="swagger-request-headers"
                                    className={compactTextareaClassName}
                                    value={requestHeaders}
                                    onChange={(event) => {
                                        setRequestHeaders(event.target.value);
                                    }}
                                />
                                {!requestHeaders ? (
                                    <div className="pointer-events-none absolute left-3 top-2.5 whitespace-pre-wrap font-mono text-body-pc-md text-text-c">
                                        {t('swagger.requestHeadersPlaceholder')}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        {servicesVisible ? (
                            <div className="xl:col-span-2">
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-body-sm text-text-c">{t('swagger.services')}</label>
                                    <Button
                                        variant="secondary"
                                        className="px-3 py-1.5 text-body-sm"
                                        onClick={addService}
                                    >
                                        {t('swagger.addService')}
                                    </Button>
                                </div>
                                <div className="mt-2 overflow-hidden rounded-xl border border-neutral-j bg-fill-a">
                                    <table className="w-full table-fixed border-collapse">
                                        <thead className="bg-fill-b text-left text-body-sm text-text-c">
                                            <tr>
                                                <th className="w-[28%] border-r border-neutral-j px-3 py-2.5 font-semibold">
                                                    {t('swagger.serviceName')}
                                                </th>
                                                <th className="px-3 py-2.5 font-semibold">
                                                    {t('swagger.serviceBaseUrl')}
                                                </th>
                                                <th className="w-20 px-3 py-2.5 font-semibold">
                                                    {t('swagger.serviceAction')}
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {services.length > 0 ? (
                                                services.map((service, index) => (
                                                    <tr
                                                        className="border-t border-neutral-j text-body-pc-md text-text-e"
                                                        key={`${service.key ?? 'service'}-${index}`}
                                                    >
                                                        <td className="border-r border-neutral-j">
                                                            <input
                                                                className="w-full bg-transparent px-3 py-2.5 outline-none transition focus:bg-fill-b"
                                                                value={service.name ?? ''}
                                                                onChange={(event) => {
                                                                    updateService(index, 'name', event.target.value);
                                                                }}
                                                                placeholder={t('swagger.serviceNamePlaceholder')}
                                                            />
                                                        </td>
                                                        <td className="border-r border-neutral-j">
                                                            <input
                                                                className="w-full bg-transparent px-3 py-2.5 outline-none transition focus:bg-fill-b"
                                                                value={service.baseUrl}
                                                                onChange={(event) => {
                                                                    updateService(index, 'baseUrl', event.target.value);
                                                                }}
                                                                placeholder={t('swagger.serviceBaseUrlPlaceholder')}
                                                            />
                                                        </td>
                                                        <td className="px-2 py-1.5">
                                                            <Button
                                                                variant="plain"
                                                                className="px-2 py-1 text-body-sm text-error"
                                                                onClick={() => {
                                                                    removeService(index);
                                                                }}
                                                            >
                                                                {t('swagger.removeService')}
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr className="border-t border-neutral-j">
                                                    <td className="px-3 py-4 text-body-sm text-text-d" colSpan={3}>
                                                        {t('swagger.emptyServices')}
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-2xl border border-neutral-j bg-fill-b p-4">
                    <div>
                        <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">{t('swagger.status')}</p>
                        <p className="mt-2 text-body-pc-md text-text-e">{status}</p>
                        <p className="mt-3 text-body-sm text-text-d">{sourceLabel}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            disabled={!hasResult}
                            onClick={() => {
                                downloadZipFile('codegen-api.zip', [
                                    { filename: 'Models.ts', content: models },
                                    { filename: 'Apis.ts', content: apis },
                                ]);
                            }}
                        >
                            {t('swagger.downloadAll')}
                        </Button>
                        <ClearButton className="px-3 py-2 text-body-sm" disabled={!isDirty} onClick={handleClear} />
                    </div>
                </div>
            </section>

            <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-2">
                <section className={`${panelClassName} flex min-h-[34rem] flex-col`}>
                    <div className="flex min-h-12 items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <label className="text-body-sm text-text-c" htmlFor="swagger-apis-output">
                                Apis.ts
                            </label>
                            <p className="mt-1 text-body-sm text-text-d">{t('swagger.apisDescription')}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {apis ? <CopyButton text={apis} idleLabel={t('common.copyResult')} /> : null}
                            <Button
                                variant="secondary"
                                className="px-3 py-2 text-body-sm"
                                disabled={!apis}
                                onClick={() => {
                                    downloadTextFile('Apis.ts', apis);
                                }}
                            >
                                {t('swagger.download')}
                            </Button>
                        </div>
                    </div>
                    <textarea
                        id="swagger-apis-output"
                        className={textareaClassName}
                        value={apis}
                        readOnly
                        placeholder={t('swagger.apisPlaceholder')}
                    />
                </section>

                <section className={`${panelClassName} flex min-h-[34rem] flex-col`}>
                    <div className="flex min-h-12 items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <label className="text-body-sm text-text-c" htmlFor="swagger-models-output">
                                Models.ts
                            </label>
                            <p className="mt-1 text-body-sm text-text-d">{t('swagger.modelsDescription')}</p>
                        </div>
                        <div className="flex shrink-0 items-center gap-2">
                            {models ? <CopyButton text={models} idleLabel={t('common.copyResult')} /> : null}
                            <Button
                                variant="secondary"
                                className="px-3 py-2 text-body-sm"
                                disabled={!models}
                                onClick={() => {
                                    downloadTextFile('Models.ts', models);
                                }}
                            >
                                {t('swagger.download')}
                            </Button>
                        </div>
                    </div>
                    <textarea
                        id="swagger-models-output"
                        className={textareaClassName}
                        value={models}
                        readOnly
                        placeholder={t('swagger.modelsPlaceholder')}
                    />
                </section>
            </section>
        </section>
    );
}
