"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useAdminUsers } from "@/hooks/useAdminUsers";
import { GetUsersParams } from "@/types/admin/admin.payload";
import { AdminUserItemResponse } from "@/types/admin/admin.response";
import { UserRole } from "@/config/user-role";
import { UserStatus } from "@/config/user-status";
import { mapStatus } from "@/config/user-status";
import UserDetailDialog from "./components/UserDetailDialog";
import UserPagination from "./components/UserPagination";

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

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 backdrop-blur p-2 rounded-md border border-slate-200">
        <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
          Quản lý người dùng: duyệt, tìm kiếm, phân quyền, theo dõi trạng thái.
        </p>
      </header>

      {/* ===== Card ===== */}
      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-base text-slate-800">
            User Management{" "}
            <span className="text-slate-500">({totalCount})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden flex flex-col">
          {/* ==== Filter row ==== */}
          <div className="flex flex-wrap items-center gap-2 px-3 py-2 border-b border-slate-200 bg-slate-50">
            {/* search */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="size-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search email / name"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-8 text-sm pl-7"
              />
            </div>

            {/* role filter */}
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white"
            >
              <option value="all">All Roles</option>
              <option value={UserRole.Admin}>Admin</option>
              <option value={UserRole.Lecturer}>Lecturer</option>
              <option value={UserRole.Student}>Student</option>
              <option value={UserRole.Staff}>Staff</option>
              <option value={UserRole.PaidUser}>Paid User</option>
            </select>

            {/* status filter */}
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white"
            >
              <option value="all">All Status</option>
              <option value={UserStatus.Active}>Active</option>
              <option value={UserStatus.Pending}>Pending</option>
              <option value={UserStatus.PendingApproval}>
                Pending Approval
              </option>
              <option value={UserStatus.Inactive}>Inactive</option>
              <option value={UserStatus.Suspended}>Suspended</option>
              <option value={UserStatus.Deleted}>Deleted</option>
            </select>

            {/* tier filter */}
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value)}
              className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white"
            >
              <option value="all">All Tiers</option>
              <option value="Free">Free</option>
              <option value="Basic">Basic</option>
              <option value="Pro">Pro</option>
              <option value="Enterprise">Enterprise</option>
            </select>

            {/* clear button */}
            <Button
              variant="ghost"
              className="h-7 px-3 text-xs"
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
          </div>

          {/* ==== Table ==== */}
          <div className="h-full overflow-auto flex-1">
            <Table className="table-auto w-full">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-600 border-y border-slate-200">
                  <TableHead className="w-40 text-center py-3 font-bold">
                    Email
                  </TableHead>
                  <TableHead className="w-32 text-center py-3 font-bold">
                    Name
                  </TableHead>
                  <TableHead className="w-20 text-center py-3 font-bold">
                    Role
                  </TableHead>
                  <TableHead className="w-28 text-center py-3 font-bold">
                    Status
                  </TableHead>
                  <TableHead className="w-28 text-center py-3 font-bold">
                    Tier
                  </TableHead>
                  <TableHead className="w-28 text-center py-3 font-bold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loadingList && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-slate-500"
                    >
                      Loading users...
                    </TableCell>
                  </TableRow>
                )}

                {!loadingList && error && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-red-500"
                    >
                      {error}
                    </TableCell>
                  </TableRow>
                )}

                {!loadingList && !error && users.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-10 text-slate-500"
                    >
                      No users found.
                    </TableCell>
                  </TableRow>
                )}

                {!loadingList &&
                  !error &&
                  users.map((u: AdminUserItemResponse) => (
                    <motion.tr
                      key={u.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-b border-slate-100 hover:bg-emerald-50/50"
                    >
                      <TableCell className="px-4 text-slate-900">
                        {u.email}
                      </TableCell>
                      <TableCell className="text-slate-800">
                        {u.firstName} {u.lastName}
                      </TableCell>
                      <TableCell className="text-center text-slate-700">
                        {u.role}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className="bg-slate-100 text-slate-700 border border-slate-200">
                          {u.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-slate-700">
                        {u.subscriptionTier}
                      </TableCell>
                      <TableCell className="text-center flex items-center justify-center gap-1">
                        {/* xem chi tiết */}
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

                        {/* reactivate nếu Suspended/Inactive */}
                       {(mapStatus(u.status) === UserStatus.Suspended ||
  mapStatus(u.status) === UserStatus.Inactive) && (
  <Button
    variant="ghost"
    disabled={loadingReactivate}
    className="h-8 px-2 text-emerald-600 hover:bg-emerald-50 cursor-pointer"
    onClick={() => reactivateUser(u.id)}
  >
    {loadingReactivate ? "..." : "Reactivate"}
  </Button>
)}
                      </TableCell>
                    </motion.tr>
                  ))}
              </TableBody>
            </Table>
          </div>

          {/* ==== Pagination ==== */}
          <UserPagination
            page={page}
            totalPages={totalPages}
            setPage={setPage}
          />
        </CardContent>
      </Card>

      {/* ==== Detail dialog ==== */}
      <UserDetailDialog
        open={openDetail}
        onOpenChange={setOpenDetail}
        detailData={detailData}
        loadingDetail={loadingDetail}
      />
    </div>
  );
}
