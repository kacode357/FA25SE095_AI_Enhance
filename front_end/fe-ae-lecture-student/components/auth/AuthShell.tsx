// components/auth/AuthShell.tsx
"use client";

import LogoLoader from "@/components/common/logo-loader";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
// Use the static logo file from `public/logo-aids-lms.svg` instead of the Logo component
import { useAuthLoading } from "./AuthLoadingProvider";

type Props = {
  title: string;
  subtitle?: string | React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export default function AuthShell({ title, subtitle, children, footer }: Props) {
  const { loading } = useAuthLoading();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#ffd1e6] via-[#cda2ff] to-[#8b5cf6] flex items-center justify-center p-4">
      
      {/* ✅ CHANGE 1: Giảm max-w-5xl xuống max-w-4xl cho gọn (khoảng 900px) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-4xl rounded-2xl shadow-2xl bg-white overflow-hidden flex flex-col md:flex-row min-h-[500px]"
      >
        
        {/* Left decorative area */}
        <div className="hidden md:block md:w-1/2 relative bg-gradient-to-br from-[#ffffff] to-[#fff6fb] overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute inset-0">
            <div className="absolute -left-24 -top-24 w-[380px] h-[380px] rounded-full bg-gradient-to-br from-[#6b28b8] to-[#ff6aa3] opacity-20 blur-3xl" />
            <div className="absolute -right-36 top-20 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-[#ffd24d] to-[#ff8a00] opacity-20 blur-3xl" />
          </div>

          {/* Decorative gradient rings - Scale down slightly for smaller card */}
          <div className="relative h-full flex items-center justify-center">
            <div className="relative w-full h-full">
              {/* Large bottom-right ring */}
              <div className="absolute -right-16 bottom-10 w-64 h-64 rounded-full p-1 bg-gradient-to-br from-[#6b28b8] via-[#ff4b9b] to-[#ff7a59] shadow-xl">
                <div className="w-full h-full rounded-full bg-white/90 backdrop-blur-sm" />
              </div>

              {/* Medium top-left ring */}
              <div className="absolute -left-12 -top-10 w-48 h-48 rounded-full p-1 bg-gradient-to-br from-[#8b5cf6] via-[#c084fc] to-[#ff6aa3] opacity-95 shadow-md">
                <div className="w-full h-full rounded-full bg-white/90 backdrop-blur-sm" />
              </div>

              {/* Small accent ring */}
              <div className="absolute left-16 top-32 w-24 h-24 rounded-full p-1 bg-gradient-to-br from-[#ffd24d] to-[#ff6aa3] opacity-90 shadow-lg">
                <div className="w-full h-full rounded-full bg-white/95" />
              </div>
            </div>
          </div>
        </div>

        {/* Right form area */}
        <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center bg-white relative">
          
          <div className="absolute top-6 right-6">
            <div className="h-12 w-12 overflow-hidden rounded-md bg-white/0">
              <img
                src="/logo-aids-lms.svg"
                alt="AIDS-LMS"
                className="h-full w-full object-contain block"
                loading="eager"
              />
            </div>
          </div>

          {/* ✅ CHANGE 2: Căn chỉnh container nội dung */}
          <div className="w-full max-w-[360px] mx-auto mt-8 md:mt-0">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Welcome to <span className="text-violet-600">AIDS-LMS!</span>
            </h2>
            
            {subtitle && (
              <div className="text-sm text-slate-500 mb-8">
                {subtitle}
              </div>
            )}

            {/* ✅ CHANGE 3: Bỏ cái card bao ngoài (bg-white shadow) để form nằm phẳng, đẹp hơn */}
            <div className="space-y-4">
              {children}
            </div>

            {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
          </div>
        </div>
      </motion.div>

      {/* Full-screen auth loading overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            key="auth-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-2xl shadow-lg">
              <LogoLoader size={40} />
              <div className="text-sm font-medium text-slate-600">Authentication...</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}