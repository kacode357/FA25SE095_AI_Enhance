// app/(auth)/reset-password/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token"); // Có thể là string hoặc null
  const { resetPassword, loading } = useResetPassword();
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. Kiểm tra nếu link không có token thì chặn luôn
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (newPassword !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    // 2. Fix lỗi TS: thêm `?? ""` (dù đã check ở trên nhưng thêm vào để TS im mồm tuyệt đối)
    const res = await resetPassword({ 
      token: token ?? "", 
      newPassword 
    });

    if (res?.success) {
      setDone(true);
    }
  };

  return (
    <AuthShell
      title="Set your new password!"
      subtitle={<span>Enter your new password below.</span>}
      footer={<Link href="/login" className="underline">Back to sign in</Link>}
    >
      {done ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-slate-700"
        >
          Your password has been reset successfully. You can now{" "}
          <Link href="/login" className="underline">
            log in
          </Link>{" "}
          with your new password.
        </motion.div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            type="password"
            name="password"
            label="New password"
            placeholder="At least 8 characters"
            required
          />
          <Input
            type="password"
            name="confirm"
            label="Confirm password"
            placeholder="Re-enter new password"
            required
          />
          <Button type="submit" className="w-full" loading={loading}>
            Reset password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}