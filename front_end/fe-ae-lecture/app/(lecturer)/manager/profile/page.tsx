// app/(lecturer)/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UpdateProfilePayload } from "@/types/user/user.payload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";

export default function ProfilePage() {
  const { user } = useAuth();
  const { updateProfile, loading } = useUpdateProfile();

  const [form, setForm] = useState<UpdateProfilePayload>({
    firstName: "",
    lastName: "",
    institutionName: "",
    institutionAddress: "",
    department: "",
    studentId: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        institutionName: user.institutionName || "",
        institutionAddress: user.institutionAddress || "",
        department: user.department || "",
        studentId: user.studentId || "",
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(form);
  };

  return (
    <main className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Cập nhật thông tin cá nhân</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="firstName"
          value={form.firstName}
          onChange={handleChange}
          placeholder="First Name"
        />
        <Input
          name="lastName"
          value={form.lastName}
          onChange={handleChange}
          placeholder="Last Name"
        />
        <Input
          name="institutionName"
          value={form.institutionName}
          onChange={handleChange}
          placeholder="Institution Name"
        />
        <Input
          name="institutionAddress"
          value={form.institutionAddress}
          onChange={handleChange}
          placeholder="Institution Address"
        />
        <Input
          name="department"
          value={form.department}
          onChange={handleChange}
          placeholder="Department"
        />
        <Input
          name="studentId"
          value={form.studentId || ""}
          onChange={handleChange}
          placeholder="Student ID (optional)"
        />
        <Button type="submit" loading={loading}>
          Save Changes
        </Button>
      </form>
    </main>
  );
}
