"use client";

export default function RootLoading() {
    return (
        <div
            className="fixed inset-0 z-[9999] bg-brand text-white flex items-center justify-center cursor-progress select-none"
            aria-busy
            aria-live="polite"
            role="status"
        >
            <div className="relative w-12 h-12">
                <span className="absolute inset-0 rounded-full border-4 border-white/40 animate-ping" />
                <span className="absolute inset-0 rounded-full border-4 border-white/30 animate-ping delay-150" />
                <span className="absolute inset-[18%] rounded-full border-4 border-white/90" />
            </div>
            <span className="sr-only">Loading…</span>
        </div>
    );
}
