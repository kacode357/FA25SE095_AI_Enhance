"use client";
import Header from "./components/header";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />
      {/* chừa chỗ cố định cho header cao 64px */}
      <main className="pt-16">{children}</main>
    </div>
  );
}
