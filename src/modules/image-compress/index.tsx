'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { FileDropzone } from '@/components/FileDropzone';
import { ModuleIntro } from '@/components/ModuleIntro';
import { Select } from '@/components/Select';
import { useI18n } from '@/services/i18n';

const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const rangeHeaderClassName = 'flex items-center justify-between gap-3 text-body-sm';
const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';

type CompressionMode = 'local' | 'tinypng';
type OutputFormat = 'image/jpeg' | 'image/png' | 'image/webp';
type TaskStatus = 'ready' | 'processing' | 'done' | 'error';

type ImageTask = {
    error?: string;
    file: File;
    height: number;
    id: string;
    name: string;
    result?: CompressionResult;
    size: number;
    sourceUrl: string;
    status: TaskStatus;
    type: string;
    width: number;
};

type CompressionResult = {
    blob: Blob;
    height: number;
    name: string;
    ratio: number;
    size: number;
    url: string;
    width: number;
};

type CompressionCandidate = {
    blob: Blob;
    format: OutputFormat;
    height: number;
    width: number;
};

const outputExtensions: Record<OutputFormat, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

const mimeExtensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
};

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('image-load-failed'));
        image.src = src;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: OutputFormat, quality: number) {
    return new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    resolve(blob);
                    return;
                }

                reject(new Error('canvas-blob-failed'));
            },
            type,
            type === 'image/png' ? undefined : quality,
        );
    });
}

function createTaskId() {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getBaseFileName(fileName: string) {
    const dotIndex = fileName.lastIndexOf('.');

    return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
}

function getFileExtension(fileName: string) {
    const dotIndex = fileName.lastIndexOf('.');

    return dotIndex > 0 ? fileName.slice(dotIndex + 1).toLowerCase() : '';
}

function formatBytes(bytes: number) {
    if (!Number.isFinite(bytes) || bytes <= 0) {
        return '0 KB';
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function resolveOutputSize(image: HTMLImageElement, maxSide: number) {
    const sourceWidth = image.naturalWidth;
    const sourceHeight = image.naturalHeight;
    const scale = maxSide > 0 ? Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight)) : 1;

    return {
        width: Math.max(1, Math.round(sourceWidth * scale)),
        height: Math.max(1, Math.round(sourceHeight * scale)),
    };
}

async function createCompressionCandidate(
    image: HTMLImageElement,
    format: OutputFormat,
    quality: number,
    maxSide: number,
): Promise<CompressionCandidate> {
    const outputSize = resolveOutputSize(image, maxSide);
    const canvas = document.createElement('canvas');
    canvas.width = outputSize.width;
    canvas.height = outputSize.height;
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('canvas-context-unavailable');
    }

    if (format === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }

    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = 'high';
    context.drawImage(image, 0, 0, outputSize.width, outputSize.height);

    return {
        blob: await canvasToBlob(canvas, format, quality),
        format,
        width: outputSize.width,
        height: outputSize.height,
    };
}

function triggerDownload(url: string, fileName: string) {
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.append(link);
    link.click();
    link.remove();
}

function buildResult(fileName: string, sourceSize: number, candidate: CompressionCandidate): CompressionResult {
    const name = `${getBaseFileName(fileName)}-compressed.${outputExtensions[candidate.format]}`;

    return {
        blob: candidate.blob,
        name,
        size: candidate.blob.size,
        width: candidate.width,
        height: candidate.height,
        ratio: sourceSize > 0 ? Math.round((1 - candidate.blob.size / sourceSize) * 100) : 0,
        url: URL.createObjectURL(candidate.blob),
    };
}

async function compressLocally(task: ImageTask, format: OutputFormat, quality: number, maxSide: number) {
    const image = await loadImage(task.sourceUrl);
    const candidate = await createCompressionCandidate(image, format, quality, maxSide);

    if (candidate.blob.size >= task.size) {
        throw new Error('not-smaller');
    }

    return buildResult(task.name, task.size, candidate);
}

