'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';
import type { XhsResolvedMedia, XhsResolvePayload } from './types';

const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const textareaClassName =
    'min-h-36 w-full resize-y rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';

function buildMediaProxyUrl(media: Pick<XhsResolvedMedia, 'fileName' | 'url'>, download = false) {
    const searchParams = new URLSearchParams({
        name: media.fileName,
        url: media.url,
    });

    if (download) {
        searchParams.set('download', '1');
    }

    return `/api/xhs/media?${searchParams.toString()}`;
}

function formatBytes(value?: number) {
    if (!value || value <= 0) {
        return '';
    }

    if (value >= 1024 * 1024 * 1024) {
        return `${(value / 1024 / 1024 / 1024).toFixed(2)} GB`;
    }

    if (value >= 1024 * 1024) {
        return `${(value / 1024 / 1024).toFixed(1)} MB`;
    }

    return `${Math.round(value / 1024)} KB`;
}

function mediaToneClass(kind: XhsResolvedMedia['kind']) {
    if (kind === 'video' || kind === 'live-photo-motion') {
        return 'border-[rgba(49,120,198,0.22)] bg-[rgba(49,120,198,0.1)] text-[rgb(31,92,154)]';
    }

    if (kind === 'live-photo-image') {
        return 'border-[rgba(217,119,6,0.18)] bg-[rgba(245,158,11,0.12)] text-[rgb(180,83,9)]';
    }

    return 'border-primary-200 bg-primary-100 text-primary-700';
}

function isResolvePayload(payload: XhsResolvePayload | { message?: string } | null): payload is XhsResolvePayload {
    return Boolean(payload && 'media' in payload && 'note' in payload);
}

