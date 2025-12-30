"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import type { AdminPaymentItem } from "@/types/payments/payment.response";
import { PaymentStatusBadge } from "./PaymentStatusBadge";

type Props = {
  loading?: boolean;
  items: AdminPaymentItem[];
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(
    amount
  );

const formatTierLabel = (item: AdminPaymentItem) => {
  if (item.tierName) {
    return Number.isFinite(item.tierLevel)
      ? `${item.tierName} (L${item.tierLevel})`
      : item.tierName;
  }
  return item.tierId;
};

export default function PaymentTable({ loading, items }: Props) {
  const showSkeleton = loading && items.length === 0;

  if (!loading && items.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-md border border-dashed border-[var(--border)] bg-slate-50/60 text-sm text-slate-500">
        No payments found matching your filters.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-[var(--border)] bg-white overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50/80 border-b border-[var(--border)]">
            <tr className="text-xs font-semibold uppercase text-slate-500">
              <th className="px-4 py-3 text-left">Order Code</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Tier</th>
              <th className="px-4 py-3 text-left">Amount</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Created At</th>
              <th className="px-4 py-3 text-left">Paid At</th>
            </tr>
          </thead>
          <tbody>
            {showSkeleton
              ? Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b border-[var(--border)]">
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-5 w-20" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                    <td className="px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  </tr>
                ))
              : items.map((item) => (
                  <tr
                    key={item.paymentId}
                    className="border-b border-[var(--border)] hover:bg-slate-50/60 transition-colors last:border-0"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900">
                      #{item.orderCode}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {item.userFullName}
                        </span>
                        <span className="text-xs text-slate-500">
                          {item.userEmail}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant="secondary"
                        className="bg-slate-100 text-slate-700 font-normal"
                      >
                        {formatTierLabel(item)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900">
                      {formatMoney(item.amount, item.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <PaymentStatusBadge status={item.status} />
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate">
                      {formatDateTimeVN(item.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate">
                      {item.paidAt ? formatDateTimeVN(item.paidAt) : "-"}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
