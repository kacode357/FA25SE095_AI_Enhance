"use client";

import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

export default function Protected({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return <div className="p-6 text-sm text-black/60">Đang chuyển hướng tới đăng nhập…</div>;
  return <>{children}</>;
}
