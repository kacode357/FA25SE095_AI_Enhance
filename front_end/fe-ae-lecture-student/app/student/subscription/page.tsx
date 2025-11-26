// app/student/subscription/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Crown } from "lucide-react";

import { useSubscriptionTiers } from "@/hooks/subscription/useSubscriptionTiers";
import type { SubscriptionTier } from "@/types/subscription/subscription.response";

function formatPriceLabel(tier: SubscriptionTier) {
  if (tier.price === 0) return "Free";
  return `${tier.price.toLocaleString()} ${tier.currency}`;
}

function formatPeriod(tier: SubscriptionTier) {
  if (tier.price === 0) return "/Forever";
  return `/${tier.duration}`;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const { getSubscriptionTiers, loading } = useSubscriptionTiers();
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await getSubscriptionTiers();
      if (!cancelled && res) setTiers(res);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChoosePlan = (tier: SubscriptionTier) => {
    const params = new URLSearchParams();
    params.set("tier", tier.tier);
    router.push(`/student/subscription/checkout?${params.toString()}`);
  };

  return (
    <section className="relative bg-slate-50 py-5">
      <div className="mx-auto max-w-6xl px-6 text-center">
         <div className="inline-flex items-center gap-2 px-4 py-2  text-sm font-medium text-white rounded-full shadow-md bg-gradient-to-r from-indigo-500 to-purple-500">
          <Crown className="h-4 w-4" />
          Pricing Plan
        </div>

        <h2 className="mt-4 text-3xl font-bold text-slate-800 md:text-5xl">
          Let&apos;s Check Our{" "}
          <span className="bg-gradient-to-r from-cyan-400 via-[var(--brand)] to-pink-500 bg-clip-text text-transparent">
            Pricing Plan
          </span>
        </h2>

        {loading && tiers.length === 0 && (
          <div
            className="mt-10 flex items-center justify-center gap-2 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
            <span>Loading plans...</span>
          </div>
        )}

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {tiers.map((tier, i) => {
            const isPopular =
              tier.tier.toLowerCase() === "standard" ||
              tier.tier.toLowerCase() === "premium";

            return (
              <motion.div
                key={tier.tier}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.25 }}
                className={`relative flex h-full flex-col rounded-3xl border p-8 shadow-lg transition-all duration-300 ${
                  isPopular
                    ? "border-[var(--brand-600)] scale-[1.03] shadow-2xl"
                    : "border-transparent hover:-translate-y-2 hover:shadow-xl"
                }`}
                style={{
                  backgroundImage:
                    "linear-gradient(180deg,#fff9fb 0%,#fff4f2 45%,#ffffff 100%)",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                {/* Label tên plan */}
                <div className="absolute left-1/2 -top-4 -translate-x-1/2">
                  <span className="rounded-full bg-[var(--brand)] px-5 py-1 text-sm font-semibold text-white shadow-md">
                    {tier.tier}
                  </span>
                </div>

                {/* Giá */}
                <div className="mt-6 mb-6">
                  <div className="flex items-end justify-center">
                    <span className="text-4xl font-bold text-[#000D83] md:text-5xl">
                      {formatPriceLabel(tier)}
                    </span>
                    <span className="ml-1 text-lg font-medium text-[var(--brand)]">
                      {formatPeriod(tier)}
                    </span>
                  </div>
                </div>

                {/* Features chiếm hết phần giữa */}
                <ul className="space-y-6 text-left flex-1">
                  {tier.features.map((feature, idx) => {
                    const isNegative = feature.toLowerCase().includes("no ");
                    return (
                      <li
                        key={idx}
                        className="flex items-center gap-3 font-bold text-[#000D83]"
                      >
                        {isNegative ? (
                          <span className="text-red-500">✗</span>
                        ) : (
                          <span className="text-green-500">✓</span>
                        )}
                        <span className="text-sm md:text-base">
                          {feature.replace("✅", "").replace("❌", "")}
                        </span>
                      </li>
                    );
                  })}
                </ul>

                {/* Nút luôn ở đáy card */}
                <button
                  type="button"
                  onClick={() => handleChoosePlan(tier)}
                  className="btn btn-gradient mt-8 w-full rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 text-sm font-medium text-white shadow-md transition hover:opacity-90"
                >
                  {tier.price === 0 ? "Use this plan" : "Choose this plan →"}
                </button>
              </motion.div>
            );
          })}

          {!loading && tiers.length === 0 && (
            <p
              className="col-span-full text-center text-sm"
              style={{ color: "var(--text-muted)" }}
            >
              No plans available at the moment.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
