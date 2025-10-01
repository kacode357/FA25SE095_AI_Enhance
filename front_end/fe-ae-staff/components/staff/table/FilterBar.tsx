"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FilterBarProps { children: ReactNode; right?: ReactNode; }
export function FilterBar({ children, right }: FilterBarProps){
  return (
    <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y:0 }} className="flex flex-wrap items-center gap-2 justify-between border-b bg-slate-50 border-slate-200 px-3 py-2">
      <div className="flex flex-wrap gap-2 items-center">{children}</div>
      {right && <div className="flex items-center gap-2">{right}</div>}
    </motion.div>
  );
}
