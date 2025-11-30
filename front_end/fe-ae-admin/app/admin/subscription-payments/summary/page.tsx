// app/admin/subscription-payments/summary/page.tsx
"use client";

import { useEffect, useState } from "react";
import { BarChart3, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { DateTimePicker } from "@/components/ui/date-time-picker";

import { useAdminSubscriptionPaymentsSummary } from "@/hooks/payments/useAdminSubscriptionPaymentsSummary";
import type { AdminSubscriptionPaymentsQuery } from "@/types/payments/subscription-payment.payload";
import { SubscriptionPaymentStatus } from "@/types/payments/subscription-payment.response";
import { SubscriptionTier } from "@/types/subscription/subscription.response";

function formatTier(tier?: SubscriptionTier) {
  switch (tier) {
    case SubscriptionTier.Free:
      return "Free";
    case SubscriptionTier.Basic:
      return "Basic";
    case SubscriptionTier.Premium:
      return "Premium";
    case SubscriptionTier.Enterprise:
      return "Enterprise";
    default:
      return "All";
  }
}

function formatStatus(status?: SubscriptionPaymentStatus) {
  switch (status) {
    case SubscriptionPaymentStatus.Pending:
      return "Pending";
    case SubscriptionPaymentStatus.Processing:
      return "Processing";
    case SubscriptionPaymentStatus.Paid:
      return "Paid";
    case SubscriptionPaymentStatus.Failed:
      return "Failed";
    case SubscriptionPaymentStatus.Cancelled:
      return "Cancelled";
    case SubscriptionPaymentStatus.Expired:
      return "Expired";
    default:
      return "All";
  }
}

export default function AdminSubscriptionPaymentsSummaryPage() {
  const { loading, summary, fetchAdminSubscriptionPaymentsSummary } =
    useAdminSubscriptionPaymentsSummary();

  // filter state (UI)
  const [userId, setUserId] = useState("");
  const [tier, setTier] = useState<SubscriptionTier | undefined>(undefined);
  const [status, setStatus] = useState<SubscriptionPaymentStatus | undefined>(
    undefined
  );
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);

  // filters thật sự đang gửi lên API
  const [activeFilters, setActiveFilters] =
    useState<Omit<AdminSubscriptionPaymentsQuery, "page" | "pageSize">>({});

  const loadSummary = () => {
    const query: AdminSubscriptionPaymentsQuery = {
      ...activeFilters,
    };
    fetchAdminSubscriptionPaymentsSummary(query);
  };

  useEffect(() => {
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  const handleApplyFilters = () => {
    const next: Omit<AdminSubscriptionPaymentsQuery, "page" | "pageSize"> = {};

    if (userId.trim()) next.userId = userId.trim();
    if (typeof tier === "number") next.tier = tier;
    if (typeof status === "number") next.status = status;
    if (from) next.from = from;
    if (to) next.to = to;

    setActiveFilters(next);
  };

  const handleResetFilters = () => {
    setUserId("");
    setTier(undefined);
    setStatus(undefined);
    setFrom(undefined);
    setTo(undefined);
    setActiveFilters({});
  };

  const totalPayments = summary?.totalPayments ?? 0;
  const totalRevenue = summary?.totalRevenue ?? 0;
  const breakdown = summary?.statusBreakdown;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Subscription Payments Summary
              </h1>
              <p className="text-xs text-slate-500">
                High-level overview of total payments, revenue, and status breakdown.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">User ID</p>
              <Input
                placeholder="Filter by User ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">
                Subscription Tier
              </p>
              <Select
                value={
                  typeof tier === "number" ? String(tier) : undefined
                }
                onValueChange={(val) =>
                  setTier(
                    val === "all"
                      ? undefined
                      : (Number(val) as SubscriptionTier)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All tiers</SelectItem>
                  <SelectItem value={String(SubscriptionTier.Free)}>
                    Free
                  </SelectItem>
                  <SelectItem value={String(SubscriptionTier.Basic)}>
                    Basic
                  </SelectItem>
                  <SelectItem value={String(SubscriptionTier.Premium)}>
                    Premium
                  </SelectItem>
                  <SelectItem
                    value={String(SubscriptionTier.Enterprise)}
                  >
                    Enterprise
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">
                Payment Status
              </p>
              <Select
                value={
                  typeof status === "number"
                    ? String(status)
                    : undefined
                }
                onValueChange={(val) =>
                  setStatus(
                    val === "all"
                      ? undefined
                      : (Number(val) as SubscriptionPaymentStatus)
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem
                    value={String(SubscriptionPaymentStatus.Pending)}
                  >
                    Pending
                  </SelectItem>
                  <SelectItem
                    value={String(SubscriptionPaymentStatus.Processing)}
                  >
                    Processing
                  </SelectItem>
                  <SelectItem
                    value={String(SubscriptionPaymentStatus.Paid)}
                  >
                    Paid
                  </SelectItem>
                  <SelectItem
                    value={String(SubscriptionPaymentStatus.Failed)}
                  >
                    Failed
                  </SelectItem>
                  <SelectItem
                    value={String(SubscriptionPaymentStatus.Cancelled)}
                  >
                    Cancelled
                  </SelectItem>
                  <SelectItem
                    value={String(SubscriptionPaymentStatus.Expired)}
                  >
                    Expired
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">
                From (Created at)
              </p>
              <DateTimePicker value={from} onChange={setFrom} />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600">
                To (Created at)
              </p>
              <DateTimePicker value={to} onChange={setTo} />
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetFilters}
              disabled={loading}
            >
              Reset
            </Button>
            <Button size="sm" onClick={handleApplyFilters} disabled={loading}>
              {loading && (
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
              )}
              Apply filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-emerald-100 bg-emerald-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-emerald-700">
              Total Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-emerald-900">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </span>
              ) : (
                totalPayments
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-indigo-100 bg-indigo-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-indigo-700">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-indigo-900">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading...
                </span>
              ) : (
                `${totalRevenue.toLocaleString()} VND`
              )}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-100 bg-slate-50/60">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-slate-700">
              Current Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-[11px] text-slate-600">
            <p>
              <span className="font-semibold">User:</span>{" "}
              {activeFilters.userId || "All"}
            </p>
            <p>
              <span className="font-semibold">Tier:</span>{" "}
              {formatTier(activeFilters.tier)}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              {formatStatus(
                activeFilters.status as SubscriptionPaymentStatus | undefined
              )}
            </p>
            <p>
              <span className="font-semibold">From:</span>{" "}
              {activeFilters.from || "-"}
            </p>
            <p>
              <span className="font-semibold">To:</span>{" "}
              {activeFilters.to || "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Status Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading && !breakdown && (
            <div className="flex h-24 items-center justify-center text-xs text-slate-500">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading summary...
            </div>
          )}

          {!loading && !breakdown && (
            <div className="flex h-24 items-center justify-center text-xs text-slate-500">
              No data available.
            </div>
          )}

          {breakdown && (
            <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
              {Object.entries(breakdown).map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2"
                >
                  <p className="text-[11px] font-medium text-slate-500">
                    {key}
                  </p>
                  <p className="text-lg font-semibold text-slate-900">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
