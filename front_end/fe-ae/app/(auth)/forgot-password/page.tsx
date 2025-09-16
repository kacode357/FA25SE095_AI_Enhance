"use client";

import { useAuthLoading } from "@/components/auth/AuthLoadingProvider";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ForgotPasswordRequest } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { withLoading } = useAuthLoading();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload: ForgotPasswordRequest = { email: String(form.get("email") ?? "").trim() };
    await withLoading(async () => {
      await new Promise((r) => setTimeout(r, 900));
    });
    setLoading(false);
    setSent(true);
  };

  return (
    <AuthShell
      title="Reset your password!"
      subtitle={<span>Enter your email to receive a reset link.</span>}
      footer={<Link href="/login" className="underline">Back to sign in</Link>}
    >
      {sent ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-white/80">
          We’ve sent a reset link to your email if an account exists. Please check your inbox.
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Input type="email" name="email" label="Email" placeholder="you@example.com" required />
          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
