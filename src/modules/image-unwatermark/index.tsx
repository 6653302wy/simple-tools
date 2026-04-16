'use client';

import { type PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { FileDropzone } from '@/components/FileDropzone';
import { ModuleIntro } from '@/components/ModuleIntro';
import { Select } from '@/components/Select';
import { useI18n } from '@/services/i18n';

const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const rangeHeaderClassName = 'flex items-center justify-between gap-3 text-body-sm';

type LoadedImage = {
    height: number;
    name: string;
    src: string;
    width: number;
};

type SelectionRect = {
    height: number;
    width: number;
    x: number;
    y: number;
};

type CanvasPoint = {
    x: number;
    y: number;
};

type RepairDirection = 'auto' | 'top' | 'right' | 'bottom' | 'left';

type SampleRect = SelectionRect & {
    direction: Exclude<RepairDirection, 'auto'>;
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

function normalizeSelectionRect(
    start: CanvasPoint,
    end: CanvasPoint,
    maxWidth: number,
    maxHeight: number,
): SelectionRect {
    const left = clamp(Math.min(start.x, end.x), 0, maxWidth);
    const top = clamp(Math.min(start.y, end.y), 0, maxHeight);
    const right = clamp(Math.max(start.x, end.x), 0, maxWidth);
    const bottom = clamp(Math.max(start.y, end.y), 0, maxHeight);

    return {
        x: Math.round(left),
        y: Math.round(top),
        width: Math.round(Math.max(0, right - left)),
        height: Math.round(Math.max(0, bottom - top)),
    };
}

function isValidSelectionRect(selection: SelectionRect | null) {
    return Boolean(selection && selection.width >= 12 && selection.height >= 12);
}

function expandSelectionRect(
    selection: SelectionRect,
    padding: number,
    maxWidth: number,
    maxHeight: number,
): SelectionRect {
    const nextX = clamp(selection.x - padding, 0, maxWidth);
    const nextY = clamp(selection.y - padding, 0, maxHeight);
    const nextRight = clamp(selection.x + selection.width + padding, 0, maxWidth);
    const nextBottom = clamp(selection.y + selection.height + padding, 0, maxHeight);

    return {
        x: nextX,
        y: nextY,
        width: Math.max(1, nextRight - nextX),
        height: Math.max(1, nextBottom - nextY),
    };
}

function createSampleRect(
    targetRect: SelectionRect,
    direction: Exclude<RepairDirection, 'auto'>,
    maxWidth: number,
    maxHeight: number,
): SampleRect | null {
    const targetThickness =
        direction === 'top' || direction === 'bottom'
            ? clamp(Math.round(targetRect.height * 0.9), 16, Math.max(16, Math.round(maxHeight * 0.24)))
            : clamp(Math.round(targetRect.width * 0.9), 16, Math.max(16, Math.round(maxWidth * 0.24)));

    if (direction === 'top') {
        const height = Math.min(targetThickness, targetRect.y);

        if (height <= 0) {
            return null;
        }

        return {
            direction,
            x: targetRect.x,
            y: targetRect.y - height,
            width: targetRect.width,
            height,
        };
    }

    if (direction === 'bottom') {
        const availableHeight = maxHeight - (targetRect.y + targetRect.height);
        const height = Math.min(targetThickness, availableHeight);

        if (height <= 0) {
            return null;
        }

        return {
            direction,
            x: targetRect.x,
            y: targetRect.y + targetRect.height,
            width: targetRect.width,
            height,
        };
    }

    if (direction === 'left') {
        const width = Math.min(targetThickness, targetRect.x);

        if (width <= 0) {
            return null;
        }

        return {
            direction,
            x: targetRect.x - width,
            y: targetRect.y,
            width,
            height: targetRect.height,
        };
    }

    const availableWidth = maxWidth - (targetRect.x + targetRect.width);
    const width = Math.min(targetThickness, availableWidth);

    if (width <= 0) {
        return null;
    }

    return {
        direction,
        x: targetRect.x + targetRect.width,
        y: targetRect.y,
        width,
        height: targetRect.height,
    };
}

function resolveSampleRect(
    targetRect: SelectionRect,
    repairDirection: RepairDirection,
    maxWidth: number,
    maxHeight: number,
): SampleRect | null {
    const directionOrder: Array<Exclude<RepairDirection, 'auto'>> =
        repairDirection === 'auto'
            ? ['right', 'bottom', 'left', 'top']
            : [repairDirection, 'right', 'bottom', 'left', 'top'];

    const sampleCandidates = directionOrder
        .map((direction) => createSampleRect(targetRect, direction, maxWidth, maxHeight))
        .filter((candidate): candidate is SampleRect => Boolean(candidate));

    if (!sampleCandidates.length) {
        return null;
    }

    if (repairDirection !== 'auto' && sampleCandidates[0]) {
        return sampleCandidates[0];
    }

    return sampleCandidates.reduce((bestCandidate, currentCandidate) => {
        const bestArea = bestCandidate.width * bestCandidate.height;
        const currentArea = currentCandidate.width * currentCandidate.height;

        return currentArea > bestArea ? currentCandidate : bestCandidate;
    });
}

function getCanvasPoint(event: ReactPointerEvent<HTMLCanvasElement>, canvas: HTMLCanvasElement): CanvasPoint {
    const rect = canvas.getBoundingClientRect();
    const relativeX = (event.clientX - rect.left) / rect.width;
    const relativeY = (event.clientY - rect.top) / rect.height;

    return {
        x: clamp(relativeX * canvas.width, 0, canvas.width),
        y: clamp(relativeY * canvas.height, 0, canvas.height),
    };
}

function drawEditorCanvas(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    selection: SelectionRect | null,
    expandedSelection: SelectionRect | null,
) {
    const context = canvas.getContext('2d');

    if (!context) {
        return;
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    if (!selection) {
        return;
    }

    context.save();
    context.fillStyle = 'rgba(0,54,22,0.2)';
    context.fillRect(0, 0, canvas.width, selection.y);
    context.fillRect(0, selection.y, selection.x, selection.height);
    context.fillRect(
        selection.x + selection.width,
        selection.y,
        canvas.width - selection.x - selection.width,
        selection.height,
    );
    context.fillRect(0, selection.y + selection.height, canvas.width, canvas.height - selection.y - selection.height);
    context.restore();

    if (expandedSelection) {
        context.save();
        context.strokeStyle = 'rgba(52,175,97,0.75)';
        context.lineWidth = 2;
        context.setLineDash([12, 8]);
        context.strokeRect(
            expandedSelection.x + 1,
            expandedSelection.y + 1,
            Math.max(0, expandedSelection.width - 2),
            Math.max(0, expandedSelection.height - 2),
        );
        context.restore();
    }

    context.save();
    context.strokeStyle = '#34AF61';
    context.lineWidth = 3;
    context.setLineDash([]);
    context.strokeRect(
        selection.x + 1.5,
        selection.y + 1.5,
        Math.max(0, selection.width - 3),
        Math.max(0, selection.height - 3),
    );
    context.fillStyle = '#34AF61';
    const tagText = `${selection.width}×${selection.height}`;
    context.font = '600 20px "Roboto", "Inter", sans-serif';
    const textWidth = context.measureText(tagText).width;
    const tagWidth = textWidth + 22;
    const tagHeight = 32;
    const tagX = selection.x;
    const tagY = selection.y >= tagHeight + 12 ? selection.y - tagHeight - 8 : selection.y + 8;

    context.fillRect(tagX, tagY, tagWidth, tagHeight);
    context.fillStyle = '#F8FBF9';
    context.textBaseline = 'middle';
    context.fillText(tagText, tagX + 11, tagY + tagHeight / 2 + 1);
    context.restore();
}

function renderRepairResult(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    selection: SelectionRect,
    padding: number,
    feather: number,
    repairDirection: RepairDirection,
) {
    const context = canvas.getContext('2d');

    if (!context) {
        throw new Error('canvas-context-unavailable');
    }

    const expandedSelection = expandSelectionRect(selection, padding, image.naturalWidth, image.naturalHeight);
    const sampleRect = resolveSampleRect(expandedSelection, repairDirection, image.naturalWidth, image.naturalHeight);

    if (!sampleRect) {
        throw new Error('sample-region-unavailable');
    }

    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = image.naturalWidth;
    sourceCanvas.height = image.naturalHeight;
    const sourceContext = sourceCanvas.getContext('2d');

    if (!sourceContext) {
        throw new Error('source-context-unavailable');
    }

    sourceContext.drawImage(image, 0, 0);

    const patchCanvas = document.createElement('canvas');
    patchCanvas.width = expandedSelection.width;
    patchCanvas.height = expandedSelection.height;
    const patchContext = patchCanvas.getContext('2d');

    if (!patchContext) {
        throw new Error('patch-context-unavailable');
    }

    patchContext.drawImage(
        sourceCanvas,
        sampleRect.x,
        sampleRect.y,
        sampleRect.width,
        sampleRect.height,
        0,
        0,
        expandedSelection.width,
        expandedSelection.height,
    );

    const softPatchCanvas = document.createElement('canvas');
    softPatchCanvas.width = expandedSelection.width;
    softPatchCanvas.height = expandedSelection.height;
    const softPatchContext = softPatchCanvas.getContext('2d');

    if (!softPatchContext) {
        throw new Error('soft-patch-context-unavailable');
    }

    if (feather > 0) {
        softPatchContext.filter = `blur(${Math.max(feather * 1.4, feather + 2)}px)`;
        softPatchContext.drawImage(patchCanvas, 0, 0);

        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = expandedSelection.width;
        maskCanvas.height = expandedSelection.height;
        const maskContext = maskCanvas.getContext('2d');

        if (!maskContext) {
            throw new Error('mask-context-unavailable');
        }

        const inset = Math.min(
            Math.max(1, Math.round(feather * 1.8)),
            Math.floor(maskCanvas.width / 2) - 1,
            Math.floor(maskCanvas.height / 2) - 1,
        );

        maskContext.filter = `blur(${Math.max(feather * 1.6, feather + 4)}px)`;
        maskContext.fillStyle = '#ffffff';
        maskContext.fillRect(
            Math.max(0, inset),
            Math.max(0, inset),
            Math.max(1, maskCanvas.width - inset * 2),
            Math.max(1, maskCanvas.height - inset * 2),
        );

        softPatchContext.globalCompositeOperation = 'destination-in';
        softPatchContext.drawImage(maskCanvas, 0, 0);
        softPatchContext.globalCompositeOperation = 'source-over';
    } else {
        softPatchContext.drawImage(patchCanvas, 0, 0);
    }

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);

    context.save();
    context.drawImage(softPatchCanvas, expandedSelection.x, expandedSelection.y);
    context.restore();
}

export function ImageUnwatermarkTool() {
    const { t } = useI18n();
    const objectUrlRef = useRef<string | null>(null);
    const imageElementRef = useRef<HTMLImageElement | null>(null);
    const editorCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const resultCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const dragStartRef = useRef<CanvasPoint | null>(null);
    const [sourceImage, setSourceImage] = useState<LoadedImage | null>(null);
    const [selection, setSelection] = useState<SelectionRect | null>(null);
    const [error, setError] = useState('');
    const [padding, setPadding] = useState(18);
    const [feather, setFeather] = useState(12);
    const [repairDirection, setRepairDirection] = useState<RepairDirection>('auto');
    const [hasResult, setHasResult] = useState(false);

    const isSelectionReady = isValidSelectionRect(selection);
    const expandedSelection = useMemo(
        () =>
            sourceImage && selection && isSelectionReady
                ? expandSelectionRect(selection, padding, sourceImage.width, sourceImage.height)
                : null,
        [isSelectionReady, padding, selection, sourceImage],
    );
    const directionOptions = useMemo(
        () => [
            { label: t('imageUnwatermark.autoDirection'), value: 'auto' },
            { label: t('imageUnwatermark.directionRight'), value: 'right' },
            { label: t('imageUnwatermark.directionBottom'), value: 'bottom' },
            { label: t('imageUnwatermark.directionLeft'), value: 'left' },
            { label: t('imageUnwatermark.directionTop'), value: 'top' },
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
        const canvas = editorCanvasRef.current;
        const image = imageElementRef.current;

        if (!canvas || !image || !sourceImage) {
            return;
        }

        drawEditorCanvas(canvas, image, isSelectionReady ? selection : null, expandedSelection);
    }, [expandedSelection, isSelectionReady, selection, sourceImage]);

    useEffect(() => {
        const canvas = resultCanvasRef.current;
        const image = imageElementRef.current;

        if (!canvas || !image || !sourceImage || !selection || !isSelectionReady) {
            setHasResult(false);
            return;
        }

        try {
            renderRepairResult(canvas, image, selection, padding, feather, repairDirection);
            setHasResult(true);
            setError('');
        } catch {
            setHasResult(false);
            setError(t('imageUnwatermark.renderFailed'));
        }
    }, [feather, isSelectionReady, padding, repairDirection, selection, sourceImage, t]);

    async function handleFilesSelect(files: FileList) {
        const file = files[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            setError(t('imageUnwatermark.invalidImage'));
            return;
        }

        try {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }

            const objectUrl = URL.createObjectURL(file);
            objectUrlRef.current = objectUrl;
            const image = await loadImage(objectUrl);

            imageElementRef.current = image;
            setSourceImage({
                name: file.name,
                src: objectUrl,
                width: image.naturalWidth,
                height: image.naturalHeight,
            });
            setSelection(null);
            setHasResult(false);
            setError('');
        } catch {
            imageElementRef.current = null;
            setSourceImage(null);
            setSelection(null);
            setHasResult(false);
            setError(t('imageUnwatermark.invalidImage'));
        }
    }

    function handleClearImage() {
        if (objectUrlRef.current) {
            URL.revokeObjectURL(objectUrlRef.current);
            objectUrlRef.current = null;
        }

        imageElementRef.current = null;
        setSourceImage(null);
        setSelection(null);
        setHasResult(false);
        setError('');
    }

    function handleClearSelection() {
        setSelection(null);
        setHasResult(false);
        setError('');
    }

    function handlePointerDown(event: ReactPointerEvent<HTMLCanvasElement>) {
        if (!sourceImage) {
            return;
        }

        const canvas = event.currentTarget;
        const startPoint = getCanvasPoint(event, canvas);

        dragStartRef.current = startPoint;
        setSelection({
            x: Math.round(startPoint.x),
            y: Math.round(startPoint.y),
            width: 0,
            height: 0,
        });
        canvas.setPointerCapture(event.pointerId);
    }

    function handlePointerMove(event: ReactPointerEvent<HTMLCanvasElement>) {
        const startPoint = dragStartRef.current;

        if (!sourceImage || !startPoint) {
            return;
        }

        const canvas = event.currentTarget;
        const currentPoint = getCanvasPoint(event, canvas);
        setSelection(normalizeSelectionRect(startPoint, currentPoint, sourceImage.width, sourceImage.height));
    }

    function finalizeSelection() {
        dragStartRef.current = null;

        setSelection((currentSelection) => {
            if (!isValidSelectionRect(currentSelection)) {
                return null;
            }

            return currentSelection;
        });
    }

    function handlePointerUp(event: ReactPointerEvent<HTMLCanvasElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        finalizeSelection();
    }

    function handlePointerCancel(event: ReactPointerEvent<HTMLCanvasElement>) {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }

        finalizeSelection();
    }

    function handleDownload() {
        const resultCanvas = resultCanvasRef.current;

        if (!resultCanvas || !sourceImage || !hasResult) {
            return;
        }

        const link = document.createElement('a');
        const dotIndex = sourceImage.name.lastIndexOf('.');
        const fileName = dotIndex > 0 ? sourceImage.name.slice(0, dotIndex) : sourceImage.name;

        link.href = resultCanvas.toDataURL('image/png');
        link.download = `${fileName}-cleaned.png`;
        link.click();
    }

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro
                badge="CLEAN"
                title={t('imageUnwatermark.introTitle')}
                description={t('imageUnwatermark.introDescription')}
            />

            <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
                <section className={`${panelClassName} flex min-h-0 flex-col`}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('imageUnwatermark.uploadTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('imageUnwatermark.uploadDescription')}</p>
                    </div>

                    <div className="my-4 flex flex-wrap gap-2">
                        <FileDropzone
                            accept="image/*"
                            label={sourceImage ? t('imageUnwatermark.replaceImage') : t('imageUnwatermark.uploadImage')}
                            onFilesSelect={handleFilesSelect}
                        />
                        <ClearButton
                            disabled={!sourceImage}
                            label={t('imageUnwatermark.clearImage')}
                            onClick={handleClearImage}
                        />
                        <ClearButton
                            disabled={!selection}
                            label={t('imageUnwatermark.clearSelection')}
                            onClick={handleClearSelection}
                        />
                    </div>

                    <div className="grid gap-3 md:grid-cols-3">
                        <div className="rounded-2xl border border-neutral-j bg-fill-b px-3 py-2.5">
                            <label className="text-body-sm text-text-c" htmlFor="repair-direction">
                                {t('imageUnwatermark.direction')}
                            </label>
                            <div className="mt-2">
                                <Select
                                    id="repair-direction"
                                    value={repairDirection}
                                    options={directionOptions}
                                    onValueChange={(value) => {
                                        setRepairDirection(value as RepairDirection);
                                    }}
                                />
                            </div>
                        </div>

                        <div className="rounded-2xl border border-neutral-j bg-fill-b px-3 py-2.5">
                            <div className={rangeHeaderClassName}>
                                <label className="text-body-sm text-text-c" htmlFor="repair-padding">
                                    {t('imageUnwatermark.padding')}
                                </label>
                                <p className="text-body-sm text-text-d">{padding}px</p>
                            </div>
                            <input
                                id="repair-padding"
                                type="range"
                                min={0}
                                max={80}
                                step={1}
                                value={padding}
                                onChange={(event) => {
                                    setPadding(Number(event.target.value));
                                }}
                                className="mt-2 w-full"
                                disabled={!sourceImage}
                            />
                        </div>

                        <div className="rounded-2xl border border-neutral-j bg-fill-b px-3 py-2.5">
                            <div className={rangeHeaderClassName}>
                                <label className="text-body-sm text-text-c" htmlFor="repair-feather">
                                    {t('imageUnwatermark.feather')}
                                </label>
                                <p className="text-body-sm text-text-d">{feather}px</p>
                            </div>
                            <input
                                id="repair-feather"
                                type="range"
                                min={0}
                                max={48}
                                step={1}
                                value={feather}
                                onChange={(event) => {
                                    setFeather(Number(event.target.value));
                                }}
                                className="mt-2 w-full"
                                disabled={!sourceImage}
                            />
                        </div>
                    </div>

                    <div className="mt-3 flex min-h-0 flex-1 flex-col rounded-2xl border border-neutral-j bg-fill-b p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                                <p className="text-title-lg text-text-e">{t('imageUnwatermark.selectionTitle')}</p>
                                <p className="mt-1 truncate whitespace-nowrap text-body-pc-md text-text-d">
                                    {t('imageUnwatermark.selectionDescription')}
                                </p>
                            </div>
                            <p className="min-w-[8.5rem] shrink-0 rounded-full bg-primary-100 px-3 py-1 text-center text-body-sm whitespace-nowrap text-primary-700">
                                {expandedSelection
                                    ? t('imageUnwatermark.selectionBadge', {
                                          width: expandedSelection.width,
                                          height: expandedSelection.height,
                                      })
                                    : t('imageUnwatermark.selectionIdleBadge')}
                            </p>
                        </div>

                        <div className="mt-3 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-primary-200 bg-fill-a p-4">
                            {sourceImage ? (
                                <canvas
                                    ref={editorCanvasRef}
                                    onPointerDown={handlePointerDown}
                                    onPointerMove={handlePointerMove}
                                    onPointerUp={handlePointerUp}
                                    onPointerCancel={handlePointerCancel}
                                    className="max-h-full w-full touch-none rounded-xl object-contain select-none"
                                />
                            ) : (
                                <p className="text-center text-body-pc-md text-text-c">
                                    {t('imageUnwatermark.waitingImage')}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                <section className={`${panelClassName} flex min-h-0 flex-col`}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-title-lg text-text-e">{t('imageUnwatermark.resultTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">
                                {t('imageUnwatermark.resultDescription')}
                            </p>
                        </div>

                        <Button disabled={!hasResult} onClick={handleDownload}>
                            {t('imageUnwatermark.download')}
                        </Button>
                    </div>

                    <div className="mt-3 rounded-2xl border border-primary-200 bg-primary-50/50 px-4 py-3 text-body-sm leading-6 text-text-d">
                        {t('imageUnwatermark.tip')}
                    </div>

                    <div className="mt-3 flex min-h-0 flex-1 flex-col">
                        <p className="text-body-sm text-text-c">{t('imageUnwatermark.resultPreview')}</p>
                        <div className="mt-2 flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-primary-200 bg-fill-b p-4">
                            <canvas
                                ref={resultCanvasRef}
                                className={
                                    hasResult && !error ? 'max-h-full w-full rounded-xl object-contain' : 'hidden'
                                }
                            />
                            {error ? (
                                <p className="text-center text-body-pc-md text-error">{error}</p>
                            ) : (
                                !hasResult && (
                                    <p className="text-center text-body-pc-md text-text-c">
                                        {sourceImage
                                            ? t('imageUnwatermark.waitingSelection')
                                            : t('imageUnwatermark.waitingImage')}
                                    </p>
                                )
                            )}
                        </div>
                    </div>
                </section>
            </section>
        </section>
    );
}
