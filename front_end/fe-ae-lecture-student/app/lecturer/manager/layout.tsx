"use client";

import Header from "@/app/student/components/header";
import { motion } from "framer-motion";
export default function ManagerLayout({ children }: { children: React.ReactNode }) {

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 overflow-y-auto bg-white pt-16">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="min-h-full bg-white"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
