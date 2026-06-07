'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { FileDropzone } from '@/components/FileDropzone';
import { ModuleIntro } from '@/components/ModuleIntro';
import { useI18n } from '@/services/i18n';

const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const rangeHeaderClassName = 'flex items-center justify-between gap-3 text-body-sm';

type LoadedImage = {
    height: number;
    name: string;
    size: number;
    src: string;
    width: number;
};

type ProcessedImage = {
    removedPixels: number;
    size: number;
    totalPixels: number;
    url: string;
};

type RgbColor = {
    blue: number;
    green: number;
    red: number;
};

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('image-load-failed'));
        image.src = src;
    });
}

function canvasToBlob(canvas: HTMLCanvasElement, type = 'image/png', quality?: number) {
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
            quality,
        );
    });
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function getBaseFileName(fileName: string) {
    const dotIndex = fileName.lastIndexOf('.');

    return dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;
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

function sampleBackgroundColor(imageData: ImageData): RgbColor {
    const { data, height, width } = imageData;
    const sampleSize = clamp(Math.round(Math.min(width, height) * 0.04), 8, 48);
    const sampleRects = [
        { x: 0, y: 0 },
        { x: width - sampleSize, y: 0 },
        { x: 0, y: height - sampleSize },
        { x: width - sampleSize, y: height - sampleSize },
    ];
    let red = 0;
    let green = 0;
    let blue = 0;
    let count = 0;

    for (const rect of sampleRects) {
        for (let y = rect.y; y < rect.y + sampleSize; y += 1) {
            for (let x = rect.x; x < rect.x + sampleSize; x += 1) {
                const index = (y * width + x) * 4;
                const alpha = data[index + 3];

                if (alpha < 16) {
                    continue;
                }

                red += data[index];
                green += data[index + 1];
                blue += data[index + 2];
                count += 1;
            }
        }
    }

    if (!count) {
        return { red: 255, green: 255, blue: 255 };
    }

    return {
        red: Math.round(red / count),
        green: Math.round(green / count),
        blue: Math.round(blue / count),
    };
}

function removeBackgroundPixels(imageData: ImageData, tolerance: number, feather: number) {
    const backgroundColor = sampleBackgroundColor(imageData);
    const { data } = imageData;
    let removedPixels = 0;

    for (let index = 0; index < data.length; index += 4) {
        const redDistance = data[index] - backgroundColor.red;
        const greenDistance = data[index + 1] - backgroundColor.green;
        const blueDistance = data[index + 2] - backgroundColor.blue;
        const distance = Math.sqrt(
            redDistance * redDistance + greenDistance * greenDistance + blueDistance * blueDistance,
        );

        if (distance <= tolerance) {
            data[index + 3] = 0;
            removedPixels += 1;
            continue;
        }

        if (feather > 0 && distance <= tolerance + feather) {
            const alphaRatio = clamp((distance - tolerance) / feather, 0, 1);
            data[index + 3] = Math.round(data[index + 3] * alphaRatio);
            removedPixels += 1;
        }
    }

    return {
        removedPixels,
        totalPixels: imageData.width * imageData.height,
    };
}

async function drawPreviewCanvas(canvas: HTMLCanvasElement | null, src: string) {
    if (!canvas) {
        return;
    }

    const image = await loadImage(src);
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('canvas-context-unavailable');
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
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

export function ImageBackgroundRemoverTool() {
    const { t } = useI18n();
    const sourceUrlRef = useRef<string | null>(null);
    const resultUrlRef = useRef<string | null>(null);
    const sourcePreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const resultPreviewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [sourceImage, setSourceImage] = useState<LoadedImage | null>(null);
    const [result, setResult] = useState<ProcessedImage | null>(null);
    const [tolerance, setTolerance] = useState(42);
    const [feather, setFeather] = useState(18);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        return () => {
            if (sourceUrlRef.current) {
                URL.revokeObjectURL(sourceUrlRef.current);
            }

            if (resultUrlRef.current) {
                URL.revokeObjectURL(resultUrlRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!sourceImage) {
            return;
        }

        let cancelled = false;

        async function renderSourcePreview() {
            if (!sourceImage || cancelled) {
                return;
            }

            try {
                await drawPreviewCanvas(sourcePreviewCanvasRef.current, sourceImage.src);
            } catch {
                if (!cancelled) {
                    setError(t('imageBackground.invalidImage'));
                }
            }
        }

        void renderSourcePreview();

        return () => {
            cancelled = true;
        };
    }, [sourceImage, t]);

    useEffect(() => {
        if (!result) {
            return;
        }

        let cancelled = false;

        async function renderResultPreview() {
            if (!result || cancelled) {
                return;
            }

            try {
                await drawPreviewCanvas(resultPreviewCanvasRef.current, result.url);
            } catch {
                if (!cancelled) {
                    setError(t('imageBackground.processFailed'));
                }
            }
        }

        void renderResultPreview();

        return () => {
            cancelled = true;
        };
    }, [result, t]);

    function revokeResultUrl() {
        if (resultUrlRef.current) {
            URL.revokeObjectURL(resultUrlRef.current);
            resultUrlRef.current = null;
        }
    }

    async function handleFilesSelect(files: FileList) {
        const file = files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError(t('imageBackground.invalidImage'));
            return;
        }

        try {
            if (sourceUrlRef.current) {
                URL.revokeObjectURL(sourceUrlRef.current);
            }

            revokeResultUrl();

            const objectUrl = URL.createObjectURL(file);
            sourceUrlRef.current = objectUrl;
            const image = await loadImage(objectUrl);

            setSourceImage({
                name: file.name,
                src: objectUrl,
                size: file.size,
                width: image.naturalWidth,
                height: image.naturalHeight,
            });
            setResult(null);
            setError('');
        } catch {
            setSourceImage(null);
            setResult(null);
            setError(t('imageBackground.invalidImage'));
        }
    }

    function handleClear() {
        if (sourceUrlRef.current) {
            URL.revokeObjectURL(sourceUrlRef.current);
            sourceUrlRef.current = null;
        }

        revokeResultUrl();
        setSourceImage(null);
        setResult(null);
        setError('');
    }

    async function handleProcess() {
        if (!sourceImage || isProcessing) {
            return;
        }

        setIsProcessing(true);
        setError('');

        try {
            const image = await loadImage(sourceImage.src);
            const canvas = document.createElement('canvas');
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const context = canvas.getContext('2d', { willReadFrequently: true });

            if (!context) {
                throw new Error('canvas-context-unavailable');
            }

            context.drawImage(image, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            const processStats = removeBackgroundPixels(imageData, tolerance, feather);

            context.putImageData(imageData, 0, 0);
            const blob = await canvasToBlob(canvas);
            const resultUrl = URL.createObjectURL(blob);

            revokeResultUrl();
            resultUrlRef.current = resultUrl;
            setResult({
                removedPixels: processStats.removedPixels,
                size: blob.size,
                totalPixels: processStats.totalPixels,
                url: resultUrl,
            });
        } catch {
            revokeResultUrl();
            setResult(null);
            setError(t('imageBackground.processFailed'));
        } finally {
            setIsProcessing(false);
        }
    }

    function handleDownload() {
        if (!sourceImage || !result) {
            return;
        }

        triggerDownload(result.url, `${getBaseFileName(sourceImage.name)}-no-background.png`);
    }

    const removedRatio = result ? Math.round((result.removedPixels / result.totalPixels) * 100) : 0;

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="BG"
                title={t('imageBackground.introTitle')}
                description={t('imageBackground.introDescription')}
            />

            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
                <section className={`${panelClassName} space-y-4`}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('imageBackground.uploadTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('imageBackground.uploadDescription')}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <FileDropzone
                            accept="image/*"
                            label={sourceImage ? t('imageBackground.replaceImage') : t('imageBackground.uploadImage')}
                            disabled={isProcessing}
                            onFilesSelect={handleFilesSelect}
                        />
                        <ClearButton
                            disabled={!sourceImage || isProcessing}
                            label={t('imageBackground.clearImage')}
                            onClick={handleClear}
                        />
                    </div>

                    <div className="rounded-2xl border border-neutral-j bg-fill-b p-4">
                        <div>
                            <p className="text-title-lg text-text-e">{t('imageBackground.settingsTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">
                                {t('imageBackground.settingsDescription')}
                            </p>
                        </div>

                        <div className="mt-4 grid gap-4">
                            <div>
                                <div className={rangeHeaderClassName}>
                                    <label className="text-text-c" htmlFor="background-tolerance">
                                        {t('imageBackground.tolerance')}
                                    </label>
                                    <span className="text-body-sm text-text-d">{tolerance}</span>
                                </div>
                                <input
                                    id="background-tolerance"
                                    type="range"
                                    min={8}
                                    max={150}
                                    step={1}
                                    value={tolerance}
                                    disabled={!sourceImage || isProcessing}
                                    onChange={(event) => {
                                        setTolerance(Number(event.target.value));
                                    }}
                                    className="mt-2 w-full"
                                />
                            </div>

                            <div>
                                <div className={rangeHeaderClassName}>
                                    <label className="text-text-c" htmlFor="background-feather">
                                        {t('imageBackground.feather')}
                                    </label>
                                    <span className="text-body-sm text-text-d">{feather}px</span>
                                </div>
                                <input
                                    id="background-feather"
                                    type="range"
                                    min={0}
                                    max={72}
                                    step={1}
                                    value={feather}
                                    disabled={!sourceImage || isProcessing}
                                    onChange={(event) => {
                                        setFeather(Number(event.target.value));
                                    }}
                                    className="mt-2 w-full"
                                />
                            </div>
                        </div>
                    </div>

                    <Button disabled={!sourceImage || isProcessing} loading={isProcessing} onClick={handleProcess}>
                        {t('imageBackground.process')}
                    </Button>

                    {sourceImage && (
                        <div className="grid gap-2 rounded-2xl border border-neutral-j bg-fill-b p-3 text-body-sm text-text-d md:grid-cols-3">
                            <span>
                                {t('imageBackground.dimension', {
                                    width: sourceImage.width,
                                    height: sourceImage.height,
                                })}
                            </span>
                            <span>{t('imageBackground.originalSize', { size: formatBytes(sourceImage.size) })}</span>
                            <span>{t('imageBackground.outputFormat')}</span>
                        </div>
                    )}
                </section>

                <section className={`${panelClassName} space-y-4`}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('imageBackground.resultTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('imageBackground.resultDescription')}</p>
                        </div>

                        <Button disabled={!result || isProcessing} onClick={handleDownload}>
                            {t('imageBackground.download')}
                        </Button>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-2">
                        <div>
                            <p className="text-body-sm text-text-c">{t('imageBackground.originalPreview')}</p>
                            <div className="mt-2 flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-fill-b p-4">
                                {sourceImage ? (
                                    <canvas
                                        ref={sourcePreviewCanvasRef}
                                        className="max-h-[24rem] w-full rounded-xl object-contain"
                                    />
                                ) : (
                                    <p className="text-center text-body-pc-md text-text-c">
                                        {t('imageBackground.waitingImage')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <p className="text-body-sm text-text-c">{t('imageBackground.resultPreview')}</p>
                            <div className="mt-2 flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-[linear-gradient(45deg,#eef3ef_25%,transparent_25%),linear-gradient(-45deg,#eef3ef_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#eef3ef_75%),linear-gradient(-45deg,transparent_75%,#eef3ef_75%)] bg-[length:24px_24px] bg-[position:0_0,0_12px,12px_-12px,-12px_0] p-4">
                                {error ? (
                                    <p className="text-center text-body-pc-md text-error">{error}</p>
                                ) : result ? (
                                    <canvas
                                        ref={resultPreviewCanvasRef}
                                        className="max-h-[24rem] w-full rounded-xl object-contain"
                                    />
                                ) : (
                                    <p className="text-center text-body-pc-md text-text-c">
                                        {t('imageBackground.waitingResult')}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {result && (
                        <div className="grid gap-2 rounded-2xl border border-neutral-j bg-fill-b p-3 text-body-sm text-text-d md:grid-cols-3">
                            <span>{t('imageBackground.removedRatio', { ratio: removedRatio })}</span>
                            <span>{t('imageBackground.resultSize', { size: formatBytes(result.size) })}</span>
                            <span>
                                {t('imageBackground.downloadName', {
                                    name: `${getBaseFileName(sourceImage?.name ?? 'image')}-no-background.png`,
                                })}
                            </span>
                        </div>
                    )}
                </section>
            </section>
        </section>
    );
}
