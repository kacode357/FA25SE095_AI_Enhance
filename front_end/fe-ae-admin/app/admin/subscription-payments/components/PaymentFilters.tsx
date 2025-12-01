"use client";

import { useState, useEffect } from "react"; // Thêm useEffect
import { Search, X, Filter } from "lucide-react";
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
import { SubscriptionPaymentStatus } from "@/types/payments/subscription-payment.response";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export type PaymentFiltersState = {
  searchTerm?: string;
  status?: string;
  tier?: string;
  from?: string;
  to?: string;
};

type Props = {
  loading?: boolean;
  filters: PaymentFiltersState;
  onChange: (patch: Partial<PaymentFiltersState>) => void;
};

export default function PaymentFilters({ loading, filters, onChange }: Props) {
  
  // 1. Tạo state nội bộ để lưu giá trị "nháp"
  const [localFilters, setLocalFilters] = useState<PaymentFiltersState>(filters);

  // Đồng bộ state nội bộ nếu props bên ngoài thay đổi (ví dụ reset từ trang cha)
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Hàm update state nội bộ (chưa gọi API)
  const updateLocal = (patch: Partial<PaymentFiltersState>) => {
    setLocalFilters((prev) => ({ ...prev, ...patch }));
  };

  // 2. Hành động Apply: Lúc này mới gọi onChange của cha để fetch API
  const handleApply = () => {
    onChange(localFilters);
  };

  // 3. Hành động Reset: Xóa sạch và gọi API luôn
  const handleReset = () => {
    const emptyState = {
      searchTerm: "",
      status: undefined,
      tier: undefined,
      from: "",
      to: "",
    };
    setLocalFilters(emptyState);
    onChange(emptyState);
  };

  // Xử lý khi nhấn Enter ở ô Search
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleApply();
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-[var(--border)] bg-slate-50/70 p-4">
      {/* --- HÀNG 1: Search, Status, Tier --- */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
        {/* Search: 6 cột */}
        <div className="relative sm:col-span-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by order code, email... (Enter to filter)"
            className="pl-8 bg-white border-[var(--border)] h-10"
            value={localFilters.searchTerm ?? ""}
            disabled={loading}
            onChange={(e) => updateLocal({ searchTerm: e.target.value })}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Status: 3 cột */}
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
              <SelectItem value={SubscriptionPaymentStatus.Paid.toString()}>Paid</SelectItem>
              <SelectItem value={SubscriptionPaymentStatus.Pending.toString()}>Pending</SelectItem>
              <SelectItem value={SubscriptionPaymentStatus.Failed.toString()}>Failed</SelectItem>
              <SelectItem value={SubscriptionPaymentStatus.Cancelled.toString()}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tier: 3 cột */}
        <div className="sm:col-span-3">
          <Select
            disabled={loading}
            value={localFilters.tier}
            onValueChange={(v) => updateLocal({ tier: v === "all" ? undefined : v })}
          >
            <SelectTrigger className="w-full bg-white border-[var(--border)] h-10">
              <SelectValue placeholder="All Tiers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="Basic">Basic</SelectItem>
              <SelectItem value="Premium">Premium</SelectItem>
              <SelectItem value="Enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* --- HÀNG 2: Date Range & Buttons (Chia 4 - 4 - 4 cho đều) --- */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
        {/* From Date: 4 cột */}
        <div className="sm:col-span-4 space-y-1.5">
          <Label className="text-sm text-slate-500 font-normal">From Date:</Label>
          <DateTimePicker
            value={localFilters.from}
            onChange={(val) => updateLocal({ from: val })}
            placeholder="Start date..."
            className="w-full bg-white border-[var(--border)] h-10"
          />
        </div>

        {/* To Date: 4 cột */}
        <div className="sm:col-span-4 space-y-1.5">
          <Label className="text-sm text-slate-500 font-normal">To Date:</Label>
          <DateTimePicker
            value={localFilters.to}
            onChange={(val) => updateLocal({ to: val })}
            placeholder="End date..."
            className="w-full bg-white border-[var(--border)] h-10"
          />
        </div>

        {/* Buttons Area: 4 cột (Lấp đầy khoảng trống bên phải) */}
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