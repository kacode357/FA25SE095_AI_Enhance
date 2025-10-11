"use client";

import LogoLoader from "@/components/common/logo-loader";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useAuthLoading } from "./AuthLoadingProvider";

type Props = {
  title: string;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: Props) {
  const pathname = usePathname();
  const isLogin = pathname?.startsWith("/login");
  const isRegister = pathname?.startsWith("/register");
  const { loading } = useAuthLoading();
  return (
    <div className="min-h-dvh relative isolate text-slate-800">
      <div className="auth-bg" />
      <div className="auth-grid" />

      <div className="relative z-10 mx-auto max-w-[1200px] px-5 sm:px-8 py-6 lg:py-8 min-h-dvh flex flex-col">
        <header className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="AI Enhance Home">
            <Image src="/ai-enhance-logo.svg" alt="AI Enhance" width={24} height={24} priority />
            <span className="font-semibold tracking-tight">AI Enhance</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className={`btn h-8 border-b-2 ${isLogin ? "border-emerald-400" : "border-transparent btn-ghost"
                }`}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={`btn h-8 border-b-2 ${isRegister ? "border-emerald-400" : "border-transparent btn-ghost"
                }`}
            >
              Register
            </Link>

          </div>
        </header>

        <main className="mx-auto grid w-full max-w-[1100px] grid-cols-12 gap-6 sm:gap-8 md:gap-24 flex-1 items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="hidden lg:flex flex-col justify-center col-span-6"
          >
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              <span className="text-slate-900">Real-time Data</span>{" "}
              <span className="text-[--color-brand]">Automation</span>
            </h1>
            <p className="mt-4 text-slate-600 max-w-prose">
              Streamline online data gathering and reporting for business students. Secure, fast, and elegant—powered by AI.
            </p>

            <div className="mt-8 md:mt-10 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
              {["Secure", "Fast", "Reliable"].map((k, i) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05 }}
                  className="card p-4"
                >
                  <div className="text-sm text-slate-700">{k}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
            className="flex items-center col-span-12 lg:col-span-6"
          >
            <div className="card w-full max-w-[520px] mx-auto p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
                {subtitle && (
                  <div className="mt-1 text-sm text-slate-600">{subtitle}</div>
                )}
              </div>
              {children}
              {footer && <div className="mt-5 text-center text-sm text-slate-600">{footer}</div>}
            </div>
          </motion.div>
        </main>

        <footer className="mt-5 sm:mt-5 text-center text-xs text-slate-500">
          © 2025 AI Enhance. All rights reserved.
        </footer>
      </div>

      {/* Full-screen auth loading overlay */}
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
              <div className="text-sm text-slate-700">Đang xử lý…</div>
              </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
