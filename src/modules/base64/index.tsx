'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { CopyButton } from '@/components/CopyButton';
import { FileDropzone } from '@/components/FileDropzone';
import { ModuleIntro } from '@/components/ModuleIntro';
import { decodeBase64ToText, encodeTextToBase64 } from '@/modules/shared/base64';
import { blobToDataUrl, fetchRemoteImageBlob } from '@/modules/shared/media';
import { useI18n } from '@/services/i18n';

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const textareaClassName =
    'mt-2 min-h-0 w-full flex-1 rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

export function Base64Tool() {
    const { language, t } = useI18n();
    const [textInput, setTextInput] = useState('Hello, Base64');
    const [textOutput, setTextOutput] = useState('');
    const [textError, setTextError] = useState('');

    const [imageUrl, setImageUrl] = useState('');
    const [imageBase64, setImageBase64] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [imageError, setImageError] = useState('');
    const [imageSourceLabel, setImageSourceLabel] = useState('');

    function handleEncodeText() {
        try {
            setTextOutput(encodeTextToBase64(textInput));
            setTextError('');
        } catch {
            setTextError(t('base64.textEncodeFailed'));
        }
    }

    function handleDecodeText() {
        try {
            setTextOutput(decodeBase64ToText(textInput));
            setTextError('');
        } catch {
            setTextError(t('base64.textDecodeFailed'));
        }
    }

    async function handleImageFiles(files: FileList) {
        const file = files[0];

        if (!file) {
            return;
        }

        try {
            const dataUrl = await blobToDataUrl(file);

            setImageBase64(dataUrl);
            setImagePreview(dataUrl);
            setImageError('');
            setImageSourceLabel(t('base64.localFileSource', { name: file.name }));
        } catch {
            setImageError(t('base64.localImageFailed'));
        }
    }

    async function handleImageUrl() {
        if (!imageUrl.trim()) {
            setImageError(t('base64.enterImageUrl'));
            return;
        }

        try {
            const imageBlob = await fetchRemoteImageBlob(imageUrl.trim(), language);
            const dataUrl = await blobToDataUrl(imageBlob);

            setImageBase64(dataUrl);
            setImagePreview(dataUrl);
            setImageError('');
            setImageSourceLabel(t('base64.remoteImageSource'));
        } catch (error) {
            setImageError(error instanceof Error ? error.message : t('base64.remoteImageFailed'));
        }
    }

    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <ModuleIntro badge="B64" title={t('base64.introTitle')} description={t('base64.introDescription')} />

            <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-2">
                <section className={`${panelClassName} flex min-h-0 flex-col`}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('base64.textTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('base64.textDescription')}</p>
                    </div>

                    <div className="mt-4 flex min-h-0 flex-1 flex-col">
                        <label className="text-body-sm text-text-c" htmlFor="base64-text-input">
                            {t('base64.inputContent')}
                        </label>
                        <textarea
                            id="base64-text-input"
                            className={textareaClassName}
                            value={textInput}
                            onChange={(event) => {
                                setTextInput(event.target.value);
                            }}
                            placeholder={t('base64.inputPlaceholder')}
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button onClick={handleEncodeText}>{t('base64.encodeText')}</Button>
                        <Button variant="secondary" onClick={handleDecodeText}>
                            {t('base64.decodeText')}
                        </Button>
                    </div>

                    <div className="mt-4 flex min-h-0 flex-1 flex-col">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-body-sm text-text-c" htmlFor="base64-text-output">
                                {t('base64.outputResult')}
                            </label>
                            {textError || textOutput ? (
                                <CopyButton
                                    text={textError || textOutput}
                                    className="px-3 py-2 text-body-sm"
                                    idleLabel={t('common.copyResult')}
                                />
                            ) : null}
                        </div>
                        <textarea
                            id="base64-text-output"
                            className={textareaClassName}
                            value={textError || textOutput}
                            readOnly
                            placeholder={t('base64.outputPlaceholder')}
                        />
                    </div>
                </section>

                <section className={`${panelClassName} flex min-h-0 flex-col`}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('base64.imageTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('base64.imageDescription')}</p>
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="image-url-input">
                            {t('base64.remoteImageUrl')}
                        </label>
                        <input
                            id="image-url-input"
                            className={inputClassName}
                            value={imageUrl}
                            onChange={(event) => {
                                setImageUrl(event.target.value);
                            }}
                            placeholder={t('base64.remoteImagePlaceholder')}
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button onClick={() => void handleImageUrl()}>{t('base64.convertRemoteImage')}</Button>
                        <FileDropzone
                            accept="image/*"
                            label={t('base64.uploadLocalImage')}
                            onFilesSelect={handleImageFiles}
                        />
                    </div>

                    {(imagePreview || imageSourceLabel) && (
                        <div className="mt-4 rounded-xl border border-neutral-j bg-fill-b p-3">
                            <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">
                                {t('base64.currentSource')}
                            </p>
                            <p className="mt-1 text-body-pc-md text-text-e">{imageSourceLabel}</p>
                            {imagePreview && (
                                <Image
                                    src={imagePreview}
                                    alt="base64 preview"
                                    width={640}
                                    height={360}
                                    unoptimized
                                    className="mt-3 max-h-52 w-full rounded-lg object-contain bg-fill-a"
                                />
                            )}
                        </div>
                    )}

                    <div className="mt-4 flex min-h-0 flex-1 flex-col">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-body-sm text-text-c" htmlFor="image-base64-output">
                                {t('base64.base64Output')}
                            </label>
                            {imageError || imageBase64 ? (
                                <CopyButton
                                    text={imageError || imageBase64}
                                    className="px-3 py-2 text-body-sm"
                                    idleLabel={t('common.copyResult')}
                                />
                            ) : null}
                        </div>
                        <textarea
                            id="image-base64-output"
                            className={textareaClassName}
                            value={imageError || imageBase64}
                            readOnly
                            placeholder={t('base64.base64OutputPlaceholder')}
                        />
                    </div>
                </section>
            </section>
        </section>
    );
}
