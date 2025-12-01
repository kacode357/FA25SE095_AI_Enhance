// components/ui/date-time-picker.tsx
"use client";

import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

// ================== COMMON TIME UTILS ==================

function formatTimeValue(date?: Date) {
    if (!date) return "";
    const h = date.getHours().toString().padStart(2, "0");
    const m = date.getMinutes().toString().padStart(2, "0");
    return `${h}:${m}`; // chỉ HH:mm
}

function parseTimeString(value: string) {
    if (!value) return { h: 0, m: 0 };
    const [h, m] = value.split(":").map((n) => parseInt(n || "0", 10));
    return {
        h: isNaN(h) ? 0 : h,
        m: isNaN(m) ? 0 : m,
    };
}

function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

// 1 component nhỏ cho time picker dạng 2 cột
type TimeSelectorProps = {
    timeStr: string;
    onChange: (newTimeStr: string) => void;
    timeIntervals?: number; // phút
    buttonClassName?: string;
    placeholder?: string;
    selectedDate?: Date | undefined;
    minTime?: Date | undefined;
};

function TimeSelector({
    timeStr,
    onChange,
    timeIntervals = 5,
    buttonClassName,
    placeholder = "Select time",
    selectedDate,
    minTime,
}: TimeSelectorProps) {
    const [open, setOpen] = React.useState(false);

    const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
    const minutes = React.useMemo(
        () => Array.from({ length: Math.floor(60 / timeIntervals) }, (_, i) => i * timeIntervals),
        [timeIntervals]
    );

    const { h: curH, m: curM } = parseTimeString(timeStr);

    const setHour = (h: number) => {
        const mm = curM.toString().padStart(2, "0");
        const hh = h.toString().padStart(2, "0");
        onChange(`${hh}:${mm}`);
    };

    const setMinute = (m: number) => {
        const hh = curH.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        onChange(`${hh}:${mm}`);
    };

    // compute disabled state based on minTime when selectedDate is same day as minTime
    const isMinDay = selectedDate && minTime && isSameDay(selectedDate, minTime);
    const minHour = isMinDay ? minTime!.getHours() : -1;
    const minMinute = isMinDay ? minTime!.getMinutes() : -1;

    const handleWheelScroll = (e: React.WheelEvent<HTMLDivElement>) => {
        const el = e.currentTarget;
        // if the element can scroll, perform the scroll action here and
        // prevent the wheel from bubbling to parent containers. This makes
        // two-finger touchpad swipes scroll the column immediately.
        if (el.scrollHeight > el.clientHeight) {
            el.scrollTop += e.deltaY;
            e.preventDefault();
            e.stopPropagation();
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    className={
                        buttonClassName ??
                        "h-9 w-28 justify-between px-3 text-xs font-normal text-slate-700"
                    }
                >
                    {timeStr || placeholder}
                    <ChevronDownIcon className="h-3 w-3 text-slate-400" />
                </Button>
            </PopoverTrigger>
            <PopoverContent
                align="start"
                className="w-auto p-2 bg-white border border-slate-200 rounded-md shadow-sm"
            >
                <div className="flex gap-2 text-sm">
                    {/* Hours */}
                    <div className="max-h-40 w-12 overflow-auto pr-1 dtp-scroll" onWheel={handleWheelScroll}>
                        {hours.map((h) => {
                            const label = h.toString().padStart(2, "0");
                            const active = h === curH;
                            const disabled = isMinDay && h < minHour;
                            return (
                                <button
                                    key={h}
                                    type="button"
                                    disabled={disabled}
                                    className={`mb-1 w-full rounded px-1 py-1 text-center ${active
                                            ? "bg-blue-500 text-white"
                                            : "hover:bg-slate-100 text-slate-800"
                                        } ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}
                                    onClick={() => !disabled && setHour(h)}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                    {/* Minutes */}
                    <div className="max-h-40 w-12 overflow-auto pr-1 dtp-scroll" onWheel={handleWheelScroll}>
                        {minutes.map((m) => {
                            const label = m.toString().padStart(2, "0");
                            const active = m === curM;
                            // disabled when on min-day and hour is equal to minHour and minute < minMinute
                            const disabledMinute = isMinDay && curH === minHour && m < minMinute;
                            return (
                                <button
                                    key={m}
                                    type="button"
                                    disabled={disabledMinute}
                                    className={`mb-1 w-full rounded px-1 py-1 text-center ${active
                                            ? "bg-blue-500 text-white"
                                            : "hover:bg-slate-100 text-slate-800"
                                        } ${disabledMinute ? "opacity-40 cursor-not-allowed" : ""}`}
                                    onClick={() => !disabledMinute && setMinute(m)}
                                >
                                    {label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}

// ================== 1) Calendar24 (demo) ==================

export function Calendar24() {
    const [openDate, setOpenDate] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(undefined);
    const [timeStr, setTimeStr] = React.useState("10:30");

    return (
        <div className="flex gap-3">
            <div className="flex flex-col gap-2">
                <Label htmlFor="date-picker" className="px-1 text-xs">
                    Date
                </Label>
                <Popover open={openDate} onOpenChange={setOpenDate}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            id="date-picker"
                            className="h-10 w-40 justify-between px-3 text-sm font-normal rounded-lg border-slate-200"
                        >
                            {date ? date.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon className="h-3 w-3" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-2 bg-white border border-slate-200 rounded-md shadow-sm"
                        align="start"
                    >
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            toYear={new Date().getFullYear() + 10}
                            onSelect={(d) => {
                                setDate(d);
                                setOpenDate(false);
                            }}
                            className="rounded-md border border-slate-100 text-sm"
                        />
                    </PopoverContent>
                </Popover>
            </div>

            <div className="flex flex-col gap-2">
                <Label htmlFor="time-picker" className="px-1 text-xs">
                    Time
                </Label>
                <TimeSelector
                    timeStr={timeStr}
                    onChange={(v) => setTimeStr(v)}
                    timeIntervals={5}
                />
            </div>
        </div>
    );
}

// ================== 2) DateTimePicker (dùng cho form) ==================

type DateTimePickerProps = {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    minDate?: Date;
    minTime?: Date;
    timeIntervals?: number; // phút
};

export function DateTimePicker({
    value,
    onChange,
    placeholder = "yyyy-MM-dd HH:mm",
    className,
    minDate,
    minTime,
    timeIntervals = 5,
}: DateTimePickerProps) {
    const [openDate, setOpenDate] = React.useState(false);
    const [date, setDate] = React.useState<Date | undefined>(
        value ? new Date(value) : undefined
    );
    const [timeStr, setTimeStr] = React.useState<string>(
        value ? formatTimeValue(new Date(value)) : ""
    );

    // sync khi value bên ngoài đổi
    React.useEffect(() => {
        if (!value) {
            setDate(undefined);
            setTimeStr("");
            return;
        }
        const d = new Date(value);
        if (!isNaN(d.getTime())) {
            setDate(d);
            setTimeStr(formatTimeValue(d));
        }
    }, [value]);

    const emitChange = React.useCallback(
        (newDate: Date | undefined, newTimeStr: string) => {
            if (!onChange || !newDate || !newTimeStr) return;
            const { h, m } = parseTimeString(newTimeStr);
            const merged = new Date(newDate);
            merged.setHours(h, m, 0, 0);

            // ensure >= minDate
            if (minDate && merged < minDate) {
                merged.setTime(minDate.getTime());
            }

            // ensure >= minTime nếu cùng ngày
            if (minTime && isSameDay(merged, minTime) && merged < minTime) {
                merged.setHours(minTime.getHours(), minTime.getMinutes(), 0, 0);
            }

            onChange(merged.toISOString());
        },
        [onChange, minDate, minTime]
    );

    const handleSelectDate = (selected?: Date) => {
        if (!selected) return;
        setDate(selected);
        if (timeStr) {
            emitChange(selected, timeStr);
        }
        setOpenDate(false);
    };

    const handleTimeSelectorChange = (newTimeStr: string) => {
        setTimeStr(newTimeStr);
        if (date) {
            emitChange(date, newTimeStr);
        }
    };

    return (
        <div
            className={`flex items-center border border-slate-200 rounded-lg bg-white ${className ?? ""
                }`}
        >
            {/* Date - expand to take available space */}
            <div className="flex-1">
                <Popover open={openDate} onOpenChange={setOpenDate}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="h-10 w-full justify-between text-xs cursor-pointer font-normal text-slate-700 text-left"
                        >
                            {date ? date.toLocaleDateString() : "Select date"}
                            <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto p-2 bg-white border border-slate-200 rounded-md shadow-sm"
                        align="start"
                    >
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            toYear={new Date().getFullYear() + 10}
                            onSelect={handleSelectDate}
                            className="rounded-md border cursor-pointer w-full border-slate-100 text-sm"
                            disabled={(d) => {
                                if (!minDate) return false;
                                const md = new Date(
                                    minDate.getFullYear(),
                                    minDate.getMonth(),
                                    minDate.getDate()
                                );
                                const curr = new Date(d.getFullYear(), d.getMonth(), d.getDate());
                                return curr < md;
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>

            {/* Time - fixed width so both controls sit nicely */}
            <div className="flex-none">
                {/* keep Input if we want user to see format placeholder */}
                <Input type="text" readOnly value={timeStr} placeholder={placeholder} className="hidden cursor-pointer" />
                <TimeSelector
                    timeStr={timeStr}
                    onChange={handleTimeSelectorChange}
                    timeIntervals={timeIntervals}
                    placeholder="Select time"
                    buttonClassName="h-10 w-full justify-between cursor-pointer bg-white px-2 text-xs font-normal text-slate-700"
                    selectedDate={date}
                    minTime={minTime}
                />
            </div>
        </div>
    );
}
