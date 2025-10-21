"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserRole } from "@/config/user-role";
import { UserStatus } from "@/config/user-status";
import { Search } from "lucide-react";

export type UsersFilterValues = {
  emailOrName?: string;
  role?: "all" | `${UserRole}`;
  status?: "all" | `${UserStatus}`;
  tier?: "all" | "Free" | "Basic" | "Pro" | "Enterprise";
};

type Props = {
  initial?: UsersFilterValues;
  loading?: boolean;
  onApply: (values: UsersFilterValues) => void;
  onClear?: () => void;
};

/**
 * Inline filter bar aligned with table columns
 * Columns: Email | Name | Role | Status | Tier | Actions
 */
export default function UsersFilterInline({
  initial = { emailOrName: "", role: "all", status: "all", tier: "all" },
  loading = false,
  onApply,
  onClear,
}: Props) {
  const [emailOrName, setEmailOrName] = useState(initial.emailOrName ?? "");
  const [role, setRole] = useState<"all" | `${UserRole}`>(initial.role ?? "all");
  const [status, setStatus] = useState<"all" | `${UserStatus}`>(initial.status ?? "all");
  const [tier, setTier] = useState<"all" | "Free" | "Basic" | "Pro" | "Enterprise">(initial.tier ?? "all");

  const handleApply = () => {
    onApply({
      emailOrName: emailOrName.trim(),
      role,
      status,
      tier,
    });
  };

  const handleClear = () => {
    setEmailOrName("");
    setRole("all");
    setStatus("all");
    setTier("all");
    onClear?.();
  };

  return (
    <div className="w-full border-b border-slate-200 bg-white/70">
      {/* Grid aligns with table headers: 6 columns */}
      <div className="grid items-center gap-2 p-2 md:grid-cols-[1.2fr_1fr_.8fr_.9fr_.9fr_.9fr] grid-cols-1">
        {/* Email */}
        <div className="flex items-center gap-2">
          <Search className="size-4 text-slate-400" />
          <Input
            value={emailOrName}
            onChange={(e) => setEmailOrName(e.target.value)}
            placeholder="Filter by email or name"
            className="h-8 text-sm"
          />
        </div>

        {/* Name (left blank to align visually; we already search by name/email together)
            If bạn muốn tách riêng Name: thay bằng Input riêng cho Name */}
        <div className="hidden md:block text-xs text-slate-400 pl-1">
          {/* Intentionally empty to keep grid aligned with 'Name' column */}
        </div>

        {/* Role */}
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as any)}
          className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white"
          aria-label="Filter by role"
        >
          <option value="all">All Roles</option>
          <option value={UserRole.Admin}>Admin</option>
          <option value={UserRole.Lecturer}>Lecturer</option>
          <option value={UserRole.Student}>Student</option>
          <option value={UserRole.Staff}>Staff</option>
        </select>

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
          className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white"
          aria-label="Filter by status"
        >
          <option value="all">All Status</option>
          <option value={UserStatus.Active}>Active</option>
          <option value={UserStatus.Pending}>Pending</option>
          <option value={UserStatus.PendingApproval}>Pending Approval</option>
          <option value={UserStatus.Inactive}>Inactive</option>
          <option value={UserStatus.Suspended}>Suspended</option>
          <option value={UserStatus.Deleted}>Deleted</option>
        </select>

        {/* Tier */}
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value as any)}
          className="h-8 text-xs border border-slate-300 rounded-md px-2 bg-white"
          aria-label="Filter by subscription tier"
        >
          <option value="all">All Tiers</option>
          <option value="Free">Free</option>
          <option value="Basic">Basic</option>
          <option value="Pro">Pro</option>
          <option value="Enterprise">Enterprise</option>
        </select>

        {/* Actions */}
        <div className="flex items-center gap-2 justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs"
            onClick={handleClear}
            disabled={loading}
          >
            Clear
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleApply}
            disabled={loading}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
