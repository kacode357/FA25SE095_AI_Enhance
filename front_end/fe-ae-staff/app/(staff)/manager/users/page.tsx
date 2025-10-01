"use client";

import { AdminSectionHeader, DataTable, FilterBar } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/config/user-role";
import { UserStatus, mapStatus } from "@/config/user-status";
import { useAdminUsers } from "@/hooks/useAdminUsers";
import { GetUsersParams } from "@/types/admin/admin.payload";
import { AdminUserItemResponse } from "@/types/admin/admin.response";
import { Eye, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import UserDetailDialog from "./components/UserDetailDialog";
import UserPagination from "./components/UserPagination";

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

  // ==== filters ====
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("all");
  const [status, setStatus] = useState("all");
  const [tier, setTier] = useState("all");
  const [page, setPage] = useState(1);

  // ==== dialog state ====
  const [openDetail, setOpenDetail] = useState(false);

  // ==== fetch users list ====
  useEffect(() => {
    const params: GetUsersParams = { page, pageSize: 10 };
    if (query.trim()) params.searchTerm = query.trim();
    if (role !== "all") params.role = Number(role);
    if (status !== "all") params.status = Number(status);
    if (tier !== "all") params.subscriptionTier = tier;
    fetchUsers(params);
  }, [query, role, status, tier, page, fetchUsers]);

  const users: AdminUserItemResponse[] = listData?.users ?? [];
  const totalCount = listData?.totalCount ?? 0;
  const totalPages = listData?.totalPages ?? 1;

  const columns = useMemo(() => {
    return [
      {
        key: "email",
        header: "Email",
        className: "min-w-[180px]",
        render: (u: UserRow) => <span className="font-medium text-slate-900">{u.email}</span>,
      },
      {
        key: "name",
        header: "Name",
        className: "min-w-[140px]",
        render: (u: UserRow) => (
          <span className="text-slate-800">{u.firstName} {u.lastName}</span>
        ),
      },
      { key: "role", header: "Role", className: "text-center", render: (u: UserRow) => u.role },
      {
        key: "status",
        header: "Status",
        className: "text-center",
        render: (u: UserRow) => (
          <Badge className="bg-slate-100 text-slate-700 border border-slate-200">{u.status}</Badge>
        ),
      },
      { key: "tier", header: "Tier", className: "text-center", render: (u: UserRow) => u.subscriptionTier },
      {
        key: "actions",
        header: "Actions",
        className: "text-center min-w-[110px]",
        render: (u: UserRow) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              className="h-8 px-2 text-blue-600 hover:bg-blue-50 cursor-pointer flex items-center gap-1"
              onClick={() => {
                fetchUserDetail(u.id);
                setOpenDetail(true);
              }}
            >
              <Eye className="size-4" />
            </Button>
            {(mapStatus(u.status) === UserStatus.Suspended || mapStatus(u.status) === UserStatus.Inactive) && (
              <Button
                variant="ghost"
                disabled={loadingReactivate}
                className="h-8 px-2 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
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

  const rows: UserRow[] = users;

  return (
    <div className="p-2 flex flex-col gap-4">
      <AdminSectionHeader
        title={`User Management (${totalCount})`}
        description="Quản lý người dùng: duyệt, tìm kiếm, phân quyền, theo dõi trạng thái."
        actions={
          <Button size="sm" variant="primary" onClick={() => fetchUsers({ page: 1, pageSize: 10 })}>
            Refresh
          </Button>
        }
      />

      <div className="border rounded-lg overflow-hidden bg-white flex flex-col">
        <FilterBar
          right={
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => {
                setQuery("");
                setRole("all");
                setStatus("all");
                setTier("all");
                setPage(1);
              }}
            >
              Clear
            </Button>
          }
        >
          <div className="relative">
            <Search className="size-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search email / name"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-8 text-sm pl-7 w-52 md:w-64"
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white"
            aria-label="Filter by role"
          >
            <option value="all">All Roles</option>
            <option value={UserRole.Admin}>Admin</option>
            <option value={UserRole.Lecturer}>Lecturer</option>
            <option value={UserRole.Student}>Student</option>
            <option value={UserRole.Staff}>Staff</option>
            <option value={UserRole.PaidUser}>Paid User</option>
          </select>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value={UserStatus.Active}>Active</option>
            <option value={UserStatus.Pending}>Pending</option>
            <option value={UserStatus.PendingApproval}>Pending Approval</option>
            <option value={UserStatus.Inactive}>Inactive</option>
            <option value={UserStatus.Suspended}>Suspended</option>
            <option value={UserStatus.Deleted}>Deleted</option>
          </select>
          <select
            value={tier}
            onChange={(e) => setTier(e.target.value)}
            className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white"
            aria-label="Filter by subscription tier"
          >
            <option value="all">All Tiers</option>
            <option value="Free">Free</option>
            <option value="Basic">Basic</option>
            <option value="Pro">Pro</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </FilterBar>

        <div className="flex-1 min-h-[300px]">
          <DataTable<UserRow>
            columns={columns}
            data={rows}
            loading={loadingList}
            emptyMessage={error ? error : "No users found."}
            rowKey={(r) => r.id}
          />
        </div>
        <div className="border-t border-slate-200 p-2">
          <UserPagination page={page} totalPages={totalPages} setPage={setPage} />
        </div>
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
