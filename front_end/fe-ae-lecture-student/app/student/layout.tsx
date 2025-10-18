"use client";

import Header from "./components/header";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* ✅ Header không dính */}
      <Header />

      {/* ✅ Nội dung chính (layout con sẽ tự thêm padding) */}
      <main>{children}</main>
    </div>
  );
}
