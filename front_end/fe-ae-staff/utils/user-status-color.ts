import { UserStatus } from "@/types/approve-lecturer/approve-lecturer.response";

function normalizeStatus(status: UserStatus | number | string): number {
  if (typeof status === "number") return status;
  const str = String(status ?? "").trim();
  // if it's numeric string, parse it
  const parsed = Number(str);
  if (!Number.isNaN(parsed)) return parsed;

  // map common string values (case-insensitive)
  switch (str.toLowerCase()) {
    case "active":
      return UserStatus.Active;
    case "inactive":
      return UserStatus.Inactive;
    case "suspended":
      return UserStatus.Suspended;
    case "deleted":
      return UserStatus.Deleted;
    case "pendingapproval":
    case "pending_approval":
    case "pending-approval":
      return UserStatus.PendingApproval;
    case "pending":
    default:
      return UserStatus.Pending;
  }
}

/** Return tailwind classes for status badges */
export function getUserStatusClass(status: UserStatus | number | string) {
  const s = normalizeStatus(status);
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
  const s = normalizeStatus(status);
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

export function isUserStatusActive(status: UserStatus | number | string) {
  return normalizeStatus(status) === UserStatus.Active;
}

export default { getUserStatusClass, getUserStatusLabel, isUserStatusActive };