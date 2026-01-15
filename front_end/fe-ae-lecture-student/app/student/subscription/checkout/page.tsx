// app/student/subscription/checkout/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, CreditCard, Crown, Check } from "lucide-react";
import { toast } from "sonner";

import { useSubscriptionTiers } from "@/hooks/subscription/useSubscriptionTiers";
import { useCreateSubscriptionPayment } from "@/hooks/payments/useCreateSubscriptionPayment";
import { useConfirmSubscriptionPayment } from "@/hooks/payments/useConfirmSubscriptionPayment";
import type { SubscriptionTier } from "@/types/subscription/subscription.response";

function getDurationLabel(days: number) {
  if (!days || days === 0) return "lifetime";
  if (days === 30) return "month";
  if (days === 365) return "year";
  return `${days} days`;
}

function formatQuota(limit: number, durationDays: number) {
  if (limit >= 2000) return "Unlimited crawling";

  if (!durationDays || durationDays === 0) {
    return `${limit.toLocaleString()} tasks total`;
  }

  if (durationDays === 30) {
    return `${limit.toLocaleString()} tasks / month`;
  }

  if (durationDays === 365) {
    return `${limit.toLocaleString()} tasks / year`;
  }

  return `${limit.toLocaleString()} tasks / ${durationDays} days`;
}

