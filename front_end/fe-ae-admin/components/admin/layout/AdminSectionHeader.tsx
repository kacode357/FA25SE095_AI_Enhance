"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  actions?: ReactNode;
}
export function AdminSectionHeader({ title, description, actions }: Props) {
  return (
    <motion.header
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between rounded-md border border-slate-200 bg-white/70 backdrop-blur p-4"
    >
      <div className="space-y-1">
        <h1 className="text-lg font-semibold text-slate-900 tracking-tight">{title}</h1>
        {description && (
          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </motion.header>
  );
}
