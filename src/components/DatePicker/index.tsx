'use client';

import dayjs, { type Dayjs } from 'dayjs';
import timezonePlugin from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { type FC, useEffect, useState } from 'react';
import type { DayPickerLocale, DayPickerProps } from 'react-day-picker';
import { DayPicker } from 'react-day-picker';
import { enUS, zhCN } from 'react-day-picker/locale';
import { Select } from '@/components/Select';
import { cn } from '@/libs/utils';
import { useI18n, useI18nLanguage, useI18nTimezone } from '@/services/i18n';
import 'react-day-picker/style.css';
import type { Language } from '@/services/i18n/constant';
import { Button } from '../Button';
import { ArrowLeft } from '../icons/ArrowLeft';
import { ArrowRight } from '../icons/ArrowRight';
import { CloseCircle } from '../icons/CloseCircle';
import './styles.css';

dayjs.extend(utc);
dayjs.extend(timezonePlugin);

type Props = {
    /** 是否显示 */
    visible?: boolean;
    /** 选中的日期 */
    value?: Dayjs;
    /** 日期变化回调 */
    onChange?: (e: Dayjs) => void;
    /** 关闭回调 */
    onClose?: () => void;
    /** 自定义类名 */
    className?: string;
    /** 切换日期回调 */
    onSwitchDay?: (e: Dayjs) => void;
    /** 是否展示时间选择 */
    showTime?: boolean;
} & DayPickerProps;

/** 将语言项转成日期控件的locale */
const getDayPickerLocale = (language: Language): DayPickerLocale | undefined => {
    const normalized = (language || '').toLowerCase();

    const mainLanguage = normalized?.split('-')?.[0];

    if (mainLanguage === 'en') return enUS;
    if (mainLanguage === 'zh') return zhCN;

    return enUS;
};

const hourOptions = Array.from({ length: 24 }, (_, hour) => ({
    label: hour.toString().padStart(2, '0'),
    value: hour.toString().padStart(2, '0'),
}));

const minuteOptions = Array.from({ length: 60 }, (_, minute) => ({
    label: minute.toString().padStart(2, '0'),
    value: minute.toString().padStart(2, '0'),
}));

/**
 * 日期选择器
 */
