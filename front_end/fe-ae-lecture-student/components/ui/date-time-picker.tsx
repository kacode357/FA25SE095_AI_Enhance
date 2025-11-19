// components/ui/date-time-picker.tsx
"use client";

import * as React from "react";
import { ChevronDownIcon } from "lucide-react";

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
};

function TimeSelector({
  timeStr,
  onChange,
  timeIntervals = 5,
  buttonClassName,
  placeholder = "Select time",
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={
            buttonClassName ??
            "h-8 w-24 justify-between px-2 text-xs font-normal"
          }
        >
          {timeStr || placeholder}
          <ChevronDownIcon className="h-3 w-3" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-2 bg-white border border-slate-200 rounded-md shadow-sm"
      >
        <div className="flex gap-2 text-xs">
          {/* Hours */}
          <div className="max-h-40 w-10 overflow-auto pr-1">
            {hours.map((h) => {
              const label = h.toString().padStart(2, "0");
              const active = h === curH;
              return (
                <button
                  key={h}
                  type="button"
                  className={`mb-1 w-full rounded px-1 py-1 text-center ${
                    active
                      ? "bg-blue-500 text-white"
                      : "hover:bg-slate-100 text-slate-800"
                  }`}
                  onClick={() => setHour(h)}
                >
                  {label}
                </button>
              );
            })}
          </div>
          {/* Minutes */}
          <div className="max-h-40 w-10 overflow-auto pr-1">
            {minutes.map((m) => {
              const label = m.toString().padStart(2, "0");
              const active = m === curM;
              return (
                <button
                  key={m}
                  type="button"
                  className={`mb-1 w-full rounded px-1 py-1 text-center ${
                    active
                      ? "bg-blue-500 text-white"
                      : "hover:bg-slate-100 text-slate-800"
                  }`}
                  onClick={() => setMinute(m)}
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
              className="h-8 w-32 justify-between px-2 text-xs font-normal"
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
              onSelect={(d) => {
                setDate(d);
                setOpenDate(false);
              }}
              className="rounded-md border border-slate-100 text-xs"
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
    <div className={`flex gap-3 ${className ?? ""}`}>
      {/* Date */}
      <div className="flex flex-col gap-2">
        <Popover open={openDate} onOpenChange={setOpenDate}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="h-8 w-32 justify-between px-2 text-xs font-normal"
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
              onSelect={handleSelectDate}
              className="rounded-md border border-slate-100 text-xs"
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

      {/* Time */}
      <div className="flex flex-col gap-2">
        {/* giữ Input nếu muốn user thấy format placeholder */}
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
          placeholder="Select time"
          buttonClassName="h-8 w-24 justify-between px-2 text-xs font-normal"
        />
      </div>
    </div>
  );
}
