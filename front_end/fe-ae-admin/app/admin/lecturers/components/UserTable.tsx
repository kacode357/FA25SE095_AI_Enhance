"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { AdminUserItem } from "@/types/admin/admin-user.response";
import { formatDateOnlyVN } from "@/utils/datetime/format-datetime";
import {
  UserRoleBadge,
  UserStatusBadge,
} from "@/app/admin/components/UserBadge";

// Import component Action mới
import UserActionMenu from "./UserActionMenu";

type Props = {
  loading?: boolean;
  items: AdminUserItem[];
  onRefresh: () => void; // ✅ Thêm prop này để refresh data từ cha
};

export default function UserTable({ loading, items, onRefresh }: Props) {
  const showSkeleton = loading && items.length === 0;

  if (!loading && items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-slate-50/60 text-sm text-slate-500">
        No users found. Try adjusting filters.
      </div>
    );
  }

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
                    {/* ... (Phần Skeleton giữ nguyên như code cũ của mày) ... */}
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
                    {/* ✅ Thay thế Dropdown cũ bằng Component mới */}
                    <UserActionMenu 
                      user={u} 
                      onRefresh={onRefresh} 
                    />
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}