async function compressWithTinyPng(task: ImageTask, apiKey: string, language: string) {
    const formData = new FormData();

    formData.append('apiKey', apiKey);
    formData.append('language', language);
    formData.append('image', task.file);

    const response = await fetch('/api/tinypng-compress', {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        throw new Error(payload?.message ?? 'tinypng-failed');
    }

    const blob = await response.blob();
    const outputType = blob.type || task.type;
    const outputExtension = mimeExtensions[outputType] ?? (getFileExtension(task.name) || 'png');

    return {
        blob,
        name: `${getBaseFileName(task.name)}-tinypng.${outputExtension}`,
        size: blob.size,
        width: task.width,
        height: task.height,
        ratio: task.size > 0 ? Math.round((1 - blob.size / task.size) * 100) : 0,
        url: URL.createObjectURL(blob),
    };
}

function createCrcTable() {
    const table = new Uint32Array(256);

    for (let index = 0; index < table.length; index += 1) {
        let current = index;

        for (let bit = 0; bit < 8; bit += 1) {
            current = current & 1 ? 0xedb88320 ^ (current >>> 1) : current >>> 1;
        }

        table[index] = current >>> 0;
    }

    return table;
}

const crcTable = createCrcTable();

function getCrc32(bytes: Uint8Array) {
    let crc = 0xffffffff;

    for (const byte of bytes) {
        crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    }

    return (crc ^ 0xffffffff) >>> 0;
}

function createZipHeader(size: number) {
    return new Uint8Array(size);
}

function writeZipHeader(view: DataView, values: Array<[number, number, number]>) {
    for (const [offset, value, byteLength] of values) {
        if (byteLength === 2) {
            view.setUint16(offset, value, true);
        } else {
            view.setUint32(offset, value, true);
        }
    }
}

function resolveUniqueFileName(fileName: string, usedNames: Map<string, number>) {
    const baseName = getBaseFileName(fileName);
    const extension = getFileExtension(fileName);
    const normalized = fileName.toLowerCase();
    const count = usedNames.get(normalized) ?? 0;

    usedNames.set(normalized, count + 1);

    if (!count) {
        return fileName;
    }

    return `${baseName}-${count + 1}${extension ? `.${extension}` : ''}`;
}

async function createZipBlob(files: Array<{ blob: Blob; name: string }>) {
    const encoder = new TextEncoder();
    const localParts: BlobPart[] = [];
    const centralParts: BlobPart[] = [];
    const usedNames = new Map<string, number>();
    let offset = 0;
    let centralSize = 0;

    for (const file of files) {
        const fileName = resolveUniqueFileName(file.name, usedNames);
        const nameBytes = encoder.encode(fileName);
        const dataBytes = new Uint8Array(await file.blob.arrayBuffer());
        const crc = getCrc32(dataBytes);
        const localHeader = createZipHeader(30 + nameBytes.length);
        const localView = new DataView(localHeader.buffer);

        writeZipHeader(localView, [
            [0, 0x04034b50, 4],
            [4, 20, 2],
            [6, 0x0800, 2],
            [8, 0, 2],
            [14, crc, 4],
            [18, dataBytes.byteLength, 4],
            [22, dataBytes.byteLength, 4],
            [26, nameBytes.byteLength, 2],
        ]);
        localHeader.set(nameBytes, 30);
        localParts.push(localHeader, dataBytes);

        const centralHeader = createZipHeader(46 + nameBytes.length);
        const centralView = new DataView(centralHeader.buffer);

        writeZipHeader(centralView, [
            [0, 0x02014b50, 4],
            [4, 20, 2],
            [6, 20, 2],
            [8, 0x0800, 2],
            [10, 0, 2],
            [16, crc, 4],
            [20, dataBytes.byteLength, 4],
            [24, dataBytes.byteLength, 4],
            [28, nameBytes.byteLength, 2],
            [42, offset, 4],
        ]);
        centralHeader.set(nameBytes, 46);
        centralParts.push(centralHeader);

        offset += localHeader.byteLength + dataBytes.byteLength;
        centralSize += centralHeader.byteLength;
    }

    const endHeader = createZipHeader(22);
    const endView = new DataView(endHeader.buffer);

    writeZipHeader(endView, [
        [0, 0x06054b50, 4],
        [8, files.length, 2],
        [10, files.length, 2],
        [12, centralSize, 4],
        [16, offset, 4],
    ]);

    return new Blob([...localParts, ...centralParts, endHeader], { type: 'application/zip' });
}

export function ImageCompressTool() {
    const { language, t } = useI18n();
    const objectUrlsRef = useRef<Set<string>>(new Set());
    const [tasks, setTasks] = useState<ImageTask[]>([]);
    const [mode, setMode] = useState<CompressionMode>('local');
    const [format, setFormat] = useState<OutputFormat>('image/webp');
    const [quality, setQuality] = useState(0.86);
    const [maxSide, setMaxSide] = useState(1920);
    const [apiKey, setApiKey] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    const formatOptions = useMemo(
        () => [
            { label: t('imageCompress.jpeg'), value: 'image/jpeg' },
            { label: t('imageCompress.webp'), value: 'image/webp' },
            { label: t('imageCompress.png'), value: 'image/png' },
        ],
        [t],
    );
    const modeOptions = useMemo(
        () => [
            { label: t('imageCompress.localMode'), value: 'local' },
            { label: t('imageCompress.tinyPngMode'), value: 'tinypng' },
        ],
        [t],
    );
    const completedTasks = tasks.filter((task) => task.result);
    const isTinyPngMode = mode === 'tinypng';
    const canProcess = tasks.length > 0 && !isProcessing && (!isTinyPngMode || apiKey.trim().length > 0);

    useEffect(() => {
        const urls = objectUrlsRef.current;

        return () => {
            for (const url of urls) {
                URL.revokeObjectURL(url);
            }

            urls.clear();
        };
    }, []);

    function registerObjectUrl(url: string) {
        objectUrlsRef.current.add(url);

        return url;
    }

    function revokeObjectUrl(url: string) {
        URL.revokeObjectURL(url);
        objectUrlsRef.current.delete(url);
    }

    function revokeTaskUrls(task: ImageTask) {
        revokeObjectUrl(task.sourceUrl);

        if (task.result) {
            revokeObjectUrl(task.result.url);
        }
    }

    async function handleFilesSelect(files: FileList) {
        const nextTasks: ImageTask[] = [];
        let invalidCount = 0;

        for (const file of Array.from(files)) {
            if (!file.type.startsWith('image/')) {
                invalidCount += 1;
                continue;
            }

            const sourceUrl = registerObjectUrl(URL.createObjectURL(file));

            try {
                const image = await loadImage(sourceUrl);

                nextTasks.push({
                    id: createTaskId(),
                    file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    width: image.naturalWidth,
                    height: image.naturalHeight,
                    sourceUrl,
                    status: 'ready',
                });
            } catch {
                invalidCount += 1;
                revokeObjectUrl(sourceUrl);
            }
        }

        if (nextTasks.length) {
            setTasks((currentTasks) => [...currentTasks, ...nextTasks]);
        }

        setError(invalidCount ? t('imageCompress.invalidImageCount', { count: invalidCount }) : '');
    }

    function handleClear() {
        for (const task of tasks) {
            revokeTaskUrls(task);
        }

        setTasks([]);
        setError('');
    }

    function handleRemoveTask(taskId: string) {
        setTasks((currentTasks) => {
            const task = currentTasks.find((currentTask) => currentTask.id === taskId);

            if (task) {
                revokeTaskUrls(task);
            }

            return currentTasks.filter((currentTask) => currentTask.id !== taskId);
        });
    }

    function markTaskProcessing(taskId: string) {
        setTasks((currentTasks) =>
            currentTasks.map((task) => {
                if (task.id !== taskId) {
                    return task;
                }

                if (task.result) {
                    revokeObjectUrl(task.result.url);
                }

                return {
                    ...task,
                    result: undefined,
                    status: 'processing',
                    error: undefined,
                };
            }),
        );
    }

    function markTaskDone(taskId: string, result: CompressionResult) {
        registerObjectUrl(result.url);
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId
                    ? {
                          ...task,
                          result,
                          status: 'done',
                          error: undefined,
                      }
                    : task,
            ),
        );
    }

    function markTaskError(taskId: string, message: string) {
        setTasks((currentTasks) =>
            currentTasks.map((task) =>
                task.id === taskId
                    ? {
                          ...task,
                          result: undefined,
                          status: 'error',
                          error: message,
                      }
                    : task,
            ),
        );
    }

    async function processTask(task: ImageTask) {
        markTaskProcessing(task.id);

        try {
            const result =
                mode === 'tinypng'
                    ? await compressWithTinyPng(task, apiKey.trim(), language)
                    : await compressLocally(task, format, quality, maxSide);

            markTaskDone(task.id, result);
        } catch (taskError) {
            const message =
                taskError instanceof Error && taskError.message === 'not-smaller'
                    ? t('imageCompress.notSmaller')
                    : taskError instanceof Error && taskError.message && !['tinypng-failed'].includes(taskError.message)
                      ? taskError.message
                      : t(mode === 'tinypng' ? 'imageCompress.tinyPngFailed' : 'imageCompress.processFailed');

            markTaskError(task.id, message);
        }
    }

    async function handleProcessAll() {
        if (!tasks.length) {
            return;
        }

        if (mode === 'tinypng' && !apiKey.trim()) {
            setError(t('imageCompress.emptyApiKey'));
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            for (const task of tasks) {
                await processTask(task);
            }
        } finally {
            setIsProcessing(false);
        }
    }

    function handleDownloadTask(task: ImageTask) {
        if (!task.result) {
            return;
        }

        triggerDownload(task.result.url, task.result.name);
    }

    async function handleDownloadZip() {
        if (!completedTasks.length || isProcessing) {
            return;
        }

        const zipBlob = await createZipBlob(
            completedTasks.map((task) => ({
                name: task.result?.name ?? task.name,
                blob: task.result?.blob ?? task.file,
            })),
        );
        const zipUrl = URL.createObjectURL(zipBlob);

        triggerDownload(zipUrl, 'compressed-images.zip');
        window.setTimeout(() => {
            URL.revokeObjectURL(zipUrl);
        }, 1000);
    }

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="ZIP"
                title={t('imageCompress.introTitle')}
                description={t('imageCompress.introDescription')}
            />

            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                <section className={`${panelClassName} space-y-4`}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('imageCompress.uploadTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('imageCompress.uploadDescription')}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <FileDropzone
                            accept="image/*"
                            multiple
                            label={tasks.length ? t('imageCompress.addImages') : t('imageCompress.uploadImage')}
                            disabled={isProcessing}
                            onFilesSelect={handleFilesSelect}
                        />
                        <ClearButton
                            disabled={!tasks.length || isProcessing}
                            label={t('imageCompress.clearImage')}
                            onClick={handleClear}
                        />
                    </div>

                    <div className="rounded-2xl border border-neutral-j bg-fill-b p-4">
                        <div>
                            <p className="text-title-lg text-text-e">{t('imageCompress.settingsTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('imageCompress.settingsDescription')}</p>
                        </div>

                        <div className="mt-4 grid gap-4">
                            <div>
                                <label className="text-body-sm text-text-c" htmlFor="compress-mode">
                                    {t('imageCompress.mode')}
                                </label>
                                <Select
                                    id="compress-mode"
                                    className="mt-2"
                                    value={mode}
                                    options={modeOptions}
                                    disabled={isProcessing}
                                    onValueChange={(value) => {
                                        setMode(value as CompressionMode);
                                        setError('');
                                    }}
                                />
                            </div>

                            {mode === 'local' ? (
                                <>
                                    <div>
                                        <label className="text-body-sm text-text-c" htmlFor="compress-format">
                                            {t('imageCompress.format')}
                                        </label>
                                        <Select
                                            id="compress-format"
                                            className="mt-2"
                                            value={format}
                                            options={formatOptions}
                                            disabled={isProcessing}
                                            onValueChange={(value) => {
                                                setFormat(value as OutputFormat);
                                            }}
                                        />
                                    </div>

                                    <div>
                                        <div className={rangeHeaderClassName}>
                                            <label className="text-text-c" htmlFor="compress-quality">
                                                {t('imageCompress.quality')}
                                            </label>
                                            <span className="text-body-sm text-text-d">
                                                {Math.round(quality * 100)}%
                                            </span>
                                        </div>
                                        <input
                                            id="compress-quality"
                                            type="range"
                                            min={40}
                                            max={100}
                                            step={1}
                                            value={Math.round(quality * 100)}
                                            disabled={isProcessing || format === 'image/png'}
                                            onChange={(event) => {
                                                setQuality(Number(event.target.value) / 100);
                                            }}
                                            className="mt-2 w-full"
                                        />
                                    </div>

                                    <div>
                                        <div className={rangeHeaderClassName}>
                                            <label className="text-text-c" htmlFor="compress-max-side">
                                                {t('imageCompress.maxSide')}
                                            </label>
                                            <span className="text-body-sm text-text-d">{maxSide}px</span>
                                        </div>
                                        <input
                                            id="compress-max-side"
                                            type="range"
                                            min={640}
                                            max={4096}
                                            step={64}
                                            value={maxSide}
                                            disabled={isProcessing}
                                            onChange={(event) => {
                                                setMaxSide(Number(event.target.value));
                                            }}
                                            className="mt-2 w-full"
                                        />
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="text-body-sm text-text-c" htmlFor="tinypng-api-key">
                                        {t('imageCompress.apiKey')}
                                    </label>
                                    <input
                                        id="tinypng-api-key"
                                        type="password"
                                        className={inputClassName}
                                        value={apiKey}
                                        disabled={isProcessing}
                                        onChange={(event) => {
                                            setApiKey(event.target.value);
                                        }}
                                        placeholder={t('imageCompress.apiKeyPlaceholder')}
                                    />
                                    <p className="mt-2 text-body-sm text-text-c">{t('imageCompress.apiKeyTip')}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Button disabled={!canProcess} loading={isProcessing} onClick={handleProcessAll}>
                            {t('imageCompress.process')}
                        </Button>
                        <Button
                            variant="secondary"
                            disabled={!completedTasks.length || isProcessing}
                            onClick={handleDownloadZip}
                        >
                            {t('imageCompress.downloadZip')}
                        </Button>
                    </div>

                    {error && <p className="text-body-pc-md text-error">{error}</p>}
                </section>

                <section className={`${panelClassName} space-y-4`}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('imageCompress.resultTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('imageCompress.resultDescription')}</p>
                    </div>

                    <div className="space-y-3">
                        {tasks.length ? (
                            tasks.map((task) => (
                                <div key={task.id} className="rounded-2xl border border-neutral-j bg-fill-b p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate text-title-sm text-text-e">{task.name}</p>
                                            <p className="mt-1 text-body-sm text-text-d">
                                                {t('imageCompress.taskMeta', {
                                                    size: formatBytes(task.size),
                                                    width: task.width,
                                                    height: task.height,
                                                })}
                                            </p>
                                        </div>

                                        <div className="flex shrink-0 flex-wrap gap-2">
                                            <Button
                                                variant="secondary"
                                                disabled={!task.result || isProcessing}
                                                onClick={() => {
                                                    handleDownloadTask(task);
                                                }}
                                            >
                                                {t('imageCompress.download')}
                                            </Button>
                                            <ClearButton
                                                disabled={isProcessing}
                                                label={t('imageCompress.removeImage')}
                                                onClick={() => {
                                                    handleRemoveTask(task.id);
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-3 grid gap-2 text-body-sm text-text-d md:grid-cols-3">
                                        <span>{t(`imageCompress.status.${task.status}`)}</span>
                                        {task.result ? (
                                            <>
                                                <span>
                                                    {t('imageCompress.resultSize', {
                                                        size: formatBytes(task.result.size),
                                                    })}
                                                </span>
                                                <span>
                                                    {t('imageCompress.savedRatio', { ratio: task.result.ratio })}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{t('imageCompress.resultPending')}</span>
                                                <span>{task.error ?? ''}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-fill-b p-4">
                                <p className="text-center text-body-pc-md text-text-c">
                                    {t('imageCompress.waitingImage')}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </section>
        </section>
    );
}
