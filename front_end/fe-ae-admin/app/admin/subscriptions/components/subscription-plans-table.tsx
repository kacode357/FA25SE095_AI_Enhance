// app/admin/subscriptions/components/subscription-plans-table.tsx
"use client";

import type { SubscriptionPlan } from "@/types/subscription/subscription.response";
import { useToggleSubscriptionPlan } from "@/hooks/subscription/useToggleSubscriptionPlan";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  plans: SubscriptionPlan[];
  loading: boolean;
  onEditPlan: (plan: SubscriptionPlan) => void;
  onChanged: () => void;
};

export function SubscriptionPlansTable({
  plans,
  loading,
  onEditPlan,
  onChanged,
}: Props) {
  const { loading: toggling, toggleSubscriptionPlan } =
    useToggleSubscriptionPlan();

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
    <Card className="card border border-[var(--border)] overflow-hidden">
      <CardContent className="p-0">
        <table className="min-w-full divide-y text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                Name
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                Tier
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                Price
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                Duration
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                Quota
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">
                Active
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading && plans.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-4 text-center text-xs text-slate-500"
                >
                  Loading plans...
                </td>
              </tr>
            )}

            {!loading && plans.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-4 text-center text-xs text-slate-500"
                >
                  No subscription plans found.
                </td>
              </tr>
            )}

            {plans.map((plan) => (
              <tr key={plan.id} className="hover:bg-slate-50/60">
                <td className="px-4 py-2 align-top">
                  <div className="font-medium text-slate-900">{plan.name}</div>
                  <div className="text-xs text-slate-500 line-clamp-2">
                    {plan.description}
                  </div>
                </td>
                <td className="px-4 py-2 align-top text-xs text-slate-700">
                  {plan.tier}
                </td>
                <td className="px-4 py-2 align-top text-xs text-slate-700">
                  {plan.price.toLocaleString("vi-VN")} {plan.currency}
                </td>
                <td className="px-4 py-2 align-top text-xs text-slate-700">
                  {plan.durationDays} days
                </td>
                <td className="px-4 py-2 align-top text-xs text-slate-700">
                  {plan.quotaLimit}
                </td>
                <td className="px-4 py-2 align-top">
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
                <td className="px-4 py-2 align-top text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[var(--border)] px-2 py-1 text-[11px]"
                      onClick={() => onEditPlan(plan)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-[var(--border)] px-2 py-1 text-[11px]"
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
