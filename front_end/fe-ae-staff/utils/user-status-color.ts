import { UserStatus } from "@/types/approve-lecturer/approve-lecturer.response";

/** Return tailwind classes for status badges */
export function getUserStatusClass(status: UserStatus | number | string) {
  // accept numeric enum or string
  const s = typeof status === "number" ? status : Number(status as any);
  switch (s) {
    case UserStatus.Active:
      return "bg-emerald-50 text-emerald-700";
    case UserStatus.Inactive:
      return "bg-slate-50 text-slate-700";
    case UserStatus.Suspended:
      return "bg-red-50 text-red-700";
    case UserStatus.Deleted:
      return "bg-gray-100 text-gray-700";
    case UserStatus.PendingApproval:
      return "bg-purple-50 text-purple-700";
    case UserStatus.Pending:
    default:
      return "bg-yellow-50 text-yellow-700";
  }
}

/** Return a human label for a status */
export function getUserStatusLabel(status: UserStatus | number | string) {
  const s = typeof status === "number" ? status : Number(status as any);
  switch (s) {
    case UserStatus.Active:
      return "Active";
    case UserStatus.Inactive:
      return "Inactive";
    case UserStatus.Suspended:
      return "Suspended";
    case UserStatus.Deleted:
      return "Deleted";
    case UserStatus.PendingApproval:
      return "PendingApproval";
    case UserStatus.Pending:
    default:
      return "Pending";
  }
}

export default { getUserStatusClass, getUserStatusLabel };