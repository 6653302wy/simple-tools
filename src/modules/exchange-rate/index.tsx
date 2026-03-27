'use client';

import { useEffect, useState } from 'react';
import { ModuleIntro } from '@/components/ModuleIntro';
import { Select } from '@/components/Select';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';
import { StorageEnum } from '@/services/types';

type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'GBP' | 'JPY' | 'HKD' | 'SGD';

type CurrencyMeta = {
    code: CurrencyCode;
    symbol: string;
};

type RateMap = Record<CurrencyCode, number>;

const currencies: CurrencyMeta[] = [
    { code: 'USD', symbol: '$' },
    { code: 'CNY', symbol: 'CNY' },
    { code: 'EUR', symbol: 'EUR' },
    { code: 'GBP', symbol: 'GBP' },
    { code: 'JPY', symbol: 'JPY' },
    { code: 'HKD', symbol: 'HKD' },
    { code: 'SGD', symbol: 'SGD' },
];

const defaultRates: RateMap = {
    USD: 1,
    CNY: 7.18,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 150.6,
    HKD: 7.82,
    SGD: 1.35,
};

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

function readStoredRates() {
    if (typeof window === 'undefined') {
        return defaultRates;
    }

    try {
        const storedValue = window.localStorage.getItem(StorageEnum.ToolExchangeRates);

        if (!storedValue) {
            return defaultRates;
        }

        const parsed = JSON.parse(storedValue) as Partial<RateMap>;

        return currencies.reduce<RateMap>(
            (accumulator, currency) => {
                const nextValue = Number(parsed[currency.code]);

                accumulator[currency.code] =
                    Number.isFinite(nextValue) && nextValue > 0 ? nextValue : defaultRates[currency.code];

                return accumulator;
            },
            { ...defaultRates },
        );
    } catch {
        return defaultRates;
    }
}

function formatCurrencyAmount(value: number, currencyCode: CurrencyCode) {
    try {
        return new Intl.NumberFormat('zh-CN', {
            style: 'currency',
            currency: currencyCode,
            maximumFractionDigits: value >= 100 ? 2 : 4,
        }).format(value);
    } catch {
        return `${value.toFixed(4)} ${currencyCode}`;
    }
}

export function ExchangeRateConverter() {
    const { t } = useI18n();
    const [amountInput, setAmountInput] = useState('100');
    const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
    const [toCurrency, setToCurrency] = useState<CurrencyCode>('CNY');
    const [rates, setRates] = useState<RateMap>(defaultRates);

    useEffect(() => {
        setRates(readStoredRates());
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        window.localStorage.setItem(StorageEnum.ToolExchangeRates, JSON.stringify(rates));
    }, [rates]);

    const amount = Number(amountInput);
    const hasValidAmount = Number.isFinite(amount) && amount >= 0;
    const convertedAmount =
        hasValidAmount && rates[fromCurrency] > 0 ? (amount / rates[fromCurrency]) * rates[toCurrency] : null;
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    const quotedRate = fromRate > 0 ? toRate / fromRate : 0;
    const currencyOptions = currencies.map((currency) => ({
        label: `${currency.code} · ${t(`exchangeRate.currency.${currency.code}`)}`,
        value: currency.code,
    }));

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="MODULE / FX"
                title={t('exchangeRate.introTitle')}
                description={t('exchangeRate.introDescription')}
            />

            <section className="grid gap-4 xl:grid-cols-2">
                <section className={panelClassName}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-title-lg text-text-e">{t('exchangeRate.mainPanelTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('exchangeRate.mainPanelDescription')}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setFromCurrency(toCurrency);
                                setToCurrency(fromCurrency);
                            }}
                            className="shrink-0 whitespace-nowrap rounded-full border border-primary-200 bg-primary-100 px-4 py-2 text-body-sm text-primary-600 transition hover:bg-primary-200"
                        >
                            {t('exchangeRate.swap')}
                        </button>
                    </div>

                    <div className="mt-4 grid gap-3 md:grid-cols-3">
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

                    <div className="mt-4 rounded-[20px] border border-primary-200 bg-[linear-gradient(135deg,rgba(225,238,229,0.96)_0%,rgba(198,236,211,0.92)_100%)] p-4 text-text-e shadow-[0_12px_28px_rgba(0,54,22,0.10)]">
                        <p className="text-body-xs uppercase tracking-[0.22em] text-primary-600/80">
                            {t('exchangeRate.resultTitle')}
                        </p>
                        {convertedAmount !== null ? (
                            <>
                                <p className="mt-2 text-headline-sm" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                    {formatCurrencyAmount(convertedAmount, toCurrency)}
                                </p>
                                <p className="mt-1.5 text-body-pc-md text-text-d">
                                    {`${formatCurrencyAmount(amount, fromCurrency)} ≈ ${formatCurrencyAmount(convertedAmount, toCurrency)}`}
                                </p>
                                <p className="mt-3 text-body-sm text-text-c">
                                    {`1 ${fromCurrency} ≈ ${quotedRate.toFixed(4)} ${toCurrency}`}
                                </p>
                            </>
                        ) : (
                            <p className="mt-3 text-body-pc-md text-text-d">{t('exchangeRate.enterAmount')}</p>
                        )}
                    </div>
                </section>

                <section className={panelClassName}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-title-lg text-text-e">{t('exchangeRate.batchTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('exchangeRate.batchDescription')}</p>
                        </div>
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        {currencies.map((currency) => {
                            const crossValue =
                                hasValidAmount && rates[fromCurrency] > 0
                                    ? (amount / rates[fromCurrency]) * rates[currency.code]
                                    : null;

                            return (
                                <div
                                    key={currency.code}
                                    className={cn(
                                        'rounded-lg border px-3 py-3 transition',
                                        currency.code === toCurrency
                                            ? 'border-primary-300 bg-primary-100'
                                            : 'border-neutral-j bg-fill-b',
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-title-sm text-text-e">
                                                {`${currency.code} · ${t(`exchangeRate.currency.${currency.code}`)}`}
                                            </p>
                                            <p className="mt-0.5 text-body-xs text-text-c">
                                                {`${t('exchangeRate.symbol')}: ${currency.symbol}`}
                                            </p>
                                        </div>
                                        <p className="text-title-sm text-primary-600">
                                            {crossValue === null
                                                ? '--'
                                                : formatCurrencyAmount(crossValue, currency.code)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </section>
        </section>
    );
}
