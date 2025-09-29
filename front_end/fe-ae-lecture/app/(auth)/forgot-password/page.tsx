// app/(auth)/forgot-password/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState } from "react";
import { useForgotPassword } from "@/hooks/useForgotPassword";

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { forgotPassword, loading } = useForgotPassword();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();

    const res = await forgotPassword({ email });
    if (res?.success) {
      setSent(true);
    }
  };

  return (
    <AuthShell
      title="Reset your password!"
      subtitle={<span>Enter your email to receive a reset link.</span>}
      footer={<Link href="/login" className="underline">Back to sign in</Link>}
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-white/80"
        >
          We’ve sent a reset link to your email if an account exists. Please
          check your inbox.
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="email"
            name="email"
            label="Email"
            placeholder="you@example.com"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