export const DatePicker: FC<Props> = ({
    visible,
    value,
    onChange,
    onClose,
    className,
    onSwitchDay,
    showTime = false,
    ...rest
}) => {
    const language = useI18nLanguage();
    const timezone = useI18nTimezone();
    const { t } = useI18n();
    const dayPickerLocale = getDayPickerLocale(language);
    const [draftValue, setDraftValue] = useState<Dayjs>(() => value ?? dayjs.tz(undefined, timezone));

    const hourValue = draftValue.format('HH');
    const minuteValue = draftValue.format('mm');

    useEffect(() => {
        if (!visible) {
            return;
        }

        setDraftValue(value ?? dayjs.tz(undefined, timezone));
    }, [visible, value, timezone]);

    if (!visible) return null;

    const updateDraftValue = (nextValue: Dayjs) => {
        setDraftValue(nextValue);
    };

    const commitDraftValue = (nextValue: Dayjs, closeAfterChange = false, triggerSwitchDay = false) => {
        onChange?.(nextValue);

        if (triggerSwitchDay) {
            onSwitchDay?.(nextValue);
        }

        if (closeAfterChange) {
            onClose?.();
        }
    };

    const updateTime = (nextHour: string, nextMinute: string, closeAfterChange = false) => {
        const nextValue = draftValue.hour(Number(nextHour)).minute(Number(nextMinute)).second(0).millisecond(0);
        updateDraftValue(nextValue);

        if (closeAfterChange && !showTime) {
            commitDraftValue(nextValue, true);
        }
    };

    const handleDateSelect = (nextDate: Date | undefined) => {
        if (!nextDate) {
            return;
        }

        const nextValue = dayjs(nextDate)
            .tz(timezone)
            .hour(draftValue.hour())
            .minute(draftValue.minute())
            .second(0)
            .millisecond(0);

        updateDraftValue(nextValue);

        if (!showTime) {
            commitDraftValue(nextValue, true, true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-p/26 p-4" onClick={onClose}>
            <div
                className={cn(
                    'w-[17.5rem] rounded-2xl border border-neutral-j bg-fill-a p-2.5 shadow-[0_18px_44px_rgba(0,0,0,0.14)] backdrop-blur-[10px]',
                    className,
                )}
                onClick={(event) => {
                    event.stopPropagation();
                }}
            >
                <div className="mb-1 flex items-center justify-end">
                    <Button variant="plain" className="p-0" onClick={onClose}>
                        <CloseCircle className="text-text-c size-5" />
                    </Button>
                </div>
                <div className="w-full">
                    <DayPicker
                        {...rest}
                        animate
                        mode="single"
                        autoFocus
                        noonSafe
                        ISOWeek
                        required={false}
                        navLayout="around"
                        locale={dayPickerLocale}
                        timeZone={timezone}
                        selected={draftValue.toDate()}
                        defaultMonth={draftValue.toDate()}
                        onSelect={handleDateSelect}
                        footer={
                            <div className="px-1 pt-2">
                                {showTime && (
                                    <div className="rounded-xl border border-neutral-j bg-fill-b p-2.5">
                                        <label
                                            className="text-body-xs uppercase tracking-[0.16em] text-text-c"
                                            htmlFor="datepicker-hour-select"
                                        >
                                            {t('datePicker.time')}
                                        </label>
                                        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
                                            <Select
                                                id="datepicker-hour-select"
                                                value={hourValue}
                                                options={hourOptions}
                                                className="mt-0 h-10 bg-fill-a text-body-sm"
                                                contentClassName="max-h-60"
                                                onValueChange={(nextHour) => {
                                                    updateTime(nextHour, minuteValue);
                                                }}
                                            />
                                            <span className="text-title-md text-text-c">:</span>
                                            <Select
                                                id="datepicker-minute-select"
                                                value={minuteValue}
                                                options={minuteOptions}
                                                className="mt-0 h-10 bg-fill-a text-body-sm"
                                                contentClassName="max-h-60"
                                                onValueChange={(nextMinute) => {
                                                    updateTime(hourValue, nextMinute);
                                                }}
                                            />
                                        </div>

                                        <div className="mt-3 flex justify-center">
                                            <Button
                                                onClick={() => {
                                                    commitDraftValue(draftValue, true, true);
                                                }}
                                            >
                                                {t('datePicker.confirm')}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        }
                        modifiersClassNames={{
                            day: 'text-text-e ',
                            selected:
                                'calendar-day--selected text-neutral-h bg-[linear-gradient(123deg,_#55B838_12.9%,_#009B39_81.32%)] rounded-full ',
                            today: 'text-neutral-h calendar-day--today',
                        }}
                        classNames={{
                            weekday: 'text-text-c text-body-sm',
                            caption_label: 'text-text-e text-title-md',
                            caption: 'mb-1',
                            month_caption: 'flex items-center justify-center h-7 mb-2',
                            day_button: 'font-family-inter text-[15px] font-weight-400 h-9 w-9',
                        }}
                        components={{
                            PreviousMonthButton: (props) => (
                                <Button
                                    {...props}
                                    variant="plain"
                                    className={cn(
                                        props.className,
                                        'h-8 rounded-sm p-0 hover:bg-primary-100! active:bg-primary-200! ',
                                    )}
                                >
                                    <ArrowLeft className="text-primary-400 size-[22px] " />
                                </Button>
                            ),
                            NextMonthButton: (props) => (
                                <Button
                                    {...props}
                                    variant="plain"
                                    className={cn(
                                        props.className,
                                        'h-8 rounded-sm p-0 hover:bg-primary-100! active:bg-primary-200! ',
                                    )}
                                >
                                    <ArrowRight className="text-primary-400 size-[22px]" />
                                </Button>
                            ),
                        }}
                    />
                </div>
            </div>
        </div>
    );
};
