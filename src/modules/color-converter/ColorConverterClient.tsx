'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { ClearButton } from '@/components/ClearButton';
import { CopyButton } from '@/components/CopyButton';
import { useI18n } from '@/services/i18n';

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

type RgbaColor = {
    r: number;
    g: number;
    b: number;
    a: number;
};

type HslColor = {
    h: number;
    s: number;
    l: number;
};

type HsvColor = {
    h: number;
    s: number;
    v: number;
};

type OutputRow = {
    label: string;
    value: string;
};

const sampleColor = '#34AF61';

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

function normalizeHue(value: number) {
    return ((value % 360) + 360) % 360;
}

function parseFiniteNumber(value: string) {
    const parsed = Number(value);

    if (!Number.isFinite(parsed)) {
        throw new Error('Invalid numeric color component.');
    }

    return parsed;
}

function assertRange(value: number, min: number, max: number, label: string) {
    if (value < min || value > max) {
        throw new Error(`${label} must be between ${min} and ${max}.`);
    }

    return value;
}

function parseAlpha(value: string | undefined) {
    if (!value) {
        return 1;
    }

    if (value.endsWith('%')) {
        return assertRange(parseFiniteNumber(value.slice(0, -1)), 0, 100, 'Alpha percentage') / 100;
    }

    return assertRange(parseFiniteNumber(value), 0, 1, 'Alpha');
}

function parseRgbChannel(value: string) {
    if (value.endsWith('%')) {
        return Math.round(assertRange(parseFiniteNumber(value.slice(0, -1)), 0, 100, 'RGB percentage') * 2.55);
    }

    return Math.round(assertRange(parseFiniteNumber(value), 0, 255, 'RGB channel'));
}

function parseHue(value: string) {
    if (value.endsWith('turn')) {
        return normalizeHue(parseFiniteNumber(value.slice(0, -4)) * 360);
    }

    if (value.endsWith('rad')) {
        return normalizeHue((parseFiniteNumber(value.slice(0, -3)) * 180) / Math.PI);
    }

    if (value.endsWith('deg')) {
        return normalizeHue(parseFiniteNumber(value.slice(0, -3)));
    }

    return normalizeHue(parseFiniteNumber(value));
}

function parsePercent(value: string) {
    if (!value.endsWith('%')) {
        throw new Error('HSL and HSV saturation/lightness/value must use percentages.');
    }

    return assertRange(parseFiniteNumber(value.slice(0, -1)), 0, 100, 'Color percentage');
}

function splitFunctionComponents(content: string) {
    const slashParts = content.split('/');
    const main = slashParts[0].trim();
    const alpha = slashParts[1]?.trim();
    const values = main.includes(',')
        ? main
              .split(',')
              .map((part) => part.trim())
              .filter(Boolean)
        : main.split(/\s+/).filter(Boolean);

    if (!alpha && values.length === 4) {
        return {
            values: values.slice(0, 3),
            alpha: values[3],
        };
    }

    return {
        values,
        alpha,
    };
}

