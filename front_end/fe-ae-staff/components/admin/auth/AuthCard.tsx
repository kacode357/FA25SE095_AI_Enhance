"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
  title: string;
  subtitle?: ReactNode;
  footer?: ReactNode;
  icon?: ReactNode;
}
export function AuthCard({ children, title, subtitle, footer, icon }: AuthCardProps){
  return (
    <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y:0 }} transition={{ duration: .4, ease: 'easeOut' }} className="relative w-full max-w-md mx-auto rounded-2xl border border-slate-200/70 bg-white/90 backdrop-blur-xl shadow-[0_6px_30px_-4px_rgba(0,0,0,0.08)] p-6 md:p-8">
      <div className="mb-6 space-y-2">
        <div className="flex items-center gap-3">
          {icon && <div className="shrink-0 text-slate-500">{icon}</div>}
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        </div>
        {subtitle && <div className="text-sm text-slate-600">{subtitle}</div>}
      </div>
      {children}
      {footer && <div className="mt-6 text-center text-xs text-slate-500">{footer}</div>}
    </motion.div>
  );
}
