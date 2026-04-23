import { Suspense } from 'react';
import type { ToolModuleSlug } from '@/modules/tool-registry';
import type { Language } from '@/services/i18n/constant';
import { ToolRouteFallback } from './ToolRouteFallback';

async function renderToolComponent(slug: ToolModuleSlug, language: Language) {
    switch (slug) {
        case 'timestamp': {
            const { TimestampConverter } = await import('@/modules/timestamp');
            return <TimestampConverter />;
        }
        case 'exchange-rate': {
            const { ExchangeRateConverter } = await import('@/modules/exchange-rate');
            return <ExchangeRateConverter language={language} />;
        }
        case 'qrcode': {
            const { QrCodeTool } = await import('@/modules/qrcode');
            return <QrCodeTool language={language} />;
        }
        case 'image-watermark': {
            const { ImageWatermarkTool } = await import('@/modules/image-watermark');
            return <ImageWatermarkTool />;
        }
        case 'image-unwatermark': {
            const { ImageUnwatermarkTool } = await import('@/modules/image-unwatermark');
            return <ImageUnwatermarkTool />;
        }
        case 'image-crop': {
            const { ImageCropTool } = await import('@/modules/image-crop');
            return <ImageCropTool />;
        }
        case 'xhs-unwatermark': {
            const { XhsUnwatermarkTool } = await import('@/modules/xhs-unwatermark');
            return <XhsUnwatermarkTool language={language} />;
        }
        case 'base64': {
            const { Base64Tool } = await import('@/modules/base64');
            return <Base64Tool language={language} />;
        }
        case 'json-tools': {
            const { JsonTools } = await import('@/modules/json-tools');
            return <JsonTools language={language} />;
        }
        case 'markdown': {
            const { MarkdownTool } = await import('@/modules/markdown');
            return <MarkdownTool language={language} />;
        }
        case 'local-network': {
            const { LocalNetworkTool } = await import('@/modules/local-network');
            return <LocalNetworkTool language={language} />;
        }
        case 'network-speed': {
            const { NetworkSpeedTool } = await import('@/modules/network-speed');
            return <NetworkSpeedTool />;
        }
        case 'http-test': {
            const { HttpTestTool } = await import('@/modules/http-test');
            return <HttpTestTool language={language} />;
        }
        case 'websocket-test': {
            const { WebSocketTestTool } = await import('@/modules/websocket-test');
            return <WebSocketTestTool language={language} />;
        }
        default: {
            const { TimestampConverter } = await import('@/modules/timestamp');
            return <TimestampConverter />;
        }
    }
}

async function ToolRouteSlot({ slug, language }: { slug: ToolModuleSlug; language: Language }) {
    return renderToolComponent(slug, language);
}

type ToolRouteRendererProps = {
    slug: ToolModuleSlug;
    language: Language;
};

export function ToolRouteRenderer({ slug, language }: ToolRouteRendererProps) {
    return (
        <Suspense fallback={<ToolRouteFallback />}>
            <ToolRouteSlot slug={slug} language={language} />
        </Suspense>
    );
}
