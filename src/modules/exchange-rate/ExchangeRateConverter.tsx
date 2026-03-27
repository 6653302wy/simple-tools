'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/libs/utils';
import { StorageEnum } from '@/services/types';

type CurrencyCode = 'USD' | 'CNY' | 'EUR' | 'GBP' | 'JPY' | 'HKD' | 'SGD';

type CurrencyMeta = {
    code: CurrencyCode;
    label: string;
    symbol: string;
};

type RateMap = Record<CurrencyCode, number>;

const currencies: CurrencyMeta[] = [
    { code: 'USD', label: '美元', symbol: '$' },
    { code: 'CNY', label: '人民币', symbol: 'CNY' },
    { code: 'EUR', label: '欧元', symbol: 'EUR' },
    { code: 'GBP', label: '英镑', symbol: 'GBP' },
    { code: 'JPY', label: '日元', symbol: 'JPY' },
    { code: 'HKD', label: '港币', symbol: 'HKD' },
    { code: 'SGD', label: '新加坡元', symbol: 'SGD' },
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
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-4 py-3 text-body-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-[24px] border border-neutral-j bg-fill-a p-5 shadow-[0_18px_48px_rgba(0,54,22,0.08)]';

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

    return (
        <section className="space-y-6">
            <section className="rounded-[28px] border border-primary-200 bg-[linear-gradient(135deg,var(--fill-a)_0%,rgba(225,238,229,0.92)_100%)] p-6 shadow-[0_20px_54px_rgba(0,54,22,0.08)]">
                <span className="inline-flex rounded-full bg-primary-400 px-3 py-1 text-body-xs tracking-[0.24em] text-text-a">
                    MODULE / FX
                </span>
                <h1 className="mt-4 text-headline-sm text-primary-700" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                    汇率转换
                </h1>
                <p className="mt-3 max-w-2xl text-body-pc-md leading-7 text-text-d">
                    默认内置一组常用参考汇率，适合报价、核算和日常换算。汇率表支持直接编辑，刷新后会保存在当前浏览器。
                </p>
            </section>

            <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
                <section className={panelClassName}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-title-lg text-text-e">主换算面板</p>
                            <p className="mt-2 text-body-pc-md text-text-d">
                                基于 1 USD 对应各币种数量的参考值进行交叉换算。
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setFromCurrency(toCurrency);
                                setToCurrency(fromCurrency);
                            }}
                            className="rounded-full border border-primary-200 bg-primary-100 px-4 py-2 text-body-sm text-primary-600 transition hover:bg-primary-200"
                        >
                            交换币种
                        </button>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-[minmax(0,1.1fr)_repeat(2,minmax(140px,1fr))]">
                        <div>
                            <label className="text-body-sm text-text-c" htmlFor="amount-input">
                                金额
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
                                placeholder="输入换算金额"
                            />
                        </div>

                        <div>
                            <label className="text-body-sm text-text-c" htmlFor="from-currency">
                                从
                            </label>
                            <select
                                id="from-currency"
                                className={inputClassName}
                                value={fromCurrency}
                                onChange={(event) => {
                                    setFromCurrency(event.target.value as CurrencyCode);
                                }}
                            >
                                {currencies.map((currency) => (
                                    <option key={currency.code} value={currency.code}>
                                        {`${currency.code} · ${currency.label}`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-body-sm text-text-c" htmlFor="to-currency">
                                到
                            </label>
                            <select
                                id="to-currency"
                                className={inputClassName}
                                value={toCurrency}
                                onChange={(event) => {
                                    setToCurrency(event.target.value as CurrencyCode);
                                }}
                            >
                                {currencies.map((currency) => (
                                    <option key={currency.code} value={currency.code}>
                                        {`${currency.code} · ${currency.label}`}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6 rounded-[24px] bg-[linear-gradient(135deg,var(--primary-400)_0%,var(--primary-600)_100%)] p-5 text-text-a shadow-[0_20px_42px_rgba(0,54,22,0.18)]">
                        <p className="text-body-xs uppercase tracking-[0.22em] text-text-a/70">Conversion Result</p>
                        {convertedAmount !== null ? (
                            <>
                                <p className="mt-3 text-headline-sm" style={{ fontFamily: 'var(--font-rajdhani)' }}>
                                    {formatCurrencyAmount(convertedAmount, toCurrency)}
                                </p>
                                <p className="mt-2 text-body-pc-md text-text-a/80">
                                    {`${formatCurrencyAmount(amount, fromCurrency)} ≈ ${formatCurrencyAmount(convertedAmount, toCurrency)}`}
                                </p>
                                <p className="mt-4 text-body-sm text-text-a/70">
                                    {`1 ${fromCurrency} ≈ ${quotedRate.toFixed(4)} ${toCurrency}`}
                                </p>
                            </>
                        ) : (
                            <p className="mt-3 text-body-pc-md text-text-a/82">请输入有效金额后查看结果。</p>
                        )}
                    </div>
                </section>

                <section className={panelClassName}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-title-lg text-text-e">批量结果</p>
                            <p className="mt-2 text-body-pc-md text-text-d">
                                以当前源币种为基准，快速查看其他币种的对应值。
                            </p>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3">
                        {currencies.map((currency) => {
                            const crossValue =
                                hasValidAmount && rates[fromCurrency] > 0
                                    ? (amount / rates[fromCurrency]) * rates[currency.code]
                                    : null;

                            return (
                                <div
                                    key={currency.code}
                                    className={cn(
                                        'rounded-lg border px-4 py-3 transition',
                                        currency.code === toCurrency
                                            ? 'border-primary-300 bg-primary-100'
                                            : 'border-neutral-j bg-fill-b',
                                    )}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-title-sm text-text-e">{`${currency.code} · ${currency.label}`}</p>
                                            <p className="mt-1 text-body-xs text-text-c">{`符号: ${currency.symbol}`}</p>
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

            <section className={panelClassName}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-title-lg text-text-e">参考汇率表</p>
                        <p className="mt-2 text-body-pc-md text-text-d">
                            这里的值表示 1 USD 对应多少目标币种，你可以按自己的业务场景直接修改。
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => {
                            setRates(defaultRates);
                        }}
                        className="rounded-full border border-error bg-[rgba(235,51,51,0.08)] px-4 py-2 text-body-sm text-error transition hover:bg-[rgba(235,51,51,0.14)]"
                    >
                        重置默认参考值
                    </button>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {currencies.map((currency) => (
                        <label key={currency.code} className="rounded-lg border border-neutral-j bg-fill-b px-4 py-3">
                            <span className="text-title-sm text-text-e">{`${currency.code} · ${currency.label}`}</span>
                            <span className="mt-1 block text-body-xs text-text-c">{`1 USD = ? ${currency.code}`}</span>
                            <input
                                type="number"
                                min="0"
                                step={currency.code === 'JPY' ? '0.01' : '0.0001'}
                                className={cn(inputClassName, 'mt-3 bg-fill-a')}
                                value={rates[currency.code]}
                                disabled={currency.code === 'USD'}
                                onChange={(event) => {
                                    const nextValue = Number(event.target.value);

                                    if (!Number.isFinite(nextValue) || nextValue <= 0) {
                                        return;
                                    }

                                    setRates((currentRates) => ({
                                        ...currentRates,
                                        [currency.code]: nextValue,
                                    }));
                                }}
                            />
                        </label>
                    ))}
                </div>
            </section>
        </section>
    );
}
