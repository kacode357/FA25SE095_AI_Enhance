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
  return `${h}:${m}`;
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

// ================== TIME SELECTOR ==================

type TimeSelectorProps = {
  timeStr: string;
  onChange: (newTimeStr: string) => void;
  timeIntervals?: number;
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

  const isMinDay = selectedDate && minTime && isSameDay(selectedDate, minTime);
  const minHour = isMinDay ? minTime!.getHours() : -1;
  const minMinute = isMinDay ? minTime!.getMinutes() : -1;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className={
            buttonClassName ??
            "h-9 w-32 justify-between px-2 text-sm font-normal text-slate-700"
          }
        >
          {timeStr || placeholder}
          <ChevronDownIcon className="h-4 w-4 text-slate-400" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-1 bg-white border border-slate-200 rounded-md shadow-sm"
      >
        <div className="flex gap-2 text-sm">
          {/* Hours */}
          <div className="max-h-40 w-12 overflow-auto pr-1 no-scrollbar">
            {hours.map((h) => {
              const label = h.toString().padStart(2, "0");
              const active = h === curH;
              const disabled = isMinDay && h < minHour;
              return (
                <button
                  key={h}
                  type="button"
                  disabled={disabled}
                  className={`mb-1 w-full rounded px-1 py-1 text-center text-xs ${
                    active
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
          <div className="max-h-40 w-12 overflow-auto pr-1 no-scrollbar">
            {minutes.map((m) => {
              const label = m.toString().padStart(2, "0");
              const active = m === curM;
              const disabledMinute = isMinDay && curH === minHour && m < minMinute;
              return (
                <button
                  key={m}
                  type="button"
                  disabled={disabledMinute}
                  className={`mb-1 w-full rounded px-1 py-1 text-center text-xs ${
                    active
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
      {/* Demo UI only */}
      <div className="flex flex-col gap-2">
        <Label>Date</Label>
        <div className="flex items-center border border-slate-200 rounded-md bg-white overflow-hidden h-9 w-40">
           <Button variant="ghost" className="h-full w-full rounded-none justify-between font-normal text-sm">
             {date ? date.toLocaleDateString() : "Select date"}
           </Button>
        </div>
      </div>
    </div>
  );
}

// ================== 2) DateTimePicker (MAIN COMPONENT) ==================

type DateTimePickerProps = {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  minDate?: Date;
  minTime?: Date;
  timeIntervals?: number; // phút
  size?: "sm" | "md";
  toYear?: number; // allow selecting years up to this value
};

export function DateTimePicker({
  value,
  onChange,
  placeholder = "yyyy-MM-dd HH:mm",
  className,
  minDate,
  minTime,
  timeIntervals = 5,
  size = "md",
  toYear = 2100,
}: DateTimePickerProps) {
  const [openDate, setOpenDate] = React.useState(false);
  const [date, setDate] = React.useState<Date | undefined>(
    value ? new Date(value) : undefined
  );
  const [timeStr, setTimeStr] = React.useState<string>(
    value ? formatTimeValue(new Date(value)) : ""
  );

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

      if (minDate && merged < minDate) {
        merged.setTime(minDate.getTime());
      }
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

  // STYLE CONFIG:
  // Container nhận chiều cao (heightClass) và overflow-hidden
  // Nút bên trong sẽ là h-full, rounded-none, bg-transparent
  
  const heightClass = size === "sm" ? "h-8" : "h-9";
  const fontSizeClass = size === "sm" ? "text-xs" : "text-sm";
  const iconSizeClass = size === "sm" ? "h-3 w-3" : "h-4 w-4";

  return (
    <div
      className={`flex items-center border border-slate-200 rounded-md bg-white overflow-hidden transition-all focus-within:ring-2 focus-within:ring-slate-400 focus-within:border-transparent ${heightClass} ${
        className ?? ""
      }`}
    >
      {/* Date Part - Grow to fill space */}
      <div className="flex-1 min-w-0 h-full">
        <Popover open={openDate} onOpenChange={setOpenDate}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full h-full justify-between ${fontSizeClass} font-normal bg-transparent hover:bg-slate-50 text-slate-700 text-left px-3 rounded-none`}
            >
              <span className="truncate">
                {date ? date.toLocaleDateString() : "Date"}
              </span>
              <ChevronDownIcon className={`${iconSizeClass} text-slate-400 shrink-0 ml-1`} />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-1 bg-white border border-slate-200 rounded-md shadow-sm"
            align="start"
          >
            <Calendar
              mode="single"
              selected={date}
              captionLayout="dropdown"
              toYear={toYear}
              onSelect={handleSelectDate}
              className="rounded-md border border-slate-100 text-sm"
              disabled={(d) => {
                if (!minDate) return false;
                const md = new Date(
                  minDate.getFullYear(),
                  minDate.getMonth(),
                  minDate.getDate()
                );
                const curr = new Date(
                  d.getFullYear(),
                  d.getMonth(),
                  d.getDate()
                );
                return curr < md;
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Separator */}
      <div className="w-px h-3/5 bg-slate-200 shrink-0" />

      {/* Time Part - Fixed Width */}
      <div className="flex-none h-full">
        <Input
          type="text"
          readOnly
          value={timeStr}
          placeholder={placeholder}
          className="hidden"
        />
        <TimeSelector
          timeStr={timeStr}
          onChange={handleTimeSelectorChange}
          timeIntervals={timeIntervals}
          placeholder="Time"
          // Quan trọng: h-full, bg-transparent, rounded-none
          buttonClassName={`h-full w-[90px] justify-between bg-transparent hover:bg-slate-50 px-2 ${fontSizeClass} font-normal text-slate-700 rounded-none`}
          selectedDate={date}
          minTime={minTime}
        />
      </div>
    </div>
  );
}