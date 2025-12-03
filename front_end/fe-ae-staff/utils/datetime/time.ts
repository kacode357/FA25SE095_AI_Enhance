export const VN_TIMEZONE = "Asia/Ho_Chi_Minh";

type FormatOptions = Intl.DateTimeFormatOptions;

/**
 * Format a UTC date/time to Vietnam timezone string using Intl.
 * Accepts Date | number (ms) | ISO string.
 */
export function formatToVN(input: string | number | Date, options?: FormatOptions) {
  let date: Date;
  if (typeof input === "string") {
    // If the string is a bare ISO datetime without timezone (e.g. "2025-11-29T15:44:00"),
    // treat it as UTC by appending a 'Z'. Browsers/Node may otherwise parse it as local time.
    const bareIsoNoTZ = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?$/;
    if (bareIsoNoTZ.test(input)) {
      date = new Date(input + "Z");
    } else {
      date = new Date(input);
    }
  } else if (typeof input === "number") {
    date = new Date(input);
  } else {
    date = input;
  }
  const baseOpts: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: undefined,
    hour12: false,
    ...options,
    timeZone: VN_TIMEZONE,
  };

  try {
    return new Intl.DateTimeFormat("vi-VN", baseOpts).format(date);
  } catch (err) {
    // Some runtimes (older Node / minimal ICU builds) don't support `dateStyle`/`timeStyle`.
    // Fall back to explicit fields mapped from those presets.
    const fallback: Intl.DateTimeFormatOptions = { timeZone: VN_TIMEZONE, hour12: false };

    if (options) {
      // Map dateStyle -> explicit year/month/day
      if ((options as any).dateStyle) {
        fallback.year = "numeric";
        fallback.month = "2-digit";
        fallback.day = "2-digit";
      }

      // Map timeStyle -> explicit hour/minute/second
      if ((options as any).timeStyle) {
        fallback.hour = "2-digit";
        fallback.minute = "2-digit";
        // keep seconds out unless explicitly requested
      }

      // Copy any explicit granular options if provided (these are safe)
      const granular: Array<keyof Intl.DateTimeFormatOptions> = [
        "year",
        "month",
        "day",
        "hour",
        "minute",
        "second",
        "weekday",
      ];
      for (const k of granular) {
        const v = (options as any)[k];
        if (v !== undefined) (fallback as any)[k] = v;
      }
    }

    return new Intl.DateTimeFormat("vi-VN", fallback).format(date);
  }
}

/**
 * Add hours to a Date (returns new Date)
 * Useful if you simply want to shift UTC -> local by adding +7.
 */
export function addHours(input: string | number | Date, hours: number) {
  const date = typeof input === "string" || typeof input === "number" ? new Date(input) : new Date((input as Date).getTime());
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

/**
 * Return a VN-local ISO-like string (YYYY-MM-DDTHH:mm:ss) without timezone suffix.
 * This takes the UTC instant and represents the wall-clock in VN timezone.
 */
export function toVNLocalISOString(input: string | number | Date) {
  const date = typeof input === "string" || typeof input === "number" ? new Date(input) : input;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: VN_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);

  const p: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== "literal") p[part.type] = part.value;
  }

  // Build ISO-like string in VN wall time (no timezone offset appended)
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}:${p.second}`;
}

/**
 * Convenience: convert UTC instant to VN Date object by shifting +7h.
 * Note: resulting Date is a JS Date representing the shifted instant in local runtime timezone.
 */
export function toVNDateByOffset(input: string | number | Date, offsetHours = 7) {
  return addHours(input, offsetHours);
}

export default { VN_TIMEZONE, formatToVN, addHours, toVNLocalISOString, toVNDateByOffset };
