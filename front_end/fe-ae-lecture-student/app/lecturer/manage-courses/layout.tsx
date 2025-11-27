"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function ManageCoursesLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || "";

    const isRequests = pathname === "/lecturer/manage-courses" || pathname.startsWith("/lecturer/manage-courses/requests");
    const isCreate = pathname.startsWith("/lecturer/manage-courses/create");
    const isSupport = pathname.startsWith("/lecturer/manage-courses/support-requests");

    return (
        <div>
            {/* Top navbar for manager area */}
            <div className="w-full bg-white border-b" style={{ borderColor: "var(--border)" }}>
                <div
                    className="mx-auto flex items-center gap-6 py-3 ml-30"
                    style={{ maxWidth: 1400, paddingLeft: "2rem", paddingRight: "1rem" }}
                >
                    <Link
                        href="/lecturer/manage-courses/requests"
                        className={`text-[13px] font-medium ${isRequests ? "text-gray-900 border-b-2 border-brand pb-1" : "text-gray-700 hover:text-gray-900"}`}
                    >
                        Course Request
                    </Link>

                    <Link
                        href="/lecturer/manage-courses/create"
                        className={`text-[13px] font-medium ${isCreate ? "text-gray-900 border-b-2 border-brand pb-1" : "text-gray-700 hover:text-gray-900"}`}
                    >
                        Create Course
                    </Link>

                    <Link
                        href="/lecturer/manage-courses/support-requests"
                        className={`text-[13px] font-medium ${isSupport ? "text-gray-900 border-b-2 border-brand pb-1" : "text-gray-700 hover:text-gray-900"}`}
                    >
                        Support Request
                    </Link>
                </div>
            </div>

            <main>{children}</main>
        </div>
    );
}
