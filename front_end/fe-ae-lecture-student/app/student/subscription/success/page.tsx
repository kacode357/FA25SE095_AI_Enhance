"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, Crown, ArrowRight } from "lucide-react";
import Cookies from "js-cookie";

import { loadDecodedUser, saveEncodedUser } from "@/utils/secure-user";

const STORAGE_KEY = "a:u";

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updatedRef = useRef(false);

  const tier = searchParams.get("tier") || "";

  // ✅ Cập nhật subscriptionTier trong encoded user + báo cho app biết user đã update
  useEffect(() => {
    if (updatedRef.current) return;
    updatedRef.current = true;

    (async () => {
      const user = await loadDecodedUser();
      if (!user) return;
      if (!tier) return;

      if (
        user.subscriptionTier &&
        user.subscriptionTier.toLowerCase() === tier.toLowerCase()
      ) {
        // đã đúng tier rồi thì khỏi làm gì
        return;
      }

      const remember = !!Cookies.get(STORAGE_KEY);

      const updatedUser = {
        ...user,
        subscriptionTier: tier,
      };

      await saveEncodedUser(updatedUser, remember);

      // 🔔 báo cho các component khác (UserMenu) reload lại user
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("app:user-updated"));
      }
    })();
  }, [tier]);

  const handleGoToPlans = () => {
    router.push("/student/subscription");
  };

  const handleGoToMySubscription = () => {
    router.push("/student/my-subscription");
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
            <Crown className="absolute -right-2 -top-2 h-6 w-6 text-[var(--brand)]" />
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
          {tier && (
            <>
              {" "}
              You are now on the{" "}
              <span className="font-semibold text-brand">{tier}</span> plan.
            </>
          )}
        </p>

        <div className="mb-6 inline-flex items-center rounded-full bg-slate-50 px-4 py-2 text-xs font-medium">
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500" />
          Subscription status:{" "}
          <span className="ml-1 text-green-600">Active</span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={handleGoToMySubscription}
            className="btn btn-gradient inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold"
          >
            Go to My Subscription
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
