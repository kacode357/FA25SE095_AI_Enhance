"use client";

import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-dvh flex flex-row items-center justify-center gap-8 text-white px-6
                    bg-gradient-to-r from-green-800 via-gray-900 to-gray-via-gray-900">
            {/* Logo */}
            <div className="flex items-center justify-center relative w-64 h-64">
                <Image
                    src="/ai-enhance-logo.svg"
                    alt="AI Enhance"
                    fill
                    className="opacity-90 object-contain"
                    priority
                />
            </div>

            {/* Divider */}
            <div className="h-56 border-l border-white/30" />

            {/* Text */}
            <div className="text-center max-w-md">
                <h1 className="text-2xl font-semibold">Page not found</h1>
                <p className="mt-2 text-white/70">
                    The page you’re looking for doesn’t exist or has been moved.
                </p>
                <Link href="/" className="btn btn-primary mt-6 inline-block">
                    Go home
                </Link>
            </div>
        </div>
    );
}
