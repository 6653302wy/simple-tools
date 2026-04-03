'use client';

import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';
import { useLeaveConfirm } from '@/services/useLeaveConfirm';

const textareaClassName =
    'mt-4 min-h-0 w-full flex-1 rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition [scrollbar-gutter:stable] focus:border-primary-400 focus:bg-fill-a lg:resize-none lg:overflow-y-auto';
const panelClassName =
    'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)] lg:flex lg:min-h-0 lg:flex-col';
const previewViewportClassName =
    'mt-4 min-h-0 flex-1 overflow-y-auto rounded-xl border border-neutral-j bg-fill-b p-4 [scrollbar-gutter:stable]';

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

export function MarkdownToolClient() {
    const { t } = useI18n();
    const localizedSample = t('markdown.sample');
    const previousSampleRef = useRef(localizedSample);
    const resizeContainerRef = useRef<HTMLElement | null>(null);
    const isResizingRef = useRef(false);
    const [markdown, setMarkdown] = useState(localizedSample);
    const [editorWidth, setEditorWidth] = useState(50);
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

    useEffect(() => {
        function handlePointerMove(event: PointerEvent) {
            if (!isResizingRef.current || !resizeContainerRef.current) {
                return;
            }

            const rect = resizeContainerRef.current.getBoundingClientRect();
            const nextWidth = ((event.clientX - rect.left) / rect.width) * 100;
            const clampedWidth = Math.min(80, Math.max(20, nextWidth));

            setEditorWidth(clampedWidth);
        }

        function stopResizing() {
            isResizingRef.current = false;
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        }

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', stopResizing);
        window.addEventListener('pointercancel', stopResizing);

        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', stopResizing);
            window.removeEventListener('pointercancel', stopResizing);
        };
    }, []);

    function startResizing(event: ReactPointerEvent<HTMLButtonElement>) {
        if (window.innerWidth < 1280) {
            return;
        }

        event.preventDefault();
        isResizingRef.current = true;
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'col-resize';
    }

    const resizeStyle = {
        '--markdown-editor-width': `${editorWidth}%`,
    } as CSSProperties;

    return (
        <section
            ref={resizeContainerRef}
            className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(20rem,var(--markdown-editor-width))_12px_minmax(20rem,1fr)] xl:gap-0"
            style={resizeStyle}
        >
            <section className={panelClassName}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-title-lg text-text-e">{t('markdown.editorTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('markdown.editorDescription')}</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <ClearButton
                            className="px-3 py-2 text-body-sm"
                            disabled={!markdown}
                            onClick={() => {
                                setMarkdown('');
                            }}
                        />
                    </div>
                </div>

                <textarea
                    className={textareaClassName}
                    value={markdown}
                    onChange={(event) => {
                        setMarkdown(event.target.value);
                    }}
                />
            </section>

            <Button
                variant="plain"
                aria-label="Resize markdown panels"
                onPointerDown={startResizing}
                className={cn(
                    'hidden xl:flex xl:min-h-0 xl:items-center xl:justify-center p-0',
                    'group relative cursor-col-resize bg-transparent hover:bg-primary-100/40',
                )}
            >
                <span className="pointer-events-none h-full w-[2px] rounded-full bg-neutral-j transition group-hover:bg-primary-300" />
                <span className="pointer-events-none absolute inset-y-1/2 h-10 w-2 -translate-y-1/2 rounded-full bg-primary-200/0 transition group-hover:bg-primary-200/80" />
            </Button>

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
    );
}
