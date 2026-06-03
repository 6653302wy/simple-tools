'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { CopyButton } from '@/components/CopyButton';
import { useI18n } from '@/services/i18n';

const textareaClassName =
    'mt-2 min-h-0 w-full flex-1 rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

const sampleJwt =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkphbmUgRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTcxMDAwMDAwMCwiZXhwIjoxODkzNDU2MDAwfQ.demo-signature';

type JwtParseResult = {
    headerText: string;
    payloadText: string;
    signature: string;
    payload: Record<string, unknown>;
};

function decodeBase64Url(part: string) {
    const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=');
    const binary = window.atob(padded);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

    return new TextDecoder().decode(bytes);
}

function parseJwtJsonPart(part: string) {
    return JSON.parse(decodeBase64Url(part)) as unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseJwt(source: string): JwtParseResult {
    const token = source.trim();

    if (!token) {
        throw new Error('JWT is empty.');
    }

    const parts = token.split('.');

    if (parts.length !== 3 || !parts[0] || !parts[1]) {
        throw new Error('JWT must contain header and payload parts.');
    }

    const header = parseJwtJsonPart(parts[0]);
    const payload = parseJwtJsonPart(parts[1]);

    if (!isRecord(header) || !isRecord(payload)) {
        throw new Error('JWT header and payload must be JSON objects.');
    }

    return {
        headerText: JSON.stringify(header, null, 2),
        payloadText: JSON.stringify(payload, null, 2),
        signature: parts[2],
        payload,
    };
}

function formatUnixClaim(value: unknown) {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return '';
    }

    return new Date(value * 1000).toLocaleString();
}

export function JwtParserClient() {
    const { t } = useI18n();
    const [token, setToken] = useState(sampleJwt);
    const [headerText, setHeaderText] = useState('');
    const [payloadText, setPayloadText] = useState('');
    const [signature, setSignature] = useState('');
    const [payload, setPayload] = useState<Record<string, unknown> | null>(null);
    const [status, setStatus] = useState(t('jwt.statusIdle'));

    const claimRows = useMemo(() => {
        if (!payload) {
            return [];
        }

        return [
            { label: 'sub', value: payload.sub },
            { label: 'iss', value: payload.iss },
            { label: 'aud', value: payload.aud },
            { label: 'iat', value: formatUnixClaim(payload.iat) || payload.iat },
            { label: 'nbf', value: formatUnixClaim(payload.nbf) || payload.nbf },
            { label: 'exp', value: formatUnixClaim(payload.exp) || payload.exp },
        ].filter((row) => row.value !== undefined && row.value !== '');
    }, [payload]);

    function handleParse() {
        try {
            const parsed = parseJwt(token);

            setHeaderText(parsed.headerText);
            setPayloadText(parsed.payloadText);
            setSignature(parsed.signature);
            setPayload(parsed.payload);
            setStatus(t('jwt.statusParsed'));
        } catch (error) {
            setHeaderText('');
            setPayloadText('');
            setSignature('');
            setPayload(null);
            setStatus(error instanceof Error ? error.message : t('jwt.statusParseFailed'));
        }
    }

    function handleClear() {
        setToken('');
        setHeaderText('');
        setPayloadText('');
        setSignature('');
        setPayload(null);
        setStatus(t('jwt.statusIdle'));
    }

    return (
        <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(20rem,0.9fr)_minmax(24rem,1.1fr)]">
            <section className={`${panelClassName} flex min-h-0 flex-col`}>
                <div>
                    <p className="text-title-lg text-text-e">{t('jwt.inputTitle')}</p>
                    <p className="mt-1 text-body-pc-md text-text-d">{t('jwt.inputDescription')}</p>
                </div>

                <div className="mt-4 flex min-h-0 flex-1 flex-col">
                    <div className="flex items-center justify-between gap-3">
                        <label className="text-body-sm text-text-c" htmlFor="jwt-token-input">
                            {t('jwt.token')}
                        </label>
                        <ClearButton className="px-3 py-2 text-body-sm" disabled={!token} onClick={handleClear} />
                    </div>
                    <textarea
                        id="jwt-token-input"
                        className={textareaClassName}
                        value={token}
                        onChange={(event) => {
                            setToken(event.target.value);
                        }}
                        placeholder={t('jwt.tokenPlaceholder')}
                    />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={handleParse}>{t('jwt.parse')}</Button>
                </div>

                <div className="mt-4 rounded-xl border border-neutral-j bg-fill-b p-3">
                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">{t('jwt.status')}</p>
                    <p className="mt-1 text-body-pc-md text-text-e">{status}</p>
                    <p className="mt-2 text-body-sm text-text-c">{t('jwt.verifyNotice')}</p>
                </div>
            </section>

            <section className={`${panelClassName} flex min-h-0 flex-col`}>
                <div>
                    <p className="text-title-lg text-text-e">{t('jwt.resultTitle')}</p>
                    <p className="mt-1 text-body-pc-md text-text-d">{t('jwt.resultDescription')}</p>
                </div>

                {claimRows.length > 0 ? (
                    <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                        {claimRows.map((row) => (
                            <div key={row.label} className="rounded-xl border border-neutral-j bg-fill-b p-3">
                                <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">{row.label}</p>
                                <p className="mt-1 break-words text-body-sm text-text-e">{String(row.value)}</p>
                            </div>
                        ))}
                    </div>
                ) : null}

                <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
                    <div className="flex min-h-0 flex-col">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-body-sm text-text-c" htmlFor="jwt-header-output">
                                {t('jwt.header')}
                            </label>
                            {headerText ? (
                                <CopyButton
                                    text={headerText}
                                    className="px-3 py-2 text-body-sm"
                                    idleLabel={t('common.copyResult')}
                                />
                            ) : null}
                        </div>
                        <textarea
                            id="jwt-header-output"
                            className={textareaClassName}
                            value={headerText}
                            readOnly
                            placeholder={t('jwt.headerPlaceholder')}
                        />
                    </div>

                    <div className="flex min-h-0 flex-col">
                        <div className="flex items-center justify-between gap-3">
                            <label className="text-body-sm text-text-c" htmlFor="jwt-payload-output">
                                {t('jwt.payload')}
                            </label>
                            {payloadText ? (
                                <CopyButton
                                    text={payloadText}
                                    className="px-3 py-2 text-body-sm"
                                    idleLabel={t('common.copyResult')}
                                />
                            ) : null}
                        </div>
                        <textarea
                            id="jwt-payload-output"
                            className={textareaClassName}
                            value={payloadText}
                            readOnly
                            placeholder={t('jwt.payloadPlaceholder')}
                        />
                    </div>
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between gap-3">
                        <label className="text-body-sm text-text-c" htmlFor="jwt-signature-output">
                            {t('jwt.signature')}
                        </label>
                        {signature ? (
                            <CopyButton
                                text={signature}
                                className="px-3 py-2 text-body-sm"
                                idleLabel={t('common.copyResult')}
                            />
                        ) : null}
                    </div>
                    <input
                        id="jwt-signature-output"
                        className="mt-2 w-full rounded-xl border border-neutral-j bg-fill-b px-3 py-3 text-body-pc-md text-text-e outline-none"
                        value={signature}
                        readOnly
                        placeholder={t('jwt.signaturePlaceholder')}
                    />
                </div>
            </section>
        </section>
    );
}
