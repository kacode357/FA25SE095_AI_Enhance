// app/(auth)/register/page.tsx
"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import RegisterShell from "@/components/auth/RegisterShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AuthService } from "@/services/auth.services";
import type { RegisterPayload } from "@/types/auth/auth.payload";
import type { RegisterResponse } from "@/types/auth/auth.response";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<string>("0");
  const [step, setStep] = useState<number>(1); // 1..3
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleAvatarChange = (file?: File) => {
    if (!file) {
      setAvatarFile(null);
      setAvatarPreview(null);
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const submitRegistration = async (form: HTMLFormElement) => {
    const formData = new FormData(form);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return false;
    }

    const get = (key: string) => {
      const v = String(formData.get(key) ?? "").trim();
      return v === "" ? undefined : v;
    };

    const payload: RegisterPayload = {
      email: String(formData.get("email") ?? "").trim(),
      password,
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      role: Number(role),
      phoneNumber: get("phoneNumber"),
      institutionName: get("institutionName"),
      institutionEmail: get("institutionEmail"),
      department: get("department"),
      position: get("position"),
      studentId: get("studentId"),
    };

    setLoading(true);
    try {
      const res: RegisterResponse = await AuthService.register(payload as any);
      toast.success(res.message);
      form.reset();
      if (!res.requiresEmailConfirmation && !res.requiresApproval) {
        router.push("/login");
      }
      return true;
    } catch {
      toast.error("Sign up failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const onNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    if (loading) return;

    if (step < 3) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const form = document.querySelector("form") as HTMLFormElement | null;
    if (form) {
      await submitRegistration(form);
    }
  };

  const onBack = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (step > 1) setStep((s) => s - 1);
  };

  return (
    <RegisterShell
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
      <form onSubmit={(e) => { e.preventDefault(); onNext(); }} className="space-y-4">
        {/* Stepper header */}
        <div className="mb-7">
          <div className="flex items-center gap-3 w-full max-w-full">
            {[
              "Your Account",
              "Profile Information",
              "Upload Avatar",
            ].map((label, i) => {
              const idx = i + 1;
              const active = idx === step;
              const done = idx < step;
              return (
                <div key={label} className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`flex-1 min-w-0 text-[11px] md:text-[12px] text-center py-1 px-2 rounded-full ${active ? 'bg-violet-100 text-violet-800 font-medium' : done ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                    <div className="uppercase tracking-tight font-medium truncate">{label}</div>
                  </div>
                  {i < 2 && <div className={`h-1 w-6 md:w-8 rounded-full flex-none ${idx < step ? 'bg-emerald-300' : 'bg-slate-200'}`} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Role selector spans full width */}
        <div className="flex items-center gap-4">
          <div className="text-sm font-medium leading-none">Register as</div>
          <Tabs defaultValue={role} value={role} onValueChange={(v) => setRole(v)}>
            <TabsList className="bg-transparent rounded-full p-1">
              <TabsTrigger
                value="0"
                className={"px-3 cursor-pointer py-1.5 rounded-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-violet-800 data-[state=active]:shadow-md data-[state=active]:font-medium"}
              >
                Student
              </TabsTrigger>
              <TabsTrigger
                value="1"
                className={"px-3 cursor-pointer py-1.5 rounded-full text-slate-700 data-[state=active]:bg-white data-[state=active]:text-violet-800 data-[state=active]:shadow-md data-[state=active]:font-medium"}
              >
                Lecturer
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Step content: single-column card — inputs distributed across steps */}
        {step === 1 && (
          <div className="space-y-5">
            <div className="flex flex-row gap-4">
              <Input className="text-sm" name="firstName" label="First name" placeholder="Jane" required />
              <Input className="text-sm" name="lastName" label="Last name" placeholder="Doe" required />
            </div>
            <div className="flex flex-row gap-4">

              <Input className="text-sm" type="email" name="email" label="Email" placeholder="you@example.com" required />
            </div>

            <div className="flex flex-row gap-4">
              <Input className="text-sm" type="password" name="password" label="Password" placeholder="At least 8 characters" required />
              <Input className="text-sm" type="password" name="confirm" label="Confirm password" placeholder="Re-enter password" required />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <Input className="text-sm" name="institutionName" label="Institution name" placeholder="University / Company" />
            <div className="flex flex-row gap-4">
              <Input className="text-sm" name="phoneNumber" label="Phone number" placeholder="+84 9xx xxx xxx" />
              <Input className="text-sm" type="email" name="institutionEmail" label="Institution email" placeholder="dept@example.edu" />
            </div>

            <div className="flex flex-row gap-4">
              <Input className="text-sm" name="department" label="Department" placeholder="e.g. Computer Science" />
              <Input className="text-sm" name="position" label="Position" placeholder="e.g. Lecturer / Researcher" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 my-10.5">
            <div className="flex items-center gap-10">
              <div className="w-52 h-52 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-slate-300"> 
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4z" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 21v-1c0-2.21-3.58-4-8-4s-8 1.79-8 4v1" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <div className="text-sm mb-2 font-medium">Upload avatar</div>
                <div className="text-xs text-slate-500 mb-7">Square image recommended. JPG/PNG. Max 2MB. (UI)</div>

                <div className="flex items-center gap-2">
                  <label className="inline-flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-md text-sm cursor-pointer shadow-sm">
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(ev) => {
                        const f = ev.currentTarget.files?.[0];
                        if (f) handleAvatarChange(f);
                      }}
                    />
                    Choose file
                  </label>

                  <button
                    type="button"
                    className="inline-flex items-center px-3 py-1.5 bg-white border border-red-400 rounded-md text-sm text-red-500 cursor-pointer"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Actions: Back / Next */}
        <div className="flex items-center justify-between mt-8">
          <div>
            <Link className="text-sm text-slate-500" href="/login">
              &larr; Back to Login
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {step > 1 && (
              <Button variant="ghost" onClick={onBack} className="hidden text-violet-800 hover:text-violet-500 md:inline-flex">
                Previous
              </Button>
            )}

            <Button onClick={onNext} className="btn btn-gradient-slow">
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing…
                </span>
              ) : (
                step < 3 ? "Next Step" : "Create account"
              )}
            </Button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          By continuing, you agree to our {" "}
          <a href="#" className="text-green-600 underline" rel="nofollow">
            Terms &amp; Conditions
          </a>{" "}
          and{" "}
          <a href="#" className="text-green-600 underline" rel="nofollow">
            Privacy Policy
          </a>
          .
        </div>
      </form>
    </RegisterShell>
  );
}
