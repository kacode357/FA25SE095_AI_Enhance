// app/student/profile/layout.tsx
import type { ReactNode } from "react";
import Sidebar from "./components/Sidebar";

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 md:px-8 lg:px-12 py-8">
      <header className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-nav">
          Account Settings
        </h1>
        <p className="text-sm text-[var(--text-muted)] mt-1">
          Manage your profile information and change your password.
        </p>
      </header>

      {/* items-stretch để 2 cột bằng chiều cao nhau */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
