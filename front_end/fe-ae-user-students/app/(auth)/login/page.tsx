"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    await login(email, password);
    router.push("/dashboard");
  };

  return (
    <div className="min-h-dvh flex items-center justify-center container-px">
      <form onSubmit={onSubmit} className="card p-6 max-w-md w-full space-y-4">
        <h1 className="text-2xl font-bold">Đăng nhập</h1>
        <p className="text-sm text-black/60">Tài khoản Staff cấp</p>
        <Input label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@staff.edu" />
        <Input label="Mật khẩu" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        <Button type="submit" loading={loading} className="w-full">Đăng nhập</Button>
      </form>
    </div>
  );
}
