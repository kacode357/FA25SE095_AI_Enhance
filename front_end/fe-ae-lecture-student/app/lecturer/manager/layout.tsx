"use client";

import { motion } from "framer-motion";
import ManagerHeader from "../components/header";
import { useRoleGuard } from "@/components/auth/useRoleGuard";
import { UserRole } from "@/config/user-role";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const { allowed } = useRoleGuard(UserRole.Lecturer);

  if (!allowed) return null; // Không render gì, hook sẽ tự redirect nếu cần

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <ManagerHeader />
      <main className="flex-1 overflow-y-auto bg-white">
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
