'use client';

import { useEffect, useMemo, useState } from 'react';
import * as YAML from 'yaml';
import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { CopyButton } from '@/components/CopyButton';
import { useI18n } from '@/services/i18n';
import { useLeaveConfirm } from '@/services/useLeaveConfirm';

const textareaClassName =
    'mt-2 min-h-0 w-full flex-1 rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

const sampleYaml = `tool: simple-tools
modules:
  - yaml-tools
  - jwt-parser
  - color-converter
settings:
  indent: 2
  enabled: true
`;

type ParsedYaml = {
    value: unknown;
    documents: unknown[];
};

function parseYamlDocuments(source: string): ParsedYaml {
    if (!source.trim()) {
        throw new Error('YAML content is empty.');
    }

    const documents = YAML.parseAllDocuments(source, { prettyErrors: false });
    const errors = documents.flatMap((document) => document.errors);

    if (errors.length > 0) {
        throw new Error(errors.map((error) => error.message).join('\n'));
    }

    if (documents.length === 0) {
        throw new Error('YAML document is empty.');
    }

    const values = documents.map((document) => document.toJS());

    return {
        value: values.length === 1 ? values[0] : values,
        documents: values,
    };
}

function stringifyYamlDocuments(documents: unknown[]) {
    return `${documents
        .map((document) =>
            YAML.stringify(document, {
                indent: 2,
                lineWidth: 0,
            }).trimEnd(),
        )
        .join('\n---\n')}\n`;
}

export function YamlToolsClient() {
    const { t } = useI18n();
    const localizedSampleYaml = useMemo(() => sampleYaml, []);
    const [source, setSource] = useState(localizedSampleYaml);
    const [result, setResult] = useState('');
    const [status, setStatus] = useState(t('yaml.statusIdle'));
    const { setGuard } = useLeaveConfirm();
    const isDirty = source !== localizedSampleYaml;

    useEffect(() => {
        setGuard({
            active: isDirty,
            title: t('yaml.dirtyTitle'),
            description: t('yaml.dirtyDescription'),
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
        if (!isDirty) {
            setStatus(t('yaml.statusIdle'));
        }
    }, [isDirty, t]);

    function handleValidate() {
        try {
            parseYamlDocuments(source);
            setResult('');
            setStatus(t('yaml.statusValid'));
        } catch (error) {
            setStatus(error instanceof Error ? error.message : t('yaml.statusValidateFailed'));
        }
    }

    function handleFormatYaml() {
        try {
            const parsed = parseYamlDocuments(source);

            setResult(stringifyYamlDocuments(parsed.documents));
            setStatus(t('yaml.statusFormatted'));
        } catch (error) {
            setStatus(error instanceof Error ? error.message : t('yaml.statusFormatFailed'));
        }
    }

    function handleParseJson() {
        try {
            const parsed = parseYamlDocuments(source);

            setResult(JSON.stringify(parsed.value, null, 2));
            setStatus(t('yaml.statusParsed'));
        } catch (error) {
            setStatus(error instanceof Error ? error.message : t('yaml.statusParseFailed'));
        }
    }

    function handleCompressJson() {
        try {
            const parsed = parseYamlDocuments(source);

            setResult(JSON.stringify(parsed.value));
            setStatus(t('yaml.statusCompressed'));
        } catch (error) {
            setStatus(error instanceof Error ? error.message : t('yaml.statusCompressFailed'));
        }
    }

    return (
        <section className={`${panelClassName} flex min-h-0 flex-1 flex-col`}>
            <div>
                <p className="text-title-lg text-text-e">{t('yaml.panelTitle')}</p>
                <p className="mt-1 text-body-pc-md text-text-d">{t('yaml.panelDescription')}</p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={handleValidate}>{t('yaml.validate')}</Button>
                <Button onClick={handleFormatYaml}>{t('yaml.formatYaml')}</Button>
                <Button variant="secondary" onClick={handleParseJson}>
                    {t('yaml.parseJson')}
                </Button>
                <Button variant="secondary" onClick={handleCompressJson}>
                    {t('yaml.compressJson')}
                </Button>
            </div>

            <div className="mt-4 flex min-h-0 flex-1 flex-col gap-4 xl:flex-row">
                <div className="flex min-h-0 flex-col xl:flex-1">
                    <div className="flex min-h-12 items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <label className="text-body-sm text-text-c" htmlFor="yaml-source">
                                {t('yaml.inputYaml')}
                            </label>
                            <div className="mt-1 h-8 rounded-full opacity-0" aria-hidden="true" />
                        </div>
                        <ClearButton
                            className="shrink-0 px-3 py-2 text-body-sm"
                            disabled={!source}
                            onClick={() => {
                                setSource('');
                                setStatus(t('yaml.statusIdle'));
                                setResult('');
                            }}
                        />
                    </div>
                    <textarea
                        id="yaml-source"
                        className={textareaClassName}
                        value={source}
                        onChange={(event) => {
                            setSource(event.target.value);
                        }}
                        placeholder={t('yaml.inputPlaceholder')}
                    />
                </div>

                <div className="flex min-h-0 flex-col xl:flex-1">
                    <div className="flex min-h-12 items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                            <label className="text-body-sm text-text-c" htmlFor="yaml-result">
                                {t('yaml.resultTitle')}
                            </label>
                            <div className="mt-1 max-w-full truncate rounded-full bg-primary-100 px-4 py-2 text-body-sm text-primary-700">
                                {status}
                            </div>
                        </div>

                        {result ? (
                            <CopyButton
                                text={result}
                                className="shrink-0 px-3 py-2 text-body-sm"
                                idleLabel={t('common.copyResult')}
                            />
                        ) : null}
                    </div>
                    <textarea
                        id="yaml-result"
                        className={textareaClassName}
                        value={result}
                        readOnly
                        placeholder={t('yaml.resultPlaceholder')}
                    />
                </div>
            </div>
        </section>
    );
}
