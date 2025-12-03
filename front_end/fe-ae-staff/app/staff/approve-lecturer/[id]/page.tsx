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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useApproveAdminUser } from "@/hooks/approve-lecturer/useApproveLecturer";
import { useGetUserApproveById } from "@/hooks/approve-lecturer/useGetUserApproveById";
import { formatToVN } from "@/utils/datetime/time";
import {
  getUserStatusClass,
  getUserStatusLabel,
  isUserStatusActive,
} from "@/utils/user-status-color";
import PendingDetailSkeleton from "./components/PendingDetailSkeleton";

export default function PendingLecturerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const lecturerId = params?.id as string;

  const { user, loading, fetchUser } = useGetUserApproveById();
  const { approveAdminUser, loading: approving } = useApproveAdminUser();

  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  // Fetch user when page loads
  useEffect(() => {
    if (lecturerId) fetchUser(lecturerId);
  }, [lecturerId, fetchUser]);

  // Handle Approve using the hook
  const handleApprove = async () => {
    if (!user) return;
    try {
      await approveAdminUser(user.id); // CALL HOOK HERE
      await fetchUser(lecturerId);
      setIsApproved(true);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReject = () => setShowRejectDialog(true);

  // Loading skeleton
  if (loading) return <PendingDetailSkeleton />;

  // Not found case
  if (!user) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-slate-500 p-5">
        <p>User not found.</p>
        <button
          onClick={() => router.back()}
          className="btn btn-blue-slow text-sm px-4 py-2"
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto pb-10 p-5">
        {/* Back button */}
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center cursor-pointer bg-slate-100 rounded-md p-2 gap-1 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>List Pending Lecturers</span>
          </button>
        </div>

        {/* Title */}
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReject}
              className="bg-red-50 flex cursor-pointer hover:shadow-lg hover:text-red-800 items-center gap-2 rounded-xl text-sm px-4 py-2"
            >
              <XCircle className="h-4 text-red-600 w-4" />
              <span className="text-red-600">Suspend</span>
            </button>

            {/* Approve button only when user is not Active */}
            {!isUserStatusActive(user.status) && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={approving}
                className="btn btn-green-slow text-sm px-4 py-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>{approving ? "Approving..." : "Approve Lecturer"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Page content */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Personal info */}
            <div className="rounded-xl border border-(--border) bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
                <User className="h-5 w-5 text-brand" />
                Personal Information
              </h3>

              <div className="flex items-center gap-4">
                <Avatar>
                  {user.profilePictureUrl ? (
                    <AvatarImage
                      src={user.profilePictureUrl}
                      alt={
                        user.fullName ??
                        `${user.firstName} ${user.lastName}`
                      }
                    />
                  ) : (
                    <AvatarFallback className="bg-violet-50 text-violet-700">
                      {`${(user.firstName?.trim()?.[0] ?? "").toUpperCase()}${(
                        user.lastName?.trim()?.[0] ?? ""
                      ).toUpperCase()}`}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    {user.fullName ||
                      `${user.firstName ?? ""} ${user.lastName ?? ""}`}
                  </div>
                  <div className="text-sm text-slate-500">{user.role}</div>
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 mt-6">
                <div>
                  <span className="text-xs font-medium uppercase text-slate-500">
                    Email Address
                  </span>
                  <div className="mt-1 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-400" />
                    <p className="font-medium text-slate-900">{user.email}</p>
                  </div>
                  <div className="mt-1">
                    {user.isEmailConfirmed ? (
                      <span className="inline-flex items-center text-xs text-emerald-600 font-medium">
                        <CheckCircle2 className="mr-1 h-3 w-3" /> Email Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-xs text-amber-600 font-medium">
                        Unverified Email
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-medium uppercase text-slate-500">
                    Institution Name
                  </span>
                  <p className="mt-1 font-medium text-slate-900">
                    {user.institutionName || (
                      <span className="italic text-sm text-slate-400">
                        Not provided
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Institution info */}
            <div className="rounded-xl border border-(--border) bg-white p-6 shadow-sm">
              <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
                <Building2 className="h-5 w-5 text-brand" /> Institution Details
              </h3>

              <div className="space-y-4">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <span className="text-xs font-medium uppercase text-slate-500">
                      Department
                    </span>
                    <p className="mt-1 font-medium text-slate-900">
                      {user.department || (
                        <span className="italic text-sm text-slate-400">
                          Not provided
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="text-xs font-medium uppercase text-slate-500">
                    Institution Address
                  </span>
                  <p className="mt-1 text-slate-700">
                    {user.institutionAddress || (
                      <span className="italic text-sm text-slate-400">
                        Not provided
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="rounded-xl border border-(--border) bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-slate-900 mb-4">
                System Status
              </h3>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Current Role</span>
                  <Badge variant="outline" className="bg-slate-50">
                    {user.role}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Account Status</span>
                  <div
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getUserStatusClass(
                      user.status
                    )}`}
                  >
                    {getUserStatusLabel(user.status)}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <div>
                    <span className="text-xs text-slate-500 block mb-1">
                      Registered At
                    </span>
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Calendar className="h-3.5 w-3.5" />
                      {user.createdAt ? formatToVN(user.createdAt) : "—"}
                    </div>
                  </div>

                  {user.lastLoginAt && (
                    <div>
                      <span className="text-xs text-slate-500 block mb-1">
                        Last Login
                      </span>
                      <div className="text-sm text-slate-700">
                        {user.lastLoginAt ? formatToVN(user.lastLoginAt) : "—"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Feature not available</DialogTitle>
            <DialogDescription>
              The reject lecturer request feature has not been implemented yet.
              Please try again later.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowRejectDialog(false)}
              className="btn btn-blue-slow text-sm px-4 py-2"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
