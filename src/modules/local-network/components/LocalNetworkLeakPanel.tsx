'use client';

import { CopyButton } from '@/components/CopyButton';
import { ToolPanel } from '@/components/ToolPanel';
import { cn } from '@/libs/utils';
import type { LeakResult } from '../types';

type LocalNetworkLeakPanelProps = {
    title: string;
    leakResult: LeakResult;
    t: (key: string, variables?: Record<string, string | number>) => string;
};

export function LocalNetworkLeakPanel({ title, leakResult, t }: LocalNetworkLeakPanelProps) {
    const summaryLabel = !leakResult.supported
        ? t('localNetwork.browserUnsupported')
        : leakResult.addresses.length
          ? t('localNetwork.leakDetected', { count: leakResult.addresses.length })
          : t('localNetwork.leakNotDetected');
    const hasPublicAddress = leakResult.addresses.some((item) => item.visibility === 'public');

    return (
        <ToolPanel
            className="overflow-hidden"
            title={title}
            description={t('localNetwork.leakDescription')}
            action={
                leakResult.addresses.length ? (
                    <CopyButton
                        className="h-10 px-3 text-body-sm"
                        text={leakResult.addresses.map((item) => item.address).join('\n')}
                    />
                ) : null
            }
            bodyClassName="p-4 pt-0"
        >
            <div className="rounded-2xl border border-neutral-j bg-fill-b/70 p-4">
                <p className="text-title-md text-text-e">{summaryLabel}</p>
                <p className={cn('mt-2 text-body-pc-md', hasPublicAddress ? 'text-[rgb(220,38,38)]' : 'text-text-d')}>
                    {hasPublicAddress ? t('localNetwork.leakPublic') : t('localNetwork.leakPrivate')}
                </p>
                <p className="mt-2 text-body-sm leading-6 text-text-c">{t('localNetwork.leakNote')}</p>

                {leakResult.addresses.length ? (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {leakResult.addresses.map((item) => (
                            <span
                                key={`${title}-${item.address}`}
                                className={cn(
                                    'inline-flex items-center rounded-full border px-3 py-1.5 text-body-sm',
                                    item.visibility === 'public'
                                        ? 'border-[rgba(239,68,68,0.22)] bg-[rgba(239,68,68,0.1)] text-[rgb(220,38,38)]'
                                        : 'border-primary-200 bg-primary-100 text-primary-700',
                                )}
                            >
                                {`${item.address} · ${item.visibility === 'public' ? t('localNetwork.publicAddress') : t('localNetwork.privateAddress')}`}
                            </span>
                        ))}
                    </div>
                ) : null}
            </div>
        </ToolPanel>
    );
}
