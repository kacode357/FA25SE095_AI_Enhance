// app/admin/users/page.tsx
"use client";

import { Eye } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AdminSectionHeader, DataTable } from "@/components/admin";
import PaginationBar from "@/components/common/PaginationBar";
import { Button } from "@/components/ui/button";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import type { GetUsersParams } from "@/types/admin/admin.payload";
import { SubscriptionTier } from "@/types/admin/admin.payload";
import type { AdminUserItemResponse } from "@/types/admin/admin.response";
import ReactivateUserButton from "./components/ReactivateUserButton";
import UsersFilterInline, {
  UsersFilterValues,
} from "./components/UsersFilterInline";
import getUserStatusClasses from "@/utils/user-status-color";

interface UserRow extends AdminUserItemResponse { }

export default function AdminUsersPage() {
  const {
    fetchUsers,
    listData,
    reactivateUser, // để dependencies khỏi bị tree-shake, ReactivateUserButton vẫn xài hook riêng
    loadingList,
    loadingReactivate,
  } = useAdminUsers();

  // Bộ lọc áp dụng khi nhấn Apply
  const [filters, setFilters] = useState<UsersFilterValues>({
    emailOrName: "",
    role: "all",
    status: "all",
    tier: "all",
  });

  const [page, setPage] = useState(1);

  // Load list khi page/filters đổi
  useEffect(() => {
    const params: GetUsersParams = { page, pageSize: 10 };

    if (filters.emailOrName?.trim())
      params.searchTerm = filters.emailOrName.trim();
    if (filters.role && filters.role !== "all")
      params.role = Number(filters.role);
    if (filters.status && filters.status !== "all")
      params.status = Number(filters.status);
    if (filters.tier && filters.tier !== "all") {
      // Accept either numeric string, enum name, or friendly labels (e.g. "Pro")
      const tierStr = String(filters.tier);

      // Map common labels to enum values (cover 'Pro' -> 'Premium')
      const tierMap: Record<string, SubscriptionTier> = {
        Free: SubscriptionTier.Free,
        Basic: SubscriptionTier.Basic,
        Premium: SubscriptionTier.Premium,
        Pro: SubscriptionTier.Premium,
        Enterprise: SubscriptionTier.Enterprise,
      };

      // If it's a numeric string like "0"/"1"
      const asNumber = Number(tierStr);
      if (!Number.isNaN(asNumber)) {
        params.subscriptionTier = asNumber as SubscriptionTier;
      } else if (tierMap[tierStr] !== undefined) {
        params.subscriptionTier = tierMap[tierStr];
      } else {
        // Fallback: try to lookup by enum key
        const key = tierStr as keyof typeof SubscriptionTier;
        const enumValue = (SubscriptionTier as any)[key];
        if (typeof enumValue === "number") params.subscriptionTier = enumValue;
      }
    }

    fetchUsers(params);
  }, [page, filters, fetchUsers]);

  // Normalize response shape: some endpoints return { users, totalCount, ... }
  // while others may wrap results in a `data` field. Safely handle both.
  const users: AdminUserItemResponse[] =
    (listData as any)?.users ?? (listData as any)?.data?.users ?? [];
  const totalCount =
    (listData as any)?.totalCount ?? (listData as any)?.data?.totalCount ?? 0;
  const totalPages =
    (listData as any)?.totalPages ?? (listData as any)?.data?.totalPages ?? 1;

  const columns = useMemo(() => {
    return [
      {
        key: "email",
        header: "Email",
        className: "min-w-[180px]",
        render: (u: UserRow) => (
          <span className="font-medium text-slate-900">{u.email}</span>
        ),
      },
      {
        key: "name",
        header: "Name",
        className: "min-w-[140px]",
        render: (u: UserRow) => (
          <span className="text-slate-800">
            {u.firstName} {u.lastName}
          </span>
        ),
      },
      {
        key: "role",
        header: "Role",
        className: "text-center",
        render: (u: UserRow) => u.role,
      },
      // Bỏ Status column theo yêu cầu trước
      {
        key: "tier",
        header: "Tier",
        className: "text-center",
        render: (u: UserRow) => u.subscriptionTier,
      },
      {
        key: "status",
        header: "Status",
        className: "text-center",
        render: (u: UserRow) => (
          <span
            className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium ${getUserStatusClasses(
              u.status
            )}`}
          >
            {u.status}
          </span>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-center min-w-[200px]",
        render: (u: UserRow) => (
          <div className="flex items-center justify-center gap-1 whitespace-nowrap">
            {/* View detail: dùng asChild + icon Eye */}
            <Button

              variant="ghost"
              className="h-8 px-2 text-slate-700 hover:bg-slate-50"
              title="View user"
            >
              <Link
                href={`/admin/users/${u.id}`}
                className="inline-flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                <span>View</span>
              </Link>
            </Button>

            {/* Reactivate (ẩn nếu không đủ điều kiện) */}
            <ReactivateUserButton userId={u.id} status={u.status} />
          </div>
        ),
      },
    ];
  }, [loadingReactivate, reactivateUser]);

  return (
    <div className="p-2 flex flex-col gap-4">
      <AdminSectionHeader
        title={`User Management (${totalCount})`}
        description="Manage users: review, search, assign roles, and monitor statuses."
        actions={
          <Button size="sm" className="btn btn-gradient-slow text-sm" variant="primary" onClick={() => setPage(1)}>
            Refresh
          </Button>
        }
      />

      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white flex flex-col">
        {/* Filter inline thẳng hàng cột */}
        <UsersFilterInline
          initial={filters}
          loading={loadingList}
          onApply={(vals) => {
            setPage(1); // reset page khi Apply
            setFilters(vals);
          }}
          onClear={() => {
            setFilters({
              emailOrName: "",
              role: "all",
              status: "all",
              tier: "all",
            });
            setPage(1);
          }}
        />

        {/* Bảng */}
        <div className="flex-1 min-h-[300px] table-clean">
          <DataTable<UserRow>
            columns={columns}
            data={users}
            loading={loadingList}
            emptyMessage={"No users found."}
            rowKey={(r) => r.id}
          />
        </div>

        {/* Phân trang */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          loading={loadingList}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
