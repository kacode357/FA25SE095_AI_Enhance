"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import ManagerHeader from "./components/header";
import ManagerSidebar from "./components/sidebar";

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen flex bg-white">
            {/* Sidebar: desktop fixed */}
            <aside
                className={`fixed left-0 top-0 bottom-0 z-40 hidden sm:block border-r border-gray-200 bg-white transition-all duration-300 ${collapsed ? "w-16" : "w-64"
                    }`}
            >
                <ManagerSidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            </aside>

            {/* Mobile drawer */}
            <div
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 sm:hidden transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
                role="dialog"
                aria-modal="true"
            >
                <ManagerSidebar collapsed={false} setCollapsed={() => { }} />
            </div>

            {/* Backdrop for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 sm:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main content */}
            <div
                className={`flex-1 w-full flex flex-col min-h-screen bg-white transition-all duration-300 ${collapsed ? "sm:ml-16" : "sm:ml-64"
                    }`}
            >
                <div
                    className={`fixed top-0 right-0 z-50 h-16 bg-white/80 border-b border-gray-200 supports-[backdrop-filter]:backdrop-blur-md transition-all duration-300 ${collapsed ? "sm:left-16" : "sm:left-64"
                        }`}
                >
                    <ManagerHeader onMenuClick={() => setSidebarOpen(true)} />
                </div>

                <main className="flex-1 mt-20 overflow-y-auto bg-white">
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
