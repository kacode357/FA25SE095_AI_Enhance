// config/user-status.ts

/** Enum chuẩn FE dùng xuyên suốt */
export enum UserStatus {
  Pending = 0,         // Account created but not verified
  Active = 1,          // Fully active account
  Inactive = 2,        // Temporarily disabled
  Suspended = 3,       // Suspended due to policy violation
  Deleted = 4,         // Soft deleted
  PendingApproval = 5, // Waiting for staff approval (lecturers)
}

/**
 * CHỈ SỬA Ở ĐÂY KHI BE ĐỔI TÊN STATUS
 * - Key: đúng theo BE trả (không phân biệt hoa/thường, có thể khai báo nhiều alias)
 * - Value: enum chuẩn dùng trong FE
 */
export const STATUS_MAP: Record<string, UserStatus> = {
  pending: UserStatus.Pending,
  active: UserStatus.Active,
  inactive: UserStatus.Inactive,
  suspended: UserStatus.Suspended,
  deleted: UserStatus.Deleted,
  "pending-approval": UserStatus.PendingApproval,
};

/** Chuẩn hoá string từ BE -> enum (dùng mọi nơi) */
export function mapStatus(status: string): UserStatus | null {
  if (!status) return null;
  const key = status.trim().toLowerCase();
  return STATUS_MAP[key] ?? null;
}

/** (tuỳ chọn) Convert enum -> key BE mong muốn khi cần gửi ngược */
export function statusToString(status: UserStatus): string {
  switch (status) {
    case UserStatus.Pending:
      return "pending";
    case UserStatus.Active:
      return "active";
    case UserStatus.Inactive:
      return "inactive";
    case UserStatus.Suspended:
      return "suspended";
    case UserStatus.Deleted:
      return "deleted";
    case UserStatus.PendingApproval:
      return "pending-approval";
    default:
      return "";
  }
}
