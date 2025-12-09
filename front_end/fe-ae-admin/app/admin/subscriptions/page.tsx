// app/admin/subscriptions/page.tsx
"use client";

import { useEffect, useState } from "react";

import { useSubscriptionPlans } from "@/hooks/subscription/useSubscriptionPlans";
import type { SubscriptionPlan } from "@/types/subscription/subscription.response";

import { SubscriptionsHeader } from "./components/subscriptions-header";
import { SubscriptionPlansTable } from "./components/subscription-plans-table";
import { SubscriptionPlanForm } from "./components/subscription-plan-form";
import { SubscriptionPlansSideInfo } from "./components/subscription-plans-side-info";

export default function AdminSubscriptionsPage() {
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    true
  );
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const { loading, plans, fetchSubscriptionPlans } = useSubscriptionPlans();

  // fetch lần đầu & mỗi khi filter đổi
  useEffect(() => {
    fetchSubscriptionPlans({ isActive: isActiveFilter });
  }, [fetchSubscriptionPlans, isActiveFilter]);

  const handleRefresh = () => {
    if (loading) return;
    fetchSubscriptionPlans({ isActive: isActiveFilter });
  };

  const handleSelectPlanForEdit = (plan: SubscriptionPlan | null) => {
    setEditingPlan(plan);
  };

  return (
    <div className="scrollbar-stable mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:py-8">
      <SubscriptionsHeader
        isActiveFilter={isActiveFilter}
        onFilterChange={setIsActiveFilter}
        loading={loading}
        onRefresh={handleRefresh}
      />

      <div className="grid gap-6 lg:grid-cols-[2fr,1.2fr]">
        <SubscriptionPlansTable
          plans={plans}
          loading={loading}
          onEditPlan={(plan) => handleSelectPlanForEdit(plan)}
          onChanged={handleRefresh}
        />

        <div className="space-y-4">
          <SubscriptionPlanForm
            editingPlan={editingPlan}
            onSaved={handleRefresh}
            onClearSelection={() => handleSelectPlanForEdit(null)}
          />

          <SubscriptionPlansSideInfo />
        </div>
      </div>
    </div>
  );
}
