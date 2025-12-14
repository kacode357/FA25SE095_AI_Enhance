"use client";

import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  Mail,
  User,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import {
  UserRoleBadge,
  UserStatusBadge,
} from "@/app/admin/components/UserBadge";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminUserDetail } from "@/hooks/admin/useAdminUserDetail";
import { useApproveAdminUser } from "@/hooks/admin/useApproveAdminUser";
import { useSuspendAdminUser } from "@/hooks/admin/useSuspendAdminUser";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

export default function PendingLecturerDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const lecturerId = params?.id as string;

  const { user, loading, fetchAdminUserDetail } = useAdminUserDetail();
  const { loading: approving, approveAdminUser } = useApproveAdminUser();

  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendUntil, setSuspendUntil] = useState<string | undefined>(undefined);

  const { suspendAdminUser, loading: suspendLoading } = useSuspendAdminUser();

  useEffect(() => {
    if (lecturerId) {
      fetchAdminUserDetail(lecturerId);
    }
  }, [lecturerId, fetchAdminUserDetail]);

  const handleApprove = async () => {
    if (!user) return;
    try {
      const res = await approveAdminUser(user.id);
      if (res) {
        // ✅ Gọi lại API get detail để status update trên UI
        await fetchAdminUserDetail(lecturerId);
        // ✅ Ẩn 2 nút hành động
        setIsApproved(true);
      }
    } catch {
      // toast error đã handle trong hook / interceptor
    }
  };

  const openSuspendDialog = () => {
    setIsSuspendOpen(true);
  };

  const handleSuspendSubmit = async () => {
    if (!user || !suspendReason.trim()) return;
    try {
      await suspendAdminUser(user.id, {
        reason: suspendReason,
        suspendUntil: suspendUntil || null,
      });
      setIsSuspendOpen(false);
      setSuspendReason("");
      setSuspendUntil(undefined);
      // refresh detail to reflect new status
      await fetchAdminUserDetail(lecturerId);
    } catch (e) {
      // errors handled by interceptor/hooks
    }
  };

  if (loading) {
    return <PendingDetailSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-slate-500 p-5">
        <p>User not found.</p>
        <button
          type="button"
          onClick={() => router.back()}
          className="btn btn-blue-slow text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto pb-10 p-5">
        {/* Nút back dùng icon, không breadcrumb nữa */}
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        {/* Main Title Section */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Review Lecturer Application
            </h1>
            <p className="text-slate-500 mt-1">
              Review the details below and decide to approve or reject the
              request.
            </p>
          </div>

          {/* Chỉ hiện nút khi chưa approve */}
          {!isApproved && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={openSuspendDialog}
                className="btn btn-red-slow text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <XCircle className="h-4 w-4" />
                <span>Suspend</span>
              </button>
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="btn btn-green-slow text-sm px-4 py-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {approving ? "Approving..." : "Approve Lecturer"}
                </span>
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Personal & Institution Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info Card */}
            <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
                <User className="h-5 w-5 text-brand" />
                Personal Information
              </h3>
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-medium uppercase text-slate-500">
                    Full Name
                  </span>
                  <p className="mt-1 font-medium text-slate-900 text-lg">
                    {user.fullName ||
                      `${user.firstName ?? ""} ${user.lastName ?? ""}` ||
                      "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-medium uppercase text-slate-500">
                    Email Address
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <p className="font-medium text-slate-900">
                      {user.email}
                    </p>
                  </div>
                  <div className="mt-1">
                    {user.isEmailConfirmed ? (
                      <span className="inline-flex items-center text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Email
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-amber-600 font-medium">
                        Unverified Email
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Institution Info Card */}
            <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
                <Building2 className="h-5 w-5 text-brand" />
                Institution Details
              </h3>
              <div className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-medium uppercase text-slate-500">
                      Institution Name
                    </span>
                    <p className="mt-1 font-medium text-slate-900">
                      {user.institutionName || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium uppercase text-slate-500">
                      Department
                    </span>
                    <p className="mt-1 font-medium text-slate-900">
                      {user.department || "Not provided"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-xs font-medium uppercase text-slate-500">
                    Institution Address
                  </span>
                  <p className="mt-1 text-slate-700">
                    {user.institutionAddress || "Not provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: System Status */}
          <div className="space-y-6">
            <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">
                System Status
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    Current Role
                  </span>
                  <UserRoleBadge role={user.role} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    Account Status
                  </span>
                  <UserStatusBadge status={user.status} />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">
                    Subscription
                  </span>
                  <Badge variant="outline" className="bg-slate-50">
                    {user.subscriptionTier}
                  </Badge>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">
                      Registered At
                    </span>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDateTimeVN(user.createdAt)}
                    </div>
                  </div>
                  {user.lastLoginAt && (
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">
                        Last Login
                      </span>
                      <div className="text-sm text-slate-700">
                        {formatDateTimeVN(user.lastLoginAt)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspend dialog */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent className="sm:max-w-[425px] bg-white p-6">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600 text-lg">
              Suspend Lecturer Account
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              This action will restrict the lecturer's access. Provide a reason.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="reason" className="font-medium text-slate-700">Reason (Required)</Label>
              <Textarea
                id="reason"
                placeholder="Violation of terms, spamming, etc."
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                className="resize-none min-h-[80px] border-slate-200 focus-visible:ring-1 focus-visible:ring-brand focus-visible:border-brand"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="font-medium text-slate-700">Suspend Until (Optional)</Label>
              <DateTimePicker
                value={suspendUntil}
                onChange={setSuspendUntil}
                placeholder="Select date (Indefinite if empty)"
                minDate={new Date()}
                className="w-full"
              />
              <p className="text-[11px] text-slate-400 italic">
                Leave empty for indefinite suspension.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button 
              variant="outline" 
              onClick={() => setIsSuspendOpen(false)}
              disabled={suspendLoading}
              className="border-slate-200"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSuspendSubmit}
              disabled={suspendLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white border-none"
            >
              {suspendLoading ? "Suspending..." : "Confirm Suspension"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Skeleton Component cho lúc loading
function PendingDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto p-5">
      <Skeleton className="h-8 w-32" />
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
