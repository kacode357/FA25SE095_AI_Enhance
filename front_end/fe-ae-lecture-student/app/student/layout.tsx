"use client";
import type { CSSProperties } from "react";
import Header from "./components/header";
import RoleGate from "@/components/auth/RoleGate";
import { UserRole } from "@/config/user-role";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={[UserRole.Student]}>
      <div
        className="min-h-screen bg-slate-50 text-slate-900"
        style={{ "--app-header-h": "64px" } as CSSProperties}
      >
        <Header />
        <main>{children}</main>
      </div>
    </RoleGate>
  );
}
