'use client';

import jsQR from 'jsqr';
import type { Language } from '@/services/i18n/constant';

export async function blobToDataUrl(blob: Blob) {
    return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result);
                return;
            }

            reject(new Error('Unable to convert blob to data url.'));
        };

        reader.onerror = () => {
            reject(reader.error ?? new Error('Unable to read blob.'));
        };

        reader.readAsDataURL(blob);
    });
}

export async function fetchRemoteImageBlob(url: string, language?: Language) {
    const searchParams = new URLSearchParams({ url });

    if (language) {
        searchParams.set('lang', language);
    }

    const response = await fetch(`/api/image-proxy?${searchParams.toString()}`, {
        cache: 'no-store',
    });

    if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { message?: string } | null;

        throw new Error(payload?.message ?? 'Unable to fetch remote image.');
    }

    return await response.blob();
}

async function loadImageElement(src: string) {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();

        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error('Unable to load image.'));
        image.src = src;
    });
}

export async function decodeQrCodeFromImage(source: Blob | string) {
    const objectUrl = typeof source === 'string' ? null : URL.createObjectURL(source);
    const src = typeof source === 'string' ? source : objectUrl;

    if (!src) {
        throw new Error('Invalid image source.');
    }

    try {
        const image = await loadImageElement(src);
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d', { willReadFrequently: true });

        if (!context) {
            throw new Error('Unable to access canvas context.');
        }

        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        context.drawImage(image, 0, 0);

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const qrResult = jsQR(imageData.data, imageData.width, imageData.height);

        return qrResult?.data ?? null;
    } finally {
        if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
        }
    }
}
