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
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Info */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-teal-900 via-green-600 to-green-700">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-20 auth-grid-pattern" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full text-white">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-3" aria-label="AI-Driven DataSync Home">
            <Image src="/ai-enhance-logo.svg" alt="AI-Driven DataSync" width={32} height={32} priority />
            <span className="text-xl font-bold text-teal-50 tracking-tight">AI-Driven DataSync</span>
          </Link>

          {/* Main Content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-6">
                <span className="text-white/90 block">Intelligent Data</span>
                <span className="text-green-200 block">Collection System</span>
              </h1>
              <p className="text-lg text-white/70 leading-relaxed mb-8">
                Empower your digital marketing education with AI-driven insights and seamless data management.
              </p>
              
              {/* Feature highlights */}
              <div className="space-y-4">
                {[
                  { icon: "📊", text: "Smart Analytics Dashboard" },
                  { icon: "🎯", text: "Personalized Learning Paths" },
                  { icon: "🤖", text: "AI-Powered Insights" }
                ].map((feature, i) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-3 text-white/80"
                  >
                    <span className="text-2xl">{feature.icon}</span>
                    <span className="font-medium">{feature.text}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="text-sm text-white/50">
            © 2025 AI-Driven DataSync. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">        
        {/* Mobile Header */}
        <div className="lg:hidden p-6 border-b border-green-100 bg-white">
          <Link href="/" className="inline-flex items-center gap-3" aria-label="AI-Driven DataSync Home">
            <Image src="/ai-enhance-logo.svg" alt="AI-Driven DataSync" width={28} height={28} priority />
            <span className="text-lg font-bold tracking-tight text-slate-800">AI-Driven DataSync</span>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex justify-center p-6 border-b border-green-100 bg-white">
          <div className="flex items-center bg-green-50 rounded-full p-1">
            <Link
              href="/login"
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                isLogin 
                  ? "bg-white text-green-700 shadow-sm" 
                  : "text-green-600 hover:text-green-700"
              }`}
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                isRegister 
                  ? "bg-white text-green-700 shadow-sm" 
                  : "text-green-600 hover:text-green-700"
              }`}
            >
              Sign Up
            </Link>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">{title}</h2>
                {subtitle && (
                  <div className="text-slate-600">{subtitle}</div>
                )}
              </div>
              
              {children}
              
              {footer && (
                <div className="mt-8 text-center text-sm text-slate-600">{footer}</div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
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
              <div className="text-sm text-white/80">Processing...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
