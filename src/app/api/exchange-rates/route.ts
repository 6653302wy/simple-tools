import type { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const BASE_CURRENCY = 'USD';
const QUOTED_CURRENCIES = ['CNY', 'EUR', 'GBP', 'JPY', 'HKD', 'SGD', 'CAD'];

type FrankfurterResponse = {
    amount?: number;
    base?: string;
    date?: string;
    rates?: Record<string, number>;
};

export async function GET(_request: NextRequest) {
    const upstream = await fetch(
        `https://api.frankfurter.dev/v1/latest?base=${BASE_CURRENCY}&symbols=${QUOTED_CURRENCIES.join(',')}`,
        {
            cache: 'no-store',
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!upstream.ok) {
        return Response.json({ message: 'exchange-rate-fetch-failed' }, { status: 502 });
    }

    const payload = (await upstream.json()) as FrankfurterResponse;

    return Response.json({
        base: payload.base ?? BASE_CURRENCY,
        date: payload.date ?? '',
        rates: {
            USD: 1,
            CNY: payload.rates?.CNY ?? null,
            EUR: payload.rates?.EUR ?? null,
            GBP: payload.rates?.GBP ?? null,
            JPY: payload.rates?.JPY ?? null,
            HKD: payload.rates?.HKD ?? null,
            SGD: payload.rates?.SGD ?? null,
            CAD: payload.rates?.CAD ?? null,
        },
    });
}
