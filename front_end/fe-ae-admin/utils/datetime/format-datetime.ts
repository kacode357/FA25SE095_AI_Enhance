// utils/datetime/format-datetime.ts

/**
 * Hàm cũ – GIỮ NGUYÊN – để tránh lỗi ở các component khác.
 * Format datetime đầy đủ (có giờ).
 * Chuyển đổi UTC sang giờ VN (+7)
 */
export function formatDateTimeVN(value?: string | null): string {
  if (!value) return "—";

  // Nếu datetime string không có timezone info, thêm 'Z' để coi là UTC
  let dateStr = value;
  if (!value.endsWith('Z') && !value.includes('+') && !value.includes('T00:00:00')) {
    // API trả về UTC time không có 'Z', thêm vào
    dateStr = value.replace(/(\.\d+)?$/, 'Z');
  }

  const d = new Date(dateStr);
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
