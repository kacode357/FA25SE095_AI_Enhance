// app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GraduationCap, User, Check, ChevronDown, Loader2 } from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";

import { AuthService } from "@/services/auth.services";
import type { RegisterPayload } from "@/types/auth/auth.payload";
import type { RegisterResponse } from "@/types/auth/auth.response";

// Dùng enum của UserService: Student=0, Lecturer=1, Staff=2, Admin=3, PaidUser=4
import {
  UserServiceRole as UserRole,
  ROLE_LABEL as USER_ROLE_LABEL,
} from "@/config/user-service/user-role";

type RoleKey = "lecturer" | "student";

// Map UI -> giá trị role của UserService (Lecturer=1, Student=0)
const ROLE_MAP: Record<RoleKey, UserRole> = {
  lecturer: UserRole.Lecturer, // 1
  student: UserRole.Student,   // 0
};

export default function RegisterPage() {
  const router = useRouter();
  const [roleKey, setRoleKey] = useState<RoleKey>("lecturer");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

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
      const res: RegisterResponse = await AuthService.register({
        ...payload,
        role: ROLE_MAP[roleKey], // -> lecturer: 1, student: 0
      });

      toast.success(res.message);
      form.reset();

      if (!res.requiresEmailConfirmation && !res.requiresApproval) {
        router.push("/login");
      }
    } catch {
      toast.error("Sign up failed. Please try again.");
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
      {/* Current role + dialog to change */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm">
          You are signing up as: <b>{USER_ROLE_LABEL[ROLE_MAP[roleKey]]}</b>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="inline-flex items-center gap-1">
              <ChevronDown className="w-4 h-4" />
              Choose role
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select a role</DialogTitle>
              <DialogDescription className="text-xs">
                Pick the account type you want to register.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setRoleKey("lecturer");
                  setOpen(false);
                }}
                className={`h-24 rounded-lg border flex flex-col items-center justify-center gap-2 transition relative
                  ${roleKey === "lecturer" ? "border-primary ring-2 ring-primary/30" : "border-slate-200 hover:border-slate-300"}`}
                aria-pressed={roleKey === "lecturer"}
              >
                {roleKey === "lecturer" && <Check className="w-4 h-4 absolute top-2 right-2" />}
                <GraduationCap className="w-6 h-6" />
                <span className="font-medium">Lecturer</span>
                <span className="text-[11px] text-slate-500">Teach & manage</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleKey("student");
                  setOpen(false);
                }}
                className={`h-24 rounded-lg border flex flex-col items-center justify-center gap-2 transition relative
                  ${roleKey === "student" ? "border-primary ring-2 ring-primary/30" : "border-slate-200 hover:border-slate-300"}`}
                aria-pressed={roleKey === "student"}
              >
                {roleKey === "student" && <Check className="w-4 h-4 absolute top-2 right-2" />}
                <User className="w-6 h-6" />
                <span className="font-medium">Student</span>
                <span className="text-[11px] text-slate-500">Join & submit</span>
              </button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Form */}
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input name="firstName" label="First name" placeholder="Jane" required />
          <Input name="lastName" label="Last name" placeholder="Doe" required />
        </div>

        <Input
          type="email"
          name="email"
          label={roleKey === "lecturer" ? "Work email" : "Email"}
          placeholder={roleKey === "lecturer" ? "you@university.edu" : "you@example.com"}
          required
        />
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
