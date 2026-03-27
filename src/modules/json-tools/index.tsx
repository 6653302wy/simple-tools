'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { CopyButton } from '@/components/CopyButton';
import { ModuleIntro } from '@/components/ModuleIntro';
import { useLeaveConfirm } from '@/services/useLeaveConfirm';

const textareaClassName =
    'mt-2 min-h-72 w-full rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

const sampleJson = `{
  "tool": "simple-tools",
  "modules": ["timestamp", "exchange-rate", "qrcode"],
  "enabled": true
}`;

export function JsonTools() {
    const [source, setSource] = useState(sampleJson);
    const [result, setResult] = useState('');
    const [status, setStatus] = useState('等待校验');
    const { setGuard } = useLeaveConfirm();
    const isDirty = source !== sampleJson;

    useEffect(() => {
        setGuard({
            active: isDirty,
            title: 'JSON 内容已修改',
            description: '你对当前 JSON 做了自定义修改，切换到其他工具后将离开当前编辑状态，确定继续离开吗？',
        });

        return () => {
            setGuard({
                active: false,
                title: '',
                description: '',
            });
        };
    }, [isDirty, setGuard]);

    function parseSource() {
        return JSON.parse(source);
    }

    function handleValidate() {
        try {
            parseSource();
            setStatus('JSON 合法');
            setResult('');
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'JSON 校验失败');
        }
    }

    function handleFormat() {
        try {
            const parsed = parseSource();

            setResult(JSON.stringify(parsed, null, 2));
            setStatus('已按 2 空格缩进格式化');
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'JSON 格式化失败');
        }
    }

    function handleCompress() {
        try {
            const parsed = parseSource();

            setResult(JSON.stringify(parsed));
            setStatus('已压缩 JSON');
        } catch (error) {
            setStatus(error instanceof Error ? error.message : 'JSON 压缩失败');
        }
    }

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="JSON"
                title="JSON 校验与格式化"
                description="用于校验 JSON 合法性，快速格式化输出，或压缩成单行 JSON 方便接口调试和日志处理。"
            />

            <section className={panelClassName}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-title-lg text-text-e">JSON 工作台</p>
                        <p className="mt-1 text-body-pc-md text-text-d">
                            输入原始 JSON 字符串后，可执行校验、格式化或压缩。
                        </p>
                    </div>
                    <div className="rounded-full border border-primary-200 bg-primary-100 px-4 py-2 text-body-sm text-primary-700">
                        {status}
                    </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button onClick={handleValidate}>校验</Button>
                    <Button variant="secondary" onClick={handleFormat}>
                        格式化
                    </Button>
                    <Button variant="secondary" onClick={handleCompress}>
                        压缩
                    </Button>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-2">
                    <div>
                        <label className="text-body-sm text-text-c" htmlFor="json-source">
                            输入 JSON
                        </label>
                        <textarea
                            id="json-source"
                            className={textareaClassName}
                            value={source}
                            onChange={(event) => {
                                setSource(event.target.value);
                            }}
                            placeholder="输入待校验的 JSON 字符串"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-body-sm text-text-c" htmlFor="json-result">
                                处理结果
                            </label>
                            <CopyButton text={result} className="px-3 py-2 text-body-sm" idleLabel="复制结果" />
                        </div>
                        <textarea
                            id="json-result"
                            className={textareaClassName}
                            value={result}
                            readOnly
                            placeholder="格式化或压缩后的 JSON 会显示在这里"
                        />
                    </div>
                </div>
            </section>
        </section>
    );
}
