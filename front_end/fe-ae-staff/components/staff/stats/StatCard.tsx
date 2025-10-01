"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  delta?: string;
  subtle?: boolean;
}
export function StatCard({ label, value, icon, delta, subtle }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white p-4 flex flex-col gap-3 ${subtle ? "bg-slate-50" : ""}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</span>
        {icon && <span className="text-slate-400">{icon}</span>}
      </div>
      <div className="text-2xl font-semibold tracking-tight text-slate-900">{value}</div>
      {delta && (
        <span className={`text-xs font-medium ${delta.startsWith("-") ? "text-red-600" : "text-emerald-600"}`}>{delta}</span>
      )}
    </motion.div>
  );
}
