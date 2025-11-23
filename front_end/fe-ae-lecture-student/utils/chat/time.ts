// utils/chat/time.ts

/** Parse datetime từ BE:
 * - Nếu thiếu timezone => coi là UTC, gắn 'Z'
 * - Clamp phần nghìn giây về 3 chữ số để Date parse ổn định
 */
export function parseServerDate(ts: string): Date {
  if (!ts) return new Date(NaN);
  const clamped = ts.replace(/(\.\d{3})\d+$/, "$1");
  const hasTZ = /Z|[+\-]\d{2}:\d{2}$/.test(clamped);
  const iso = hasTZ ? clamped : clamped + "Z";
  return new Date(iso);
}

export const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const mins = (a: Date, b: Date) =>
  Math.abs(a.getTime() - b.getTime()) / 60000;

export const timeHHmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(
    2,
    "0",
  )}`;

export const dayLabel = (d: Date) => {
  const now = new Date();
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  if (sameDay(d, now)) return "Today";
  if (sameDay(d, y)) return "Yesterday";
  return `${String(d.getDate()).padStart(2, "0")} ${d.toLocaleString(
    undefined,
    {
      month: "short",
    },
  )} ${d.getFullYear()}`;
};

/** Item cho UI: hoặc là separator, hoặc message */
export type ChatTimelineItem<T> =
  | { kind: "sep"; id: string; label: string }
  | { kind: "msg"; m: T; isMine: boolean; showTime: boolean };

/** Build mảng đã group: chèn "Today/Yesterday/..." + flag showTime */
export function buildChatTimeline<
  T extends { id: string; senderId: string; sentAt: string },
>(messages: T[], currentUserId: string | null): ChatTimelineItem<T>[] {
  const out: ChatTimelineItem<T>[] = [];

  for (let i = 0; i < messages.length; i++) {
    const m = messages[i];
    const d = parseServerDate(m.sentAt);

    // chèn separator ngày
    if (i === 0 || !sameDay(parseServerDate(messages[i - 1].sentAt), d)) {
      out.push({
        kind: "sep",
        id: `sep-${d.toDateString()}`,
        label: dayLabel(d), // <-- "Today", "Yesterday", ...
      });
    }

    const next = messages[i + 1];
    const showTime = !(
      next &&
      next.senderId === m.senderId &&
      mins(parseServerDate(next.sentAt), d) <= 5
    );
    const isMine = !!currentUserId && m.senderId === currentUserId;

    out.push({ kind: "msg", m, isMine, showTime });
  }

  return out;
}
