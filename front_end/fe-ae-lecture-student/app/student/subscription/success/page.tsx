// app/student/subscription/success/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { useConfirmSubscriptionPayment } from "@/hooks/payments/useConfirmSubscriptionPayment";
import { useCancelSubscriptionPayment } from "@/hooks/payments/useCancelSubscriptionPayment";
import { getRememberMeFlag } from "@/utils/auth/access-token";
import { loadDecodedUser, saveEncodedUser } from "@/utils/secure-user";
import { getUserSubscriptionPlanName } from "@/config/user-service/plan";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updatedRef = useRef(false);
  const hasHandledReturnRef = useRef(false);

  const { confirmSubscriptionPayment, loading: confirming } =
    useConfirmSubscriptionPayment();
  const { cancelSubscriptionPayment } = useCancelSubscriptionPayment();

  const tier = searchParams.get("tier") || "";
  const planId = searchParams.get("planId") || "";
  const confirmationToken =
    searchParams.get("confirmationToken") ||
    searchParams.get("ConfirmationToken");
  const orderCode =
    searchParams.get("orderCode") || searchParams.get("OrderCode");
  const status = searchParams.get("status") || searchParams.get("Status");
  const cancel = searchParams.get("cancel") || searchParams.get("Cancel");
  const cameFromPayOsReturn = Boolean(confirmationToken && orderCode);
  const hasReturnParams = Boolean(orderCode || confirmationToken || status || cancel);
  const [canUpdateUser, setCanUpdateUser] = useState(!cameFromPayOsReturn);
  const planName = getUserSubscriptionPlanName(tier);

  // Confirm payment directly when PayOS returns to this page
  useEffect(() => {
    if (!hasReturnParams) return;
    if (hasHandledReturnRef.current) return;

    const normalizedStatus = status?.toUpperCase() ?? "";
    const isCancelled =
      cancel?.toLowerCase() === "true" ||
      normalizedStatus === "CANCELLED" ||
      normalizedStatus === "CANCELED" ||
      normalizedStatus === "CANCEL";

    if (isCancelled) {
      hasHandledReturnRef.current = true;
      setCanUpdateUser(false);

      const reasonParam =
        searchParams.get("reason") ||
        searchParams.get("Reason") ||
        searchParams.get("message") ||
        searchParams.get("Message") ||
        searchParams.get("desc") ||
        searchParams.get("Desc");
      const reason = reasonParam?.trim() || "User cancelled payment.";

      (async () => {
        let orderCodeValue = orderCode;
        if (!orderCodeValue && typeof window !== "undefined") {
          orderCodeValue = sessionStorage.getItem(
            "subscription:pendingOrderCode",
          );
        }

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
      return;
    }

    if (!confirmationToken || !orderCode) return;

    if (normalizedStatus && normalizedStatus !== "PAID") {
      toast.error("Payment not completed. Please try again.");
      const fallback = new URLSearchParams();
      if (tier) fallback.set("tier", tier);
      if (planId) fallback.set("planId", planId);
      const fallbackQuery = fallback.toString();
      router.replace(
        `/student/subscription/checkout${
          fallbackQuery ? `?${fallbackQuery}` : ""
        }`,
      );
      return;
    }

    hasHandledReturnRef.current = true;

    (async () => {
      const res = await confirmSubscriptionPayment({
        orderCode: orderCode as string,
        token: confirmationToken as string,
      });

      if (!res || res.status !== 200) {
        setCanUpdateUser(false);
        toast.error(
          res?.message || "Could not confirm your subscription payment.",
        );
        const fallback = new URLSearchParams();
        if (tier) fallback.set("tier", tier);
        if (planId) fallback.set("planId", planId);
        const fallbackQuery = fallback.toString();
        router.replace(
          `/student/subscription/checkout${
            fallbackQuery ? `?${fallbackQuery}` : ""
          }`,
        );
        return;
      }

      setCanUpdateUser(true);
      if (typeof window !== "undefined") {
        sessionStorage.removeItem("subscription:pendingOrderCode");
      }

      // Clean sensitive query params but keep plan info for downstream logic
      const cleanQuery = new URLSearchParams();
      if (tier) cleanQuery.set("tier", tier);
      if (planId) cleanQuery.set("planId", planId);

      const cleanQueryString = cleanQuery.toString();
      if (cleanQueryString) {
        router.replace(`/student/subscription/success?${cleanQueryString}`);
      } else if (status || cancel || confirmationToken || orderCode) {
        router.replace("/student/subscription/success");
      }
    })();
  }, [
    cancel,
    cancelSubscriptionPayment,
    confirmationToken,
    confirmSubscriptionPayment,
    hasReturnParams,
    orderCode,
    planId,
    router,
    status,
    tier,
  ]);

  // Update cached user data once payment is confirmed (or when arriving from a trusted redirect)
  useEffect(() => {
    if (!tier || !canUpdateUser) return;
    if (updatedRef.current) return;
    updatedRef.current = true;

    (async () => {
      const user = await loadDecodedUser();
      if (!user) return;

      if (
        user.subscriptionTier &&
        user.subscriptionTier.toLowerCase() === tier.toLowerCase()
      ) {
        return;
      }

      const remember = getRememberMeFlag();

      const updatedUser = {
        ...user,
        subscriptionTier: tier,
      };

      await saveEncodedUser(updatedUser, remember);

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("app:user-updated"));
      }
    })();
  }, [tier, canUpdateUser]);

  const handleGoToPlans = () => {
    router.push("/student/subscription");
  };

  const handleGoToMySubscription = () => {
    router.push("/student/payment-history");
  };

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-10 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full px-6 py-8 md:px-8"
      >
        <div className="mb-4 flex justify-center">
          <div className="relative">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
            <Crown className="absolute -right-2 -top-2 h-6 w-6 text-yellow-400" />
          </div>
        </div>

        <h1 className="mb-2 text-xl font-semibold text-nav md:text-2xl">
          Payment successful
        </h1>

        <p
          className="mx-auto mb-4 max-w-md text-sm"
          style={{ color: "var(--text-muted)" }}
        >
          Your subscription has been activated successfully.
          {planName && (
            <>
              {" "}
              You are now on the{" "}
              <span className="font-semibold text-brand">{planName}</span> plan.
            </>
          )}
        </p>

        {cameFromPayOsReturn && confirming && (
          <div
            className="mb-4 inline-flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-[11px] font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-brand" />
            Confirming your payment with PayOS...
          </div>
        )}

        <div className="mb-6 inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-xs font-medium">
          <span
            className={`mr-1 inline-block h-2 w-2 rounded-full ${
              confirming ? "bg-brand" : "bg-green-500"
            }`}
          />
          Subscription status:{" "}
          <span
            className={`ml-1 ${
              confirming ? "text-brand" : "text-green-600"
            }`}
          >
            {confirming ? "Confirming..." : "Active"}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleGoToMySubscription}
            className="btn btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold"
          >
            View payment history
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleGoToPlans}
            className="btn border border-border bg-white px-5 py-2 text-sm font-semibold hover:bg-slate-50"
          >
            Back to Pricing Plans
          </button>
        </div>
      </motion.div>
    </div>
  );
}
