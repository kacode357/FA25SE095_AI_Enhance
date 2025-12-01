"use client";

import { useRouter } from "next/navigation";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { Eye, MoreHorizontal, RotateCcw } from "lucide-react";
import type { AdminUserItem } from "@/types/admin/admin-user.response";
import { formatDateOnlyVN } from "@/utils/datetime/format-datetime";
import {
  UserRoleBadge,
  UserStatusBadge,
} from "@/app/admin/components/UserBadge";

type Props = {
  loading?: boolean;
  items: AdminUserItem[];
};

export default function UserTable({ loading, items }: Props) {
  const router = useRouter();
  const showSkeleton = loading && items.length === 0;

  if (!loading && items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-slate-50/60 text-sm text-slate-500">
        No users found. Try adjusting filters.
      </div>
    );
  }

  const handleViewDetail = (u: AdminUserItem) => {
    router.push(`/admin/users/${u.id}`);
  };

  const handleReactivate = (u: AdminUserItem) => {
    // TODO: wire reactivate API
    console.log("Reactivate user", u.id);
  };

  return (
    <div className="rounded-md border border-[var(--border)] bg-white">
      <table className="w-full table-fixed text-sm">
  <colgroup>
          {[
            "w-[22%]", // User
            "w-[10%]", // Role
            "w-[12%]", // Status
            "w-[12%]", // Subscription
            "w-[14%]", // Quota
            "w-[12%]", // Last login
            "w-[12%]", // Created at
            "w-[6%]",  // Actions
          ].map((className, idx) => (
            <col key={idx} className={className} />
          ))}
        </colgroup>

        <thead className="bg-slate-50/80 border-b border-[var(--border)]">
          <tr className="text-xs font-semibold uppercase text-slate-500">
            <th className="px-3 py-2 text-left truncate">User</th>
            <th className="px-3 py-2 text-left truncate">Role</th>
            <th className="px-3 py-2 text-left truncate">Status</th>
            <th className="px-3 py-2 text-left truncate">Subscription</th>
            <th className="px-3 py-2 text-left truncate">Quota</th>
            <th className="px-3 py-2 text-left truncate">Last login</th>
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
                  <td className="px-3 py-3">
                    <Skeleton className="h-4 w-4/5" />
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
                    <UserStatusBadge status={u.status} />
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant="outline"
                      className="border-emerald-200 bg-emerald-50/70 text-[11px] font-medium text-emerald-700 truncate"
                    >
                      {u.subscriptionTier}
                    </Badge>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-700">
                    <div className="flex flex-col">
                      <span className="truncate">
                        {u.crawlQuotaUsed} / {u.crawlQuotaLimit}
                      </span>
                      <span className="text-[11px] text-slate-400 truncate">
                        URLs used / limit
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-700 truncate">
                    {formatDateOnlyVN(u.lastLoginAt)}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-700 truncate">
                    {formatDateOnlyVN(u.createdAt)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          className="h-9 w-9 rounded-2xl bg-[#efeaff] flex items-center justify-center shadow-sm hover:bg-[#e2d7ff] transition"
                        >
                          <MoreHorizontal className="h-4 w-4 text-brand" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="min-w-[170px] rounded-2xl border border-[var(--border)] bg-white px-1 py-1 shadow-lg"
                      >
                        <DropdownMenuItem
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#15157a] focus:bg-slate-50/90 cursor-pointer"
                          onClick={() => handleViewDetail(u)}
                        >
                          <Eye className="h-4 w-4 text-brand" />
                          <span>Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[#15157a] focus:bg-slate-50/90 cursor-pointer"
                          onClick={() => handleReactivate(u)}
                        >
                          <RotateCcw className="h-4 w-4 text-brand" />
                          <span>Reactivate</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
