// app/staff/profile/my-profile/page.tsx
"use client";

import AccountDetails from "@/app/staff/profile/components/AccountDetails";
import EditProfileForm from "@/app/staff/profile/components/EditProfileForm";
import HeaderSection from "@/app/staff/profile/components/Header";
import { safeStr } from "@/app/staff/profile/components/ProfileUI";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";
import { useUploadAvatar } from "@/hooks/user/useUploadAvatar";
import type { UpdateProfilePayload } from "@/types/user/user.payload";
import { useEffect, useMemo, useRef, useState } from "react";

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

  const isDirty = useMemo(() => {
    if (!user) return false;
    return (
      form.firstName !== safeStr(user.firstName) ||
      form.lastName !== safeStr(user.lastName) ||
      form.department !== safeStr(user.department) ||
      form.studentId !== safeStr(user.studentId) ||
      form.institutionName !== safeStr(user.institutionName) ||
      form.institutionAddress !== safeStr(user.institutionAddress)
    );
  }, [form, user]);

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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget as HTMLInputElement;
    const f = input.files?.[0];
    if (!f) return;

    const url = URL.createObjectURL(f);
    setPreview(url);

    const uploadedUrl = await uploadAvatar({ ProfilePicture: f });

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

    try {
      input.value = "";
    } catch (err) {
      // ignore
    }
  };

  const resetForm = () => {
    setForm({
      firstName: safeStr(user.firstName),
      lastName: safeStr(user.lastName),
      department: safeStr(user.department),
      studentId: safeStr(user.studentId),
      institutionName: safeStr(user.institutionName),
      institutionAddress: safeStr(user.institutionAddress),
    });
  };

  return (
    <div className="space-y-6">
      <HeaderSection user={user} preview={preview} onAvatarChange={handleAvatarChange} uploading={uploading} fileInputRef={fileInputRef} fullName={fullName} />

      <AccountDetails user={user} />

      <EditProfileForm form={form} onChange={(k: any) => onChange(k)} onSubmit={onSubmit} isDirty={isDirty} loading={loading} resetForm={resetForm} safeStr={safeStr} />
    </div>
  );
}
