"use client";

import { useAuthLoading } from "@/components/auth/AuthLoadingProvider";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AuthResponse, RegisterRequest } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const { withLoading } = useAuthLoading();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload: RegisterRequest = {
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
      name: `${String(form.get("firstName") ?? "").trim()} ${String(form.get("lastName") ?? "").trim()}`.trim() || undefined,
    };
    await withLoading(async () => {
      await new Promise((r) => setTimeout(r, 1200));
    });
    const _res: Partial<AuthResponse> = {};
    void _res;
    setLoading(false);
  };

  return (
    <AuthShell
      title="Create your account!"
      subtitle={
        <span>
          Already have an account? <Link className="underline" href="/login">Sign in</Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input name="firstName" label="First name" placeholder="Jane" required />
          <Input name="lastName" label="Last name" placeholder="Doe" required />
        </div>
        <Input type="email" name="email" label="Email" placeholder="you@example.com" required />
        <Input type="password" name="password" label="Password" placeholder="At least 8 characters" required />
        <Input type="password" name="confirm" label="Confirm password" placeholder="Re-enter password" required />
        <div className="mt-6">
          <Button type="submit" className="w-full" loading={loading}>
            Create account
          </Button>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center text-xs text-white/50"
        >
          We’ll send a verification code to your email.
        </motion.div>
      </form>
    </AuthShell>
  );
}
