'use client';

import Image from 'next/image';
import QRCode from 'qrcode';
import { type ChangeEvent, useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { ModuleIntro } from '@/components/ModuleIntro';
import { decodeQrCodeFromImage, fetchRemoteImageBlob } from '@/modules/shared/media';

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const textareaClassName =
    'mt-2 min-h-32 w-full rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

export function QrCodeTool() {
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

                setGenerateError('二维码生成失败，请检查输入内容。');
            });

        return () => {
            cancelled = true;
        };
    }, [qrText]);

    async function handleDecodeFromSource(source: Blob | string, sourceLabel: string, previewUrl?: string) {
        try {
            const qrValue = await decodeQrCodeFromImage(source);

            if (!qrValue) {
                setDecodeError('未识别到二维码，请更换更清晰的图片。');
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
            setDecodeError(error instanceof Error ? error.message : '二维码解析失败。');
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

        await handleDecodeFromSource(file, `本地文件 · ${file.name}`, previewUrl);
        event.target.value = '';
    }

    async function handleUrlDecode() {
        if (!decodeImageUrl.trim()) {
            setDecodeError('请输入可访问的图片链接。');
            return;
        }

        try {
            const imageBlob = await fetchRemoteImageBlob(decodeImageUrl.trim());

            await handleDecodeFromSource(imageBlob, '网络图片链接', decodeImageUrl.trim());
        } catch (error) {
            setDecodeError(error instanceof Error ? error.message : '网络图片解析失败。');
            setDecodedText('');
            setDecodeSourceLabel('网络图片链接');
            setDecodePreview('');
        }
    }

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="QR"
                title="二维码生成与反解"
                description="支持文本生成二维码，也支持上传本地二维码图片或输入网络图片链接进行反解。"
            />

            <section className="grid gap-4 xl:grid-cols-2">
                <section className={panelClassName}>
                    <div>
                        <p className="text-title-lg text-text-e">二维码生成</p>
                        <p className="mt-1 text-body-pc-md text-text-d">输入任意文字、链接或配置串，实时生成二维码。</p>
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="qr-text-input">
                            输入内容
                        </label>
                        <textarea
                            id="qr-text-input"
                            className={textareaClassName}
                            value={qrText}
                            onChange={(event) => {
                                setQrText(event.target.value);
                            }}
                            placeholder="输入想编码到二维码中的文字或链接"
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
                                <p className="text-body-pc-md text-text-c">生成后的二维码会显示在这里。</p>
                            )}
                        </div>
                    )}
                </section>

                <section className={panelClassName}>
                    <div>
                        <p className="text-title-lg text-text-e">二维码反解</p>
                        <p className="mt-1 text-body-pc-md text-text-d">
                            支持上传本地图片，或通过网络图片链接解析二维码内容。
                        </p>
                    </div>

                    <div className="mt-4 grid gap-4">
                        <div>
                            <label className="text-body-sm text-text-c" htmlFor="qr-image-url">
                                网络图片链接
                            </label>
                            <input
                                id="qr-image-url"
                                className={inputClassName}
                                value={decodeImageUrl}
                                onChange={(event) => {
                                    setDecodeImageUrl(event.target.value);
                                }}
                                placeholder="https://example.com/qr.png"
                            />
                            <div className="mt-3 flex flex-wrap gap-2">
                                <Button variant="secondary" onClick={() => void handleUrlDecode()}>
                                    解析链接图片
                                </Button>
                                <label className="inline-flex">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFileDecode}
                                    />
                                    <span className="inline-flex cursor-pointer items-center justify-center rounded-full bg-fill-b px-4 py-[9.5px] text-title-md text-text-e transition hover:bg-fill-c">
                                        上传本地图片
                                    </span>
                                </label>
                            </div>
                        </div>

                        {(decodePreview || decodeSourceLabel) && (
                            <div className="rounded-xl border border-neutral-j bg-fill-b p-3">
                                <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">当前图片来源</p>
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
                            <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">解析结果</p>
                            {decodeError ? (
                                <p className="mt-2 text-body-pc-md text-error">{decodeError}</p>
                            ) : decodedText ? (
                                <p className="mt-2 break-all text-body-pc-md text-text-e">{decodedText}</p>
                            ) : (
                                <p className="mt-2 text-body-pc-md text-text-c">等待图片输入。</p>
                            )}
                        </div>
                    </div>
                </section>
            </section>
        </section>
    );
}
