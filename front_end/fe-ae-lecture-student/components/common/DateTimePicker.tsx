"use client";

import { formatISO, parseISO } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./DateTimePicker.css";

type Props = {
  value?: string;
  onChange: (isoString: string) => void;
  className?: string;
  placeholder?: string;
  id?: string;
  minDate?: Date;
  maxDate?: Date;
  minTime?: Date;
  maxTime?: Date;
  timeIntervals?: number;
};

export default function DateTimePicker({ value, onChange, className, placeholder, id, minDate, maxDate, minTime, maxTime, timeIntervals = 5 }: Props) {
  // react-datepicker uses Date objects; convert from ISO string if present
  const selected = value ? parseISO(value) : null;
  // react-datepicker requires both minTime and maxTime together; compute defaults
  let computedMinTime: Date | undefined = minTime ?? undefined;
  let computedMaxTime: Date | undefined = maxTime ?? undefined;
  if (minTime && !maxTime) {
    // default maxTime to end of day of minTime
    const m = new Date(minTime);
    m.setHours(23, 59, 59, 999);
    computedMaxTime = m;
  } else if (maxTime && !minTime) {
    // default minTime to start of day of maxTime
    const m = new Date(maxTime);
    m.setHours(0, 0, 0, 0);
    computedMinTime = m;
  }

  return (
    <div className={className}>
      <DatePicker
        id={id}
        selected={selected}
        onChange={(d: Date | null) => {
          if (!d) return onChange("");
          try {
            onChange(formatISO(d));
          } catch (err) {
            onChange(d.toISOString());
          }
        }}
        minDate={minDate}
        maxDate={maxDate}
        minTime={computedMinTime}
        maxTime={computedMaxTime}
        // readOnly
        showTimeSelect
        timeFormat="HH:mm"
        timeIntervals={timeIntervals}
        dateFormat="yyyy-MM-dd HH:mm"
        placeholderText={placeholder}
        className="w-full rounded-lg border bg-white border-slate-200 px-2 py-3 text-xs"
        popperClassName="ae-datepicker-popper"
      />
    </div>
  );
}
