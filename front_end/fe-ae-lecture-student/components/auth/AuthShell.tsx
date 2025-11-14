// components/auth/AuthShell.tsx
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
      {/* Decorative background shapes will remain from global styles */}

      <div className="relative z-10 mx-auto max-w-[1200px] px-6 sm:px-8 py-6 min-h-dvh flex flex-col">
        {/* compact header */}
        <header className="flex items-center justify-between gap-4 py-2">
          <Link href="/" className="inline-flex items-center gap-2" aria-label="AI Enhance Home">
            <div className="rounded-full bg-gradient-to-br from-[#f4a7df] to-[--brand] p-1">
              <Image src="/ai-enhance-logo.svg" alt="AI Enhance" width={28} height={28} priority />
            </div>
            <span className="font-semibold tracking-tight">AI Enhance</span>
          </Link>

          <nav aria-label="Auth navigation" className="flex items-center gap-2">
            <Link
              href="/login"
              className={`btn px-3 py-1 text-sm rounded-md ${isLogin ? "border-brand text-nav-active" : "btn-ghost text-nav"}`}
            >
              Login
            </Link>
            <Link
              href="/register"
              className={`btn px-3 py-1 text-sm rounded-md ${isRegister ? "border-brand text-nav-active" : "btn-ghost text-nav"}`}
            >
              Register
            </Link>
          </nav>
        </header>

        <main className="mx-auto w-full max-w-[1100px] grid grid-cols-12 gap-10 flex-1 items-center">
          {/* Left hero (visual emphasis) */}
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="hidden md:flex flex-col justify-center col-span-7 auth-hero"
          >
            <h1 className="hero-title text-slate-900">
              Real-time Data <span className="text-brand">Automation</span>
            </h1>
            <p className="mt-4 hero-sub max-w-prose">
              Streamline online data gathering and reporting for business students. Secure, fast, and elegant—powered by AI.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg">
              {["Secure", "Fast", "Reliable"].map((k, i) => (
                <motion.div
                  key={k}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.14 + i * 0.04 }}
                  className="glass-card p-4"
                >
                  <div className="text-sm text-slate-800">{k}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right form: glass card, centered on smaller screens */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: 0.05 }}
            className="flex items-center col-span-12 md:col-span-5"
          >
            <div className="glass-card w-full max-w-[520px] mx-auto p-6 sm:p-8">
              <div className="mb-5">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h2>
                  <div className="text-xs text-slate-500">{isLogin ? "Welcome back!" : "Welcome"}</div>
                </div>
                {subtitle && <div className="mt-1 text-sm text-slate-600">{subtitle}</div>}
              </div>

              {children}

              {footer && <div className="mt-6 text-center text-sm text-slate-600">{footer}</div>}
            </div>
          </motion.div>
        </main>

        <footer className="mt-6 text-center text-xs text-slate-500">
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
              <div className="text-sm text-slate-100">Processing…</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
