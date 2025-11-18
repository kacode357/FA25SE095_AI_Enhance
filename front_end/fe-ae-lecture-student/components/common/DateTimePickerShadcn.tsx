"use client";

import { useEffect, useMemo, useState } from "react";

type Props = {
  value?: string | null;
  onChange: (iso: string) => void;
  placeholder?: string;
  id?: string;
  minDate?: Date | null;
  maxDate?: Date | null;
  minTime?: Date | null;
  maxTime?: Date | null;
  timeIntervals?: number; // minutes
  className?: string;
};

function toLocalDateString(d?: Date | null) {
  if (!d) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toLocalTimeString(d?: Date | null) {
  if (!d) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function DateTimePickerShadcn({
  value,
  onChange,
  placeholder,
  id,
  minDate,
  maxDate,
  minTime,
  maxTime,
  timeIntervals = 5,
  className,
}: Props) {
  // parse incoming ISO
  const parsed = useMemo(() => (value ? new Date(value) : null), [value]);
  const [datePart, setDatePart] = useState<string>(() => toLocalDateString(parsed));
  const [timePart, setTimePart] = useState<string>(() => toLocalTimeString(parsed));

  useEffect(() => {
    setDatePart(toLocalDateString(parsed));
    setTimePart(toLocalTimeString(parsed));
  }, [value]);

  const minDateStr = minDate ? toLocalDateString(minDate) : undefined;
  const maxDateStr = maxDate ? toLocalDateString(maxDate) : undefined;
  const minTimeStr = minTime ? toLocalTimeString(minTime) : undefined;
  const maxTimeStr = maxTime ? toLocalTimeString(maxTime) : undefined;

  const handleChange = (d: string, t: string) => {
    if (!d) return onChange("");
    // if time is empty, default to 00:00
    const time = t || "00:00";
    const dt = new Date(`${d}T${time}`);
    if (isNaN(dt.getTime())) return onChange("");
    onChange(dt.toISOString());
  };

  // build time options by intervals for accessibility (optional)
  const timeOptions = useMemo(() => {
    const opts: string[] = [];
    for (let m = 0; m < 24 * 60; m += timeIntervals) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      opts.push(`${hh}:${mm}`);
    }
    return opts;
  }, [timeIntervals]);

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <input
        id={id}
        type="date"
        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
        value={datePart}
        placeholder={placeholder}
        onChange={(e) => {
          setDatePart(e.target.value);
          handleChange(e.target.value, timePart);
        }}
        min={minDateStr}
        max={maxDateStr}
      />

      <select
        className="h-9 rounded-md border border-slate-300 bg-white px-2 text-sm"
        value={timePart}
        onChange={(e) => {
          setTimePart(e.target.value);
          handleChange(datePart, e.target.value);
        }}
        aria-label="time"
      >
        <option value="">--:--</option>
        {timeOptions.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </div>
  );
}
