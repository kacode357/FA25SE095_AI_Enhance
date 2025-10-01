// app/(auth)/forgot-password/page.tsx
"use client";

import { AuthCard, AuthShellAdmin } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/hooks/useForgotPassword";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

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
    <AuthShellAdmin>
      <AuthCard
        title="Reset password"
        subtitle={<span>Enter your email to receive a reset link.</span>}
        footer={<Link href="/login" className="text-emerald-600 hover:underline">Back to sign in</Link>}
      >
        {sent ? (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="text-sm text-slate-600">
            We’ve sent a reset link to your email if an account exists. Please check your inbox.
          </motion.div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <Input
              type="email"
              name="email"
              label="Email"
              placeholder="you@example.com"
              required
            />
            <Button type="submit" className="w-full" loading={loading}>Send reset link</Button>
          </form>
        )}
      </AuthCard>
    </AuthShellAdmin>
  );
}
