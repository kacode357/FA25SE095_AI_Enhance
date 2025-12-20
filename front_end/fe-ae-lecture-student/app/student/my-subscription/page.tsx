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

  const quotaLabel =
    profile && profile.crawlQuotaLimit > 0
      ? `${profile.crawlQuotaUsed} / ${profile.crawlQuotaLimit} tasks`
      : `${profile?.crawlQuotaUsed ?? 0} tasks used`;

  return (
    <main className="px-4 py-4 md:px-10 md:py-8 lg:px-20">
      <div className="mx-auto max-w-5xl space-y-5">
        {/* Header */}
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-nav">
              My Subscription
            </h1>
          </div>
        </header>

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
          <div className="space-y-5">
            {/* Top: plan summary + action */}
            <section className="card p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(127,113,244,0.08)]">
                  <Crown className="w-5 h-5 text-accent" />
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
            </section>

            {/* Bottom: 2 columns */}
            <section className="grid gap-5 md:grid-cols-2">
              {/* Usage card */}
              <div className="card p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Gauge className="w-4 h-4 text-brand" />
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

                {/* Progress bar */}
                <div
                  className="h-2 w-full rounded-full mb-2"
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

                <p
                  className="text-xs flex items-center gap-1"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Zap className="w-3 h-3" />
                  Quota resets on{" "}
                  <span className="font-medium">
                    {formatDateOnlyVN(profile.quotaResetDate)}
                  </span>
                </p>
              </div>

              {/* Details card */}
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-4 h-4 text-brand" />
                  <h3 className="text-sm font-semibold">Subscription details</h3>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between gap-4">
                    <span style={{ color: "var(--text-muted)" }}>
                      Start date
                    </span>
                    <span className="font-medium">
                      {formatDateOnlyVN(profile.subscriptionStartDate)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span style={{ color: "var(--text-muted)" }}>
                      End date
                    </span>
                    <span className="font-medium">
                      {formatDateOnlyVN(profile.subscriptionEndDate)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span style={{ color: "var(--text-muted)" }}>
                      Last login
                    </span>
                    <span className="font-medium">
                      {formatDateOnlyVN(profile.lastLoginAt)}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
