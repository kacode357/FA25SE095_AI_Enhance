// app/admin/subscriptions/page.tsx
"use client";

import { useEffect, useState } from "react";

import { useSubscriptionPlans } from "@/hooks/subscription/useSubscriptionPlans";

import { SubscriptionsHeader } from "./components/subscriptions-header";
import { SubscriptionPlansTable } from "./components/subscription-plans-table";
import { SubscriptionPlansSideInfo } from "./components/subscription-plans-side-info";

export default function AdminSubscriptionsPage() {
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(
    true
  );

  const { loading, plans, fetchSubscriptionPlans } = useSubscriptionPlans();

  // fetch lần đầu & mỗi khi filter đổi
  useEffect(() => {
    fetchSubscriptionPlans({ isActive: isActiveFilter });
  }, [fetchSubscriptionPlans, isActiveFilter]);

  const reloadPlans = () => {
    fetchSubscriptionPlans({ isActive: isActiveFilter });
  };

  return (
    <div className="scrollbar-stable mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:py-8">
      <SubscriptionsHeader
        isActiveFilter={isActiveFilter}
        onFilterChange={setIsActiveFilter}
      />

      <div className="grid gap-6">
        <SubscriptionPlansTable
          plans={plans}
          loading={loading}
          onChanged={reloadPlans}
        />

        <SubscriptionPlansSideInfo />
      </div>
    </div>
  );
}
