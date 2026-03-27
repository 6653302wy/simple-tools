'use client';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { useState } from 'react';
import { ModuleIntro } from '@/components/ModuleIntro';
import { cn } from '@/libs/utils';

dayjs.extend(utc);

type TimestampUnit = 'milliseconds' | 'seconds';

const timestampUnitOptions: Array<{ label: string; value: TimestampUnit }> = [
    { label: '毫秒', value: 'milliseconds' },
    { label: '秒', value: 'seconds' },
];

const inputClassName =
    'mt-2 w-full rounded-lg border border-neutral-j bg-fill-b px-3 py-2.5 text-body-pc-md text-text-e outline-none transition focus:border-primary-400 focus:bg-fill-a';
const panelClassName = 'rounded-2xl border border-neutral-j bg-fill-a p-4 shadow-[0_16px_40px_rgba(0,54,22,0.08)]';

function formatDateTimeInput(value: dayjs.Dayjs) {
    return value.format('YYYY-MM-DDTHH:mm');
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

function describeRelative(value: dayjs.Dayjs) {
    const diffMinutes = value.diff(dayjs(), 'minute');

    if (Math.abs(diffMinutes) < 1) {
        return '刚刚';
    }

    if (Math.abs(diffMinutes) < 60) {
        return diffMinutes > 0 ? `${diffMinutes} 分钟后` : `${Math.abs(diffMinutes)} 分钟前`;
    }

    const diffHours = value.diff(dayjs(), 'hour');

    if (Math.abs(diffHours) < 24) {
        return diffHours > 0 ? `${diffHours} 小时后` : `${Math.abs(diffHours)} 小时前`;
    }

    const diffDays = value.diff(dayjs(), 'day');

    return diffDays > 0 ? `${diffDays} 天后` : `${Math.abs(diffDays)} 天前`;
}

export function TimestampConverter() {
    const [timestampUnit, setTimestampUnit] = useState<TimestampUnit>('milliseconds');
    const [timestampInput, setTimestampInput] = useState(() => String(Date.now()));
    const [dateInput, setDateInput] = useState(() => formatDateTimeInput(dayjs()));

    const browserTimezone =
        typeof window === 'undefined' ? 'UTC' : Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

    const timestampDate = parseTimestamp(timestampInput, timestampUnit);
    const selectedDate = dateInput ? dayjs(dateInput) : null;
    const isSelectedDateValid = Boolean(selectedDate?.isValid());
    const timestampError = timestampInput.trim() && !timestampDate ? '请输入有效的数字时间戳。' : '';
    const dateError = dateInput && !isSelectedDateValid ? '请选择有效日期时间。' : '';

    const timestampRows = timestampDate
        ? [
              { label: `浏览器时区 (${browserTimezone})`, value: timestampDate.format('YYYY-MM-DD HH:mm:ss') },
              { label: 'UTC', value: timestampDate.utc().format('YYYY-MM-DD HH:mm:ss') },
              { label: 'ISO 8601', value: timestampDate.toISOString() },
              { label: '相对时间', value: describeRelative(timestampDate) },
          ]
        : [];

    const dateRows =
        selectedDate && isSelectedDateValid
            ? [
                  { label: '毫秒时间戳', value: String(selectedDate.valueOf()) },
                  { label: '秒时间戳', value: String(Math.floor(selectedDate.valueOf() / 1000)) },
                  { label: 'UTC 时间', value: selectedDate.utc().format('YYYY-MM-DD HH:mm:ss') },
              ]
            : [];

    return (
        <section className="space-y-4">
            <ModuleIntro
                badge="MODULE / TIME"
                title="时间戳转换"
                description="适合调试接口、排查日志和核对前后端时间字段。左侧输入时间戳或日期时间，结果会在当前浏览器时区和 UTC 之间同步展示。"
            />

            <section className="grid gap-4 xl:grid-cols-2">
                <section className={panelClassName}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-title-lg text-text-e">时间戳转日期</p>
                            <p className="mt-1 text-body-pc-md text-text-d">快速识别接口返回的秒级或毫秒级时间戳。</p>
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
                            使用当前时间
                        </button>
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="timestamp-input">
                            时间戳数值
                        </label>
                        <input
                            id="timestamp-input"
                            className={inputClassName}
                            inputMode="numeric"
                            value={timestampInput}
                            onChange={(event) => {
                                setTimestampInput(event.target.value);
                            }}
                            placeholder="例如 1743043200000"
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
                                            ? 'bg-primary-400 text-text-a shadow-[0_10px_20px_rgba(0,155,57,0.18)]'
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
                            <p className="text-title-lg text-text-e">日期转时间戳</p>
                            <p className="mt-1 text-body-pc-md text-text-d">
                                输入本地日期时间，快速换算成接口常用的 Unix 时间戳。
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setDateInput(formatDateTimeInput(dayjs()));
                            }}
                            className="shrink-0 whitespace-nowrap rounded-full border border-auxiliary-blue bg-[rgba(0,97,186,0.08)] px-4 py-2 text-body-sm text-auxiliary-blue transition hover:bg-[rgba(0,97,186,0.14)]"
                        >
                            填充当前时间
                        </button>
                    </div>

                    <div className="mt-4">
                        <label className="text-body-sm text-text-c" htmlFor="datetime-input">
                            本地日期时间
                        </label>
                        <input
                            id="datetime-input"
                            type="datetime-local"
                            className={inputClassName}
                            value={dateInput}
                            onChange={(event) => {
                                setDateInput(event.target.value);
                            }}
                        />
                        <p className="mt-2 text-body-xs text-text-c">{`当前浏览器时区: ${browserTimezone}`}</p>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        {dateError ? (
                            <p className="rounded-lg border border-warning bg-[rgba(255,199,0,0.14)] px-4 py-3 text-body-pc-md text-text-e">
                                {dateError}
                            </p>
                        ) : (
                            dateRows.map((row) => (
                                <div key={row.label} className="rounded-lg border border-neutral-j bg-fill-b px-3 py-3">
                                    <p className="text-body-xs uppercase tracking-[0.18em] text-text-c">{row.label}</p>
                                    <p className="mt-1.5 break-all text-title-sm text-text-e">{row.value}</p>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </section>
        </section>
    );
}
