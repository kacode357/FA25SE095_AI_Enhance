// app/staff/profile/layout.tsx
"use client";

import type { ReactNode } from "react";
import ManagerHeader from "../components/header"; // từ /staff/profile → /staff/components
import Sidebar from "./components/Sidebar";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top header (sticky) */}
      <ManagerHeader onMenuClick={() => { /* TODO: toggle sidebar mobile nếu cần */ }} />

      {/* chừa space bằng chiều cao header: h-20 */}
      <div className=" px-4 md:px-8 lg:px-12 py-8">
        <header className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Account Settings
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your profile information and change your password.
          </p>
        </header>

        <div className="flex flex-col md:flex-row gap-6">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
