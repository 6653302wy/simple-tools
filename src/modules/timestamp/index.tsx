'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState } from 'react';
import { DatePicker } from '@/components/DatePicker';
import { ModuleIntro } from '@/components/ModuleIntro';
import { cn } from '@/libs/utils';
import { useI18n } from '@/services/i18n';

dayjs.extend(utc);

type TimestampUnit = 'milliseconds' | 'seconds';

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

function formatDateTimeInput(value: dayjs.Dayjs) {
    return value.format('YYYY-MM-DD HH:mm');
}

function parseTimestamp(rawValue: string, unit: TimestampUnit) {
    if (!rawValue.trim()) {
        return null;
    }

    const numericValue = Number(rawValue);

    if (!Number.isFinite(numericValue)) {
        return null;
    }

    const milliseconds = unit === 'seconds' ? numericValue * 1000 : numericValue;
    const parsed = dayjs(milliseconds);

    return parsed.isValid() ? parsed : null;
}

function describeRelative(value: dayjs.Dayjs, t: (key: string, variables?: Record<string, string | number>) => string) {
    const diffMinutes = value.diff(dayjs(), 'minute');

    if (Math.abs(diffMinutes) < 1) {
        return t('timestamp.justNow');
    }

    if (Math.abs(diffMinutes) < 60) {
        return diffMinutes > 0
            ? t('timestamp.minutesLater', { value: diffMinutes })
            : t('timestamp.minutesAgo', { value: Math.abs(diffMinutes) });
    }

    const diffHours = value.diff(dayjs(), 'hour');

    if (Math.abs(diffHours) < 24) {
        return diffHours > 0
            ? t('timestamp.hoursLater', { value: diffHours })
            : t('timestamp.hoursAgo', { value: Math.abs(diffHours) });
    }

    const diffDays = value.diff(dayjs(), 'day');

    return diffDays > 0
        ? t('timestamp.daysLater', { value: diffDays })
        : t('timestamp.daysAgo', { value: Math.abs(diffDays) });
}

export function TimestampConverter() {
    const { t } = useI18n();
    const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>('milliseconds');
    const [timestampInput, setTimestampInput] = useState(() => String(Date.now()));
    const [selectedDate, setSelectedDate] = useState(() => dayjs());
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const timestampUnitOptions: Array<{ label: string; value: TimestampUnit }> = [
        { label: t('timestamp.milliseconds'), value: 'milliseconds' },
        { label: t('timestamp.seconds'), value: 'seconds' },
    ];

    const browserTimezone =
        typeof window === 'undefined' ? 'UTC' : Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const timestampDate = parseTimestamp(timestampInput, timestampUnit);
    const timestampError = timestampInput.trim() && !timestampDate ? t('timestamp.invalidTimestamp') : '';

    const timestampRows = timestampDate
        ? [
              {
                  label: t('timestamp.browserTimezone', { timezone: browserTimezone }),
                  value: timestampDate.format('YYYY-MM-DD HH:mm:ss'),
              },
              { label: t('timestamp.utc'), value: timestampDate.utc().format('YYYY-MM-DD HH:mm:ss') },
              { label: t('timestamp.iso'), value: timestampDate.toISOString() },
              { label: t('timestamp.relative'), value: describeRelative(timestampDate, t) },
          ]
        : [];

    const dateRows = [
        { label: t('timestamp.millisecondsTimestamp'), value: String(selectedDate.valueOf()) },
        { label: t('timestamp.secondsTimestamp'), value: String(Math.floor(selectedDate.valueOf() / 1000)) },
        { label: t('timestamp.utcTime'), value: selectedDate.utc().format('YYYY-MM-DD HH:mm:ss') },
    ];

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="MODULE / TIME"
                title={t('timestamp.introTitle')}
                description={t('timestamp.introDescription')}
            />

            <section className="grid gap-4 xl:grid-cols-2">
                <section className={panelClassName}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-title-lg text-text-e">{t('timestamp.fromTimestampTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">
                                {t('timestamp.fromTimestampDescription')}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                const currentTimestamp = Date.now();

                                setTimestampUnit('milliseconds');
                                setTimestampInput(String(currentTimestamp));
                            }}
                            className="shrink-0 whitespace-nowrap rounded-full border border-primary-200 bg-primary-100 px-4 py-2 text-body-sm text-primary-600 transition hover:bg-primary-200"
                        >
                            {t('timestamp.useCurrentTime')}
                        </button>
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="timestamp-input">
                            {t('timestamp.timestampValue')}
                        </label>
                        <input
                            id="timestamp-input"
                            className={inputClassName}
                            inputMode="numeric"
                            value={timestampInput}
                            onChange={(event) => {
                                setTimestampInput(event.target.value);
                            }}
                            placeholder={t('timestamp.timestampPlaceholder')}
                        />
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {timestampUnitOptions.map((option) => {
                            const isActive = option.value === timestampUnit;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        setTimestampUnit(option.value);
                                    }}
                                    className={cn(
                                        'shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-body-sm transition',
                                        isActive
                                            ? 'bg-primary-400 text-text-a '
                                            : 'bg-fill-b text-text-d hover:bg-primary-100',
                                    )}
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {timestampError ? (
                            <p className="rounded-lg border border-warning bg-[rgba(255,199,0,0.14)] px-4 py-3 text-body-pc-md text-text-e">
                                {timestampError}
                            </p>
                        ) : (
                            timestampRows.map((row) => (
                                <div key={row.label} className="rounded-lg border border-neutral-j bg-fill-b px-3 py-3">
                                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">{row.label}</p>
                                    <p className="mt-1.5 break-all text-title-sm text-text-e">{row.value}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className={panelClassName}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-title-lg text-text-e">{t('timestamp.toTimestampTitle')}</p>
                            <p className="mt-1 text-body-pc-md text-text-d">{t('timestamp.toTimestampDescription')}</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setSelectedDate(dayjs());
                            }}
                            className="shrink-0 whitespace-nowrap rounded-full border border-auxiliary-blue bg-[rgba(0,97,186,0.08)] px-4 py-2 text-body-sm text-auxiliary-blue transition hover:bg-[rgba(0,97,186,0.14)]"
                        >
                            {t('timestamp.fillCurrentTime')}
                        </button>
                    </div>

                    <div className="relative mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="datetime-input">
                            {t('timestamp.localDateTime')}
                        </label>
                        <button
                            id="datetime-input"
                            type="button"
                            className={cn(
                                inputClassName,
                                'flex items-center justify-between text-left',
                                isDatePickerOpen && 'border-primary-400 bg-fill-a',
                            )}
                            onClick={() => {
                                setIsDatePickerOpen((previousValue) => !previousValue);
                            }}
                        >
                            <span>{formatDateTimeInput(selectedDate)}</span>
                            <span className="text-body-sm text-text-c">{browserTimezone}</span>
                        </button>
                        <p className="mt-2 text-body-xs text-text-c">
                            {t('common.currentBrowserTimezone', { timezone: browserTimezone })}
                        </p>

                        <DatePicker
                            visible={isDatePickerOpen}
                            value={selectedDate}
                            showTime
                            className="w-[min(100vw-2rem,22rem)]"
                            onChange={(nextValue) => {
                                setSelectedDate(nextValue);
                            }}
                            onClose={() => {
                                setIsDatePickerOpen(false);
                            }}
                        />
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {dateRows.map((row) => (
                            <div key={row.label} className="rounded-lg border border-neutral-j bg-fill-b px-3 py-3">
                                <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">{row.label}</p>
                                <p className="mt-1.5 break-all text-title-sm text-text-e">{row.value}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </section>
        </section>
    );
}
