"use client";
import { motion } from "framer-motion";
import { FileWarning } from "lucide-react";

export function EmptyState({ message = "No data" }: { message?: string }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-2 py-14 text-slate-500">
      <FileWarning className="w-6 h-6 text-slate-400" />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
}
