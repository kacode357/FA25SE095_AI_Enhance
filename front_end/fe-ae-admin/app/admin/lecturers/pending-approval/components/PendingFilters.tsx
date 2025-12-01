// app/admin/pending-approval/components/PendingFilters.tsx
"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  AdminUserRoleFilter,
  AdminSubscriptionTierFilter,
} from "@/types/admin/admin-user.payload";

type FiltersState = {
  searchTerm?: string;
  role?: AdminUserRoleFilter;
  subscriptionTier?: AdminSubscriptionTierFilter;
};

type Props = {
  loading?: boolean;
  filters: FiltersState;
  onChange: (patch: Partial<FiltersState>) => void;
};

const ROLE_OPTIONS: { value: AdminUserRoleFilter; label: string }[] = [
  { value: AdminUserRoleFilter.Student, label: "Student" },
  { value: AdminUserRoleFilter.Lecturer, label: "Lecturer" },
  { value: AdminUserRoleFilter.Staff, label: "Staff" },
  { value: AdminUserRoleFilter.Admin, label: "Admin" },
  { value: AdminUserRoleFilter.PaidUser, label: "Paid User" },
];

const TIER_OPTIONS: { value: AdminSubscriptionTierFilter; label: string }[] = [
  { value: AdminSubscriptionTierFilter.Free, label: "Free" },
  { value: AdminSubscriptionTierFilter.Basic, label: "Basic" },
  { value: AdminSubscriptionTierFilter.Premium, label: "Premium" },
  { value: AdminSubscriptionTierFilter.Enterprise, label: "Enterprise" },
];

export default function PendingFilters({ loading, filters, onChange }: Props) {
  const handleReset = () => {
    onChange({
      searchTerm: "",
      role: undefined,
      subscriptionTier: undefined,
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-slate-50/70 p-3">
      {/* Row 1: search */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by email, name..."
            className="pl-8 text-sm"
            value={filters.searchTerm ?? ""}
            disabled={loading}
            onChange={(e) => onChange({ searchTerm: e.target.value })}
          />
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-1 md:mt-0"
          onClick={handleReset}
          disabled={loading}
        >
          Clear filters
        </Button>
      </div>

      {/* Row 2: select filters */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {/* Role */}
        <Select
          disabled={loading}
          value={
            typeof filters.role === "number" ? String(filters.role) : undefined
          }
          onValueChange={(v) =>
            onChange({
              role: v === "all" ? undefined : (Number(v) as AdminUserRoleFilter),
            })
          }
        >
          <SelectTrigger className="h-9 text-xs border border-[var(--border)] sm:text-sm">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            {ROLE_OPTIONS.map((r) => (
              <SelectItem key={r.value} value={String(r.value)}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Tier */}
        <Select
          disabled={loading}
          value={
            typeof filters.subscriptionTier === "number"
              ? String(filters.subscriptionTier)
              : undefined
          }
          onValueChange={(v) =>
            onChange({
              subscriptionTier:
                v === "all"
                  ? undefined
                  : (Number(v) as AdminSubscriptionTierFilter),
            })
          }
        >
          <SelectTrigger className="h-9 text-xs border border-[var(--border)] sm:text-sm">
            <SelectValue placeholder="Filter by subscription tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tiers</SelectItem>
            {TIER_OPTIONS.map((t) => (
              <SelectItem key={t.value} value={String(t.value)}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status fixed: PendingApproval (chỉ hiển thị, không filter) */}
        <div className="flex w-fit items-center text-xs text-amber-700 bg-amber-50/70 border border-amber-200 rounded-md px-3">
          <span className="whitespace-nowrap">
            Showing users with status{" "}
            <span className="font-semibold">Pending approval</span>
          </span>
        </div>
      </div>
    </div>
  );
}
