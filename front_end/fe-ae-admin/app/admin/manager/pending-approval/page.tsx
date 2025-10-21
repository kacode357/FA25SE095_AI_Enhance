"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RotateCw, Users } from "lucide-react";
import EmptyState from "../components/EmptyState";
import TableSkeleton from "../components/TableSkeleton";
import { usePendingApprovalUsers } from "@/hooks/admin/usePendingApprovalUsers";
import { useUserApproval } from "@/hooks/admin/useUserApproval";
import { AdminUserItemResponse } from "@/types/admin/admin.response";

// Dialog components
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function PendingApprovalPage() {
  // ⬇️ Hook không còn error
  const { data, loading, fetchPendingUsers } = usePendingApprovalUsers();
  const { approveUser, suspendUser, loading: actionLoading } = useUserApproval();

  // filter state
  const [qEmail, setQEmail] = useState("");
  const [qInstitution, setQInstitution] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [createdFrom, setCreatedFrom] = useState<string>("");

  // refresh state
  const [refreshing, setRefreshing] = useState(false);

  // reject dialog state
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectUserId, setRejectUserId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [suspendUntil, setSuspendUntil] = useState("");

  useEffect(() => {
    // Không bắt lỗi ở đây, interceptor sẽ lo
    fetchPendingUsers({ page: 1, pageSize: 20 });
  }, [fetchPendingUsers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPendingUsers({ page: 1, pageSize: 20 });
    setRefreshing(false);
  };

  const handleApprove = async (id: string) => {
    const res = await approveUser(id);
    if (res?.success) {
      handleRefresh();
    }
  };

  const handleReject = async () => {
    if (!rejectUserId) return;
    const res = await suspendUser(rejectUserId, {
      reason: reason || "No reason provided",
      suspendUntil:
        suspendUntil ||
        new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
    if (res?.success) {
      setRejectOpen(false);
      setReason("");
      setSuspendUntil("");
      setRejectUserId(null);
      handleRefresh();
    }
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    const createdFromTime = createdFrom ? new Date(createdFrom).getTime() : null;

    return data.users.filter((u: AdminUserItemResponse) => {
      if (qEmail && !u.email.toLowerCase().includes(qEmail.toLowerCase()))
        return false;
      if (
        qInstitution &&
        !(u.institutionName || "")
          .toLowerCase()
          .includes(qInstitution.toLowerCase())
      )
        return false;
      if (filterRole !== "all" && u.role !== filterRole) return false;
      if (createdFromTime && new Date(u.createdAt).getTime() < createdFromTime)
        return false;
      return true;
    });
  }, [data, qEmail, qInstitution, filterRole, createdFrom]);

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
            Review and approve users before granting access.
          </p>
          <Button
            onClick={handleRefresh}
            disabled={refreshing || loading}
            className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
          >
            <RotateCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </header>

      {/* Main Card */}
      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="text-base text-slate-800">
            Pending Approval{" "}
            <span className="text-slate-500">({filtered.length})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          {/* ❌ ĐÃ BỎ KHỐI HIỂN THỊ ERROR */}
          {!filtered?.length && !loading ? (
            <div className="p-6">
              <EmptyState
                title="No pending users"
                description="All caught up! No users waiting for approval."
                icon={<Users className="size-10" />}
              />
            </div>
          ) : (
            <div className="h-full overflow-auto">
              <Table className="table-auto w-full">
                <TableHeader className="sticky top-0 z-10 bg-slate-50">
                  {/* giữ nguyên table head, đã bỏ FilterRow */}
                  <TableRow>
                    <TableHead className="px-4 py-2 text-left">Email</TableHead>
                    <TableHead className="px-4 py-2 text-left">Name</TableHead>
                    <TableHead className="px-4 py-2 text-center">Role</TableHead>
                    <TableHead className="px-4 py-2 text-left">Institution</TableHead>
                    <TableHead className="px-4 py-2 text-right hidden xl:table-cell">
                      Created At
                    </TableHead>
                    <TableHead className="px-4 py-2 text-right hidden xl:table-cell">
                      Last Login
                    </TableHead>
                    <TableHead className="px-4 py-2 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && <TableSkeleton rows={5} columns={7} />}
                  {!loading &&
                    filtered.map((u) => (
                      <TableRow
                        key={u.id}
                        className="border-b cursor-pointer border-slate-100 hover:bg-emerald-50/40"
                      >
                        <TableCell className="px-4 py-2 font-medium text-slate-800">
                          {u.email}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-slate-600 text-xs">
                          {u.firstName} {u.lastName}
                        </TableCell>
                        <TableCell className="px-4 text-center py-2 text-slate-600 text-xs">
                          {u.role}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-xs text-slate-600">
                          {u.institutionName}
                        </TableCell>
                        <TableCell className="pr-13 py-2 text-right text-xs text-slate-500 hidden xl:table-cell">
                          {formatDateTime(u.createdAt)}
                        </TableCell>
                        <TableCell className="pr-13 py-2 text-right text-xs text-slate-500 hidden xl:table-cell">
                          {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "—"}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-center">
                          <div className="inline-flex gap-2">
                            <Button
                              variant="ghost"
                              disabled={actionLoading}
                              onClick={() => handleApprove(u.id)}
                              className="h-8 px-2 !bg-emerald-50 cursor-pointer text-emerald-700"
                            >
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              disabled={actionLoading}
                              onClick={() => {
                                setRejectUserId(u.id);
                                setRejectOpen(true);
                              }}
                              className="h-8 px-2 !bg-red-50 cursor-pointer text-red-600"
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent className="bg-white shadow-lg rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Reject User
            </DialogTitle>
            <p className="text-sm text-slate-500">
              Provide a reason and suspension end date for this user.
            </p>
          </DialogHeader>

          <div className="flex flex-col gap-4 mt-2">
            {/* Reason */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Reason for rejection
              </label>
              <Input
                placeholder="Enter reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Suspend Until */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700">
                Suspend until
              </label>
              <Input
                type="datetime-local"
                value={suspendUntil}
                onChange={(e) => setSuspendUntil(e.target.value)}
                className="h-9"
              />
              <p className="text-xs text-slate-500">
                User will be suspended until this date/time.
              </p>
            </div>
          </div>

          <DialogFooter className="mt-5 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setRejectOpen(false)}
              className="px-3"
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Confirm Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
