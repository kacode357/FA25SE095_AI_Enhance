"use client";

import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { AdminUserItem } from "@/types/admin/admin-user.response";
import { Eye } from "lucide-react";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import { UserRoleBadge } from "@/app/admin/components/UserBadge";

type Props = {
  loading?: boolean;
  items: AdminUserItem[];
};

export default function PendingTable({ loading, items }: Props) {
  const router = useRouter();
  const showSkeleton = loading && items.length === 0;

  if (!loading && items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-slate-50/60 text-sm text-slate-500">
        No pending approval users.
      </div>
    );
  }

  const handleViewDetail = (u: AdminUserItem) => {
   router.push(`/admin/lecturers/pending-approval/${u.id}`);
  };

  return (
    <div className="rounded-md border border-[var(--border)] bg-white">
      <table className="w-full table-fixed text-sm">
       <colgroup>
          {[
            "w-[28%]", // User
            "w-[14%]", // Role
            "w-[16%]", // Subscription
            "w-[16%]", // Status
            "w-[18%]", // Created at
            "w-[8%]",  // Actions
          ].map((className, idx) => (
            <col key={idx} className={className} />
          ))}
        </colgroup>

        <thead className="bg-slate-50/80 border-b border-[var(--border)]">
          <tr className="text-xs font-semibold uppercase text-slate-500">
            <th className="px-3 py-2 text-left truncate">User</th>
            <th className="px-3 py-2 text-left truncate">Role</th>
            <th className="px-3 py-2 text-left truncate">Subscription</th>
            <th className="px-3 py-2 text-left truncate">Status</th>
            <th className="px-3 py-2 text-left truncate">Created at</th>
            <th className="px-3 py-2 text-right truncate">Actions</th>
          </tr>
        </thead>
        <tbody>
          {showSkeleton
            ? Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="border-b border-[var(--border)]">
                  <td className="px-3 py-3">
                    <div className="flex flex-col gap-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Skeleton className="h-4 w-2/3" />
                  </td>
                  <td className="px-3 py-3">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                  <td className="px-3 py-3">
                    <Skeleton className="h-4 w-3/4" />
                  </td>
                  <td className="px-3 py-3">
                    <Skeleton className="h-4 w-4/5" />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Skeleton className="h-9 w-9 ml-auto" />
                  </td>
                </tr>
              ))
            : items.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[var(--border)] hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-3 py-3">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 truncate">
                        {u.firstName || u.lastName
                          ? `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim()
                          : u.email}
                      </span>
                      <span className="text-xs text-slate-500 truncate">
                        {u.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <UserRoleBadge role={u.role} />
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50/70 text-[11px] font-medium text-emerald-700 truncate"
                    >
                      {u.subscriptionTier}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant="outline"
                      className="border-amber-200 bg-amber-50/80 text-[11px] font-medium text-amber-700 truncate"
                    >
                      Pending approval
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-700 truncate">
                    {formatDateTimeVN(u.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="relative inline-flex items-center justify-center group">
                      <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition ease-out duration-150 flex flex-col items-center gap-1">
                        <div className="bg-brand text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                          Details
                        </div>
                        <div className="h-2 w-2 bg-brand rotate-45 rounded-[2px]" />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleViewDetail(u)}
                        className="h-9 w-9 rounded-xl bg-brand flex items-center justify-center shadow-sm hover:brightness-110 transition"
                      >
                        <Eye className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