function parseHexColor(input: string): RgbaColor | null {
    const match = input.match(/^#?([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

    if (!match) {
        return null;
    }

    const hex = match[1];
    const expanded =
        hex.length === 3 || hex.length === 4
            ? hex
                  .split('')
                  .map((character) => `${character}${character}`)
                  .join('')
            : hex;

    return {
        r: Number.parseInt(expanded.slice(0, 2), 16),
        g: Number.parseInt(expanded.slice(2, 4), 16),
        b: Number.parseInt(expanded.slice(4, 6), 16),
        a: expanded.length === 8 ? Number.parseInt(expanded.slice(6, 8), 16) / 255 : 1,
    };
}

function hslToRgb({ h, s, l }: HslColor, alpha: number): RgbaColor {
    const saturation = s / 100;
    const lightness = l / 100;
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const segment = h / 60;
    const x = chroma * (1 - Math.abs((segment % 2) - 1));
    const match = lightness - chroma / 2;
    const [red, green, blue] =
        segment < 1
            ? [chroma, x, 0]
            : segment < 2
              ? [x, chroma, 0]
              : segment < 3
                ? [0, chroma, x]
                : segment < 4
                  ? [0, x, chroma]
                  : segment < 5
                    ? [x, 0, chroma]
                    : [chroma, 0, x];

    return {
        r: Math.round((red + match) * 255),
        g: Math.round((green + match) * 255),
        b: Math.round((blue + match) * 255),
        a: alpha,
    };
}

function hsvToRgb({ h, s, v }: HsvColor, alpha: number): RgbaColor {
    const saturation = s / 100;
    const value = v / 100;
    const chroma = value * saturation;
    const segment = h / 60;
    const x = chroma * (1 - Math.abs((segment % 2) - 1));
    const match = value - chroma;
    const [red, green, blue] =
        segment < 1
            ? [chroma, x, 0]
            : segment < 2
              ? [x, chroma, 0]
              : segment < 3
                ? [0, chroma, x]
                : segment < 4
                  ? [0, x, chroma]
                  : segment < 5
                    ? [x, 0, chroma]
                    : [chroma, 0, x];

    return {
        r: Math.round((red + match) * 255),
        g: Math.round((green + match) * 255),
        b: Math.round((blue + match) * 255),
        a: alpha,
    };
}

function rgbToHsl({ r, g, b }: RgbaColor): HslColor {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;
    const lightness = (max + min) / 2;

    if (delta === 0) {
        return { h: 0, s: 0, l: Math.round(lightness * 100) };
    }

    const saturation = delta / (1 - Math.abs(2 * lightness - 1));
    const hue =
        max === red
            ? 60 * (((green - blue) / delta) % 6)
            : max === green
              ? 60 * ((blue - red) / delta + 2)
              : 60 * ((red - green) / delta + 4);

    return {
        h: Math.round(normalizeHue(hue)),
        s: Math.round(saturation * 100),
        l: Math.round(lightness * 100),
    };
}

function rgbToHsv({ r, g, b }: RgbaColor): HsvColor {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const delta = max - min;

    if (delta === 0) {
        return { h: 0, s: 0, v: Math.round(max * 100) };
    }

    const hue =
        max === red
            ? 60 * (((green - blue) / delta) % 6)
            : max === green
              ? 60 * ((blue - red) / delta + 2)
              : 60 * ((red - green) / delta + 4);

    return {
        h: Math.round(normalizeHue(hue)),
        s: Math.round((delta / max) * 100),
        v: Math.round(max * 100),
    };
}

function parseColor(input: string): RgbaColor {
    const normalizedInput = input.trim().toLowerCase();

    if (!normalizedInput) {
        throw new Error('Color value is empty.');
    }

    const hexColor = parseHexColor(normalizedInput);

    if (hexColor) {
        return hexColor;
    }

    const functionMatch = normalizedInput.match(/^([a-z]+)\((.*)\)$/);

    if (!functionMatch) {
        throw new Error('Unsupported color format.');
    }

    const [, name, content] = functionMatch;
    const { values, alpha } = splitFunctionComponents(content);

    if ((name === 'rgb' || name === 'rgba') && values.length === 3) {
        return {
            r: parseRgbChannel(values[0]),
            g: parseRgbChannel(values[1]),
            b: parseRgbChannel(values[2]),
            a: parseAlpha(alpha),
        };
    }

    if ((name === 'hsl' || name === 'hsla') && values.length === 3) {
        return hslToRgb(
            {
                h: parseHue(values[0]),
                s: parsePercent(values[1]),
                l: parsePercent(values[2]),
            },
            parseAlpha(alpha),
        );
    }

    if ((name === 'hsv' || name === 'hsva') && values.length === 3) {
        return hsvToRgb(
            {
                h: parseHue(values[0]),
                s: parsePercent(values[1]),
                v: parsePercent(values[2]),
            },
            parseAlpha(alpha),
        );
    }

    throw new Error('Unsupported color format.');
}

function toHexChannel(value: number) {
    return value.toString(16).padStart(2, '0').toUpperCase();
}

function formatAlpha(value: number) {
    return Number(value.toFixed(3)).toString();
}

function toHex({ r, g, b, a }: RgbaColor, includeAlpha: boolean) {
    const alpha = includeAlpha ? toHexChannel(Math.round(clamp(a, 0, 1) * 255)) : '';

    return `#${toHexChannel(r)}${toHexChannel(g)}${toHexChannel(b)}${alpha}`;
}

function buildColorOutputs(color: RgbaColor): OutputRow[] {
    const hsl = rgbToHsl(color);
    const hsv = rgbToHsv(color);
    const alpha = formatAlpha(color.a);

    return [
        { label: 'HEX', value: toHex(color, false) },
        { label: 'HEXA', value: toHex(color, true) },
        { label: 'RGB', value: `rgb(${color.r}, ${color.g}, ${color.b})` },
        { label: 'RGBA', value: `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})` },
        { label: 'HSL', value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
        { label: 'HSLA', value: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})` },
        { label: 'HSV', value: `hsv(${hsv.h}, ${hsv.s}%, ${hsv.v}%)` },
        { label: 'HSVA', value: `hsva(${hsv.h}, ${hsv.s}%, ${hsv.v}%, ${alpha})` },
    ];
}

export function ColorConverterClient() {
    const { t } = useI18n();
    const [source, setSource] = useState(sampleColor);
    const [color, setColor] = useState<RgbaColor | null>(parseColor(sampleColor));
    const [error, setError] = useState('');

    const outputRows = useMemo(() => (color ? buildColorOutputs(color) : []), [color]);
    const outputText = outputRows.map((row) => `${row.label}: ${row.value}`).join('\n');
    const swatchColor = color ? `rgba(${color.r}, ${color.g}, ${color.b}, ${formatAlpha(color.a)})` : 'transparent';

    function handleConvert() {
        try {
            setColor(parseColor(source));
            setError('');
        } catch (conversionError) {
            setColor(null);
            setError(conversionError instanceof Error ? conversionError.message : t('color.statusConvertFailed'));
        }
    }

    function handleClear() {
        setSource('');
        setColor(null);
        setError('');
    }

    return (
        <section className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(20rem,0.8fr)_minmax(24rem,1.2fr)]">
            <section className={`${panelClassName} flex flex-col`}>
                <div>
                    <p className="text-title-lg text-text-e">{t('color.inputTitle')}</p>
                    <p className="mt-1 text-body-pc-md text-text-d">{t('color.inputDescription')}</p>
                </div>

                <div className="mt-4">
                    <div className="flex items-center justify-between gap-3">
                        <label className="text-body-sm text-text-c" htmlFor="color-source">
                            {t('color.inputColor')}
                        </label>
                        <ClearButton className="px-3 py-2 text-body-sm" disabled={!source} onClick={handleClear} />
                    </div>
                    <input
                        id="color-source"
                        className={inputClassName}
                        value={source}
                        onChange={(event) => {
                            setSource(event.target.value);
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                handleConvert();
                            }
                        }}
                        placeholder={t('color.inputPlaceholder')}
                    />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                    <Button onClick={handleConvert}>{t('color.convert')}</Button>
                </div>

                <div className="mt-4 rounded-xl border border-neutral-j bg-fill-b p-3">
                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">{t('color.supportedTitle')}</p>
                    <p className="mt-1 text-body-sm text-text-d">{t('color.supportedDescription')}</p>
                </div>
            </section>

            <section className={`${panelClassName} flex min-h-0 flex-col`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <p className="text-title-lg text-text-e">{t('color.resultTitle')}</p>
                        <p className="mt-1 text-body-pc-md text-text-d">{t('color.resultDescription')}</p>
                    </div>
                    {outputText ? (
                        <CopyButton
                            text={outputText}
                            className="px-3 py-2 text-body-sm"
                            idleLabel={t('common.copyResult')}
                        />
                    ) : null}
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-xl border border-neutral-j bg-fill-b p-3">
                    <div
                        className="size-16 shrink-0 rounded-xl border border-neutral-j"
                        style={{ backgroundColor: swatchColor }}
                    />
                    <div className="min-w-0">
                        <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">{t('color.preview')}</p>
                        <p className="mt-1 break-words text-body-pc-md text-text-e">
                            {error || outputRows[0]?.value || t('color.waiting')}
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {outputRows.map((row) => (
                        <div key={row.label} className="rounded-xl border border-neutral-j bg-fill-b p-3">
                            <div className="flex items-center justify-between gap-3">
                                <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">{row.label}</p>
                                <CopyButton
                                    text={row.value}
                                    className="px-3 py-2 text-body-sm"
                                    idleLabel={t('common.copyResult')}
                                />
                            </div>
                            <p className="mt-2 break-words font-mono text-body-pc-md text-text-e">{row.value}</p>
                        </div>
                    ))}
                </div>
            </section>
        </section>
    );
}
