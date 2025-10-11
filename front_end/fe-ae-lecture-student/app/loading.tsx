"use client";

import LogoLoader from "@/components/common/logo-loader";

export default function RootLoading() {
    return (
        <div className="min-h-dvh flex items-center justify-center text-white">
            <div className="flex flex-col items-center gap-3">
                <LogoLoader size={56} />
                <div className="text-sm text-white/70">Loading...</div>
            </div>
        </div>
    );
}
