// app/admin/subscriptions/components/subscription-plans-side-info.tsx
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function SubscriptionPlansSideInfo() {
  return (
    <Card className="card border border-[var(--border)]">
      <CardHeader>
        <CardTitle className="text-sm font-semibold">
          Tips for designing plans
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Some quick guidelines to make your pricing clear and effective.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600">
        <div className="space-y-1">
          <p className="font-medium text-slate-800">1. Clear naming</p>
          <p className="text-xs text-slate-500">
            Use simple names like{" "}
            <span className="font-semibold">Free</span>,{" "}
            <span className="font-semibold">Basic</span>,{" "}
            <span className="font-semibold">Premium</span> so users immediately
            understand the hierarchy.
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-medium text-slate-800">2. Obvious value</p>
          <p className="text-xs text-slate-500">
            Highlight what each plan unlocks compared to the lower tier. Use the
            features field to describe key benefits.
          </p>
        </div>

        <div className="space-y-1">
          <p className="font-medium text-slate-800">3. Keep it consistent</p>
          <p className="text-xs text-slate-500">
            Duration and quota should make sense together. For example, short
            duration + small quota for trial, higher quota for enterprise.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
