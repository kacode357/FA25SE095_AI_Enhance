// utils/datetime/format-datetime.ts

/**
 * Format datetime đầy đủ (có giờ) - Ép buộc +7 Timezone
 */
export function formatDateTimeVN(value?: string | null): string {
  if (!value) return "—";

  // FIX: Nếu chuỗi thời gian không có múi giờ (không có Z và không có dấu +),
  // ta ép nó là UTC bằng cách thêm 'Z' vào cuối.
  // Ví dụ: "2025-12-03T08:31:42" -> "2025-12-03T08:31:42Z"
  // Lúc này trình duyệt mới hiểu là 8h sáng quốc tế => đổi ra 15h chiều VN.
  let dateString = value;
  if (typeof dateString === "string" && !dateString.endsWith("Z") && !dateString.includes("+")) {
    dateString += "Z";
  }

  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) {
    return value ?? "—";
  }

  try {
    return d.toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false, // Dùng định dạng 24h (15:30) cho chuẩn VN
    });
  } catch {
    return d.toLocaleString("vi-VN");
  }
}

/**
 * Hàm mới – CHỈ LẤY NGÀY – KHÔNG GIỜ.
 */
export function formatDateOnlyVN(value?: string | null): string {
  if (!value || value.startsWith("0001")) return "—";

  // Cũng ép UTC như trên để ngày không bị thụt lùi (ví dụ 1h sáng UTC -> 8h sáng VN)
  let dateString = value;
  if (typeof dateString === "string" && !dateString.endsWith("Z") && !dateString.includes("+")) {
    dateString += "Z";
  }

  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return "—";

  try {
    return d.toLocaleDateString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    });
  } catch {
    return d.toLocaleDateString("vi-VN");
  }
}

/**
 * Format time (HH:mm) in Vietnam timezone.
 */
export function formatTimeOnlyVN(value?: string | null): string {
  if (!value) return "?";

  let dateString = value;
  if (typeof dateString === "string" && !dateString.endsWith("Z") && !dateString.includes("+")) {
    dateString += "Z";
  }

  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) {
    return value ?? "?";
  }

  try {
    return d.toLocaleTimeString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return d.toLocaleTimeString("vi-VN");
  }
}
