// app/admin/subscriptions/components/subscriptions-header.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Props = {
  isActiveFilter?: boolean;
  onFilterChange: (value: boolean | undefined) => void;
  loading: boolean;
  onRefresh: () => void;
};

export function SubscriptionsHeader({
  isActiveFilter,
  onFilterChange,
  loading,
  onRefresh,
}: Props) {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Subscription Plans
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage available subscription plans and their availability.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs sm:text-sm text-slate-700">
          <input
            type="checkbox"
            checked={isActiveFilter === true}
            onChange={(e) =>
              onFilterChange(e.target.checked ? true : undefined)
            }
          />
          <span>Show only active plans</span>
        </label>

        <Button
          type="button"
          variant="outline"
          className="border-[var(--border)] text-xs sm:text-sm"
          onClick={onRefresh}
          disabled={loading}
        >
          {loading ? "Refreshing..." : "Refresh"}
        </Button>

        <Button
          type="button"
          className="btn btn-gradient-slow text-xs sm:text-sm"
          onClick={() => router.push("/admin/subscriptions/create")}
        >
          Create plan
        </Button>
      </div>
    </div>
  );
}
