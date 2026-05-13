'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { Select } from '@/components/Select';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';

type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'GBP' | 'JPY' | 'HKD' | 'SGD' | 'CAD';

type CurrencyMeta = {
    code: CurrencyCode;
    symbol: string;
};

type RateMap = Record<CurrencyCode, number>;

type ExchangeRatesResponse = {
    base: string;
    date: string;
    rates: Partial<Record<CurrencyCode, number | null>>;
};

const currencies: CurrencyMeta[] = [
    { code: 'USD', symbol: '$' },
    { code: 'CNY', symbol: 'CNY' },
    { code: 'EUR', symbol: 'EUR' },
    { code: 'GBP', symbol: 'GBP' },
    { code: 'JPY', symbol: 'JPY' },
    { code: 'HKD', symbol: 'HKD' },
    { code: 'SGD', symbol: 'SGD' },
    { code: 'CAD', symbol: 'CAD' },
];

const fallbackRates: RateMap = {
    USD: 1,
    CNY: 7.18,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150.6,
    HKD: 7.82,
    SGD: 1.35,
    CAD: 1.37,
};

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

function sanitizeRates(inputRates: Partial<Record<CurrencyCode, number | null>>) {
    return currencies.reduce<RateMap>(
        (accumulator, currency) => {
            const nextValue = Number(inputRates[currency.code]);

            accumulator[currency.code] =
                Number.isFinite(nextValue) && nextValue > 0 ? nextValue : fallbackRates[currency.code];

            return accumulator;
        },
        { ...fallbackRates },
    );
}

function formatCurrencyAmount(value: number, currencyCode: CurrencyCode, language: 'zh' | 'en') {
    try {
        return new Intl.NumberFormat(language === 'zh' ? 'zh-CN' : 'en-US', {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: value >= 100 ? 2 : 4,
        }).format(value);
    } catch {
        return `${value.toFixed(4)} ${currencyCode}`;
    }
}

