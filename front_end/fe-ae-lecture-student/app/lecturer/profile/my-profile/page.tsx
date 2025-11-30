"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";
import { useUploadAvatar } from "@/hooks/user/useUploadAvatar";
import type { UpdateProfilePayload } from "@/types/user/user.payload";
import { CircleFadingArrowUp, Loader2, Mail, ScanEye, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge, DetailRow, Field, formatDateTime, initials, safeStr, StatLine } from "../components/format-profile";

type ProfileForm = {
    firstName: string;
    lastName: string;
    department: string;
    institutionName: string;
    institutionAddress: string;
};

export default function LecturerMyProfilePage() {
    const { user } = useAuth();
    const { updateProfile, loading } = useUpdateProfile();
    const { uploadAvatar, loading: uploading } = useUploadAvatar();

    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        return () => {
            if (preview && preview.startsWith("blob:")) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const [form, setForm] = useState<ProfileForm>({
        firstName: "",
        lastName: "",
        department: "",
        institutionName: "",
        institutionAddress: "",
    });

    useEffect(() => {
        if (!user) return;
        setForm({
            firstName: safeStr(user.firstName),
            lastName: safeStr(user.lastName),
            department: safeStr(user.department),
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
                <div className="flex flex-col md:flex-row md:items-start gap-10">
                    <div className="relative group" aria-hidden>
                        <div className="h-32 w-32 rounded-xl overflow-hidden border border-[var(--border)] bg-white grid place-items-center text-base font-semibold text-[var(--brand-700)]">
                            {preview ? (
                                <img src={preview} alt="avatar preview" className="h-full w-full object-cover" />
                            ) : user.profilePictureUrl ? (
                                <img
                                    src={user.profilePictureUrl}
                                    alt={`${user.firstName} ${user.lastName}`}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                initials(user.firstName, user.lastName)
                            )}
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center transition-opacity duration-150 opacity-0 group-hover:opacity-100">
                            {/* very subtle light overlay so avatar remains visible */}
                            <div className="absolute inset-0 cursor-pointer bg-white/50" aria-hidden />

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="relative z-10 rounded cursor-pointer  text-nav text-sm flex items-center gap-2"
                                aria-label="Upload avatar"
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                <CircleFadingArrowUp className="w-7 h-7 text-violet-500" />
                            </button>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            aria-hidden="true"
                            aria-label="Upload avatar"
                            className="hidden"
                            onChange={async (e) => {
                                // capture DOM input element before any await to avoid synthetic event pooling
                                const input = e.currentTarget as HTMLInputElement;
                                const f = input.files?.[0];
                                if (!f) return;

                                // show local preview immediately
                                const url = URL.createObjectURL(f);
                                setPreview(url);

                                // call updated hook (expects { ProfilePicture: File })
                                const uploadedUrl = await uploadAvatar({ ProfilePicture: f });

                                // if upload returned a hosted URL, use it and revoke our blob preview
                                if (uploadedUrl) {
                                    if (url && url.startsWith("blob:")) {
                                        try {
                                            URL.revokeObjectURL(url);
                                        } catch (err) {
                                            // ignore
                                        }
                                    }

                                    setPreview(uploadedUrl);
                                }

                                // clear input so same file can be selected again later
                                try {
                                    input.value = "";
                                } catch (err) {
                                    // ignore if input removed
                                }
                            }}
                        />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="min-w-0">
                                <h2 className="text-xl font-semibold text-nav break-words">
                                    {fullName || user.email}
                                </h2>
                                <div className="mt-1 text-sm text-[var(--text-muted)] flex items-center gap-2">
                                    <Mail className="w-4 h-4" />
                                    <a className="hover:underline break-all" href={`mailto:${user.email}`}>{user.email}</a>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Badge label={user.role || "Lecturer"} tone="brand" />
                                <Badge label={user.status || "Unknown"} tone={user.status === "Active" ? "success" : "neutral"} />
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                            <StatLine label="Last login" value={formatDateTime(user.lastLoginAt)} />
                            <StatLine label="Account created" value={formatDateTime(user.createdAt, true)} />
                            <StatLine
                                label="Email"
                                value={
                                    user.isEmailConfirmed ? (
                                        <>
                                            <div className="flex gap-1 items-start">
                                                <ShieldCheck className="w-4 h-4 items-start text-green-600" />
                                                <div className="inline-flex items-start gap-1 text-green-600">
                                                    Verified{user.emailConfirmedAt ? ` (${formatDateTime(user.emailConfirmedAt, true)})` : ""}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <span className="text-slate-500">Not verified</span>
                                    )
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Two-column layout: left = Profile (read-only), right = Edit profile (form) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card p-6">
                    <h3 className="text-sm font-semibold flex items-center gap-1 text-nav mb-4">Profile Preview <ScanEye className="size-4" /></h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-9" role="group" aria-label="Profile details">
                        <div className="md:col-span-2">

                            <DetailRow label="First name" value={safeStr(form.firstName) || <span className="text-slate-400 italic">Not set</span>} />
                        </div>
                        <div className="md:col-span-2">

                            <DetailRow label="Last name" value={safeStr(form.lastName) || <span className="text-slate-400 italic">Not set</span>} />
                        </div>

                        <div className="md:col-span-2">
                            <DetailRow label="Department" value={safeStr(form.department) || <span className="text-slate-400 italic">Not set</span>} />
                        </div>

                        <div className="md:col-span-2">
                            <DetailRow label="Institution" value={safeStr(form.institutionName) || <span className="text-slate-400 italic">Not set</span>} />
                        </div>

                        <div className="md:col-span-2">
                            <DetailRow label="Institution address" value={safeStr(form.institutionAddress) || <span className="text-slate-400 italic">Not set</span>} />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="text-sm font-semibold text-nav mb-4">Edit profile</h3>
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
                                    placeholder="Department"
                                    value={form.department}
                                    onChange={onChange("department")}
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

                        <div className="flex items-center justify-end gap-3 pt-2">
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
        </div>
    );
}
