"use client";


type Props = {
    label?: string;
};

export default function FullscreenLoader({ label }: Props) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="status"
            aria-live="polite"
            aria-busy="true"
        >
            <div className="absolute inset-0 bg-gradient-to-br from-[#8b5cf6] to-[#6b28b8]" />

            <div className="relative flex flex-col items-center gap-4">
                {/* Outer pulse ring */}
                <div className="relative flex items-center justify-center">
                    <div className="absolute rounded-full w-36 h-36 bg-white/6 animate-pulse" />
                    <div className="absolute rounded-full w-28 h-28 border-2 border-white/40" />
                    <div className="rounded-full w-12 h-12 bg-white flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-[#8b5cf6]" />
                    </div>
                </div>

                {label && <div className="text-sm text-white/90">{label}</div>}
            </div>
        </div>
    );
}
