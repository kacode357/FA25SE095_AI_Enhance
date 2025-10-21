// config/user-role.ts

/** Enum chuẩn FE dùng xuyên suốt (khớp BE) */
export enum UserRole {
  Student = 0,
  Lecturer = 1,
  Staff = 2,
  Admin = 3,
}

/** Map BE string -> enum (chỉ key đúng chuẩn, KHÔNG alias) */
export const ROLE_MAP: Record<"student" | "lecturer" | "staff" | "admin", UserRole> = {
  student: UserRole.Student,
  lecturer: UserRole.Lecturer,
  staff: UserRole.Staff,
  admin: UserRole.Admin,
};

/** enum -> string BE mong muốn (đảo từ ROLE_MAP) */
export const STRING_BY_ROLE: Record<UserRole, keyof typeof ROLE_MAP> = {
  [UserRole.Student]: "student",
  [UserRole.Lecturer]: "lecturer",
  [UserRole.Staff]: "staff",
  [UserRole.Admin]: "admin",
};

/** Nhãn hiển thị (UI) */
export const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Student]: "Student",
  [UserRole.Lecturer]: "Lecturer",
  [UserRole.Staff]: "Staff",
  [UserRole.Admin]: "Admin",
};

/** (tuỳ biến) Role được phép đăng nhập khu Lecturer */
export const ALLOWED_LOGIN_ROLES: UserRole[] = [UserRole.Admin];

/** Chuẩn hoá string từ BE -> enum */
export function mapRole(role: string): UserRole | null {
  if (!role) return null;
  const key = role.trim().toLowerCase() as keyof typeof ROLE_MAP;
  return ROLE_MAP[key] ?? null;
}

/** enum -> key BE khi cần gửi ngược */
export function roleToString(role: UserRole): string {
  return STRING_BY_ROLE[role] ?? "";
}
