// app/(auth)/register/page.tsx
"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { AuthService } from "@/services/auth.services";
import type { RegisterPayload } from "@/types/auth/auth.payload";
import type { RegisterResponse } from "@/types/auth/auth.response";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const payload: Omit<RegisterPayload, "role"> = {
      email: String(formData.get("email") ?? "").trim(),
      password,
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
    };

    setLoading(true);
    try {
      // BE tự suy ra role hoặc không cần; ép any để không phụ thuộc type có 'role'
      const res: RegisterResponse = await AuthService.register(payload as any);

      // Let axios interceptor show BE-provided toast on error. On success,
      // reset the form and navigate if no further confirmation/approval required.
      form.reset();

      if (!res.requiresEmailConfirmation && !res.requiresApproval) {
        router.push("/login");
      }
    } catch (err) {
      // Stay on the register page; axios interceptor already displayed the server message.
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating…
              </span>
            ) : (
              "Create account"
            )}
          </Button>
        </div>

        <div className="text-center text-xs text-slate-500">
          After signing up, you may need to verify your email or wait for approval.
        </div>
      </form>
    </AuthShell>
  );
}
