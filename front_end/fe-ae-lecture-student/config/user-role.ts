// config/user-role.ts

/** KHỚP THỨ TỰ VỚI BE:
 * Admin=0, Staff=1, Lecturer=2, Student=3
 */
export enum UserRole {
  Admin = 0,
  Staff = 1,
  Lecturer = 2,
  Student = 3,
}

/** Min/Max để check nhanh số hợp lệ */
const MIN_ROLE = UserRole.Admin;
const MAX_ROLE = UserRole.Student;

/** Map BE string -> enum (single source of truth) */
export const ROLE_BY_STRING = {
  admin: UserRole.Admin,
  staff: UserRole.Staff,
  lecturer: UserRole.Lecturer,
  student: UserRole.Student,
} as const;

/** enum -> string BE mong muốn (đảo từ ROLE_BY_STRING) */
export const STRING_BY_ROLE: Record<UserRole, keyof typeof ROLE_BY_STRING> = {
  [UserRole.Admin]: "admin",
  [UserRole.Staff]: "staff",
  [UserRole.Lecturer]: "lecturer",
  [UserRole.Student]: "student",
};

/** Nhãn hiển thị (UI) */
export const ROLE_LABEL: Record<UserRole, string> = {
  [UserRole.Admin]: "Admin",
  [UserRole.Staff]: "Staff",
  [UserRole.Lecturer]: "Lecturer",
  [UserRole.Student]: "Student",
};

/** App cho phép role nào */
export const APP_ALLOWED_ROLES = new Set<UserRole>([
  UserRole.Lecturer,
  UserRole.Student,
]);

/** Landing path cho từng role */
export const ROLE_HOME: Record<UserRole, string> = {
  [UserRole.Admin]: "/",
  [UserRole.Staff]: "/",
  [UserRole.Lecturer]: "/lecturer/manager/course",
  [UserRole.Student]: "/student/home",
};

/** Type guard số hợp lệ theo BE */
export const isUserRole = (value: unknown): value is UserRole =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= MIN_ROLE &&
  value <= MAX_ROLE;

/** FE-safe: map từ unknown -> enum, hỗ trợ number, "2"/"3", "lecturer"/"student"... */
export function mapRole(role: unknown): UserRole | null {
  if (role == null) return null;

  if (typeof role === "number") return isUserRole(role) ? role : null;

  if (typeof role === "string") {
    const s = role.trim().toLowerCase();
    if (/^\d+$/.test(s)) {
      const n = Number(s);
      return isUserRole(n) ? n : null;
    }
    return ROLE_BY_STRING[s as keyof typeof ROLE_BY_STRING] ?? null;
  }

  return null;
}

/** enum -> string BE mong muốn (gửi ngược) */
export const roleToString = (role: UserRole): string => STRING_BY_ROLE[role] ?? "";

/** Helpers */
export const isAllowedAppRole = (r?: UserRole | null) =>
  r != null && APP_ALLOWED_ROLES.has(r);

export const isLecturer = (r?: UserRole | null) => r === UserRole.Lecturer;
export const isStudent = (r?: UserRole | null) => r === UserRole.Student;

export const homeOf = (role: UserRole): string => ROLE_HOME[role] ?? "/";
