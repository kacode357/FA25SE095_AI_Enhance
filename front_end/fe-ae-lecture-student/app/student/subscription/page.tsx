"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCancelSubscriptionPayment } from "@/hooks/payments/useCancelSubscriptionPayment";
import { useSubscriptionTiers } from "@/hooks/subscription/useSubscriptionTiers";
import type { SubscriptionTier } from "@/types/subscription/subscription.response";
import { loadDecodedUser } from "@/utils/secure-user";

function formatPeriod(tier: SubscriptionTier) {
  if (tier.price === 0) return "/Forever";

  const days = tier.durationDays ?? 0;

  if (days === 30) return "/Month";
  if (days === 365) return "/Year";
  if (days === 0) return "/Lifetime";

  return `/${days} days`;
}

function formatQuota(tier: SubscriptionTier) {
  const limit = tier.quotaLimit || 0;
  const days = tier.durationDays ?? 0;

  if (limit >= 2000) return "Unlimited tasks";

  if (days === 0) {
    return `${limit.toLocaleString()} tasks total`;
  }

  if (days === 30) {
    return `${limit.toLocaleString()} tasks / month`;
  }

  if (days === 365) {
    return `${limit.toLocaleString()} tasks / year`;
  }

  return `${limit.toLocaleString()} tasks / ${days} days`;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getSubscriptionTiers, loading } = useSubscriptionTiers();
  const { cancelSubscriptionPayment } = useCancelSubscriptionPayment();
  const cancelHandledRef = useRef(false);

  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [currentTierKey, setCurrentTierKey] = useState<string | null>(null);

  useEffect(() => {
    const cancelParam =
      searchParams.get("cancel") || searchParams.get("Cancel");
    const statusParam =
      searchParams.get("status") || searchParams.get("Status");
    const normalizedStatus = statusParam?.toLowerCase() ?? "";
    const isCancelled =
      cancelParam?.toLowerCase() === "true" ||
      normalizedStatus === "cancelled" ||
      normalizedStatus === "canceled" ||
      normalizedStatus === "cancel";

    if (!isCancelled) return;
    if (cancelHandledRef.current) return;
    cancelHandledRef.current = true;

    const reasonParam =
      searchParams.get("reason") ||
      searchParams.get("Reason") ||
      searchParams.get("message") ||
      searchParams.get("Message") ||
      searchParams.get("desc") ||
      searchParams.get("Desc");

    let orderCodeValue =
      searchParams.get("orderCode") || searchParams.get("OrderCode");
    if (!orderCodeValue && typeof window !== "undefined") {
      orderCodeValue = sessionStorage.getItem(
        "subscription:pendingOrderCode",
      );
    }

    const reason = reasonParam?.trim() || "User cancelled payment.";

    (async () => {
      if (!orderCodeValue) {
        toast.error("Payment was cancelled.");
        router.replace("/student/subscription");
        return;
      }

      const res = await cancelSubscriptionPayment({
        orderCode: orderCodeValue,
        reason,
      });

      if (!res || res.status !== 200) {
        toast.error(res?.message || "Could not cancel your payment.");
      }

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("subscription:pendingOrderCode");
      }

      router.replace("/student/payment-history");
    })();
  }, [searchParams, cancelSubscriptionPayment, router]);

  // Load plans
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await getSubscriptionTiers(); // res: SubscriptionTier[]
      console.log("Fetched subscription tiers:", res);
      if (!cancelled && res) {
        setTiers(res);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load current user tier
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const user = await loadDecodedUser();
      if (cancelled || !user) return;

      // BE đang có: subscriptionTier: string
      // mình giữ string này làm key
      const key = user.subscriptionTier ?? null;
      if (key) setCurrentTierKey(key);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChoosePlan = (tier: SubscriptionTier, isCurrent: boolean) => {
    if (isCurrent) return;

    const params = new URLSearchParams();
    params.set("planId", tier.id); // dùng id để checkout
    params.set("tier", tier.tierName); // gửi thêm tier name nếu cần

    router.push(`/student/subscription/checkout?${params.toString()}`);
  };

  // Chỉ lấy plan active + sort theo tier level
  const activeSortedTiers = tiers
    .filter((t) => t.isActive)
    .sort((a, b) => a.tierLevel - b.tierLevel);

  return (
    <section className="relative bg-slate-50 pt-7 pb-15">
      <div className="mx-auto max-w-7xl px-6 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full shadow-md bg-gradient-to-r from-indigo-500 to-purple-500">
          <Crown className="h-4 w-4" />
          Pricing Plan
        </div>

        <h2 className="mt-4 text-3xl font-bold text-slate-800 md:text-5xl">
          Let&apos;s Check Our{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-[var(--brand)] to-pink-500 bg-clip-text text-transparent">
            Pricing Plan
          </span>
        </h2>
        <Dialog>
          <div className="mt-5 flex items-center justify-center sm:absolute sm:right-6 sm:top-6 sm:mt-0">
            <DialogTrigger asChild>
              <button
                type="button"
                className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-900 shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-100"
              >
                Plan change rule
              </button>
            </DialogTrigger>
          </div>
          <DialogContent className="border-amber-200 bg-amber-50 text-amber-900">
            <DialogHeader>
              <DialogTitle>Plan change rule</DialogTitle>
              <DialogDescription asChild>
                <div className="text-amber-900/90">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>
                      Upgrading to a higher-priced plan replaces your current
                      quota with the new plan&apos;s quota limit.
                    </li>
                    <li>The quota does not stack with your old plan.</li>
                    <li>
                      Any remaining quota from the old plan does not carry
                      over.
                    </li>
                    <li>Only the latest plan&apos;s quota is active.</li>
                  </ul>
                </div>
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>

        {loading && activeSortedTiers.length === 0 && (
          <div
            className="mt-10 flex items-center justify-center gap-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
            <span>Loading plans...</span>
          </div>
        )}

        <div className="mt-16">
          {!loading && activeSortedTiers.length === 0 && (
            <p
              className="text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No plans available at the moment.
            </p>
          )}

          {activeSortedTiers.length > 0 && (
            <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-4">
              {activeSortedTiers.map((tier, i) => {
                const tierName = tier.name ?? "";

                // ÉP BOOLEAN rõ ràng để TS hết kêu (không dùng && trả về string)
                const keyLower = currentTierKey?.toLowerCase() ?? null;

                const isCurrent: boolean =
                  !!keyLower &&
                  (
                    tier.id.toLowerCase() === keyLower || // user.subscriptionTier = id
                    tierName.toLowerCase() === keyLower || // user.subscriptionTier = "Free"/"Basic"/...
                    tier.tierName.toLowerCase() === keyLower || // user.subscriptionTier = tierName
                    String(tier.tierLevel) === keyLower // user.subscriptionTier = "0"/"1"/...
                  );

                const lowerName = tierName.toLowerCase();
                const isPopular =
                  lowerName === "basic" ||
                  lowerName === "premium" ||
                  lowerName === "enterprise";

                const cardHighlight = isCurrent
                  ? "border-[var(--accent-600)] scale-[1.03] shadow-2xl"
                  : isPopular
                  ? "border-[var(--brand-600)] scale-[1.02] shadow-xl"
                  : "border-transparent hover:-translate-y-2 hover:shadow-xl";

                const priceLabel =
                  tier.price === 0
                    ? "Free"
                    : `${tier.price.toLocaleString()} ${tier.currency}`;

                const isLongPrice = priceLabel.length > 14;
                const priceSizeClass = isLongPrice
                  ? "text-3xl md:text-3xl"
                  : "text-4xl md:text-4xl";

                return (
                  <motion.div
                    key={tier.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.25 }}
                    className={`relative flex flex-col rounded-3xl border p-8 shadow-lg transition-all duration-300 ${cardHighlight} bg-white`}
                    style={{
                      backgroundImage:
                        "url('https://live.themewild.com/edubo/assets/img/shape/04.png')",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Label tên plan */}
                    <div className="absolute left-1/2 -top-4 -translate-x-1/2 flex flex-col items-center gap-3">
                      <span className="rounded-full bg-indigo-500 px-5 py-1 text-sm font-semibold text-white shadow-md">
                        {tierName}
                      </span>
                      {isCurrent && (
                        <span
                          className="rounded-full px-3 py-0.5 text-[11px] font-semibold"
                          style={{
                            background: "rgba(244,162,59,0.16)",
                            color: "var(--accent-700)",
                          }}
                        >
                          Current plan
                        </span>
                      )}
                    </div>

                    {/* Giá */}
                    <div className="mt-10 mb-4">
                      <div className="flex flex-col items-center leading-tight">
                        <span
                          className={`${priceSizeClass} font-bold text-indigo-900 whitespace-nowrap price-digits`}
                        >
                          {priceLabel}
                        </span>
                        <span className="mt-1 text-sm md:text-base text-indigo-600 whitespace-nowrap">
                          {formatPeriod(tier)}
                        </span>
                      </div>
                    </div>

                    {/* Quota */}
                    <div className="mb-6 flex flex-col items-center">
                      <span
                        className="text-[11px] uppercase tracking-wide"
                        style={{ color: "var(--text-muted)" }}
                      >
                        Quota
                      </span>
                      <p className="mt-1 text-3xl font-extrabold text-nav leading-none">
                        {tier.quotaLimit >= 2000
                          ? "∞"
                          : tier.quotaLimit.toLocaleString()}
                      </p>
                      <p
                        className="mt-1 text-xs text-center"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatQuota(tier)}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-4 text-left flex-1">
                      {tier.features.map((feature, idx) => {
                        const clean = feature
                          .replace("✅", "")
                          .replace("❌", "");
                        const isNegative =
                          clean.toLowerCase().startsWith("no ") ||
                          clean.toLowerCase().includes("not included");

                        return (
                          <li
                            key={idx}
                            className="flex items-center gap-3 font-medium text-[#000D83]"
                          >
                            {isNegative ? (
                              <span className="text-red-500">✗</span>
                            ) : (
                              <span className="text-green-500">✓</span>
                            )}
                            <span className="text-sm md:text-[13px]">
                              {clean}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Button */}
                    <button
                      type="button"
                      onClick={() => handleChoosePlan(tier, isCurrent)}
                      className={`btn mt-8 w-full rounded-xl text-sm font-medium text-white shadow-md transition ${
                        isCurrent
                          ? "btn-green-slow cursor-default"
                          : "btn-gradient bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90"
                      }`}
                      disabled={isCurrent}
                    >
                      {isCurrent
                        ? "Current plan"
                        : tier.price === 0
                        ? "Use this plan"
                        : "Choose this plan →"}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
