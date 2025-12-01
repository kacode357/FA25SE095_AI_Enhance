// utils/datetime/format-datetime.ts

/**
 * Hàm cũ – GIỮ NGUYÊN – để tránh lỗi ở các component khác.
 * Format datetime đầy đủ (có giờ).
 */
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
    return d.toLocaleString("vi-VN");
  }
}

/**
 * Hàm mới – CHỈ LẤY NGÀY – KHÔNG GIỜ.
 * Dùng cho Dashboard hoặc chỗ nào không muốn hiện giờ.
 */
export function formatDateOnlyVN(value?: string | null): string {
  if (!value || value.startsWith("0001")) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  try {
    return d.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch {
    return d.toLocaleDateString("vi-VN");
  }
}
