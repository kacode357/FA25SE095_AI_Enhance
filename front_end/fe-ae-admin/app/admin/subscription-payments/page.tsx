// app/admin/subscription-payments/page.tsx
"use client";

import { useEffect, useState } from "react";
import { CreditCard, Loader2, RefreshCw } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { DateTimePicker } from "@/components/ui/date-time-picker";

import { useAdminSubscriptionPayments } from "@/hooks/payments/useAdminSubscriptionPayments";
import type { AdminSubscriptionPaymentsQuery } from "@/types/payments/subscription-payment.payload";
import {
  SubscriptionPaymentStatus,
  SubscriptionPaymentItem,
} from "@/types/payments/subscription-payment.response";
import { SubscriptionTier } from "@/types/subscription/subscription.response";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";

function formatTier(tier: SubscriptionTier | undefined) {
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
      return "-";
  }
}

function formatStatus(status: SubscriptionPaymentStatus) {
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
      return "Unknown";
  }
}

function formatAmount(amount: number, currency: string) {
  if (Number.isNaN(amount)) return "-";
  return `${amount.toLocaleString()} ${currency}`;
}

export default function AdminSubscriptionPaymentsPage() {
  const { loading, items, pagination, fetchAdminSubscriptionPayments } =
    useAdminSubscriptionPayments();

  const [page, setPage] = useState(1);

  // filter state
  const [userId, setUserId] = useState("");
  const [tier, setTier] = useState<SubscriptionTier | undefined>(undefined);
  const [status, setStatus] = useState<SubscriptionPaymentStatus | undefined>(
    undefined
  );
  const [from, setFrom] = useState<string | undefined>(undefined);
  const [to, setTo] = useState<string | undefined>(undefined);

  // filters đang áp dụng thật sự (sau khi bấm Apply)
  const [activeFilters, setActiveFilters] = useState<
    Omit<AdminSubscriptionPaymentsQuery, "page" | "pageSize">
  >({});

  const pageSize = 20;

  const loadData = () => {
    const query: AdminSubscriptionPaymentsQuery = {
      page,
      pageSize,
      ...activeFilters,
    };

    fetchAdminSubscriptionPayments(query);
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, activeFilters]);

  const handleApplyFilters = () => {
    const next: Omit<AdminSubscriptionPaymentsQuery, "page" | "pageSize"> = {};

    if (userId.trim()) next.userId = userId.trim();
    if (typeof tier === "number") next.tier = tier;
    if (typeof status === "number") next.status = status;
    if (from) next.from = from;
    if (to) next.to = to;

    setPage(1);
    setActiveFilters(next);
  };

  const handleResetFilters = () => {
    setUserId("");
    setTier(undefined);
    setStatus(undefined);
    setFrom(undefined);
    setTo(undefined);
    setPage(1);
    setActiveFilters({});
  };

  const handlePrevPage = () => {
    if (pagination.hasPreviousPage) {
      setPage((p) => Math.max(1, p - 1));
    }
  };

  const handleNextPage = () => {
    if (pagination.hasNextPage) {
      setPage((p) => p + 1);
    }
  };

  const renderStatusBadgeClass = (status: SubscriptionPaymentStatus) => {
    switch (status) {
      case SubscriptionPaymentStatus.Paid:
        return "bg-emerald-50 text-emerald-700 border border-emerald-200";
      case SubscriptionPaymentStatus.Pending:
      case SubscriptionPaymentStatus.Processing:
        return "bg-amber-50 text-amber-700 border border-amber-200";
      case SubscriptionPaymentStatus.Failed:
      case SubscriptionPaymentStatus.Cancelled:
      case SubscriptionPaymentStatus.Expired:
        return "bg-rose-50 text-rose-700 border border-rose-200";
      default:
        return "bg-slate-50 text-slate-700 border border-slate-200";
    }
  };

  const hasData = items && items.length > 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-md">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Subscription Payments
              </h1>
              <p className="text-xs text-slate-500">
                View and filter all subscription payment records.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs"
            onClick={loadData}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="h-3 w-3" />
            )}
            Refresh
          </Button>
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
              Apply filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">
            Payments ({pagination.totalItems})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[160px]">
                    Order / Payment ID
                  </TableHead>
                  <TableHead className="min-w-[180px]">
                    User
                  </TableHead>
                  <TableHead className="min-w-[90px]">
                    Tier
                  </TableHead>
                  <TableHead className="min-w-[110px]">
                    Amount
                  </TableHead>
                  <TableHead className="min-w-[110px]">
                    Status
                  </TableHead>
                  <TableHead className="min-w-[180px]">
                    Created At
                  </TableHead>
                  <TableHead className="min-w-[180px]">
                    Paid At
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!loading && !hasData && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-xs text-slate-500"
                    >
                      No payments found.
                    </TableCell>
                  </TableRow>
                )}

                {loading && !hasData && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-8 text-center text-xs text-slate-500"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading payments...
                      </div>
                    </TableCell>
                  </TableRow>
                )}

                {items.map((p: SubscriptionPaymentItem) => (
                  <TableRow key={p.paymentId}>
                    <TableCell className="align-top text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-900">
                          {p.orderCode}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {p.paymentId}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-slate-900">
                          {p.userFullName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {p.userEmail}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="align-top text-xs">
                      {formatTier(p.tier)}
                    </TableCell>

                    <TableCell className="align-top text-xs">
                      {formatAmount(p.amount, p.currency)}
                    </TableCell>

                    <TableCell className="align-top text-xs">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${renderStatusBadgeClass(
                          p.status
                        )}`}
                      >
                        {formatStatus(p.status)}
                      </span>
                    </TableCell>

                    <TableCell className="align-top text-xs">
                      {formatDateTimeVN(p.createdAt)}
                    </TableCell>

                    <TableCell className="align-top text-xs">
                      {p.paidAt ? formatDateTimeVN(p.paidAt) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-600">
            <div>
              Page{" "}
              <span className="font-semibold">{pagination.page}</span> of{" "}
              <span className="font-semibold">{pagination.totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasPreviousPage || loading}
                onClick={handlePrevPage}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={!pagination.hasNextPage || loading}
                onClick={handleNextPage}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
