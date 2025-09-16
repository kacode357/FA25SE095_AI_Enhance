"use client";

import { useAuthLoading } from "@/components/auth/AuthLoadingProvider";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { VerifyEmailRequest } from "@/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function VerifyPage() {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const { withLoading } = useAuthLoading();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const code = Array.from({ length: 6 })
      .map((_, i) => String(form.get(String(i)) ?? ""))
      .join("");
    const payload: VerifyEmailRequest = { token: code };
    await withLoading(async () => {
      await new Promise((r) => setTimeout(r, 1000));
    });
    setLoading(false);
    setVerified(true);
  };

  return (
    <AuthShell
      title="Verify your account!"
      subtitle={<span>Enter the 6-digit code we emailed to you.</span>}
      footer={<Link href="/login" className="underline">Back to sign in</Link>}
    >
      {verified ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm text-white/80">
          Your email has been verified. You can now sign in.
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Input key={i} name={String(i)} inputMode="numeric" pattern="[0-9]*" maxLength={1} className="text-center" />
            ))}
          </div>
          <Button type="submit" className="w-full" loading={loading}>
            Verify
          </Button>
          <div className="text-center text-xs text-white/60">
            Didn’t get a code? <button type="button" className="underline">Resend</button>
          </div>
        </form>
      )}
    </AuthShell>
  );
}
