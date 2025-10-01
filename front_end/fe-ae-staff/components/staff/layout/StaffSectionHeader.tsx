"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
  accent?: "sky" | "indigo" | "emerald";
}

// Slightly different styling from Admin: softer gradient edge + slimmer padding
export function StaffSectionHeader({ title, description, actions, accent = "sky" }: Props) {
  const accentRing = accent === 'indigo' ? 'ring-indigo-200 bg-indigo-50' : accent === 'emerald' ? 'ring-emerald-200 bg-emerald-50' : 'ring-sky-200 bg-sky-50';
  return (
    <motion.header
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="relative flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-lg border border-slate-200 bg-white/80 backdrop-blur px-4 py-3 overflow-hidden"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(circle_at_30%_40%,black,transparent)] bg-gradient-to-br from-sky-200 via-indigo-100 to-transparent" />
      <div className="relative space-y-1">
        <h1 className="text-base font-semibold text-slate-900 tracking-tight flex items-center gap-2">
          <span className={`inline-flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-medium ring-1 ${accentRing}`}>{title.charAt(0)}</span>
          <span>{title}</span>
        </h1>
        {description && (
          <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="relative flex items-center gap-2 flex-wrap">{actions}</div>}
    </motion.header>
  );
}
