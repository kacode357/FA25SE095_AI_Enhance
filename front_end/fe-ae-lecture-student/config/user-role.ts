export enum UserRole {
  Student = 0,
  Lecturer = 1,
  Staff = 2,
  Admin = 3,
  PaidUser = 4,
}

export const ROLE_MAP: Record<string, UserRole> = {
  student: UserRole.Student,
  students: UserRole.Student,   // alias nếu BE từng trả số nhiều
  lecturer: UserRole.Lecturer,
  staff: UserRole.Staff,
  admin: UserRole.Admin,
  paiduser: UserRole.PaidUser,
  "paid-user": UserRole.PaidUser,
  "paid_user": UserRole.PaidUser,
};

/** Danh sách role được phép đăng nhập khu Lecturer-Student (tuỳ biến tại đây) */
export const ALLOWED_LOGIN_ROLES: UserRole[] = [UserRole.Lecturer, UserRole.Student];

/** Chuẩn hoá string từ BE -> enum (dùng mọi nơi) */
export function mapRole(role: string): UserRole | null {
  if (!role) return null;
  const key = role.trim().toLowerCase();
  return ROLE_MAP[key] ?? null;
}

/** (tuỳ chọn) Convert enum -> key BE mong muốn khi cần gửi ngược */
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
