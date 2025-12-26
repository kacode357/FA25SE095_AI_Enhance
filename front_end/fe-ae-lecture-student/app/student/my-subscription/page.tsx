"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Gauge, Zap, Crown, Loader2 } from "lucide-react";

import { useGetSubscription } from "@/hooks/subscription/useGetSubscription";
import type { SubscriptionProfile } from "@/types/subscription/subscription.response";
import { formatDateOnlyVN } from "@/utils/datetime/format-datetime";

export default function MySubscriptionPage() {
  const router = useRouter();
  const { getSubscription, loading } = useGetSubscription();

  const [profile, setProfile] = useState<SubscriptionProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await getSubscription();
        if (!mounted) return;
        if (!res || !res.data) {
          setError("Unable to load subscription information.");
          return;
        }
        setProfile(res.data);
      } catch {
        if (!mounted) return;
        setError("Unable to load subscription information.");
      } finally {
        if (mounted) setInitialized(true);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const percentUsed = useMemo(() => {
    if (!profile) return 0;
    if (!profile.crawlQuotaLimit || profile.crawlQuotaLimit <= 0) return 0;
    const p = (profile.crawlQuotaUsed / profile.crawlQuotaLimit) * 100;
    if (!Number.isFinite(p)) return 0;
    return Math.min(100, Math.max(0, Math.round(p)));
  }, [profile]);

  const planName = profile?.subscriptionTier || "Free plan";

  const quotaUsed = profile?.crawlQuotaUsed ?? 0;
  const quotaLimit = profile?.crawlQuotaLimit ?? 0;

  const quotaLabel =
    profile && profile.crawlQuotaLimit > 0
      ? `${quotaUsed.toLocaleString()} / ${quotaLimit.toLocaleString()} tasks`
      : `${quotaUsed.toLocaleString()} tasks used`;

  const quotaLimitLabel =
    profile && profile.crawlQuotaLimit > 0
      ? `${quotaLimit.toLocaleString()} tasks limit`
      : "No quota limit";

  const quotaUsedLabel = `${quotaUsed.toLocaleString()} tasks used`;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 md:px-10 md:py-10 lg:px-20">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-1 text-left">
            <h1 className="text-2xl font-semibold text-nav">
              My Subscription
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Track your plan, quota usage, and key dates in one place.
            </p>
          </div>
        </div>

        {/* Loading state */}
        {loading && !initialized && (
          <div className="card p-6 flex items-center gap-3 justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm" style={{ color: "var(--text-muted)" }}>
              Loading your subscription...
            </span>
          </div>
        )}

        {/* Error */}
        {!loading && initialized && error && (
          <div className="card p-6">
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {error}
            </p>
          </div>
        )}

        {/* Content */}
        {!loading && initialized && !error && profile && (
          <section className="grid gap-5 lg:grid-cols-3">
            <div className="card p-6 lg:col-span-2">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(127,113,244,0.08)]">
                    <Crown className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <p
                      className="text-xs uppercase tracking-wide"
                      style={{ color: "var(--text-muted)" }}
                    >
                      Current plan
                    </p>
                    <p className="mt-1 text-lg font-semibold text-nav">
                      {planName}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-blue-slow text-sm px-5 py-2"
                  onClick={() => router.push("/student/subscription")}
                >
                  Change plan
                </button>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p
                    className="text-xs uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Quota limit
                  </p>
                  <p className="mt-1 text-sm font-semibold text-nav">
                    {quotaLimitLabel}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p
                    className="text-xs uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Used
                  </p>
                  <p className="mt-1 text-sm font-semibold text-nav">
                    {quotaUsedLabel}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p
                    className="text-xs uppercase tracking-wide"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Reset date
                  </p>
                  <p className="mt-1 text-sm font-semibold text-nav">
                    {formatDateOnlyVN(profile.quotaResetDate)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-brand" />
                    <h3 className="text-sm font-semibold">Quota usage</h3>
                  </div>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      background: "var(--focus-ring)",
                      color: "var(--brand-700)",
                    }}
                  >
                    {percentUsed}% used
                  </span>
                </div>

                <p
                  className="text-sm mb-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {quotaLabel}
                </p>

                <div
                  className="h-2 w-full rounded-full"
                  style={{
                    background: "var(--border)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${percentUsed}%`,
                      background:
                        "linear-gradient(90deg, var(--brand), var(--nav-active))",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalendarDays className="h-4 w-4 text-brand" />
                <h3 className="text-sm font-semibold">Subscription details</h3>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <span style={{ color: "var(--text-muted)" }}>Start date</span>
                  <span className="font-medium">
                    {formatDateOnlyVN(profile.subscriptionStartDate)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span style={{ color: "var(--text-muted)" }}>End date</span>
                  <span className="font-medium">
                    {formatDateOnlyVN(profile.subscriptionEndDate)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span style={{ color: "var(--text-muted)" }}>Last login</span>
                  <span className="font-medium">
                    {formatDateOnlyVN(profile.lastLoginAt)}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Zap className="h-3 w-3 text-brand" />
                  <span>
                    Next quota reset{" "}
                    <span className="font-semibold text-nav">
                      {formatDateOnlyVN(profile.quotaResetDate)}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