export default function SubscriptionCheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // từ URL: ?tier=0&planId=1111-...
  const tierParam = searchParams.get("tier") || "";
  const planIdParam = searchParams.get("planId") || "";

  const { getSubscriptionTiers, loading: tiersLoading } =
    useSubscriptionTiers();
  const { createSubscriptionPayment, loading: creatingPayment } =
    useCreateSubscriptionPayment();
  const { confirmSubscriptionPayment, loading: confirming } =
    useConfirmSubscriptionPayment();

  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const hasHandledReturnRef = useRef(false);

  // ✅ Handle PayOS return: lấy token + orderCode và confirm
  useEffect(() => {
    const confirmationToken =
      searchParams.get("confirmationToken") ||
      searchParams.get("ConfirmationToken");
    const orderCode =
      searchParams.get("orderCode") || searchParams.get("OrderCode");

    const status = searchParams.get("status"); // PAID / ...
    const cancel = searchParams.get("cancel"); // "true" / "false"

    if (!confirmationToken || !orderCode) return;
    if (status && status.toUpperCase() !== "PAID") return;
    if (cancel === "true") return;

    if (hasHandledReturnRef.current) return;
    hasHandledReturnRef.current = true;

    (async () => {
      try {
        const res = await confirmSubscriptionPayment({
          orderCode,
          token: confirmationToken,
        });

        if (!res || res.status !== 200) {
          toast.error(
            res?.message || "Could not confirm your subscription payment.",
          );
          return;
        }

        const tierValue = searchParams.get("tier") || "";
        const planIdValue = searchParams.get("planId") || "";

        // ✅ Redirect sang trang success (để hiện UI + update cookie)
        const query = new URLSearchParams();
        if (tierValue) query.set("tier", tierValue);
        if (planIdValue) query.set("planId", planIdValue);

        router.replace(
          `/student/subscription/success${
            query.toString() ? `?${query.toString()}` : ""
          }`,
        );
      } catch (err) {
        toast.error("Something went wrong when confirming your payment.");
      }
    })();
  }, [searchParams, confirmSubscriptionPayment, router]);

  // Load list tiers
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const res = await getSubscriptionTiers(); // SubscriptionTier[]
      if (!cancelled) setTiers(res);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // chọn tier từ URL: ưu tiên planId, fallback tier number / name
  const selectedTier = useMemo(() => {
    if (!tiers.length) return undefined;

    if (planIdParam) {
      const byId = tiers.find((t) => t.id === planIdParam);
      if (byId) return byId;
    }

    if (tierParam) {
      const byTierLevel = tiers.find(
        (t) => String(t.tierLevel) === tierParam,
      );
      if (byTierLevel) return byTierLevel;

      const lower = tierParam.toLowerCase();
      const byName = tiers.find(
        (t) => t.name.toLowerCase() === lower || t.tierName.toLowerCase() === lower || String(t.tierLevel) === lower,
      );
      if (byName) return byName;
    }

    return undefined;
  }, [tiers, tierParam, planIdParam]);

  const handleBack = () => {
    router.push("/student/subscription");
  };

  const handleConfirm = async () => {
    if (!selectedTier) return;

    // Free plan: không cần thanh toán
    if (selectedTier.price === 0) {
      router.push("/student/subscription");
      return;
    }

    if (typeof window === "undefined") return;

    const origin = window.location.origin;

    // returnUrl về lại đúng trang checkout (giữ tier + planId)
    const query = new URLSearchParams();
    query.set("tier", selectedTier.tierName); // tierName: Free/Basic/Premium/Enterprise
    query.set("planId", selectedTier.id);

    const returnUrl = `${origin}/student/subscription/success?${query.toString()}`;
    const cancelQuery = new URLSearchParams();
    cancelQuery.set("cancel", "true");
    const cancelUrl = `${origin}/student/subscription?${cancelQuery.toString()}`;

    // 👇 Gửi đúng payload mới: subscriptionPlanId + return/cancel
    const res = await createSubscriptionPayment({
      subscriptionPlanId: selectedTier.id,
      returnUrl,
      cancelUrl,
    });

    const checkoutUrl = res?.data?.checkoutUrl;
    const orderCode = res?.data?.orderCode;
    if (orderCode && typeof window !== "undefined") {
      sessionStorage.setItem("subscription:pendingOrderCode", orderCode);
    }
    if (checkoutUrl) {
      window.location.href = checkoutUrl;
    }
  };

  const loading = tiersLoading && !selectedTier;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium cursor-pointer transition-colors hover:bg-slate-100 hover:text-nav"
        style={{ color: "var(--text-muted)" }}
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to plans
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 md:p-7"
      >
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent">
            <Crown className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-nav">
              Confirm your subscription
            </h1>
            <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
              Review the details before proceeding to payment.
            </p>
          </div>
        </div>

        {(loading || confirming) && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {confirming
              ? "Confirming your payment..."
              : "Loading plan details..."}
          </p>
        )}

        {!loading && !confirming && !selectedTier && (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Plan not found. Please go back and choose a plan again.
          </p>
        )}

        {!loading && !confirming && selectedTier && (
          <>
            <div className="mb-4 rounded-lg border border-border bg-white/80 px-4 py-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-nav">
                    {selectedTier.name}
                  </p>
                  <p
                    className="mt-1 text-[11px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {selectedTier.description}
                  </p>
                </div>
                <div className="text-right">
                  {selectedTier.price === 0 ? (
                    <p className="text-sm font-bold text-brand">Free</p>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-accent">
                        {selectedTier.price.toLocaleString()}{" "}
                        {selectedTier.currency}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        / {getDurationLabel(selectedTier.durationDays)}
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-3 text-[11px]">
                <span className="font-medium text-brand">
                  {formatQuota(
                    selectedTier.quotaLimit,
                    selectedTier.durationDays,
                  )}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold text-nav">
                What&apos;s included
              </p>
              <ul className="space-y-1.5 text-[11px]">
                {selectedTier.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2"
                    style={{ color: "var(--foreground)" }}
                  >
                    <Check className="mt-[2px] h-3 w-3 text-brand" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {selectedTier.price > 0 && (
              <div className="mb-4 flex items-center justify-between text-xs">
                <span style={{ color: "var(--text-muted)" }}>Total</span>
                <span className="font-semibold text-accent">
                  {selectedTier.price.toLocaleString()} {selectedTier.currency}
                </span>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={handleConfirm}
                disabled={creatingPayment}
                className="btn btn-gradient flex-1 text-sm font-semibold inline-flex items-center justify-center gap-2 rounded-xl"
              >
                <CreditCard className="h-4 w-4" />
                {selectedTier.price === 0
                  ? "Use this plan"
                  : creatingPayment
                  ? "Creating payment..."
                  : "Confirm and pay"}
              </button>

              <button
                type="button"
                onClick={handleBack}
                className="btn flex-1 text-sm font-semibold border border-border bg-white hover:bg-slate-50"
              >
                Change plan
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
