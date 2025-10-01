"use client";
import { motion } from "framer-motion";

export function FormHeading({ title, description }: { title: string; description?: string }){
  return (
    <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} transition={{ duration:.35 }} className="space-y-1 mb-6">
      <h1 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h1>
      {description && <p className="text-sm text-slate-600 leading-relaxed max-w-prose">{description}</p>}
    </motion.div>
  );
}
