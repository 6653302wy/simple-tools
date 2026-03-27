'use client';

import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyButton } from '@/components/CopyButton';
import { ModuleIntro } from '@/components/ModuleIntro';
import { useLeaveConfirm } from '@/services/useLeaveConfirm';

const textareaClassName =
    'mt-4 min-h-80 w-full rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a lg:min-h-[26rem] lg:max-h-[calc(100vh-20rem)] lg:overflow-y-auto';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';
const previewViewportClassName =
    'mt-4 min-h-80 overflow-y-auto rounded-xl border border-neutral-j bg-fill-b p-4 lg:min-h-[26rem] lg:max-h-[calc(100vh-20rem)]';

const initialMarkdown = `# Markdown Playground

支持 **实时编辑**、表格、任务列表和代码块。

## 功能清单

- 左侧输入 Markdown
- 右侧实时预览
- 下方复制渲染后的 HTML 结果

\`\`\`ts
const tool = 'markdown';
console.log(tool);
\`\`\`

| Name | Value |
| --- | --- |
| format | GFM |
| preview | live |
`;

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
    const [markdown, setMarkdown] = useState(initialMarkdown);
    const { setGuard } = useLeaveConfirm();
    const isDirty = markdown !== initialMarkdown;

    useEffect(() => {
        setGuard({
            active: isDirty,
            title: 'Markdown 内容已修改',
            description:
                '你正在编辑的 Markdown 还有未确认的自定义内容，切换到其他工具后将离开当前编辑状态，确定继续离开吗？',
        });

        return () => {
            setGuard({
                active: false,
                title: '',
                description: '',
            });
        };
    }, [isDirty, setGuard]);

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="MD"
                title="Markdown 实时编辑预览"
                description="左侧输入 Markdown，右侧实时预览，适合边写边看并快速复制 Markdown 原文。"
            />

            <section className="grid gap-4 xl:grid-cols-2">
                <section className={panelClassName}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-title-lg text-text-e">Markdown 编辑区</p>
                            <p className="mt-1 text-body-pc-md text-text-d">支持 GFM 语法、代码块、表格和任务列表。</p>
                        </div>

                        <CopyButton text={markdown} className="px-3 py-2 text-body-sm" idleLabel="复制 Markdown" />
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
                        <p className="text-title-lg text-text-e">实时预览</p>
                        <p className="mt-1 text-body-pc-md text-text-d">预览区与输入内容保持同步，便于边写边看。</p>
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
