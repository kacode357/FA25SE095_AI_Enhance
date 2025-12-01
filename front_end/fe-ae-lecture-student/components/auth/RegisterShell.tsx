"use client";

import LogoLoader from "@/components/common/logo-loader";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import React from "react";
import Logo from "../logo/Logo";
import { useAuthLoading } from "./AuthLoadingProvider";

type Props = {
    title: string;
    subtitle?: string | React.ReactNode;
    children: React.ReactNode;
    footer?: React.ReactNode;
};

// RegisterShell: a wider AuthShell variant used only for the register page
export default function RegisterShell({ title, subtitle, children, footer }: Props) {
    const pathname = usePathname();
    const isLogin = pathname?.startsWith("/login");
    const isRegister = pathname?.startsWith("/register");
    const { loading } = useAuthLoading();

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#ffd1e6] via-[#cda2ff] to-[#8b5cf6] flex items-center justify-center p-8">
            {/* Increase max width so registration form can be laid out more horizontally */}
            <div className="w-full max-w-7xl rounded-2xl shadow-2xl bg-white overflow-hidden flex flex-col md:flex-row transform scale-90 origin-top-center">
                {/* Left decorative area (same as AuthShell) */}
                <div className="hidden md:block md:w-2/5 lg:w-2/5 relative bg-gradient-to-br from-[#ffffff] to-[#fff6fb]">
                    <div className="absolute inset-0">
                        <div className="absolute -left-24 -top-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#6b28b8] to-[#ff6aa3] opacity-20 blur-3xl" />
                        <div className="absolute -right-36 top-20 w-[360px] h-[360px] rounded-full bg-gradient-to-br from-[#ffd24d] to-[#ff8a00] opacity-20 blur-3xl" />
                        <div className="absolute left-12 bottom-12 w-[220px] h-[220px] rounded-full bg-white/80 shadow-inner" />
                    </div>

                    <div className="relative h-full flex items-center justify-center p-8">
                        <div className="relative w-full h-full">
                            <div className="absolute -right-10 bottom-14 w-72 h-72 rounded-full p-1 bg-gradient-to-br from-[#6b28b8] via-[#ff4b9b] to-[#ff7a59] shadow-xl">
                                <div className="w-full h-full rounded-full bg-white/90" />
                            </div>

                            <div className="absolute -left-20 -top-16 w-56 h-56 rounded-full p-1 bg-gradient-to-br from-[#8b5cf6] via-[#c084fc] to-[#ff6aa3] opacity-95 shadow-md">
                                <div className="w-full h-full rounded-full bg-white/90" />
                            </div>

                            <div className="absolute left-12 top-32 w-28 h-28 rounded-full p-1 bg-gradient-to-br from-[#ffd24d] to-[#ff6aa3] opacity-90 shadow-lg">
                                <div className="w-full h-full rounded-full bg-white/95" />
                            </div>

                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute -left-24 -top-24 w-[420px] h-[420px] rounded-full bg-gradient-to-br from-[#6b28b8] to-[#ff6aa3] opacity-10 blur-3xl" />
                                <div className="absolute -right-36 top-20 w-[360px] h-[360px] rounded-full bg-gradient-to-br from-[#ffd24d] to-[#ff8a00] opacity-10 blur-3xl" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right form area: make it wider than default AuthShell so content can use horizontal space */}
                <div className="w-full md:w-1/2 lg:w-3/5 p-8 md:px-12 md:py-8">
                    <div className="max-w-2xl mx-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
                            <div className="flex-1">
                                <h2 className="text-2xl font-semibold text-slate-900 mb-1">{title}</h2>
                                {subtitle && <div className="text-sm text-slate-600">{subtitle}</div>}
                            </div>

                            <div className="flex-none ml-4">
                                <Logo />
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-md">{children}</div>

                        {footer && <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>}
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {loading && (
                    <motion.div
                        key="auth-loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
                        role="alert"
                        aria-live="assertive"
                        aria-busy="true"
                    >
                        <div className="flex flex-col items-center gap-3">
                            <LogoLoader size={40} />
                            <div className="text-sm text-white">Loading…</div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
