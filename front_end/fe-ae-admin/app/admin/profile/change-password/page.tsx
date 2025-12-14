// app/admin/profile/change-password/page.tsx
"use client";

import { useChangePassword } from "@/hooks/auth/useChangePassword";
import type { ChangePasswordPayload } from "@/types/auth/auth.payload";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

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
        if (key === "newPassword") setErrors((e) => ({ ...e, new: undefined }));
        if (key === "confirmPassword") setErrors((e) => ({ ...e, confirm: undefined }));
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
    <div className="card p-6" style={{ borderColor: "#e2e8f0" }}>
      <form onSubmit={onSubmit} className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Change Password</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current password */}
          <div className="md:col-span-2">
            <label className="block text-sm text-slate-700 mb-1">Current Password</label>
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
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100"
                onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                aria-label={show.current ? "Hide password" : "Show password"}
              >
                {show.current ? <Eye className="w-4 h-4" /> : < EyeOff className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-sm text-slate-700 mb-1">New Password</label>
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
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100"
                onClick={() => setShow((s) => ({ ...s, next: !s.next }))}
                aria-label={show.next ? "Hide password" : "Show password"}
              >
                {show.next ? <Eye className="w-4 h-4" /> : < EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-1">{pwdHint}</p>
            {!isStrong && form.newPassword.length > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {errors.new || "Weak password."}
              </p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-sm text-slate-700 mb-1">Confirm New Password</label>
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
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100"
                onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                aria-label={show.confirm ? "Hide password" : "Show password"}
              >
                {show.confirm ? <Eye className="w-4 h-4" /> : < EyeOff className="w-4 h-4" />}
              </button>
            </div>
            {!confirmMatch && form.confirmPassword.length > 0 && (
              <p className="text-xs text-red-600 mt-1">
                {errors.confirm || "New password and confirmation do not match."}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button type="submit" className="btn btn-green-slow" disabled={isDisabled}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Updating...
              </>
            ) : (
              "Update Password"
            )}
          </button>
          <button
            type="button"
            className="btn btn-ghost cursor-pointer hover:bg-slate-100"
            disabled={loading}
            onClick={() =>
              setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
            }
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
