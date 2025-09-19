"use client";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Protected from "@/components/providers/Protected";

export default function UserLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid grid-rows-[auto_1fr]">
      <Header />
      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] container-px gap-6 py-4">
        <Sidebar />
        <main className="min-w-0">
          <Protected>{children}</Protected>
        </main>
      </div>
    </div>
  );
}
