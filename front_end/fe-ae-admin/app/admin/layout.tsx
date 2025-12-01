"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ManagerSidebar from "./components/layout/sidebar";

export default function ManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-white overflow-x-hidden">
      {/* Sidebar: desktop fixed */}
      <aside
        className={`fixed left-0 top-0 bottom-0 z-40 hidden sm:block border-r border-gray-200 bg-white transition-all duration-300 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        <ManagerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </aside>

      {/* Main content */}
      <div
        className={`flex-1 w-full flex flex-col min-h-screen bg-white transition-all duration-300 ${
          collapsed ? "sm:ml-20" : "sm:ml-64"
        }`}
      >
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
    </div>
  );
}
