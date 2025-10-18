"use client"; // ⚠️ thêm dòng này vì layout sẽ chứa component client (Header)

import Header from "./components/header";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Header /> 
      <main className="flex-1 container mx-auto p-4 sm:p-6">{children}</main>
    </div>
  );
}
