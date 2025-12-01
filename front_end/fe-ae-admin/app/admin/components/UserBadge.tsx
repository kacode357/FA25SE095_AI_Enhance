// app\admin\components\UserBadge.tsx
"use client";

import type { AdminUserItem } from "@/types/admin/admin-user.response";

type Role = AdminUserItem["role"];
type Status = AdminUserItem["status"];

export function UserRoleBadge({ role }: { role: Role }) {
  // Thêm whitespace-nowrap vào đây để role không bị xuống dòng
  const base = "px-2 py-0.5 text-[11px] rounded-full border whitespace-nowrap";

  switch (role) {
    case "Admin":
      return (
        <span
          className={`${base} bg-red-50 text-red-700 border-red-200 font-semibold`}
        >
          Admin
        </span>
      );
    case "Staff":
      return (
        <span
          className={`${base} bg-sky-50 text-sky-700 border-sky-200 font-semibold`}
        >
          Staff
        </span>
      );
    case "Lecturer":
      return (
        <span
          className={`${base} bg-violet-50 text-violet-700 border-violet-200`}
        >
          Lecturer
        </span>
      );
    case "PaidUser":
      return (
        <span
          className={`${base} bg-amber-50 text-amber-700 border-amber-200`}
        >
          Paid User
        </span>
      );
    default:
      return (
        <span
          className={`${base} bg-slate-50 text-slate-700 border-slate-200`}
        >
          Student
        </span>
      );
  }
}

export function UserStatusBadge({ status }: { status: Status }) {
  // QUAN TRỌNG: Thêm 'whitespace-nowrap' vào đây
  const base = "px-2 py-0.5 text-[11px] rounded-full border whitespace-nowrap";

  switch (status) {
    case "Active":
      return (
        <span
          className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}
        >
          Active
        </span>
      );
    case "PendingApproval":
      return (
        <span
          className={`${base} bg-amber-50 text-amber-700 border-amber-200`}
        >
          Pending approval
        </span>
      );
    case "Suspended":
      return (
        <span
          className={`${base} bg-rose-50 text-rose-700 border-rose-200`}
        >
          Suspended
        </span>
      );
    case "Inactive":
      return (
        <span
          className={`${base} bg-slate-50 text-slate-600 border-slate-200`}
        >
          Inactive
        </span>
      );
    case "Deleted":
      return (
        <span
          className={`${base} bg-slate-100 text-slate-500 border-slate-300 line-through`}
        >
          Deleted
        </span>
      );
    default:
      return (
        <span
          className={`${base} bg-slate-50 text-slate-600 border-slate-200`}
        >
          {status}
        </span>
      );
  }
}