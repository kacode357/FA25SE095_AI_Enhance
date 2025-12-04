"use client";

import AuthShell from "@/components/auth/AuthShell";
import { useConfirmEmail } from "@/hooks/auth/useConfirmEmail";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { confirmEmail, loading, result } = useConfirmEmail();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    const token = searchParams.get("token");
    if (token) {
      confirmEmail({ token });
      calledRef.current = true;
    }
  }, [searchParams, confirmEmail]);

  return (
    <AuthShell
      title="Email Verification"
      subtitle={
        result === null
          ? "Verifying your email..."
          : result.success
          ? "Authentication successful!"
          : "Authentication failed"
      }
      footer={<Link href="/" className="underline">Back to login</Link>}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-sm text-center text-white/80"
      >
        {loading
          ? "Loading..."
          : result
          ? result.message
          : "Authentication token not found."}
      </motion.div>
    </AuthShell>
  );
}
