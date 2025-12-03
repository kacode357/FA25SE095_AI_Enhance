// app/(auth)/reset-password/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/hooks/auth/useResetPassword";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react"; 
import { toast } from "sonner";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const rawToken = searchParams.get("token");

  // --- LOGIC QUAN TRỌNG: FIX LỖI MẤT DẤU CỘNG ---
  // Trình duyệt tự đổi '+' thành ' ' (khoảng trắng).
  // Dòng này đổi ngược lại khoảng trắng thành '+' để token y nguyên như trên URL.
  const token = rawToken ? rawToken.replace(/ /g, "+") : null;
  // -----------------------------------------------

  const { resetPassword, loading } = useResetPassword();
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    const res = await resetPassword({
      token,
      newPassword,
    });

    if (res?.success) {
      setDone(true);
    }
  };

  return (
    <AuthShell
      title="Set your new password!"
      subtitle={<span>Enter your new password below.</span>}
      footer={
        <Link href="/login" className="underline">
          Back to sign in
        </Link>
      }
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
          {/* Cập nhật class btn-gradient-slow theo CSS Global */}
          <Button 
            type="submit" 
            className="w-full btn-gradient-slow border-0" 
            loading={loading}
          >
            Reset password
          </Button>
        </form>
      )}
    </AuthShell>
  );
}

// Bọc trong Suspense là best practice khi dùng useSearchParams trong Next.js App Router
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}