export function ExchangeRateClient() {
    const { language, t } = useI18n();
    const [amountInput, setAmountInput] = useState('100');
    const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
    const [toCurrency, setToCurrency] = useState<CurrencyCode>('CNY');
    const [rates, setRates] = useState<RateMap>(fallbackRates);
    const [updatedAt, setUpdatedAt] = useState('');
    const [fetchError, setFetchError] = useState('');
    const [loading, setLoading] = useState(true);

    const loadRates = useCallback(async () => {
        try {
            setLoading(true);
            setFetchError('');

            const response = await fetch('/api/exchange-rates', {
                cache: 'no-store',
            });
            const payload = (await response.json()) as ExchangeRatesResponse | { message?: string };

            if (!response.ok || !('rates' in payload)) {
                throw new Error('message' in payload ? payload.message : 'exchange-rate-fetch-failed');
            }

            setRates(sanitizeRates(payload.rates));
            setUpdatedAt(payload.date || '');
        } catch {
            setRates(fallbackRates);
            setUpdatedAt('');
            setFetchError(t('exchangeRate.fetchFailed'));
        } finally {
            setLoading(false);
        }
    }, [t]);

    useEffect(() => {
        void loadRates();
    }, [loadRates]);

    const amount = Number(amountInput);
    const hasValidAmount = Number.isFinite(amount) && amount >= 0;
    const convertedAmount =
        hasValidAmount && rates[fromCurrency] > 0 ? (amount / rates[fromCurrency]) * rates[toCurrency] : null;
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    const quotedRate = fromRate > 0 ? toRate / fromRate : 0;
    const currencyOptions = useMemo(
        () =>
            currencies.map((currency) => ({
                label: `${currency.code} · ${t(`exchangeRate.currency.${currency.code}`)}`,
                value: currency.code,
            })),
        [t],
    );

    return (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <section className={panelClassName}>
                <div>
                    <p className="text-title-lg text-text-e">{t('exchangeRate.mainPanelTitle')}</p>
                    <p className="mt-1 text-body-pc-md text-text-d">{t('exchangeRate.mainPanelDescription')}</p>
                </div>

                {fetchError && (
                    <p className="mt-3 rounded-xl border border-[rgba(217,119,6,0.18)] bg-[rgba(245,158,11,0.08)] px-4 py-3 text-body-pc-md text-[rgb(180,83,9)]">
                        {fetchError}
                    </p>
                )}

                <div className="mt-4 grid gap-3 md:grid-cols-[minmax(9rem,0.92fr)_minmax(0,1.12fr)_auto_minmax(0,1.12fr)]">
                    <div>
                        <label className="text-body-sm text-text-c" htmlFor="amount-input">
                            {t('exchangeRate.amount')}
                        </label>
                        <input
                            id="amount-input"
                            type="number"
                            min="0"
                            step="0.01"
                            className={inputClassName}
                            value={amountInput}
                            onChange={(event) => {
                                setAmountInput(event.target.value);
                            }}
                            placeholder={t('exchangeRate.amountPlaceholder')}
                        />
                    </div>

                    <div>
                        <label className="text-body-sm text-text-c" htmlFor="from-currency">
                            {t('exchangeRate.from')}
                        </label>
                        <Select
                            id="from-currency"
                            className={inputClassName}
                            value={fromCurrency}
                            options={currencyOptions}
                            placeholder={t('exchangeRate.fromPlaceholder')}
                            onValueChange={(nextValue) => {
                                setFromCurrency(nextValue as CurrencyCode);
                            }}
                        />
                    </div>

                    <Button
                        variant="plain"
                        onClick={() => {
                            setFromCurrency(toCurrency);
                            setToCurrency(fromCurrency);
                        }}
                        className="mt-7 inline-flex h-11 w-11 items-center justify-center rounded-full border border-primary-200 bg-primary-100 text-title-lg text-primary-600 transition hover:bg-primary-200"
                        aria-label={t('exchangeRate.swap')}
                        title={t('exchangeRate.swap')}
                    >
                        ⇄
                    </Button>

                    <div>
                        <label className="text-body-sm text-text-c" htmlFor="to-currency">
                            {t('exchangeRate.to')}
                        </label>
                        <Select
                            id="to-currency"
                            className={inputClassName}
                            value={toCurrency}
                            options={currencyOptions}
                            placeholder={t('exchangeRate.toPlaceholder')}
                            onValueChange={(nextValue) => {
                                setToCurrency(nextValue as CurrencyCode);
                            }}
                        />
                    </div>
                </div>

                <div className="relative mt-4 rounded-[20px] border border-primary-200 bg-[linear-gradient(135deg,rgba(225,238,229,0.96)_0%,rgba(198,236,211,0.92)_100%)] p-4 text-text-e shadow-[0_12px_28px_rgba(0,54,22,0.10)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-body-sm text-text-c">{t('exchangeRate.resultTitle')}</p>
                        <p className="min-h-[1.75rem] text-right text-body-sm text-text-c">
                            {loading
                                ? t('exchangeRate.loading')
                                : updatedAt
                                  ? `${t('exchangeRate.updatedAt')}: ${updatedAt}`
                                  : `${t('exchangeRate.updatedAt')}: --`}
                        </p>
                    </div>
                    <div className="mt-3">
                        <p className="text-headline-md text-primary-700">
                            {convertedAmount === null
                                ? t('exchangeRate.enterAmount')
                                : formatCurrencyAmount(convertedAmount, toCurrency, language)}
                        </p>
                    </div>
                    <p className="mt-3 text-body-pc-md text-text-d">{`1 ${fromCurrency} = ${quotedRate.toFixed(4)} ${toCurrency}`}</p>
                </div>
            </section>

            <section className={panelClassName}>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-title-lg text-text-e">{t('exchangeRate.batchTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('exchangeRate.batchDescription')}</p>
                    </div>
                    <Button variant="secondary" disabled={loading} onClick={() => void loadRates()}>
                        {t('exchangeRate.refresh')}
                    </Button>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                    {currencies.map((currency) => {
                        const currentAmount =
                            hasValidAmount && rates[fromCurrency] > 0
                                ? (amount / rates[fromCurrency]) * rates[currency.code]
                                : null;

                        return (
                            <div
                                key={currency.code}
                                className={cn(
                                    'rounded-2xl border border-neutral-j bg-fill-b px-4 py-3 transition',
                                    currency.code === toCurrency && 'border-primary-200 bg-primary-100/55',
                                )}
                            >
                                <div className="flex flex-col gap-1.5">
                                    <p className="text-title-sm text-text-e">{`${currency.code} · ${t(`exchangeRate.currency.${currency.code}`)}`}</p>
                                    <p className="text-body-pc-md text-text-e whitespace-nowrap">
                                        {currentAmount === null
                                            ? '--'
                                            : formatCurrencyAmount(currentAmount, currency.code, language)}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>
        </section>
    );
}
