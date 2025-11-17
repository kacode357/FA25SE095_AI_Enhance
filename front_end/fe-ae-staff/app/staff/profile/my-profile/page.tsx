// app/student/profile/my-profile/page.tsx
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";
import type { UpdateProfilePayload } from "@/types/user/user.payload";
import { Loader2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type ProfileForm = {
  firstName: string;
  lastName: string;
  department: string;
  studentId: string;
  institutionName: string;
  institutionAddress: string;
};

export default function MyProfilePage() {
  const { user } = useAuth();
  const { updateProfile, loading } = useUpdateProfile();

  const [form, setForm] = useState<ProfileForm>({
    firstName: "",
    lastName: "",
    department: "",
    studentId: "",
    institutionName: "",
    institutionAddress: "",
  });

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: safeStr(user.firstName),
      lastName: safeStr(user.lastName),
      department: safeStr(user.department),
      studentId: safeStr(user.studentId),
      institutionName: safeStr(user.institutionName),
      institutionAddress: safeStr(user.institutionAddress),
    });
  }, [user]);

  const fullName = useMemo(() => {
    const f = form.firstName.trim();
    const l = form.lastName.trim();
    return [f, l].filter(Boolean).join(" ");
  }, [form.firstName, form.lastName]);

  const onChange =
    (key: keyof ProfileForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((s) => ({ ...s, [key]: e.target.value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const payload: UpdateProfilePayload = {
      firstName: form.firstName,
      lastName: form.lastName,
      department: form.department,
      institutionName: form.institutionName,
      institutionAddress: form.institutionAddress,
      ...(form.studentId ? { studentId: form.studentId } : {}),
    };

    await updateProfile(payload);
  };

  const quotaPct = useMemo(() => {
    const used = user?.crawlQuotaUsed ?? 0;
    const limit = user?.crawlQuotaLimit ?? 0;
    if (limit <= 0) return 0;
    return Math.min(100, Math.round((used / limit) * 100));
  }, [user]);

  if (!user) {
    return (
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-nav mb-1">My Profile</h2>
        <p className="text-sm text-[var(--text-muted)]">You are not signed in.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-start gap-6">
          <div
            className="h-16 w-16 rounded-xl grid place-items-center text-base font-semibold border border-[var(--border)]"
            style={{
              color: "var(--brand-700)",
              background: "color-mix(in oklab, var(--brand) 10%, white)",
            }}
            aria-hidden
          >
            {initials(user.firstName, user.lastName)}
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-nav break-words">
              {fullName || user.email}
            </h2>
            <p className="text-sm text-[var(--text-muted)] mt-0.5">
              Manage your personal and institution information.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <StatLine label="Role" value="Student" />
              <StatLine label="Account Status" value={user.status || "—"} />
              <StatLine label="Subscription Plan" value={user.subscriptionTier || "—"} />
            </div>
          </div>
        </div>
      </div>

      {/* Readonly details */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-nav mb-4">Account Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoItem label="Email" value={user.email ?? ""} />
          <InfoItem label="Student ID" value={safeStr(user.studentId) || "-"} />
          <InfoItem label="Last Login" value={formatDateTime(user.lastLoginAt)} />
        </div>

        <div className="mt-5">
          <label className="block text-sm text-nav mb-2">Crawl Quota</label>

          <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-1">
            <span>
              Used {user.crawlQuotaUsed ?? 0} / {user.crawlQuotaLimit ?? 0}
            </span>
            {user.quotaResetDate && (
              <span>Reset: {formatDateTime(user.quotaResetDate, true)}</span>
            )}
          </div>

          <div className="h-2 rounded-full bg-slate-100 border border-[var(--border)] overflow-hidden">
            <div
              className="h-2 rounded-full"
              style={{
                width: `${quotaPct}%`,
                background:
                  "linear-gradient(90deg, var(--brand), var(--brand-700))",
              }}
            />
          </div>
        </div>
      </div>

      {/* Editable form */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-nav mb-4">Edit Profile</h3>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="First Name">
              <input
                className="input"
                placeholder="First name"
                value={form.firstName}
                onChange={onChange("firstName")}
              />
            </Field>

            <Field label="Last Name">
              <input
                className="input"
                placeholder="Last name"
                value={form.lastName}
                onChange={onChange("lastName")}
              />
            </Field>

            <Field label="Department" span={2}>
              <input
                className="input"
                placeholder="Digital Marketing"
                value={form.department}
                onChange={onChange("department")}
              />
            </Field>

            <Field label="Student ID" span={2}>
              <input
                className="input"
                placeholder="e.g., STU003"
                value={form.studentId}
                onChange={onChange("studentId")}
              />
            </Field>

            <Field label="Institution Name" span={2}>
              <input
                className="input"
                placeholder="University / Organization"
                value={form.institutionName}
                onChange={onChange("institutionName")}
              />
            </Field>

            <Field label="Institution Address" span={2}>
              <input
                className="input"
                placeholder="Address"
                value={form.institutionAddress}
                onChange={onChange("institutionAddress")}
              />
            </Field>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              className={`btn btn-gradient-slow ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>

            <button
              type="button"
              className={`btn bg-white border border-brand text-nav hover:text-nav-active ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={loading}
              onClick={() => {
                setForm({
                  firstName: safeStr(user.firstName),
                  lastName: safeStr(user.lastName),
                  department: safeStr(user.department),
                  studentId: safeStr(user.studentId),
                  institutionName: safeStr(user.institutionName),
                  institutionAddress: safeStr(user.institutionAddress),
                });
              }}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ===== UI bits ===== */
function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-3">
      <div className="text-sm flex items-center text-nav font-medium">
        {label}: <span className="font-normal text-foreground/80">{value}</span>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  span = 1,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  span?: 1 | 2;
  hint?: string;
}) {
  return (
    <div className={span === 2 ? "md:col-span-2" : ""}>
      <label className="block text-sm text-nav mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-3">
      <div className="text-[11px] uppercase tracking-wide text-[var(--text-muted)]">
        {label}
      </div>
      <div className="text-sm text-foreground mt-0.5 break-all">{value || "-"}</div>
    </div>
  );
}

function safeStr(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function initials(first?: string, last?: string) {
  const f = safeStr(first).trim();
  const l = safeStr(last).trim();
  return (f[0] || "").toUpperCase() + (l[0] || "").toUpperCase();
}

function formatDateTime(iso?: string | null, dateOnly = false) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const opts: Intl.DateTimeFormatOptions = dateOnly
    ? { year: "numeric", month: "short", day: "2-digit" }
    : { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" };
  return new Intl.DateTimeFormat(undefined, opts).format(d);
}
