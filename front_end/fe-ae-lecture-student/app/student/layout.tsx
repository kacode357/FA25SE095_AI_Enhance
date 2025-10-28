"use client";

import { useRoleGuard } from "@/components/auth/useRoleGuard";
import { UserRole } from "@/config/classroom-service/user-role";
import type { CSSProperties } from "react";
import Header from "./components/header";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { allowed } = useRoleGuard(UserRole.Student);

  if (!allowed) return null; 

  return (
    <div
      className="min-h-screen bg-slate-50 text-slate-900"
      style={{ "--app-header-h": "64px" } as CSSProperties}
    >
      <Header />
      <main>{children}</main>
    </div>
  );
}
