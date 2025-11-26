"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Gauge,
  Zap,
  Crown,
  Loader2,
} from "lucide-react";

import { useGetSubscription } from "@/hooks/subscription/useGetSubscription";
import type { SubscriptionProfile } from "@/types/subscription/subscription.response";

const dt = (s: string | null) => {
  if (!s) return "-";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

function computeStatus(profile: SubscriptionProfile | null): string {
  if (!profile) return "Unknown";

  const now = new Date();
  if (profile.subscriptionEndDate) {
    const end = new Date(profile.subscriptionEndDate);
    if (!Number.isNaN(end.getTime()) && end.getTime() < now.getTime()) {
      return "Expired";
    }
  }

  if (profile.status) return profile.status;

  return "Active";
}

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
      } catch (e) {
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

  const statusText = computeStatus(profile);
  const isExpired = statusText === "Expired";

  const fullName =
    profile?.fullName ||
    `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() ||
    "Student";

  const planName = profile?.subscriptionTier || "Free plan";

  const quotaLabel =
    profile && profile.crawlQuotaLimit > 0
      ? `${profile.crawlQuotaUsed} / ${profile.crawlQuotaLimit} tasks`
      : `${profile?.crawlQuotaUsed ?? 0} tasks used`;

  return (
    <main className="px-4 md:px-10 lg:px-20">
      <div className="mx-auto max-w-5xl">
     

        {/* Header */}
        <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-nav">My Subscription</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              View your current plan, usage, and renewal details.
            </p>
          </div>

          <div className="flex items-center gap-3 mt-2 md:mt-0">
            <div className="text-right">
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Status
              </p>
              <p
                className="text-sm font-semibold"
                style={{
                  color: isExpired ? "#b91c1c" : "var(--brand-700)",
                }}
              >
                {statusText}
              </p>
            </div>
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
          <div className="grid gap-5 md:grid-cols-[2fr,1.4fr]">
            {/* Left: plan + usage */}
            <section className="space-y-5">
              {/* Plan card */}
              <div className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium mb-3">
                      <Crown className="w-3.5 h-3.5 text-accent" />
                      <span
                        className="uppercase tracking-wide"
                        style={{ color: "var(--accent-700)" }}
                      >
                        {planName}
                      </span>
                    </div>

                    <h2 className="text-lg font-semibold mb-1">{fullName}</h2>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {profile.email}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
                      {profile.institutionName && (
                        <span
                          className="px-2.5 py-1 rounded-full"
                          style={{
                            background: "var(--focus-ring)",
                            color: "var(--nav)",
                          }}
                        >
                          {profile.institutionName}
                        </span>
                      )}
                      {profile.studentId && (
                        <span
                          className="px-2.5 py-1 rounded-full"
                          style={{
                            background: "var(--focus-ring)",
                            color: "var(--nav)",
                          }}
                        >
                          Student ID: {profile.studentId}
                        </span>
                      )}
                      {profile.department && (
                        <span
                          className="px-2.5 py-1 rounded-full"
                          style={{
                            background: "var(--focus-ring)",
                            color: "var(--nav)",
                          }}
                        >
                          {profile.department}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

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
                      background: "rgba(127,113,244,0.08)",
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
                    background: "#e5e7eb",
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
                    {dt(profile.quotaResetDate)}
                  </span>
                </p>
              </div>
            </section>

            {/* Right: dates + actions */}
            <section className="space-y-5">
              {/* Dates */}
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
                      {dt(profile.subscriptionStartDate)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span style={{ color: "var(--text-muted)" }}>
                      End date
                    </span>
                    <span className="font-medium">
                      {dt(profile.subscriptionEndDate)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span style={{ color: "var(--text-muted)" }}>
                      Last login
                    </span>
                    <span className="font-medium">
                      {dt(profile.lastLoginAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="card p-5 flex flex-col gap-3">
                <p
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  Need more quota or a different plan? You can manage upgrades
                  and changes from the subscription page.
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="btn btn-blue-slow text-sm px-4 py-2"
                    onClick={() =>
                      router.push("/student/subscription/checkout")
                    }
                  >
                    Manage plan
                  </button>

                  <button
                    type="button"
                    className="btn bg-white text-sm px-4 py-2"
                    style={{
                      border: "1px solid var(--border)",
                      color: "var(--text-muted)",
                    }}
                    onClick={() => router.push("/student/profile/my-profile")}
                  >
                    View profile
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
