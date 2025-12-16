// app/student/layout.tsx
"use client";

import Header from "./components/header";
import HotkeySettings from "./components/HotkeySettings";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="student-shell min-h-screen text-slate-900">
      <Header />
      <main className="pt-16">{children}</main>
      <HotkeySettings />
    </div>
  );
}
