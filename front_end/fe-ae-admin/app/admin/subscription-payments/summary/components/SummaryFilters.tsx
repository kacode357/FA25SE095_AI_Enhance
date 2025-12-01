"use client";

import { useState } from "react";
import { Filter, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export type SummaryFiltersState = {
  searchTerm?: string; // Dùng để search UserId hoặc Email
  from?: string;
  to?: string;
};

type Props = {
  loading?: boolean;
  filters: SummaryFiltersState;
  onChange: (filters: SummaryFiltersState) => void;
};

export default function SummaryFilters({ loading, filters, onChange }: Props) {
  // State nội bộ để nhập liệu, chưa gọi API ngay
  const [localFilters, setLocalFilters] = useState<SummaryFiltersState>(filters);

  const handleApply = () => {
    onChange(localFilters);
  };

  const handleReset = () => {
    const empty = { searchTerm: "", from: undefined, to: undefined };
    setLocalFilters(empty);
    onChange(empty);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleApply();
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-slate-50/60 p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-12 items-end">
        
        {/* 1. Search User (Chiếm 4 cột) */}
        <div className="sm:col-span-4 space-y-2">
          <Label className="text-sm font-medium text-slate-700">Student (ID/Email)</Label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Enter user email or ID..."
              className="pl-9 bg-white border-[var(--border)] h-10 focus-visible:ring-brand"
              value={localFilters.searchTerm ?? ""}
              onChange={(e) => setLocalFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
          </div>
        </div>

        {/* 2. From Date (Chiếm 3 cột) */}
        <div className="sm:col-span-3 space-y-2">
          <Label className="text-sm font-medium text-slate-700">From Date</Label>
          <DateTimePicker
            value={localFilters.from}
            onChange={(val) => setLocalFilters(prev => ({ ...prev, from: val }))}
            placeholder="Start date..."
            className="w-full bg-white border-[var(--border)] h-10"
          />
        </div>

        {/* 3. To Date (Chiếm 3 cột) */}
        <div className="sm:col-span-3 space-y-2">
          <Label className="text-sm font-medium text-slate-700">To Date</Label>
          <DateTimePicker
            value={localFilters.to}
            onChange={(val) => setLocalFilters(prev => ({ ...prev, to: val }))}
            placeholder="End date..."
            className="w-full bg-white border-[var(--border)] h-10"
          />
        </div>

        {/* 4. Buttons (Chiếm 2 cột - Căn phải) */}
        <div className="sm:col-span-2 flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={loading}
            className="h-10 px-3 bg-white border-[var(--border)] text-slate-600 hover:text-slate-900"
            title="Clear Filters"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <Button
            onClick={handleApply}
            disabled={loading}
            className="h-10 px-4 bg-brand hover:bg-brand/90 text-white w-full shadow-sm"
          >
            <Filter className="mr-2 h-3.5 w-3.5" /> Apply
          </Button>
        </div>
      </div>
    </div>
  );
}