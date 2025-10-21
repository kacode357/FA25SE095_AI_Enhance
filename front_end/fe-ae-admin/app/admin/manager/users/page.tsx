"use client";

import { AdminSectionHeader, DataTable } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/config/user-role";
import { UserStatus, mapStatus } from "@/config/user-status";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import type { GetUsersParams } from "@/types/admin/admin.payload";
import type { AdminUserItemResponse } from "@/types/admin/admin.response";
import { Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import PaginationBar from "@/components/common/PaginationBar";
import UserDetailDialog from "./components/UserDetailDialog";
import UsersFilterInline, { UsersFilterValues } from "./components/UsersFilterInline";

interface UserRow extends AdminUserItemResponse {}

export default function AdminUsersPage() {
  const {
    fetchUsers,
    listData,
    detailData,
    fetchUserDetail,
    reactivateUser,
    loadingList,
    loadingDetail,
    loadingReactivate,
    error,
  } = useAdminUsers();

  // applied filters (only change on Apply)
  const [filters, setFilters] = useState<UsersFilterValues>({
    emailOrName: "",
    role: "all",
    status: "all",
    tier: "all",
  });

  const [page, setPage] = useState(1);
  const [openDetail, setOpenDetail] = useState(false);

  // fetch list when page or filters change
  useEffect(() => {
    const params: GetUsersParams = { page, pageSize: 10 };

    if (filters.emailOrName?.trim()) params.searchTerm = filters.emailOrName.trim();
    if (filters.role && filters.role !== "all") params.role = Number(filters.role);
    if (filters.status && filters.status !== "all") params.status = Number(filters.status);
    if (filters.tier && filters.tier !== "all") params.subscriptionTier = filters.tier;

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
      {
        key: "status",
        header: "Status",
        className: "text-center",
        render: (u: UserRow) => (
          <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
            {u.status}
          </Badge>
        ),
      },
      {
        key: "tier",
        header: "Tier",
        className: "text-center",
        render: (u: UserRow) => u.subscriptionTier,
      },
      {
        key: "actions",
        header: "Actions",
        className: "text-center min-w-[110px]",
        render: (u: UserRow) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              className="h-8 px-2 text-emerald-700 hover:bg-emerald-50 cursor-pointer flex items-center gap-1"
              onClick={() => {
                fetchUserDetail(u.id);
                setOpenDetail(true);
              }}
              aria-label="View detail"
              title="View detail"
            >
              <Eye className="size-4" />
            </Button>

            {(mapStatus(u.status) === UserStatus.Suspended ||
              mapStatus(u.status) === UserStatus.Inactive) && (
              <Button
                variant="ghost"
                disabled={loadingReactivate}
                className="h-8 px-2 text-emerald-700 hover:bg-emerald-50 cursor-pointer"
                onClick={() => reactivateUser(u.id)}
              >
                {loadingReactivate ? "..." : "Reactivate"}
              </Button>
            )}
          </div>
        ),
      },
    ];
  }, [fetchUserDetail, loadingReactivate, reactivateUser]);

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
        {/* Inline filter aligned with table columns */}
        <UsersFilterInline
          initial={filters}
          loading={loadingList}
          onApply={(vals) => {
            setPage(1);         // reset to first page on new filters
            setFilters(vals);
          }}
          onClear={() => {
            setFilters({ emailOrName: "", role: "all", status: "all", tier: "all" });
            setPage(1);
          }}
        />

        {/* Table */}
        <div className="flex-1 min-h-[300px] table-clean">
          <DataTable<UserRow>
            columns={columns}
            data={users}
            loading={loadingList}
            emptyMessage={error ? error : "No users found."}
            rowKey={(r) => r.id}
          />
        </div>

        {/* Pagination */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          loading={loadingList}
          onPageChange={setPage}
        />
      </div>

      <UserDetailDialog
        open={openDetail}
        onOpenChange={setOpenDetail}
        detailData={detailData}
        loadingDetail={loadingDetail}
      />
    </div>
  );
}
