"use client";

import { useSubscriptionTiers } from "@/hooks/subscription/useSubscriptionTiers";
import type { SubscriptionTier } from "@/types/subscription/subscription.response";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

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

export default function PricingPlanSection() {
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

    const activeSortedTiers = tiers
        .filter((t) => (typeof t.isActive === "boolean" ? t.isActive : true))
        .sort((a, b) => (a.tierLevel ?? 0) - (b.tierLevel ?? 0));

    return (
        <section className="relative py-10 bg-center bg-no-repeat bg-cover bg-slate-50">
            <div className="container relative z-10 px-6 mx-auto text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium text-white rounded-full shadow-md bg-gradient-to-r from-indigo-500 to-purple-500">
                    💡 Pricing Plan
                </div>
                <h2 className="mb-10 text-3xl font-bold md:text-5xl text-slate-800">
                    Let’s Check Our {" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                        Pricing Plan
                    </span>
                </h2>

                {loading && activeSortedTiers.length === 0 ? (
                    <div className="mt-10 flex items-center justify-center gap-2 text-sm" style={{ color: "var(--text-muted)" }}>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
                        <span>Loading plans...</span>
                    </div>
                ) : null}

                <div className="grid grid-cols-1 gap-8 mt-10 md:grid-cols-4">
                    {activeSortedTiers.length === 0 && !loading ? (
                        <p className="text-center text-sm" style={{ color: "var(--text-muted)" }}>
                            No plans available at the moment.
                        </p>
                    ) : (
                        activeSortedTiers.map((tier, i) => {
                            const priceLabel = tier.price === 0 ? "Free" : `${tier.price.toLocaleString()} ${tier.currency ?? ""}`;
                            const isPopular = (tier.name ?? "").toLowerCase() === "premium" || (tier.name ?? "").toLowerCase() === "basic";

                            const cardHighlight = isPopular ? "border-[var(--brand-600)] scale-[1.02] shadow-xl" : "border-transparent hover:-translate-y-2 hover:shadow-xl";

                            const features: string[] = (tier as any).features ?? ((tier as any).description ? [(tier as any).description] : []);

                            return (
                                <motion.div
                                    key={tier.id ?? i}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.04, duration: 0.25 }}
                                    className={`relative flex flex-col rounded-3xl border p-8 shadow-lg transition-all duration-300 ${cardHighlight} bg-white`}
                                    style={{
                                        backgroundImage: "url('https://live.themewild.com/edubo/assets/img/shape/04.png')",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                    }}
                                >
                                    <div className="absolute left-1/2 -top-4 -translate-x-1/2">
                                        <span className="px-5 py-1 text-sm font-semibold text-white bg-indigo-500 rounded-full">
                                            {tier.name}
                                        </span>
                                    </div>

                                    <div className="mt-8 mb-4">
                                        <div className="flex items-end justify-center">
                                            <span className="text-2xl font-bold text-indigo-900">{priceLabel}</span>
                                            <span className="ml-2 text-sm font-medium text-indigo-600">{formatPeriod(tier)}</span>
                                        </div>
                                    </div>

                                    <div className="mb-4 flex flex-col items-center">
                                        <div className="text-sm text-slate-600">{formatQuota(tier)}</div>
                                    </div>

                                    <ul className="space-y-4 text-left flex-1">
                                        {features.length > 0 ? (
                                            features.map((f, idx) => (
                                                <li key={idx} className="flex items-center gap-3 text-[#000D83] font-medium">
                                                    <span className="text-green-500">✓</span>
                                                    <span className="text-sm md:text-sm">{f}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="text-sm text-slate-500">No details available.</li>
                                        )}
                                    </ul>

                                    <a href="/student/subscription" className={`btn mt-6 w-full rounded-xl text-sm font-medium btn btn-gradient-slow text-white shadow-md transition bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90`}>Subscribe Now →</a>
                                </motion.div>
                            );
                        })
                    )}
                </div>
            </div>
        </section>
    );
}
