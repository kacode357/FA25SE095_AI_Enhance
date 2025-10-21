// config/UserService/user-role.ts

/** KHỚP THỨ TỰ VỚI UserService:
 * Student = 0, Lecturer = 1, Staff = 2, Admin = 3, PaidUser = 4
 */
export enum UserServiceRole {
  Student = 0,
  Lecturer = 1,
  Staff = 2,
  Admin = 3,
  PaidUser = 4,
}

/** Min/Max để check nhanh số hợp lệ */
const MIN_ROLE = UserServiceRole.Student;
const MAX_ROLE = UserServiceRole.PaidUser;

/** Map BE string -> enum (KHÔNG alias, đúng key BE) */
export const ROLE_BY_STRING = {
  student: UserServiceRole.Student,
  lecturer: UserServiceRole.Lecturer,
  staff: UserServiceRole.Staff,
  admin: UserServiceRole.Admin,
  paiduser: UserServiceRole.PaidUser, // giữ "paiduser" liền để ổn định key
} as const;

/** enum -> string BE mong muốn */
export const STRING_BY_ROLE: Record<UserServiceRole, keyof typeof ROLE_BY_STRING> =
{
  [UserServiceRole.Student]: "student",
  [UserServiceRole.Lecturer]: "lecturer",
  [UserServiceRole.Staff]: "staff",
  [UserServiceRole.Admin]: "admin",
  [UserServiceRole.PaidUser]: "paiduser",
};

/** Nhãn hiển thị (UI) */
export const ROLE_LABEL: Record<UserServiceRole, string> = {
  [UserServiceRole.Student]: "Student",
  [UserServiceRole.Lecturer]: "Lecturer",
  [UserServiceRole.Staff]: "Staff",
  [UserServiceRole.Admin]: "Admin",
  [UserServiceRole.PaidUser]: "Paid User",
};

/** Landing path (nếu cần dùng) */
export const ROLE_HOME: Record<UserServiceRole, string> = {
  [UserServiceRole.Student]: "/student/home",
  [UserServiceRole.Lecturer]: "/lecturer/manager/course",
  [UserServiceRole.Staff]: "/staff",
  [UserServiceRole.Admin]: "/admin",
  [UserServiceRole.PaidUser]: "/",
};

/** Type guard số hợp lệ theo UserService */
export const isUserServiceRole = (value: unknown): value is UserServiceRole =>
  typeof value === "number" &&
  Number.isInteger(value) &&
  value >= MIN_ROLE &&
  value <= MAX_ROLE;

/** FE-safe: map từ unknown -> enum */
export function mapRole(role: unknown): UserServiceRole | null {
  if (role == null) return null;

  if (typeof role === "number") return isUserServiceRole(role) ? role : null;

  if (typeof role === "string") {
    const s = role.trim().toLowerCase();
    if (/^\d+$/.test(s)) {
      const n = Number(s);
      return isUserServiceRole(n) ? n : null;
    }
    return ROLE_BY_STRING[s as keyof typeof ROLE_BY_STRING] ?? null;
  }

  return null;
}

/** enum -> string BE mong muốn (gửi ngược) */
export const roleToString = (role: UserServiceRole): string =>
  STRING_BY_ROLE[role] ?? "";

/** Helpers */
export const isStudent = (r?: UserServiceRole | null) =>
  r === UserServiceRole.Student;
export const isLecturer = (r?: UserServiceRole | null) =>
  r === UserServiceRole.Lecturer;

export const homeOf = (role: UserServiceRole): string => ROLE_HOME[role] ?? "/";
