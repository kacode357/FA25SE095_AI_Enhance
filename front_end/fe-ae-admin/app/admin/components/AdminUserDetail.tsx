"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  GraduationCap,
  Mail,
  MapPin,
  Shield,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { useAdminUserDetail } from "@/hooks/admin/useAdminUserDetail";
import { UserRoleBadge, UserStatusBadge } from "@/app/admin/components/UserBadge";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

type RoleContext = "Student" | "Staff" | "Lecturer";

type Props = {
  role: RoleContext;
};

export default function AdminUserDetail({ role }: Props) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params?.id as string;

  const { user, loading, fetchAdminUserDetail } = useAdminUserDetail();

  useEffect(() => {
    if (userId) {
      fetchAdminUserDetail(userId);
    }
  }, [userId, fetchAdminUserDetail]);

  if (loading) return <UserDetailSkeleton />;

  if (!user) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-slate-500">
        <p>User not found.</p>
        <Button variant="outline" onClick={() => router.back()}>
          Go back
        </Button>
      </div>
    );
  }

  const showQuotaUsage = role === "Student";
  const quotaPercentage =
    showQuotaUsage && user.crawlQuotaLimit > 0
      ? (user.crawlQuotaUsed / user.crawlQuotaLimit) * 100
      : 0;

  const pageTitle =
    role === "Student"
      ? "Student Details"
      : role === "Staff"
      ? "Staff Details"
      : "Lecturer Details";

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 p-5">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-slate-500 hover:text-slate-900"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to list
        </Button>
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">{pageTitle}</h1>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4 border-2 border-slate-100">
              <AvatarImage src={user.profilePictureUrl || ""} alt={user.email} />
              <AvatarFallback className="text-2xl bg-slate-100 text-slate-500">
                {(user.firstName?.[0] || user.email[0]).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <h2 className="text-xl font-bold text-slate-900">
              {user.fullName || "Unnamed User"}
            </h2>

            <div className="flex items-center gap-2 mt-2 text-slate-500">
              <Mail className="h-4 w-4" />
              <span className="text-sm">{user.email}</span>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <UserRoleBadge role={user.role} />
              <UserStatusBadge status={user.status} />
            </div>

            <Separator className="my-6" />

            <div className="w-full space-y-3 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Email Verified</span>
                <Badge
                  variant={user.isEmailConfirmed ? "default" : "secondary"}
                  className={
                    user.isEmailConfirmed
                      ? "bg-emerald-600 text-white hover:bg-emerald-700"
                      : ""
                  }
                >
                  {user.isEmailConfirmed ? "Yes" : "No"}
                </Badge>
              </div>
              {user.emailConfirmedAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Verified At</span>
                  <span className="text-slate-900">
                    {formatDateTimeVN(user.emailConfirmedAt)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
              <CreditCard className="h-5 w-5 text-brand" />
              {showQuotaUsage ? "Subscription & Usage" : "Subscription"}
            </h3>

            <div
              className={`grid gap-6 ${
                showQuotaUsage ? "sm:grid-cols-2" : "grid-cols-1"
              }`}
            >
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-medium uppercase text-slate-500">
                    Current Tier
                  </span>
                  <div className="mt-1">
                    <Badge
                      variant="outline"
                      className="text-sm px-3 py-1 border-brand/30 bg-brand/5 text-brand"
                    >
                      {user.subscriptionTier}
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 block">
                      Start Date
                    </span>
                    <span className="text-sm font-medium">
                      {user.subscriptionStartDate
                        ? formatDateTimeVN(user.subscriptionStartDate)
                        : "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">End Date</span>
                    <span className="text-sm font-medium">
                      {user.subscriptionEndDate
                        ? formatDateTimeVN(user.subscriptionEndDate)
                        : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {showQuotaUsage && (
                <div className="rounded-lg bg-slate-50 p-4 border border-slate-100">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-medium text-slate-700">
                      Crawl Quota Usage
                    </span>
                    <span className="text-xs text-slate-500">
                      {user.crawlQuotaUsed} / {user.crawlQuotaLimit} URLs
                    </span>
                  </div>
                  <Progress value={quotaPercentage} className="h-2" />
                  <p className="text-xs text-slate-400 mt-2">
                    Resets on:{" "}
                    {user.quotaResetDate
                      ? formatDateTimeVN(user.quotaResetDate)
                      : "N/A"}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
              <GraduationCap className="h-5 w-5 text-brand" />
              Institution Details
            </h3>
            <div className="grid gap-y-4 sm:grid-cols-2 sm:gap-x-8">
              <div>
                <span className="text-xs text-slate-500 block">
                  Institution Name
                </span>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {user.institutionName || "Not Provided"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">Department</span>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {user.department || "Not Provided"}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-500 block">
                  Student/Staff ID
                </span>
                <p className="text-sm font-medium text-slate-900 mt-1">
                  {user.studentId || "N/A"}
                </p>
              </div>
              <div className="sm:col-span-2">
                <span className="text-xs text-slate-500 block">Address</span>
                <div className="flex gap-2 mt-1">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-slate-900">
                    {user.institutionAddress || "Not Provided"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-white p-6 shadow-sm">
            <h3 className="flex items-center gap-2 font-semibold text-slate-900 mb-4">
              <Shield className="h-5 w-5 text-brand" />
              System Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <span className="text-xs text-slate-500 block mb-1">
                  Created At
                </span>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatDateTimeVN(user.createdAt)}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">
                  Updated At
                </span>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatDateTimeVN(user.updatedAt)}
                </div>
              </div>
              <div>
                <span className="text-xs text-slate-500 block mb-1">
                  Last Login
                </span>
                <div className="flex items-center gap-1.5 text-sm text-slate-700">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  {user.lastLoginAt
                    ? formatDateTimeVN(user.lastLoginAt)
                    : "Never"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserDetailSkeleton() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-5">
      <Skeleton className="h-8 w-32" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-96 rounded-xl" />
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
