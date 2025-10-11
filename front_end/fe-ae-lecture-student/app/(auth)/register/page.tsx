// app/(auth)/register/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterLecturer } from "@/hooks/auth/useRegister"; // ✅ đổi sang hook Lecturer
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register, loading } = useRegisterLecturer();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await register({
      email: String(formData.get("email") ?? "").trim(),
      password,
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
    });

    if (res) {
      form.reset();
    }
  };

  return (
    <AuthShell
      title="Create your Lecturer account!"
      subtitle={
        <span>
          Already have an account?{" "}
          <Link className="underline" href="/login">
            Sign in
          </Link>
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
          className="text-center text-xs text-slate-500"
        >
          After signing up, you may need to verify your email or wait for account approval.
        </motion.div>
      </form>
    </AuthShell>
  );
}
