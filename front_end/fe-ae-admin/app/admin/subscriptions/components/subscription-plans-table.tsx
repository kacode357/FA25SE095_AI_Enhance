// app/admin/subscriptions/components/subscription-plans-table.tsx
"use client";

import { useRouter } from "next/navigation";

import type { SubscriptionPlan } from "@/types/subscription/subscription.response";
import { useToggleSubscriptionPlan } from "@/hooks/subscription/useToggleSubscriptionPlan";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  plans: SubscriptionPlan[];
  loading: boolean;
  onChanged: () => void;
};

export function SubscriptionPlansTable({
  plans,
  loading,
  onChanged,
}: Props) {
  const { loading: toggling, toggleSubscriptionPlan } =
    useToggleSubscriptionPlan();
  const router = useRouter();

  const handleToggleActive = async (plan: SubscriptionPlan) => {
    const confirmMsg = plan.isActive
      ? `Deactivate plan "${plan.name}"?`
      : `Activate plan "${plan.name}"?`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await toggleSubscriptionPlan(plan.id);
      onChanged();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Card className="card border border-[var(--border)] shadow-sm overflow-hidden rounded-2xl py-0">
      <CardContent className="p-0">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold">
                Name
              </th>
              <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold">
                Price
              </th>
              <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold">
                Duration
              </th>
              <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold">
                Quota
              </th>
              <th className="px-3 sm:px-4 py-2.5 text-left text-xs font-semibold">
                Active
              </th>
              <th className="px-3 sm:px-4 py-2.5 text-right text-xs font-semibold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading && plans.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 text-center text-xs text-slate-500"
                >
                  Loading...
                </td>
              </tr>
            )}

            {!loading && plans.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-4 text-center text-xs text-slate-500"
                >
                  No plans yet.
                </td>
              </tr>
            )}

            {plans.map((plan) => (
              <tr
                key={plan.id}
                className="transition-colors hover:bg-slate-50/70"
              >
                <td className="px-3 sm:px-4 py-3 align-top">
                  <div className="font-medium text-slate-900">{plan.name}</div>
                  <div className="text-xs text-slate-500 line-clamp-2">
                    {plan.description}
                  </div>
                </td>
                <td className="px-3 sm:px-4 py-3 align-top text-xs text-slate-700">
                  {plan.price.toLocaleString("vi-VN")} {plan.currency}
                </td>
                <td className="px-3 sm:px-4 py-3 align-top text-xs text-slate-700">
                  {plan.durationDays} days
                </td>
                <td className="px-3 sm:px-4 py-3 align-top text-xs text-slate-700">
                  {plan.quotaLimit}
                </td>
                <td className="px-3 sm:px-4 py-3 align-top">
                  <span
                    className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${
                      plan.isActive
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-3 sm:px-4 py-3 align-top text-right">
                  <div className="flex justify-end gap-1.5 sm:gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="btn-table"
                      onClick={() => router.push(`/admin/subscriptions/${plan.id}`)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className={`btn-table ${
                        plan.isActive ? "btn-table-danger" : "btn-table-success"
                      }`}
                      onClick={() => handleToggleActive(plan)}
                      disabled={toggling}
                    >
                      {plan.isActive ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
