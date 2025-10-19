// config/user-role.ts

/** KHỚP THỨ TỰ VỚI BE:
 * Admin=0, Staff=1, Lecturer=2, Student=3, PaidUser=4
 */
export enum UserRole {
  Admin = 0,
  Staff = 1,
  Lecturer = 2,
  Student = 3,
  PaidUser = 4,
}

/** Map từ string (BE trả) -> enum */
export const ROLE_MAP: Record<string, UserRole> = {
  admin: UserRole.Admin,
  staff: UserRole.Staff,
  lecturer: UserRole.Lecturer,
  student: UserRole.Student,
  students: UserRole.Student,      // phòng khi BE từng trả số nhiều
  paiduser: UserRole.PaidUser,
  "paid-user": UserRole.PaidUser,
  "paid_user": UserRole.PaidUser,
};

/** Nhãn hiển thị (nếu cần UI) */
export const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Admin]: "Admin",
  [UserRole.Staff]: "Staff",
  [UserRole.Lecturer]: "Lecturer",
  [UserRole.Student]: "Student",
  [UserRole.PaidUser]: "Paid User",
};

/** Khu vực app này chỉ cho phép: Lecturer=2, Student=3 */
export const APP_ALLOWED_ROLES: UserRole[] = [UserRole.Lecturer, UserRole.Student];

/** Landing path cho từng role */
export const ROLE_HOME: Record<UserRole, string> = {
  [UserRole.Admin]: "/",
  [UserRole.Staff]: "/",
  [UserRole.Lecturer]: "/lecturer/manager/course",
  [UserRole.Student]: "/student/home",   // bạn đã có page này
  [UserRole.PaidUser]: "/",
};

/** Type guard số hợp lệ theo BE */
export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= UserRole.Admin &&
  value <= UserRole.PaidUser;

/** FE-safe: map từ unknown -> enum, hỗ trợ number, "2"/"3", "lecturer"/"student"... */
export function mapRole(role: unknown): UserRole | null {
  if (role === null || role === undefined) return null;

  // BE trả số (2,3,...) -> dùng trực tiếp
  if (typeof role === "number") {
    return isUserRole(role) ? role : null;
  }

  // BE trả string: "2"/"3" hoặc "Lecturer"/"Student"
  if (typeof role === "string") {
    const trimmed = role.trim();

    // "2", "3", ...
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      return isUserRole(n) ? n : null;
    }

    // "lecturer", "student", ...
    const key = trimmed.toLowerCase();
    return ROLE_MAP[key] ?? null;
  }

  return null;
}

/** Convert enum -> string BE mong muốn (khi cần gửi ngược) */
export function roleToString(role: UserRole): string {
  switch (role) {
    case UserRole.Admin:
      return "admin";
    case UserRole.Staff:
      return "staff";
    case UserRole.Lecturer:
      return "lecturer";
    case UserRole.Student:
      return "student";
    case UserRole.PaidUser:
      return "paiduser";
    default:
      return "";
  }
}

/** Helpers */
export const isAllowedAppRole = (r?: UserRole | null) =>
  r !== null && r !== undefined && APP_ALLOWED_ROLES.includes(r as UserRole);

export const isLecturer = (r?: UserRole | null) => r === UserRole.Lecturer;
export const isStudent = (r?: UserRole | null) => r === UserRole.Student;

export function homeOf(role: UserRole): string {
  return ROLE_HOME[role] ?? "/";
}
