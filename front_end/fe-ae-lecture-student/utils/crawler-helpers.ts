export const SUMMARY_KEYWORDS = [
  "summary",
  "summaries",
  "insights",
  "overview",
  "breakdown",
  "highlights",
  "khoảng giá",
  "bao nhiêu",
  "thống kê",
  "biểu đồ",
  "tổng hợp",
  "phân tích",
  "xu hướng",
  "giá cả",
  "so sánh",
];

export function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function generateGuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isIgnorableSignalRError(msg: any) {
  const errorString = String(msg || "");
  return (
    errorString.includes("Canceled") ||
    errorString.includes("Invocation canceled") ||
    errorString.includes("WebSocket closed") ||
    errorString.includes("AbortError") ||
    errorString.includes("connection is not in the 'Connected' state") ||
    errorString.includes("The connection was stopped during negotiation")
  );
}

export function safeValidateUrl(raw: string): boolean {
  try {
    new URL(raw);
    return true;
  } catch {
    return false;
  }
}

export function buildUserIdentity(
  decodedUser: { id?: string; fullName?: string; email?: string } | null | undefined,
  authUser: any
) {
  const userId =
    decodedUser?.id ||
    authUser?.id ||
    authUser?.userId ||
    authUser?.userID ||
    authUser?.UserId ||
    "";
  const userName =
    decodedUser?.fullName ||
    decodedUser?.email ||
    authUser?.fullName ||
    authUser?.name ||
    authUser?.userName ||
    authUser?.email ||
    "Student";
  return { userId, userName };
}
