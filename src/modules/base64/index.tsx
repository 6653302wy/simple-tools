'use client';

import Image from 'next/image';
import { type ChangeEvent, useState } from 'react';
import { Button } from '@/components/Button';
import { CopyButton } from '@/components/CopyButton';
import { ModuleIntro } from '@/components/ModuleIntro';
import { decodeBase64ToText, encodeTextToBase64 } from '@/modules/shared/base64';
import { blobToDataUrl, fetchRemoteImageBlob } from '@/modules/shared/media';

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const textareaClassName =
    'mt-2 min-h-36 w-full rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

export function Base64Tool() {
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
            setTextError('文字编码失败，请检查输入内容。');
        }
    }

    function handleDecodeText() {
        try {
            setTextOutput(decodeBase64ToText(textInput));
            setTextError('');
        } catch {
            setTextError('Base64 解析失败，请确认输入合法。');
        }
    }

    async function handleImageFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        try {
            const dataUrl = await blobToDataUrl(file);

            setImageBase64(dataUrl);
            setImagePreview(dataUrl);
            setImageError('');
            setImageSourceLabel(`本地文件 · ${file.name}`);
        } catch {
            setImageError('本地图片转换失败。');
        } finally {
            event.target.value = '';
        }
    }

    async function handleImageUrl() {
        if (!imageUrl.trim()) {
            setImageError('请输入网络图片链接。');
            return;
        }

        try {
            const imageBlob = await fetchRemoteImageBlob(imageUrl.trim());
            const dataUrl = await blobToDataUrl(imageBlob);

            setImageBase64(dataUrl);
            setImagePreview(dataUrl);
            setImageError('');
            setImageSourceLabel('网络图片链接');
        } catch (error) {
            setImageError(error instanceof Error ? error.message : '网络图片转换失败。');
        }
    }

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="B64"
                title="Base64 编解码"
                description="支持文字转 Base64 和反解析，也支持上传本地图片或输入网络图片链接转换为 Base64。"
            />

            <section className="grid gap-4 xl:grid-cols-2">
                <section className={panelClassName}>
                    <div>
                        <p className="text-title-lg text-text-e">文字 Base64</p>
                        <p className="mt-1 text-body-pc-md text-text-d">适合调试接口签名、认证串和基础文本编解码。</p>
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="base64-text-input">
                            输入内容
                        </label>
                        <textarea
                            id="base64-text-input"
                            className={textareaClassName}
                            value={textInput}
                            onChange={(event) => {
                                setTextInput(event.target.value);
                            }}
                            placeholder="输入普通文字或 Base64 字符串"
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button onClick={handleEncodeText}>文字转 Base64</Button>
                        <Button variant="secondary" onClick={handleDecodeText}>
                            解析 Base64
                        </Button>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-body-sm text-text-c" htmlFor="base64-text-output">
                                输出结果
                            </label>
                            <CopyButton
                                text={textError || textOutput}
                                className="px-3 py-2 text-body-sm"
                                idleLabel="复制结果"
                            />
                        </div>
                        <textarea
                            id="base64-text-output"
                            className={textareaClassName}
                            value={textError || textOutput}
                            readOnly
                            placeholder="转换结果会显示在这里"
                        />
                    </div>
                </section>

                <section className={panelClassName}>
                    <div>
                        <p className="text-title-lg text-text-e">图片转 Base64</p>
                        <p className="mt-1 text-body-pc-md text-text-d">
                            支持上传本地图片，或通过网络图片链接转成 Data URL。
                        </p>
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="image-url-input">
                            网络图片链接
                        </label>
                        <input
                            id="image-url-input"
                            className={inputClassName}
                            value={imageUrl}
                            onChange={(event) => {
                                setImageUrl(event.target.value);
                            }}
                            placeholder="https://example.com/image.png"
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <Button onClick={() => void handleImageUrl()}>转换链接图片</Button>
                        <label className="inline-flex">
                            <input type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
                            <span className="inline-flex cursor-pointer items-center justify-center rounded-full bg-fill-b px-4 py-[9.5px] text-title-md text-text-e transition hover:bg-fill-c">
                                上传本地图片
                            </span>
                        </label>
                    </div>

                    {(imagePreview || imageSourceLabel) && (
                        <div className="mt-4 rounded-xl border border-neutral-j bg-fill-b p-3">
                            <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">当前来源</p>
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

                    <div className="mt-4">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-body-sm text-text-c" htmlFor="image-base64-output">
                                Base64 输出
                            </label>
                            <CopyButton
                                text={imageError || imageBase64}
                                className="px-3 py-2 text-body-sm"
                                idleLabel="复制结果"
                            />
                        </div>
                        <textarea
                            id="image-base64-output"
                            className={textareaClassName}
                            value={imageError || imageBase64}
                            readOnly
                            placeholder="图片转换后的 Base64 会显示在这里"
                        />
                    </div>
                </section>
            </section>
        </section>
    );
}
