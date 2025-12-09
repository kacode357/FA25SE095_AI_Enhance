// config/user-service.ts

// Enum tier BE: 0 = Free, 1 = Basic, 2 = Premium, 3 = Enterprise
export const SUBSCRIPTION_TIER_NAME_BY_NUMBER: Record<number, string> = {
  0: "Free",
  1: "Basic",
  2: "Premium",
  3: "Enterprise",
};

// Map thêm theo key chữ (phòng khi FE/BE dùng string "free", "basic" ...)
export const SUBSCRIPTION_TIER_NAME_BY_KEY: Record<string, string> = {
  free: "Free",
  basic: "Basic",
  premium: "Premium",
  enterprise: "Enterprise",
};

/**
 * Convert tier (number, "0", "free", ...) -> tên gói đẹp để hiển thị.
 * Nếu không map được thì trả về string gốc (cho đỡ bị trống).
 */
export function getUserSubscriptionPlanName(
  value: string | number | null | undefined,
): string {
  if (value === null || value === undefined) return "";

  if (typeof value === "number") {
    if (Number.isFinite(value) && value in SUBSCRIPTION_TIER_NAME_BY_NUMBER) {
      return SUBSCRIPTION_TIER_NAME_BY_NUMBER[value];
    }
    return String(value);
  }

  const raw = value.trim();
  if (!raw) return "";

  // Nếu là số dạng "0", "1", "2", "3"
  const maybeNumber = Number(raw);
  if (!Number.isNaN(maybeNumber) && maybeNumber in SUBSCRIPTION_TIER_NAME_BY_NUMBER) {
    return SUBSCRIPTION_TIER_NAME_BY_NUMBER[maybeNumber];
  }

  // Nếu là key dạng "free", "basic", ...
  const lower = raw.toLowerCase();
  if (lower in SUBSCRIPTION_TIER_NAME_BY_KEY) {
    return SUBSCRIPTION_TIER_NAME_BY_KEY[lower];
  }

  // Không map được thì trả string gốc
  return raw;
}
