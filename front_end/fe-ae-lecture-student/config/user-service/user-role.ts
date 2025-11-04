// config/UserService/user-role.ts
export enum UserServiceRole {
  Student = 0,
  Lecturer = 1,
  Staff = 2,
  Admin = 3,
  PaidUser = 4,
}

/** Numeric constants (sugar) */
export const ROLE_STUDENT   = UserServiceRole.Student;
export const ROLE_LECTURER  = UserServiceRole.Lecturer;
export const ROLE_STAFF     = UserServiceRole.Staff;
export const ROLE_ADMIN     = UserServiceRole.Admin;
export const ROLE_PAID_USER = UserServiceRole.PaidUser;
