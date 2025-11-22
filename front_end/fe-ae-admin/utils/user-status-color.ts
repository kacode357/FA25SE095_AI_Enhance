// utils/user-status-color.ts
// Return Tailwind classes for quick status coloring in UI
import { statusToString } from "@/config/user-status";

export function getUserStatusClasses(status?: string | number) {
  if (status === undefined || status === null) return "bg-slate-100 text-slate-700";

  // If status is numeric (enum value), convert to string key
  const statusStr = typeof status === "number" ? statusToString(status as any) : String(status);
  const s = statusStr.toLowerCase();

  if (s.includes("active")) return "bg-emerald-50 text-emerald-700";
  if (s.includes("pending")) return "bg-amber-50 text-amber-700";
  if (s.includes("suspend") || s.includes("suspended") || s.includes("blocked"))
    return "bg-red-50 text-red-700";
  if (s.includes("inactive")) return "bg-slate-50 text-slate-600";
  if (s.includes("trial")) return "bg-indigo-50 text-indigo-700";

  // default neutral
  return "bg-slate-100 text-slate-700";
}

export default getUserStatusClasses;
