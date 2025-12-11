// app/admin/subscriptions/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useSubscriptionPlans } from "@/hooks/subscription/useSubscriptionPlans";
import type { SubscriptionPlan } from "@/types/subscription/subscription.response";

import { SubscriptionPlanForm } from "../components/subscription-plan-form";

export default function SubscriptionPlanEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const planId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const { loading, fetchSubscriptionPlans } = useSubscriptionPlans();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadPlan = async () => {
      if (!planId) {
        setInitializing(false);
        return;
      }

      setInitializing(true);
      try {
        const res = await fetchSubscriptionPlans();
        if (!mounted) return;

        const match = res.data?.find((plan) => plan.id === planId) ?? null;
        setSelectedPlan(match);
      } finally {
        if (mounted) setInitializing(false);
      }
    };

    void loadPlan();

    return () => {
      mounted = false;
    };
  }, [fetchSubscriptionPlans, planId]);

  const handleBack = () => router.push("/admin/subscriptions");

  const showLoading = initializing || loading;

  return (
    <div className="scrollbar-stable mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 lg:py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Subscriptions
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Edit plan {selectedPlan ? `- ${selectedPlan.name}` : ""}
          </h1>
        </div>

        <Button
          type="button"
          variant="outline"
          className="border-[var(--border)] text-xs sm:text-sm"
          onClick={handleBack}
        >
          Back to plans
        </Button>
      </div>

      {showLoading && (
        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-6 text-sm text-slate-500">
          Loading plan details...
        </div>
      )}

      {!showLoading && !selectedPlan && (
        <div className="rounded-xl border border-[var(--border)] bg-white px-4 py-6 text-sm text-slate-600">
          Plan not found.
          <div className="mt-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-[var(--border)]"
              onClick={handleBack}
            >
              Back to plans
            </Button>
          </div>
        </div>
      )}

      {selectedPlan && (
        <SubscriptionPlanForm
          editingPlan={selectedPlan}
          onSaved={handleBack}
          onClearSelection={handleBack}
        />
      )}
    </div>
  );
}
