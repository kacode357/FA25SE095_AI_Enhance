"use client";

import { useEffect, useState } from "react";
import { Filter, X } from "lucide-react";
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

export type SummaryFiltersState = {
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
  filters: SummaryFiltersState;
  tierOptions?: TierOption[];
  onChange: (filters: SummaryFiltersState) => void;
};

export default function SummaryFilters({
  loading,
  filters,
  tierOptions = [],
  onChange,
}: Props) {
  const [localFilters, setLocalFilters] = useState<SummaryFiltersState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onChange(localFilters);
  };

  const handleReset = () => {
    const empty = { tierId: undefined, from: undefined, to: undefined };
    setLocalFilters(empty);
    onChange(empty);
  };

  return (
    <div className="rounded-xl border border-[var(--border)] bg-slate-50/60 p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-12 items-end">
        <div className="sm:col-span-4 space-y-2">
          <Label className="text-sm font-medium text-slate-700">Tier</Label>
          <Select
            disabled={loading || tierOptions.length === 0}
            value={localFilters.tierId}
            onValueChange={(v) =>
              setLocalFilters((prev) => ({
                ...prev,
                tierId: v === "all" ? undefined : v,
              }))
            }
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

        <div className="sm:col-span-3 space-y-2">
          <Label className="text-sm font-medium text-slate-700">From Date</Label>
          <DateTimePicker
            value={localFilters.from}
            onChange={(val) =>
              setLocalFilters((prev) => ({ ...prev, from: val }))
            }
            placeholder="Start date..."
            className="w-full bg-white border-[var(--border)] h-10"
          />
        </div>

        <div className="sm:col-span-3 space-y-2">
          <Label className="text-sm font-medium text-slate-700">To Date</Label>
          <DateTimePicker
            value={localFilters.to}
            onChange={(val) =>
              setLocalFilters((prev) => ({ ...prev, to: val }))
            }
            placeholder="End date..."
            className="w-full bg-white border-[var(--border)] h-10"
          />
        </div>

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
