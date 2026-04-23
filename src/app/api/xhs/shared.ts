import { isLanguage, type Language } from '@/services/i18n/constant';
import { translate } from '@/services/i18n/messages';

export const xhsRequestHeaders = {
    Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    Referer: 'https://www.xiaohongshu.com/',
    'User-Agent':
        process.env.XHS_USER_AGENT ||
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
};

const pageHostnames = new Set(['www.xiaohongshu.com', 'xiaohongshu.com', 'xhslink.com']);
const mediaHostnames = new Set(['ci.xiaohongshu.com']);

export function getPayloadLanguage(language: unknown): Language {
    return isLanguage(language) ? language : 'zh';
}

export function apiError(language: Language, key: string, status = 400) {
    return Response.json({ message: translate(language, key) }, { status });
}

export function isAllowedXhsPageUrl(url: URL) {
    return ['http:', 'https:'].includes(url.protocol) && pageHostnames.has(url.hostname.toLowerCase());
}

export function isAllowedXhsMediaUrl(url: URL) {
    const hostname = url.hostname.toLowerCase();

    return (
        ['http:', 'https:'].includes(url.protocol) && (mediaHostnames.has(hostname) || hostname.endsWith('.xhscdn.com'))
    );
}

export function extractFirstXhsUrl(content: string) {
    const normalized = content.trim();
    const match = normalized.match(
        /(?:https?:\/\/)?(?:(?:www\.)?xiaohongshu\.com\/(?:explore|discovery\/item|user\/profile\/[a-zA-Z0-9]+\/)[^\s"<>\\^`{|}，。；！？、〖〗《》]+|xhslink\.com\/[^\s"<>\\^`{|}，。；！？、〖〗《》]+)/i,
    );

    if (!match) {
        return null;
    }

    return match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
}

export function safeFileName(input: string, fallback: string) {
    const cleaned = input
        .replace(/[\\/:*?"<>|]+/g, '-')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 96);

    return cleaned || fallback;
}

export function extensionFromContentType(contentType: string) {
    const normalized = contentType.split(';')[0]?.trim().toLowerCase();

    switch (normalized) {
        case 'image/jpeg':
            return 'jpg';
        case 'image/png':
            return 'png';
        case 'image/webp':
            return 'webp';
        case 'image/heic':
        case 'image/heif':
            return 'heic';
        case 'video/mp4':
            return 'mp4';
        case 'video/quicktime':
            return 'mov';
        default:
            return '';
    }
}

export function buildContentDisposition(name: string, contentType: string) {
    const baseName = safeFileName(name, 'xhs-media');
    const hasExtension = /\.[a-z0-9]{2,5}$/i.test(baseName);
    const extension = hasExtension ? '' : extensionFromContentType(contentType);
    const fileName = extension ? `${baseName}.${extension}` : baseName;
    const asciiName = fileName.replace(/[^\x20-\x7E]/g, '_').replace(/"/g, "'");
    const encodedName = encodeURIComponent(fileName);

    return `attachment; filename="${asciiName}"; filename*=UTF-8''${encodedName}`;
}
