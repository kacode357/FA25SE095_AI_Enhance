// app/admin/users/[id]/page.tsx
"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminUserDetailScreen() {
  const params = useParams();
  const router = useRouter();
  const userId = typeof params?.id === "string" ? params.id : "";

  const { fetchUserDetail, detailData, loadingDetail } = useAdminUsers();

  useEffect(() => {
    if (userId) fetchUserDetail(userId);
  }, [userId, fetchUserDetail]);

  const u = detailData;

  const avatar = u?.profilePictureUrl
    ? u.profilePictureUrl
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(
        u?.fullName || `${u?.firstName ?? ""} ${u?.lastName ?? ""}`.trim()
      )}&background=E2E8F0&color=0F172A&size=128`;

  return (
    <div className="p-2 flex flex-col gap-3">
      <Card className="bg-white border border-slate-200">
        {/* ⬇️ Nút Back đặt trong khung */}
        <CardHeader className="pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              className="h-9 px-3"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <CardTitle className="text-base text-slate-800">Profile</CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {loadingDetail && (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-sm text-slate-600">Loading user…</span>
            </div>
          )}

          {!loadingDetail && u && (
            <div className="space-y-6">
              {/* Top */}
              <div className="flex items-start gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={avatar}
                  alt={u.fullName || u.email}
                  className="h-16 w-16 rounded-xl border border-slate-200 object-cover bg-slate-50"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900 truncate">
                      {u.fullName || `${u.firstName} ${u.lastName}`}
                    </p>
                    <Badge variant="outline">{u.role}</Badge>
                    <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100">
                      {u.status}
                    </Badge>
                    {u.subscriptionTier && (
                      <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
                        {u.subscriptionTier}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 break-all">{u.email}</p>
                </div>
              </div>

              <Separator />

              {/* Grid info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Info label="Email confirmed">
                  {u.isEmailConfirmed ? "Yes" : "No"}
                </Info>
                <Info label="Email confirmed at">{fmt(u.emailConfirmedAt)}</Info>

                <Info label="Last login">{fmt(u.lastLoginAt)}</Info>
                <Info label="Created at">{fmt(u.createdAt)}</Info>

                <Info label="Institution">{u.institutionName || "—"}</Info>
                <Info label="Institution address">
                  {u.institutionAddress || "—"}
                </Info>

                <Info label="Department">{u.department || "—"}</Info>
                <Info label="Student ID">{u.studentId || "—"}</Info>

                <Info label="Subscription start">
                  {fmt(u.subscriptionStartDate)}
                </Info>
                <Info label="Subscription end">
                  {fmt(u.subscriptionEndDate)}
                </Info>

                <Info label="Crawl used / limit">
                  {u.crawlQuotaUsed}/{u.crawlQuotaLimit}
                </Info>
                <Info label="Quota reset date">{fmt(u.quotaResetDate)}</Info>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm text-slate-800 mt-0.5 break-words">{children}</p>
    </div>
  );
}

function fmt(v?: string) {
  if (!v) return "—";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
