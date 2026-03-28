'use client';

import Image from 'next/image';
import QRCode from 'qrcode';
import { type ChangeEvent, useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { ModuleIntro } from '@/components/ModuleIntro';
import { decodeQrCodeFromImage, fetchRemoteImageBlob } from '@/modules/shared/media';
import { useI18n } from '@/services/i18n';

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const textareaClassName =
    'mt-2 min-h-32 w-full rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

export function QrCodeTool() {
    const { language, t } = useI18n();
    const [qrText, setQrText] = useState('https://example.com/tools');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [generateError, setGenerateError] = useState('');

    const [decodeImageUrl, setDecodeImageUrl] = useState('');
    const [decodePreview, setDecodePreview] = useState('');
    const [decodedText, setDecodedText] = useState('');
    const [decodeError, setDecodeError] = useState('');
    const [decodeSourceLabel, setDecodeSourceLabel] = useState('');

    useEffect(() => {
        let cancelled = false;

        void QRCode.toDataURL(qrText.trim() || ' ', {
            errorCorrectionLevel: 'M',
            margin: 1,
            width: 1024,
            color: {
                dark: '#003616',
                light: '#FFFFFF',
            },
        })
            .then((dataUrl) => {
                if (cancelled) {
                    return;
                }

                setQrDataUrl(dataUrl);
                setGenerateError('');
            })
            .catch(() => {
                if (cancelled) {
                    return;
                }

                setGenerateError(t('qrcode.generateFailed'));
            });

        return () => {
            cancelled = true;
        };
    }, [qrText, t]);

    async function handleDecodeFromSource(source: Blob | string, sourceLabel: string, previewUrl?: string) {
        try {
            const qrValue = await decodeQrCodeFromImage(source);

            if (!qrValue) {
                setDecodeError(t('qrcode.noQrFound'));
                setDecodedText('');
                setDecodeSourceLabel(sourceLabel);
                setDecodePreview(previewUrl ?? '');
                return;
            }

            setDecodedText(qrValue);
            setDecodeError('');
            setDecodeSourceLabel(sourceLabel);
            setDecodePreview(previewUrl ?? '');
        } catch (error) {
            setDecodeError(error instanceof Error ? error.message : t('qrcode.decodeFailed'));
            setDecodedText('');
            setDecodeSourceLabel(sourceLabel);
            setDecodePreview(previewUrl ?? '');
        }
    }

    async function handleFileDecode(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const previewUrl = URL.createObjectURL(file);

        await handleDecodeFromSource(file, t('qrcode.localFileSource', { name: file.name }), previewUrl);
        event.target.value = '';
    }

    async function handleUrlDecode() {
        if (!decodeImageUrl.trim()) {
            setDecodeError(t('qrcode.enterImageUrl'));
            return;
        }

        try {
            const imageBlob = await fetchRemoteImageBlob(decodeImageUrl.trim(), language);

            await handleDecodeFromSource(imageBlob, t('qrcode.remoteImageSource'), decodeImageUrl.trim());
        } catch (error) {
            setDecodeError(error instanceof Error ? error.message : t('qrcode.decodeFailed'));
            setDecodedText('');
            setDecodeSourceLabel(t('qrcode.remoteImageSource'));
            setDecodePreview('');
        }
    }

    return (
        <section className="space-y-4">
            <ModuleIntro badge="QR" title={t('qrcode.introTitle')} description={t('qrcode.introDescription')} />

            <section className="grid gap-4 xl:grid-cols-2">
                <section className={panelClassName}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('qrcode.generateTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('qrcode.generateDescription')}</p>
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="qr-text-input">
                            {t('qrcode.inputContent')}
                        </label>
                        <textarea
                            id="qr-text-input"
                            className={textareaClassName}
                            value={qrText}
                            onChange={(event) => {
                                setQrText(event.target.value);
                            }}
                            placeholder={t('qrcode.inputPlaceholder')}
                        />
                    </div>

                    {generateError ? (
                        <p className="mt-4 rounded-lg border border-error bg-[rgba(235,51,51,0.08)] px-4 py-3 text-body-pc-md text-error">
                            {generateError}
                        </p>
                    ) : (
                        <div className="mt-4 flex flex-col items-center rounded-2xl border border-dashed border-primary-200 bg-primary-100/40 px-4 py-5">
                            {qrDataUrl ? (
                                <Image
                                    src={qrDataUrl}
                                    alt="generated qr code"
                                    width={512}
                                    height={512}
                                    unoptimized
                                    className="w-full max-w-64 rounded-xl bg-white p-3"
                                    style={{ imageRendering: 'pixelated' }}
                                />
                            ) : (
                                <p className="text-body-pc-md text-text-c">{t('qrcode.generatePreviewPlaceholder')}</p>
                            )}
                        </div>
                    )}
                </section>

                <section className={panelClassName}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('qrcode.decodeTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('qrcode.decodeDescription')}</p>
                    </div>

                    <div className="mt-4 grid gap-4">
                        <div>
                            <label className="text-body-sm text-text-c" htmlFor="qr-image-url">
                                {t('qrcode.remoteImageUrl')}
                            </label>
                            <input
                                id="qr-image-url"
                                className={inputClassName}
                                value={decodeImageUrl}
                                onChange={(event) => {
                                    setDecodeImageUrl(event.target.value);
                                }}
                                placeholder={t('qrcode.remoteImagePlaceholder')}
                            />
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Button  onClick={() => void handleUrlDecode()}>
                                    {t('qrcode.decodeRemoteImage')}
                                </Button>
                                <label className="inline-flex">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileDecode}
                                    />
                                    <span className="inline-flex cursor-pointer items-center justify-center rounded-full bg-fill-b px-4 py-[9.5px] text-body-md text-text-e transition hover:bg-fill-c">
                                        {t('qrcode.uploadLocalImage')}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {(decodePreview || decodeSourceLabel) && (
                            <div className="rounded-xl border border-neutral-j bg-fill-b p-3">
                                <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                    {t('qrcode.currentImageSource')}
                                </p>
                                <p className="mt-1 text-body-pc-md text-text-e">{decodeSourceLabel}</p>
                                {decodePreview && (
                                    <Image
                                        src={decodePreview}
                                        alt="qr preview"
                                        width={640}
                                        height={360}
                                        unoptimized
                                        className="mt-3 max-h-52 w-full rounded-lg object-contain bg-fill-a"
                                    />
                                )}
                            </div>
                        )}

                        <div className="rounded-xl border border-neutral-j bg-fill-b p-3">
                            <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                {t('qrcode.decodeResult')}
                            </p>
                            {decodeError ? (
                                <p className="mt-2 text-body-pc-md text-error">{decodeError}</p>
                            ) : decodedText ? (
                                <p className="mt-2 break-all text-body-pc-md text-text-e">{decodedText}</p>
                            ) : (
                                <p className="mt-2 text-body-pc-md text-text-c">{t('qrcode.waitingForImage')}</p>
                            )}
                        </div>
                    </div>
                </section>
            </section>
        </section>
    );
}
