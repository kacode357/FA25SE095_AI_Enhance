"use client";

import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
    return (
        <div className="min-h-dvh bg-gradient-to-br from-indigo-50 via-white to-sky-50 text-nav flex items-center justify-center px-6">
            <div className="flex w-full max-w-5xl flex-col items-center gap-8 rounded-3xl border border-indigo-100 bg-white/80 p-8 shadow-lg backdrop-blur">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative h-20 w-20">
                        <Image
                            src="/short-logo-aids.png"
                            alt="AIDS-LMS"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-3xl font-semibold text-nav">Page not found</h1>
                    <p className="text-sm text-slate-600 text-center max-w-lg">
                        The page you're looking for doesn't exist or has been moved. Please return to the home page.
                    </p>
                </div>

                <Link href="/" className="btn btn-gradient px-6 py-3 text-sm">
                    Go home
                </Link>
            </div>
        </div>
    );
}
