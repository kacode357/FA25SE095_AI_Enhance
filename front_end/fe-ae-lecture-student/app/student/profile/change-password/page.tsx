// app/student/profile/change-password/page.tsx
"use client";

import { useMemo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useChangePassword } from "@/hooks/auth/useChangePassword";
import type { ChangePasswordPayload } from "@/types/auth/auth.payload";
import Button from "@/components/ui/button";

type FormState = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ChangePasswordPage() {
  const { changePassword, loading } = useChangePassword();

  const [form, setForm] = useState<FormState>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState<{ current: boolean; next: boolean; confirm: boolean }>({
    current: false,
    next: false,
    confirm: false,
  });

  const [errors, setErrors] = useState<{ new?: string; confirm?: string }>({});

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setForm((s) => ({ ...s, [key]: val }));
      if (key === "newPassword") setErrors((er) => ({ ...er, new: undefined }));
      if (key === "confirmPassword") setErrors((er) => ({ ...er, confirm: undefined }));
    };

  const pwdHint = useMemo(
    () => "At least 8 characters, include numbers & letters.",
    []
  );

  const isStrong = useMemo(() => {
    const p = form.newPassword;
    return p.length >= 8 && /[A-Za-z]/.test(p) && /[0-9]/.test(p);
  }, [form.newPassword]);

  const confirmMatch = useMemo(
    () => form.newPassword === form.confirmPassword,
    [form.newPassword, form.confirmPassword]
  );

  const isDisabled = loading || !form.currentPassword || !isStrong || !confirmMatch;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!isStrong) nextErrors.new = "Password must be at least 8 chars and include letters & numbers.";
    if (!confirmMatch) nextErrors.confirm = "Confirmation does not match.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const payload: ChangePasswordPayload = {
      currentPassword: form.currentPassword,
      newPassword: form.newPassword,
    };

    const res = await changePassword(payload);
    if (res?.success) {
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }
  };

  return (
    <div className="card p-6">
      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-nav mb-1">Change Password</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current password */}
          <div className="md:col-span-2">
            <label className="block text-sm text-nav mb-1">Current Password</label>
            <div className="relative">
              <input
                type={show.current ? "text" : "password"}
                className="input pr-10"
                placeholder="••••••••"
                value={form.currentPassword}
                onChange={onChange("currentPassword")}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:text-nav-active"
                onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                aria-label={show.current ? "Hide password" : "Show password"}
              >
                {show.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm text-nav mb-1">New Password</label>
            <div className="relative">
              <input
                type={show.next ? "text" : "password"}
                className="input pr-10"
                placeholder="••••••••"
                value={form.newPassword}
                onChange={onChange("newPassword")}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:text-nav-active"
                onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                aria-label={show.next ? "Hide password" : "Show password"}
              >
                {show.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">{pwdHint}</p>
            {!isStrong && form.newPassword.length > 0 && (
              <p className="text-xs text-accent mt-1">
                {errors.new || "Weak password."}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm text-nav mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type={show.confirm ? "text" : "password"}
                className="input pr-10"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={onChange("confirmPassword")}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:text-nav-active"
                onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                aria-label={show.confirm ? "Hide password" : "Show password"}
              >
                {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {!confirmMatch && form.confirmPassword.length > 0 && (
              <p className="text-xs text-accent mt-1">
                {errors.confirm || "New password and confirmation do not match."}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-2">
          {/* Update Password — dùng Button component + gradient pill */}
          <Button
            // dùng loader trong Button (LogoLoader)
            loading={loading}
            // để áp gradient pill chậm theo globals.css
            variant="gradient"
            className={`btn-gradient-slow ${isDisabled ? " cursor-not-allowed" : ""}`}
            disabled={isDisabled}
            type="submit"
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>

          {/* Reset — outline brand */}
          <Button
            className={`bg-white border border-brand text-nav hover:text-nav-active ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={loading}
            type="button"
            onClick={() => setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
