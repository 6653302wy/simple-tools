'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { FileDropzone } from '@/components/FileDropzone';
import { ModuleIntro } from '@/components/ModuleIntro';
import { Select } from '@/components/Select';
import { useI18n } from '@/services/i18n';

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

type WatermarkMode = 'tile' | 'corner';

type LoadedImage = {
    height: number;
    name: string;
    src: string;
    width: number;
};

function loadImage(src: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new window.Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('image-load-failed'));
        image.src = src;
    });
}

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export function ImageWatermarkTool() {
    const { t } = useI18n();
    const objectUrlRef = useRef<string | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [sourceImage, setSourceImage] = useState<LoadedImage | null>(null);
    const [hasResult, setHasResult] = useState(false);
    const [error, setError] = useState('');
    const [watermarkText, setWatermarkText] = useState('SIMPLE TOOLS');
    const [color, setColor] = useState('#003616');
    const [fontSize, setFontSize] = useState(36);
    const [opacity, setOpacity] = useState(0.22);
    const [gap, setGap] = useState(120);
    const [rotation, setRotation] = useState(-24);
    const [mode, setMode] = useState<WatermarkMode>('tile');

    const modeOptions = useMemo(
        () => [
            { label: t('imageWatermark.tileMode'), value: 'tile' },
            { label: t('imageWatermark.cornerMode'), value: 'corner' },
        ],
        [t],
    );

    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!sourceImage) {
            setHasResult(false);
            return;
        }

        let cancelled = false;

        async function renderWatermark() {
            try {
                const nextSourceImage = sourceImage;

                if (!nextSourceImage) {
                    return;
                }

                const image = await loadImage(nextSourceImage.src);

                if (cancelled) {
                    return;
                }

                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                const previewCanvas = previewCanvasRef.current;

                if (!context || !previewCanvas) {
                    throw new Error('canvas-unavailable');
                }

                context.drawImage(image, 0, 0);
                const normalizedColor = color.replace('#', '');
                const hasValidColor = normalizedColor.length === 6;
                const red = hasValidColor ? Number.parseInt(normalizedColor.slice(0, 2), 16) : 0;
                const green = hasValidColor ? Number.parseInt(normalizedColor.slice(2, 4), 16) : 54;
                const blue = hasValidColor ? Number.parseInt(normalizedColor.slice(4, 6), 16) : 22;

                context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`;
                context.textAlign = 'center';
                context.textBaseline = 'middle';
                context.font = `600 ${fontSize}px "Roboto", "Inter", sans-serif`;

                const text = watermarkText.trim() || ' ';

                if (mode === 'tile') {
                    context.save();
                    context.translate(canvas.width / 2, canvas.height / 2);
                    context.rotate((rotation * Math.PI) / 180);

                    for (let x = -canvas.width; x <= canvas.width; x += gap) {
                        for (let y = -canvas.height; y <= canvas.height; y += gap) {
                            context.fillText(text, x, y);
                        }
                    }

                    context.restore();
                } else {
                    context.save();
                    context.translate(canvas.width - fontSize * 2.2, canvas.height - fontSize * 1.8);
                    context.rotate((rotation * Math.PI) / 180);
                    context.fillText(text, 0, 0);
                    context.restore();
                }

                previewCanvas.width = canvas.width;
                previewCanvas.height = canvas.height;
                const previewContext = previewCanvas.getContext('2d');

                if (!previewContext) {
                    throw new Error('preview-context-unavailable');
                }

                previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
                previewContext.drawImage(canvas, 0, 0);
                setHasResult(true);
                setError('');
            } catch {
                if (!cancelled) {
                    setError(t('imageWatermark.renderFailed'));
                    setHasResult(false);
                }
            }
        }

        void renderWatermark();

        return () => {
            cancelled = true;
        };
    }, [color, fontSize, gap, mode, opacity, rotation, sourceImage, t, watermarkText]);

    async function handleFilesSelect(files: FileList) {
        const file = files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError(t('imageWatermark.invalidImage'));
            return;
        }

        try {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }

            const objectUrl = URL.createObjectURL(file);
            objectUrlRef.current = objectUrl;
            const image = await loadImage(objectUrl);

            setSourceImage({
                name: file.name,
                src: objectUrl,
                width: image.width,
                height: image.height,
            });
            setError('');
        } catch {
            setError(t('imageWatermark.invalidImage'));
            setSourceImage(null);
            setHasResult(false);
        } finally {
        }
    }

    function handleDownload() {
        const previewCanvas = previewCanvasRef.current;

        if (!previewCanvas || !sourceImage || !hasResult) {
            return;
        }

        const link = document.createElement('a');
        const dotIndex = sourceImage.name.lastIndexOf('.');
        const fileName = dotIndex > 0 ? sourceImage.name.slice(0, dotIndex) : sourceImage.name;

        link.href = previewCanvas.toDataURL('image/png');
        link.download = `${fileName}-watermarked.png`;
        link.click();
    }

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="WM"
                title={t('imageWatermark.introTitle')}
                description={t('imageWatermark.introDescription')}
            />

            <section className="grid gap-4 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)]">
                <section className={`${panelClassName} space-y-4`}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('imageWatermark.uploadTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('imageWatermark.uploadDescription')}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <FileDropzone
                            accept="image/*"
                            label={sourceImage ? t('imageWatermark.replaceImage') : t('imageWatermark.uploadImage')}
                            onFilesSelect={handleFilesSelect}
                        />
                    </div>

                    <div className="rounded-2xl border border-neutral-j bg-fill-b p-4">
                        <div>
                            <p className="text-title-lg text-text-e">{t('imageWatermark.watermarkTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">
                                {t('imageWatermark.watermarkDescription')}
                            </p>
                        </div>

                        <div className="mt-4 grid gap-4">
                            <div>
                                <label className="text-body-sm text-text-c" htmlFor="watermark-text">
                                    {t('imageWatermark.watermarkText')}
                                </label>
                                <input
                                    id="watermark-text"
                                    className={inputClassName}
                                    value={watermarkText}
                                    onChange={(event) => {
                                        setWatermarkText(event.target.value);
                                    }}
                                    placeholder={t('imageWatermark.watermarkPlaceholder')}
                                />
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div>
                                    <label className="text-body-sm text-text-c">{t('imageWatermark.mode')}</label>
                                    <Select
                                        className="mt-2"
                                        value={mode}
                                        options={modeOptions}
                                        onValueChange={(value) => {
                                            setMode(value as WatermarkMode);
                                        }}
                                    />
                                </div>

                                <div>
                                    <label className="text-body-sm text-text-c" htmlFor="watermark-color">
                                        {t('imageWatermark.color')}
                                    </label>
                                    <div className="mt-2 flex items-center gap-3 rounded-lg border border-neutral-j bg-fill-a px-3 py-2.5">
                                        <input
                                            id="watermark-color"
                                            type="color"
                                            value={color}
                                            onChange={(event) => {
                                                setColor(event.target.value);
                                            }}
                                            className="h-9 w-12 cursor-pointer rounded-md border-0 bg-transparent p-0"
                                        />
                                        <span className="text-body-pc-md text-text-e">{color.toUpperCase()}</span>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-body-sm text-text-c" htmlFor="watermark-font-size">
                                        {t('imageWatermark.fontSize')}
                                    </label>
                                    <input
                                        id="watermark-font-size"
                                        type="range"
                                        min={16}
                                        max={96}
                                        value={fontSize}
                                        onChange={(event) => {
                                            setFontSize(Number(event.target.value));
                                        }}
                                        className="mt-3 w-full"
                                    />
                                    <p className="mt-1 text-body-sm text-text-d">{fontSize}px</p>
                                </div>

                                <div>
                                    <label className="text-body-sm text-text-c" htmlFor="watermark-opacity">
                                        {t('imageWatermark.opacity')}
                                    </label>
                                    <input
                                        id="watermark-opacity"
                                        type="range"
                                        min={5}
                                        max={80}
                                        value={Math.round(opacity * 100)}
                                        onChange={(event) => {
                                            setOpacity(Number(event.target.value) / 100);
                                        }}
                                        className="mt-3 w-full"
                                    />
                                    <p className="mt-1 text-body-sm text-text-d">{Math.round(opacity * 100)}%</p>
                                </div>

                                <div>
                                    <label className="text-body-sm text-text-c" htmlFor="watermark-rotation">
                                        {t('imageWatermark.rotation')}
                                    </label>
                                    <input
                                        id="watermark-rotation"
                                        type="range"
                                        min={-60}
                                        max={60}
                                        value={rotation}
                                        onChange={(event) => {
                                            setRotation(Number(event.target.value));
                                        }}
                                        className="mt-3 w-full"
                                    />
                                    <p className="mt-1 text-body-sm text-text-d">{rotation}°</p>
                                </div>
                            </div>

                            {mode === 'tile' && (
                                <div>
                                    <label className="text-body-sm text-text-c" htmlFor="watermark-gap">
                                        {t('imageWatermark.gap')}
                                    </label>
                                    <input
                                        id="watermark-gap"
                                        type="range"
                                        min={70}
                                        max={220}
                                        value={clamp(gap, 70, 220)}
                                        onChange={(event) => {
                                            setGap(Number(event.target.value));
                                        }}
                                        className="mt-3 w-full"
                                    />
                                    <p className="mt-1 text-body-sm text-text-d">{gap}px</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={`${panelClassName} space-y-4`}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('imageWatermark.resultTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('imageWatermark.resultDescription')}</p>
                        </div>

                        <Button disabled={!hasResult} onClick={handleDownload}>
                            {t('imageWatermark.download')}
                        </Button>
                    </div>

                    <div>
                        <p className="text-body-sm text-text-c">{t('imageWatermark.resultPreview')}</p>
                        <div className="mt-2 flex min-h-80 items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-fill-b p-4">
                            {error ? (
                                <p className="text-body-pc-md text-error">{error}</p>
                            ) : (
                                <>
                                    <canvas
                                        ref={previewCanvasRef}
                                        className={
                                            hasResult ? 'max-h-[34rem] w-full rounded-xl object-contain' : 'hidden'
                                        }
                                    />
                                    {!hasResult && (
                                        <p className="text-body-pc-md text-text-c">
                                            {t('imageWatermark.waitingImage')}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </section>
            </section>
        </section>
    );
}
