"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AdminUserDetailResponse } from "@/types/admin/admin.response";
import { formatVNDateTime } from "@/lib/utils";
import { roleToString, mapRole, UserRole } from "@/config/user-role";
import { statusToString, mapStatus, UserStatus } from "@/config/user-status";
import { Loader2 } from "lucide-react";

interface UserDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detailData: AdminUserDetailResponse | null;
  loadingDetail?: boolean;
}

export default function UserDetailDialog({
  open,
  onOpenChange,
  detailData,
  loadingDetail,
}: UserDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>User Detail</DialogTitle>
        </DialogHeader>

        {loadingDetail ? (
          <div className="flex items-center justify-center py-10 text-slate-500">
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Loading user detail...
          </div>
        ) : detailData ? (
          <div className="space-y-2 text-sm text-slate-700">
            <p>
              <b>Email:</b> {detailData.email}
            </p>
            <p>
              <b>Name:</b> {detailData.firstName} {detailData.lastName}
            </p>
            <p>
              <b>Role:</b>{" "}
              {roleToString(mapRole(detailData.role) ?? UserRole.Student)}
            </p>
            <p>
              <b>Status:</b>{" "}
              {statusToString(
                mapStatus(detailData.status) ?? UserStatus.Pending
              )}
            </p>
            <p>
              <b>Tier:</b> {detailData.subscriptionTier}
            </p>
            <p>
              <b>Created At:</b> {formatVNDateTime(detailData.createdAt)}
            </p>
            <p>
              <b>Last Login:</b>{" "}
              {detailData.lastLoginAt
                ? formatVNDateTime(detailData.lastLoginAt)
                : "-"}
            </p>
          </div>
        ) : (
          <p className="text-slate-500">No data available.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
