// app/admin/manager/users/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Eye } from "lucide-react";

import { AdminSectionHeader, DataTable } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import type { GetUsersParams } from "@/types/admin/admin.payload";
import type { AdminUserItemResponse } from "@/types/admin/admin.response";
import PaginationBar from "@/components/common/PaginationBar";
import UsersFilterInline, {
  UsersFilterValues,
} from "./components/UsersFilterInline";
import ReactivateUserButton from "./components/ReactivateUserButton";

interface UserRow extends AdminUserItemResponse {}

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
    if (filters.tier && filters.tier !== "all")
      params.subscriptionTier = filters.tier;

    fetchUsers(params);
  }, [page, filters, fetchUsers]);

  const users: AdminUserItemResponse[] = listData?.users ?? [];
  const totalCount = listData?.totalCount ?? 0;
  const totalPages = listData?.totalPages ?? 1;

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
                href={`/admin/manager/users/${u.id}`}
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
          <Button size="sm" variant="primary" onClick={() => setPage(1)}>
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
