export function parseServerDate(ts: string): Date {
    if (!ts) return new Date(NaN);
    const clamped = ts.replace(/(\.\d{3})\d+$/, "$1");
    const hasTZ = /Z|[+\-]\d{2}:\d{2}$/.test(clamped);
    const iso = hasTZ ? clamped : clamped + "Z";
    return new Date(iso);
}

export const sameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export const mins = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;

export const timeHHmm = (d: Date) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

export const dayLabel = (d: Date) => {
    const now = new Date();
    const y = new Date(now);
    y.setDate(now.getDate() - 1);
    if (sameDay(d, now)) return "Today";
    if (sameDay(d, y)) return "Yesterday";
    return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString(undefined, { month: "short" })} ${d.getFullYear()}`;
};

export const initial = (name?: string) => (name?.trim()?.[0]?.toUpperCase() ?? "?");
