// config/user-role.ts

/** Enum chuẩn FE dùng xuyên suốt */
export enum UserRole {
  Student = 0,
  Lecturer = 1,
  Staff = 2,
  Admin = 3,
  PaidUser = 4,
}

/**
 * Map string role từ BE -> enum UserRole
 * - Viết thường hết để tránh lỗi case ("Student" / "STUDENT" đều ok)
 * - Có thêm alias nếu BE thay đổi
 */
export const ROLE_MAP: Record<string, UserRole> = {
  student: UserRole.Student,
  students: UserRole.Student, // alias
  lecturer: UserRole.Lecturer,
  staff: UserRole.Staff,
  admin: UserRole.Admin,
  paiduser: UserRole.PaidUser,
  "paid-user": UserRole.PaidUser,
  "paid_user": UserRole.PaidUser,
};

/** Danh sách role được phép đăng nhập (tuỳ biến ở đây) */
export const ALLOWED_LOGIN_ROLES: UserRole[] = [UserRole.Student];

/**
 * Chuẩn hoá role từ BE (string hoặc number) -> enum UserRole
 */
export function mapRole(role: string | number): UserRole | null {
  if (role === null || role === undefined) return null;

  if (typeof role === "number") {
    return Object.values(UserRole).includes(role) ? (role as UserRole) : null;
  }

  const key = role.trim().toLowerCase();
  return ROLE_MAP[key] ?? null;
}

/**
 * Convert enum -> string BE mong muốn khi cần gửi ngược
 */
export function roleToString(role: UserRole): string {
  switch (role) {
    case UserRole.Student:
      return "student";
    case UserRole.Lecturer:
      return "lecturer";
    case UserRole.Staff:
      return "staff";
    case UserRole.Admin:
      return "admin";
    case UserRole.PaidUser:
      return "paiduser";
    default:
      return "";
  }
}
