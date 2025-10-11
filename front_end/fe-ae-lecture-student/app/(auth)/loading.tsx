"use client";

import LogoLoader from "@/components/common/logo-loader";

export default function AuthLoading() {
  return (
    <div className="min-h-dvh flex items-center justify-center text-slate-800">
      <div className="flex flex-col items-center gap-3">
  <LogoLoader size={56} />
        <div className="text-sm text-slate-700">Preparing authentication...</div>
      </div>
    </div>
  );
}
