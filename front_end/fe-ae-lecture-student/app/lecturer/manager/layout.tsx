"use client";

import RoleGate from "@/components/auth/RoleGate";
import { UserRole } from "@/config/user-role";
import { motion } from "framer-motion";
import ManagerHeader from "../components/header";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleGate allow={[UserRole.Lecturer]}>
      <div className="min-h-screen flex flex-col bg-white">
        {/* Top header with navigation */}
        <ManagerHeader />

        {/* Main content */}
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
    </RoleGate>
  );
}
