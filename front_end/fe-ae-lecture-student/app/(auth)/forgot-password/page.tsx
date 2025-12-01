// app/(auth)/forgot-password/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForgotPassword } from "@/hooks/auth/useForgotPassword";
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

    const isSuccess = res
      ? ("success" in (res as any)
        ? Boolean((res as any).success)
        : typeof (res as any).status === "number" && (res as any).status >= 200 && (res as any).status < 300)
      : false;

    if (isSuccess) setSent(true);
  };

  return (
    <AuthShell
      title="Reset your password!"
      subtitle={<span>Enter your email to receive a reset link.</span>}
      footer={<Link href="/login" className="underline">&larr; &nbsp;Back to sign in</Link>}
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-center bg-green-50 p-2 rounded-2xl text-green-700"
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
          <Button type="submit" className="w-full btn btn-gradient-slow" loading={loading}>
            Send reset link
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
