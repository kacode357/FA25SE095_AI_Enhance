"use client";

import { useEffect, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { SubscriptionPaymentStatus } from "@/types/payments/payment.response";

export type PaymentFiltersState = {
  searchTerm?: string;
  status?: string;
  tierId?: string;
  from?: string;
  to?: string;
};

export type TierOption = {
  value: string;
  label: string;
};

type Props = {
  loading?: boolean;
  filters: PaymentFiltersState;
  tierOptions?: TierOption[];
  onChange: (patch: Partial<PaymentFiltersState>) => void;
};

export default function PaymentFilters({
  loading,
  filters,
  tierOptions = [],
  onChange,
}: Props) {
  const [localFilters, setLocalFilters] = useState<PaymentFiltersState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const updateLocal = (patch: Partial<PaymentFiltersState>) => {
    setLocalFilters((prev) => ({ ...prev, ...patch }));
  };

  const handleApply = () => {
    onChange(localFilters);
  };

  const handleReset = () => {
    const emptyState: PaymentFiltersState = {
      searchTerm: "",
      status: undefined,
      tierId: undefined,
      from: "",
      to: "",
    };
    setLocalFilters(emptyState);
    onChange(emptyState);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-slate-50/70 p-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        <div className="relative sm:col-span-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by user ID or email... (Enter to filter)"
            className="pl-8 bg-white border-[var(--border)] h-10"
            value={localFilters.searchTerm ?? ""}
            disabled={loading}
            onChange={(e) => updateLocal({ searchTerm: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="sm:col-span-3">
          <Select
            disabled={loading}
            value={localFilters.status?.toString()}
            onValueChange={(v) => updateLocal({ status: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-full bg-white border-[var(--border)] h-10">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value={SubscriptionPaymentStatus.Paid.toString()}>
                Paid
              </SelectItem>
              <SelectItem value={SubscriptionPaymentStatus.Pending.toString()}>
                Pending
              </SelectItem>
              <SelectItem value={SubscriptionPaymentStatus.Processing.toString()}>
                Processing
              </SelectItem>
              <SelectItem value={SubscriptionPaymentStatus.Failed.toString()}>
                Failed
              </SelectItem>
              <SelectItem value={SubscriptionPaymentStatus.Cancelled.toString()}>
                Cancelled
              </SelectItem>
              <SelectItem value={SubscriptionPaymentStatus.Expired.toString()}>
                Expired
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="sm:col-span-3">
          <Select
            disabled={loading || tierOptions.length === 0}
            value={localFilters.tierId}
            onValueChange={(v) => updateLocal({ tierId: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-full bg-white border-[var(--border)] h-10">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              {tierOptions.length === 0 ? (
                <SelectItem value="empty" disabled>
                  No tiers available
                </SelectItem>
              ) : (
                tierOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
        <div className="sm:col-span-4 space-y-1.5">
          <Label className="text-sm text-slate-500 font-normal">From Date:</Label>
          <DateTimePicker
            value={localFilters.from}
            onChange={(val) => updateLocal({ from: val })}
            placeholder="Start date..."
            className="w-full bg-white border-[var(--border)] h-10"
          />
        </div>

        <div className="sm:col-span-4 space-y-1.5">
          <Label className="text-sm text-slate-500 font-normal">To Date:</Label>
          <DateTimePicker
            value={localFilters.to}
            onChange={(val) => updateLocal({ to: val })}
            placeholder="End date..."
            className="w-full bg-white border-[var(--border)] h-10"
          />
        </div>

        <div className="sm:col-span-4 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="h-10 px-4 bg-white border-[var(--border)] text-slate-600 hover:text-slate-900"
          >
            <X className="mr-2 h-3.5 w-3.5" /> Clear
          </Button>

          <Button
            onClick={handleApply}
            disabled={loading}
            className="h-10 px-6 bg-brand hover:bg-brand/90 text-white min-w-[100px]"
          >
            <Filter className="mr-2 h-3.5 w-3.5" /> Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
