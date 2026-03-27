'use client';

import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyButton } from '@/components/CopyButton';
import { ModuleIntro } from '@/components/ModuleIntro';
import { useI18n } from '@/services/i18n';
import { useLeaveConfirm } from '@/services/useLeaveConfirm';

const textareaClassName =
    'mt-4 min-h-80 w-full rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a lg:min-h-[26rem] lg:max-h-[calc(100vh-20rem)] lg:overflow-y-auto';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const previewViewportClassName =
    'mt-4 min-h-80 overflow-y-auto rounded-xl border border-neutral-j bg-fill-b p-4 lg:min-h-[26rem] lg:max-h-[calc(100vh-20rem)]';

const markdownComponents = {
    h1: ({ ...props }: React.ComponentProps<'h1'>) => <h1 className="text-headline-sm text-text-e" {...props} />,
    h2: ({ ...props }: React.ComponentProps<'h2'>) => <h2 className="mt-5 text-headline-md text-text-e" {...props} />,
    h3: ({ ...props }: React.ComponentProps<'h3'>) => <h3 className="mt-4 text-title-xl text-text-e" {...props} />,
    p: ({ ...props }: React.ComponentProps<'p'>) => <p className="mt-3 leading-7 text-text-d" {...props} />,
    a: ({ ...props }: React.ComponentProps<'a'>) => (
        <a className="text-primary-500 underline decoration-primary-200 underline-offset-2" {...props} />
    ),
    ul: ({ ...props }: React.ComponentProps<'ul'>) => (
        <ul className="mt-3 list-disc space-y-2 pl-5 text-text-d" {...props} />
    ),
    ol: ({ ...props }: React.ComponentProps<'ol'>) => (
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-text-d" {...props} />
    ),
    li: ({ ...props }: React.ComponentProps<'li'>) => <li className="leading-7" {...props} />,
    blockquote: ({ ...props }: React.ComponentProps<'blockquote'>) => (
        <blockquote
            className="mt-4 rounded-r-lg border-l-4 border-primary-300 bg-primary-100/40 px-4 py-3 text-text-d"
            {...props}
        />
    ),
    code: ({ className, children, ...props }: React.ComponentProps<'code'>) => {
        const isBlock = className?.includes('language-');

        if (isBlock) {
            return (
                <code
                    className="block overflow-x-auto rounded-xl bg-fill-e text-text-d  px-4 py-3 text-body-pc-md "
                    {...props}
                >
                    {children}
                </code>
            );
        }

        return (
            <code className="rounded bg-fill-b px-1.5 py-0.5 text-body-pc-md text-primary-600" {...props}>
                {children}
            </code>
        );
    },
    pre: ({ ...props }: React.ComponentProps<'pre'>) => <pre className="mt-4 overflow-x-auto" {...props} />,
    table: ({ ...props }: React.ComponentProps<'table'>) => (
        <div className="mt-4 overflow-x-auto">
            <table className="min-w-full border-collapse rounded-xl border border-neutral-j bg-fill-a" {...props} />
        </div>
    ),
    th: ({ ...props }: React.ComponentProps<'th'>) => (
        <th className="border border-neutral-j bg-fill-b px-3 py-2 text-left text-title-sm text-text-e" {...props} />
    ),
    td: ({ ...props }: React.ComponentProps<'td'>) => (
        <td className="border border-neutral-j px-3 py-2 text-body-pc-md text-text-d" {...props} />
    ),
};

export function MarkdownTool() {
    const { t } = useI18n();
    const localizedSample = t('markdown.sample');
    const previousSampleRef = useRef(localizedSample);
    const [markdown, setMarkdown] = useState(localizedSample);
    const { setGuard } = useLeaveConfirm();
    const isDirty = markdown !== localizedSample;

    useEffect(() => {
        if (markdown === previousSampleRef.current) {
            setMarkdown(localizedSample);
        }

        previousSampleRef.current = localizedSample;
    }, [localizedSample, markdown]);

    useEffect(() => {
        setGuard({
            active: isDirty,
            title: t('markdown.dirtyTitle'),
            description: t('markdown.dirtyDescription'),
        });

        return () => {
            setGuard({
                active: false,
                title: '',
                description: '',
            });
        };
    }, [isDirty, setGuard, t]);

    return (
        <section className="space-y-4">
            <ModuleIntro badge="MD" title={t('markdown.introTitle')} description={t('markdown.introDescription')} />

            <section className="grid gap-4 xl:grid-cols-2">
                <section className={panelClassName}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-title-lg text-text-e">{t('markdown.editorTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('markdown.editorDescription')}</p>
                        </div>

                        <CopyButton
                            text={markdown}
                            className="px-3 py-2 text-body-sm"
                            idleLabel={t('markdown.copyMarkdown')}
                        />
                    </div>

                    <textarea
                        className={textareaClassName}
                        value={markdown}
                        onChange={(event) => {
                            setMarkdown(event.target.value);
                        }}
                    />
                </section>

                <section className={panelClassName}>
                    <div>
                        <p className="text-title-lg text-text-e">{t('markdown.previewTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('markdown.previewDescription')}</p>
                    </div>

                    <div className={previewViewportClassName}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                            {markdown}
                        </ReactMarkdown>
                    </div>
                </section>
            </section>
        </section>
    );
}
