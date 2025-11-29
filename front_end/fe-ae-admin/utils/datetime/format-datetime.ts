// utils/datetime/format-datetime.ts

export function formatDateTimeVN(value?: string | null): string {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    return value ?? "—";
  }

  try {
    return d.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch {
    // fallback nếu runtime ko support timeZone 
    return d.toLocaleString("vi-VN");
  }
}