export function XhsUnwatermarkClient() {
    const { language, t } = useI18n();
    const [content, setContent] = useState('');
    const [result, setResult] = useState<XhsResolvePayload | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const groupedMedia = useMemo(() => {
        if (!result) {
            return [];
        }

        const map = new Map<string, XhsResolvedMedia[]>();

        for (const media of result.media) {
            const key = media.groupId || media.id;
            const group = map.get(key) ?? [];

            group.push(media);
            map.set(key, group);
        }

        return [...map.entries()];
    }, [result]);

    async function handleResolve() {
        if (!content.trim()) {
            setError(t('xhsUnwatermark.emptyInput'));
            setResult(null);
            return;
        }

        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/xhs/resolve', {
                body: JSON.stringify({ content, language }),
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
            });
            const payload = (await response.json().catch(() => null)) as
                | XhsResolvePayload
                | { message?: string }
                | null;
            const responseMessage = payload && 'message' in payload ? payload.message : '';

            if (!response.ok || !isResolvePayload(payload)) {
                throw new Error(responseMessage || t('xhsUnwatermark.resolveFailed'));
            }

            setResult(payload);
        } catch (resolveError) {
            setResult(null);
            setError(resolveError instanceof Error ? resolveError.message : t('xhsUnwatermark.resolveFailed'));
        } finally {
            setLoading(false);
        }
    }

    function startDownload(media: XhsResolvedMedia, delay = 0) {
        window.setTimeout(() => {
            const link = document.createElement('a');

            link.href = buildMediaProxyUrl(media, true);
            link.download = media.fileName;
            link.rel = 'noreferrer';
            document.body.appendChild(link);
            link.click();
            link.remove();
        }, delay);
    }

    function handleDownloadAll() {
        result?.media.forEach((media, index) => {
            startDownload(media, index * 220);
        });
    }

    function handleClear() {
        setContent('');
        setResult(null);
        setError('');
    }

    return (
        <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)]">
            <section className={`${panelClassName} flex min-h-0 flex-col`}>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-title-lg text-text-e">{t('xhsUnwatermark.inputTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('xhsUnwatermark.inputDescription')}</p>
                    </div>
                    <ClearButton
                        disabled={!content && !result && !error}
                        label={t('xhsUnwatermark.clear')}
                        onClick={handleClear}
                    />
                </div>

                <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
                    <label className="text-body-sm text-text-c" htmlFor="xhs-share-content">
                        {t('xhsUnwatermark.shareContent')}
                    </label>
                    <textarea
                        id="xhs-share-content"
                        className={textareaClassName}
                        value={content}
                        onChange={(event) => {
                            setContent(event.target.value);
                        }}
                        placeholder={t('xhsUnwatermark.sharePlaceholder')}
                    />
                    <Button
                        loading={loading}
                        className="h-12 w-full rounded-[2rem]"
                        onClick={() => void handleResolve()}
                    >
                        {t('xhsUnwatermark.resolve')}
                    </Button>
                </div>

                {error ? (
                    <p className="mt-4 rounded-2xl border border-error bg-[rgba(235,51,51,0.08)] px-4 py-3 text-body-pc-md text-error">
                        {error}
                    </p>
                ) : null}

                {result ? (
                    <div className="mt-4 rounded-2xl border border-neutral-j bg-fill-b p-4">
                        <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                            {t('xhsUnwatermark.noteInfo')}
                        </p>
                        <p className="mt-2 break-words text-title-lg text-text-e">{result.note.title}</p>
                        <div className="mt-3 grid gap-2 text-body-pc-md text-text-d">
                            <p>{t('xhsUnwatermark.mediaCount', { count: result.media.length })}</p>
                            {result.note.authorName ? (
                                <p>{t('xhsUnwatermark.author', { name: result.note.authorName })}</p>
                            ) : null}
                            <a
                                href={result.note.sourceUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="break-all text-primary-500 hover:text-primary-400"
                            >
                                {result.note.sourceUrl}
                            </a>
                        </div>
                        {result.warnings.length ? (
                            <div className="mt-3 space-y-2">
                                {result.warnings.map((warning) => (
                                    <p
                                        key={warning}
                                        className="rounded-xl border border-[rgba(217,119,6,0.18)] bg-[rgba(245,158,11,0.12)] px-3 py-2 text-body-sm text-[rgb(180,83,9)]"
                                    >
                                        {warning}
                                    </p>
                                ))}
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </section>

            <section className={`${panelClassName} flex min-h-0 flex-col`}>
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <p className="text-title-lg text-text-e">{t('xhsUnwatermark.resultTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('xhsUnwatermark.resultDescription')}</p>
                    </div>
                    <Button variant="secondary" disabled={!result?.media.length} onClick={handleDownloadAll}>
                        {t('xhsUnwatermark.downloadAll')}
                    </Button>
                </div>

                {!result ? (
                    <div className="mt-4 flex min-h-72 items-center justify-center rounded-2xl border border-dashed border-neutral-j bg-fill-b px-4 text-center text-body-pc-md text-text-c">
                        {t('xhsUnwatermark.waiting')}
                    </div>
                ) : (
                    <div className="mt-4 grid min-h-0 gap-4 overflow-auto pr-1">
                        {groupedMedia.map(([groupId, items], groupIndex) => (
                            <div key={groupId} className="rounded-2xl border border-neutral-j bg-fill-b p-3">
                                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-body-sm text-text-c">
                                        {t('xhsUnwatermark.groupLabel', { index: groupIndex + 1 })}
                                    </p>
                                    {items.length > 1 ? (
                                        <span className="rounded-full border border-[rgba(217,119,6,0.18)] bg-[rgba(245,158,11,0.12)] px-3 py-1 text-body-xs text-[rgb(180,83,9)]">
                                            {t('xhsUnwatermark.livePhotoPair')}
                                        </span>
                                    ) : null}
                                </div>
                                <div className={cn('grid gap-3', items.length > 1 && 'lg:grid-cols-2')}>
                                    {items.map((media) => {
                                        const previewUrl = buildMediaProxyUrl(media);
                                        const bytes = formatBytes(media.size);

                                        return (
                                            <article
                                                key={media.id}
                                                className="overflow-hidden rounded-xl border border-neutral-j bg-fill-a"
                                            >
                                                <div className="aspect-video bg-fill-c">
                                                    {media.kind === 'image' || media.kind === 'live-photo-image' ? (
                                                        <Image
                                                            src={previewUrl}
                                                            alt={media.fileName}
                                                            width={960}
                                                            height={540}
                                                            unoptimized
                                                            className="h-full w-full object-contain"
                                                        />
                                                    ) : (
                                                        // biome-ignore lint/a11y/useMediaCaption: External XHS media does not provide caption tracks.
                                                        <video
                                                            src={previewUrl}
                                                            className="h-full w-full object-contain"
                                                            controls
                                                            preload="metadata"
                                                        />
                                                    )}
                                                </div>
                                                <div className="space-y-3 p-3">
                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <span
                                                            className={cn(
                                                                'rounded-full border px-2.5 py-1 text-body-xs uppercase',
                                                                mediaToneClass(media.kind),
                                                            )}
                                                        >
                                                            {t(`xhsUnwatermark.kind.${media.kind}`)}
                                                        </span>
                                                        {media.qualityLabel ? (
                                                            <span className="rounded-full border border-neutral-j bg-fill-b px-2.5 py-1 text-body-xs text-text-d">
                                                                {media.qualityLabel}
                                                            </span>
                                                        ) : null}
                                                        {bytes ? (
                                                            <span className="rounded-full border border-neutral-j bg-fill-b px-2.5 py-1 text-body-xs text-text-d">
                                                                {bytes}
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                    <p className="break-all text-body-sm text-text-d">
                                                        {media.fileName}
                                                    </p>
                                                    <Button className="w-full" onClick={() => startDownload(media)}>
                                                        {t('xhsUnwatermark.download')}
                                                    </Button>
                                                </div>
                                            </article>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </section>
    );
}
