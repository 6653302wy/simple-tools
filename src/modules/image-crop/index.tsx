'use client';

import { useCallback, useEffect, useRef, useState, type WheelEvent } from 'react';
import { Cropper, type ReactCropperElement } from 'react-cropper';
import { Button } from '@/components/Button';
import { FileDropzone } from '@/components/FileDropzone';
import { ModuleIntro } from '@/components/ModuleIntro';
import { useI18n } from '@/services/i18n';

const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const minZoomOffset = -0.8;
const maxZoomOffset = 2;
const wheelZoomStep = 0.04;
const defaultCropWidthCoverage = 0.68;
const defaultCropHeightCoverage = 0.58;

type LoadedImage = {
    height: number;
    name: string;
    src: string;
    width: number;
};

type InitialCropData = {
    height: number;
    width: number;
    x: number;
    y: number;
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

function createInitialCropData(
    image: Pick<LoadedImage, 'height' | 'width'>,
    containerWidth: number,
    containerHeight: number,
) {
    const safeContainerWidth = containerWidth || image.width;
    const safeContainerHeight = containerHeight || image.height;
    const targetRatio = safeContainerWidth / safeContainerHeight;
    const widthLimit = image.width * defaultCropWidthCoverage;
    const heightLimit = image.height * defaultCropHeightCoverage;

    let width = widthLimit;
    let height = width / targetRatio;

    if (height > heightLimit) {
        height = heightLimit;
        width = height * targetRatio;
    }

    return {
        x: (image.width - width) / 2,
        y: (image.height - height) / 2,
        width,
        height,
    };
}

export function ImageCropTool() {
    const { t } = useI18n();
    const cropperRef = useRef<ReactCropperElement>(null);
    const cropStageRef = useRef<HTMLDivElement | null>(null);
    const objectUrlRef = useRef<string | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const previewFrameRef = useRef<number | null>(null);
    const previousZoomOffsetRef = useRef(0);
    const [sourceImage, setSourceImage] = useState<LoadedImage | null>(null);
    const [initialCropData, setInitialCropData] = useState<InitialCropData | null>(null);
    const [zoomOffset, setZoomOffset] = useState(0);
    const [zoomRatio, setZoomRatio] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [hasResult, setHasResult] = useState(false);
    const [error, setError] = useState('');
    const [isCropperReady, setIsCropperReady] = useState(false);

    useEffect(() => {
        return () => {
            if (previewFrameRef.current) {
                window.cancelAnimationFrame(previewFrameRef.current);
            }

            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    const syncZoomRatio = useCallback(() => {
        const cropper = cropperRef.current?.cropper;

        if (!cropper) {
            return;
        }

        const imageData = cropper.getImageData();
        const canvasData = cropper.getCanvasData();

        if (!imageData.naturalWidth || !canvasData.width) {
            return;
        }

        setZoomRatio(canvasData.width / imageData.naturalWidth);
    }, []);

    const updatePreview = useCallback(() => {
        const cropper = cropperRef.current?.cropper;
        const previewCanvas = previewCanvasRef.current;

        if (!cropper || !previewCanvas) {
            return;
        }

        try {
            const croppedCanvas = cropper.getCroppedCanvas({
                fillColor: '#ffffff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });

            if (!croppedCanvas) {
                setHasResult(false);
                return;
            }

            previewCanvas.width = croppedCanvas.width;
            previewCanvas.height = croppedCanvas.height;
            const previewContext = previewCanvas.getContext('2d');

            if (!previewContext) {
                throw new Error('preview-context-unavailable');
            }

            previewContext.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
            previewContext.drawImage(croppedCanvas, 0, 0);
            setHasResult(true);
            setError('');
            syncZoomRatio();
        } catch {
            setHasResult(false);
            setError(t('imageCrop.renderFailed'));
        }
    }, [syncZoomRatio, t]);

    const schedulePreviewUpdate = useCallback(() => {
        if (previewFrameRef.current) {
            window.cancelAnimationFrame(previewFrameRef.current);
        }

        previewFrameRef.current = window.requestAnimationFrame(() => {
            previewFrameRef.current = null;
            updatePreview();
        });
    }, [updatePreview]);

    async function handleFilesSelect(files: FileList) {
        const file = files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError(t('imageCrop.invalidImage'));
            return;
        }

        try {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }

            const objectUrl = URL.createObjectURL(file);
            objectUrlRef.current = objectUrl;
            const image = await loadImage(objectUrl);
            const cropStage = cropStageRef.current;
            const nextLoadedImage = {
                name: file.name,
                src: objectUrl,
                width: image.width,
                height: image.height,
            };

            setInitialCropData(
                createInitialCropData(nextLoadedImage, cropStage?.clientWidth ?? 0, cropStage?.clientHeight ?? 0),
            );
            setSourceImage(nextLoadedImage);
            setIsCropperReady(false);
            previousZoomOffsetRef.current = 0;
            setZoomOffset(0);
            setZoomRatio(1);
            setRotation(0);
            setHasResult(false);
            setError('');
        } catch {
            setSourceImage(null);
            setInitialCropData(null);
            setIsCropperReady(false);
            previousZoomOffsetRef.current = 0;
            setHasResult(false);
            setError(t('imageCrop.invalidImage'));
        }
    }

    function handleClear() {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        setSourceImage(null);
        setInitialCropData(null);
        setIsCropperReady(false);
        setHasResult(false);
        setError('');
        previousZoomOffsetRef.current = 0;
        setZoomOffset(0);
        setZoomRatio(1);
        setRotation(0);
    }

    function handleDownload() {
        const cropper = cropperRef.current?.cropper;

        if (!cropper || !sourceImage) {
            return;
        }

        const croppedCanvas = cropper.getCroppedCanvas({
            fillColor: '#ffffff',
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high',
        });

        if (!croppedCanvas) {
            return;
        }

        const link = document.createElement('a');
        const dotIndex = sourceImage.name.lastIndexOf('.');
        const fileName = dotIndex > 0 ? sourceImage.name.slice(0, dotIndex) : sourceImage.name;

        link.href = croppedCanvas.toDataURL('image/png');
        link.download = `${fileName}-cropped.png`;
        link.click();
    }

    useEffect(() => {
        const cropper = cropperRef.current?.cropper;

        if (!cropper || !sourceImage || !isCropperReady) {
            return;
        }

        const nextZoomDelta = zoomOffset - previousZoomOffsetRef.current;

        if (nextZoomDelta !== 0) {
            cropper.zoom(nextZoomDelta);
            previousZoomOffsetRef.current = zoomOffset;
        }

        cropper.rotateTo(rotation);
        schedulePreviewUpdate();
    }, [isCropperReady, rotation, schedulePreviewUpdate, sourceImage, zoomOffset]);

    function handleCropperWheel(event: WheelEvent<HTMLDivElement>) {
        if (!sourceImage || !isCropperReady) {
            return;
        }

        event.preventDefault();
        const nextStep = event.deltaY < 0 ? wheelZoomStep : -wheelZoomStep;

        setZoomOffset((currentValue) => clamp(currentValue + nextStep, minZoomOffset, maxZoomOffset));
    }

    return (
        <section className="space-y-4">
            <ModuleIntro badge="CROP" title={t('imageCrop.introTitle')} description={t('imageCrop.introDescription')} />

            <section className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
                <section className={`${panelClassName} space-y-4`}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('imageCrop.uploadTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('imageCrop.uploadDescription')}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <FileDropzone
                            accept="image/*"
                            label={sourceImage ? t('imageCrop.replaceImage') : t('imageCrop.uploadImage')}
                            onFilesSelect={handleFilesSelect}
                        />
                        <Button variant="secondary" disabled={!sourceImage} onClick={handleClear}>
                            {t('imageCrop.clearImage')}
                        </Button>
                    </div>

                    <div className="rounded-2xl border border-neutral-j bg-fill-b p-4">
                        <div>
                            <p className="text-title-lg text-text-e">{t('imageCrop.cropTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('imageCrop.cropDescription')}</p>
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                            <div className="rounded-2xl border border-neutral-j bg-fill-a px-3 py-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-body-sm text-text-c" htmlFor="crop-zoom">
                                        {t('imageCrop.zoom')}
                                    </label>
                                    <p className="text-body-sm text-text-d">{zoomRatio.toFixed(2)}x</p>
                                </div>
                                <input
                                    id="crop-zoom"
                                    type="range"
                                    min={minZoomOffset}
                                    max={maxZoomOffset}
                                    step={0.01}
                                    value={zoomOffset}
                                    onChange={(event) => {
                                        setZoomOffset(Number(event.target.value));
                                    }}
                                    className="mt-2 w-full"
                                    disabled={!sourceImage}
                                />
                            </div>

                            <div className="rounded-2xl border border-neutral-j bg-fill-a px-3 py-2.5">
                                <div className="flex items-center justify-between gap-3">
                                    <label className="text-body-sm text-text-c" htmlFor="crop-rotation">
                                        {t('imageCrop.rotation')}
                                    </label>
                                    <p className="text-body-sm text-text-d">{rotation}°</p>
                                </div>
                                <input
                                    id="crop-rotation"
                                    type="range"
                                    min={-180}
                                    max={180}
                                    step={1}
                                    value={rotation}
                                    onChange={(event) => {
                                        setRotation(Number(event.target.value));
                                    }}
                                    className="mt-2 w-full"
                                    disabled={!sourceImage}
                                />
                            </div>
                        </div>

                        <div className="mt-3 overflow-hidden rounded-2xl border border-neutral-j bg-fill-a">
                            {sourceImage ? (
                                <div ref={cropStageRef} className="h-[22rem] w-full" onWheel={handleCropperWheel}>
                                    <Cropper
                                        key={sourceImage.src}
                                        ref={cropperRef}
                                        src={sourceImage.src}
                                        style={{ height: '100%', width: '100%' }}
                                        className="h-full w-full"
                                        data={initialCropData ?? undefined}
                                        viewMode={1}
                                        guides
                                        background={false}
                                        responsive
                                        autoCropArea={defaultCropWidthCoverage}
                                        checkOrientation={false}
                                        dragMode="move"
                                        minCropBoxWidth={80}
                                        minCropBoxHeight={80}
                                        cropBoxResizable
                                        cropBoxMovable
                                        toggleDragModeOnDblclick={false}
                                        zoomOnWheel={false}
                                        ready={() => {
                                            const cropper = cropperRef.current?.cropper;

                                            if (!cropper) {
                                                return;
                                            }

                                            setIsCropperReady(true);
                                            previousZoomOffsetRef.current = 0;
                                            cropper.rotateTo(rotation);
                                            syncZoomRatio();
                                            schedulePreviewUpdate();
                                        }}
                                        crop={schedulePreviewUpdate}
                                        cropend={updatePreview}
                                        cropmove={updatePreview}
                                        zoom={schedulePreviewUpdate}
                                    />
                                </div>
                            ) : (
                                <div className="flex h-[22rem] items-center justify-center px-4 text-center text-body-pc-md text-text-c">
                                    {t('imageCrop.waitingImage')}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className={`${panelClassName} space-y-4`}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('imageCrop.resultTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('imageCrop.resultDescription')}</p>
                        </div>

                        <Button disabled={!hasResult} onClick={handleDownload}>
                            {t('imageCrop.download')}
                        </Button>
                    </div>

                    <div>
                        <p className="text-body-sm text-text-c">{t('imageCrop.resultPreview')}</p>
                        <div className="mt-2 flex min-h-[28rem] items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-fill-b p-4">
                            {error ? (
                                <p className="text-body-pc-md text-error">{error}</p>
                            ) : (
                                <>
                                    <canvas
                                        ref={previewCanvasRef}
                                        className={
                                            hasResult ? 'max-h-[36rem] w-full rounded-xl object-contain' : 'hidden'
                                        }
                                    />
                                    {!hasResult && (
                                        <p className="text-body-pc-md text-text-c">{t('imageCrop.waitingImage')}</p>
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
