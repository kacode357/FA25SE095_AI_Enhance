"use client";

import { ListPlus, Wrench } from "lucide-react";
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
            {/* Top area header: title + action buttons per manager area */}
            <div className="w-full bg-slate-50" style={{ borderColor: "var(--border)" }}>
                <div
                    className="mx-auto flex items-center justify-between py-4"
                    style={{ maxWidth: 1400, paddingLeft: "2rem", paddingRight: "1rem" }}
                >
                    <div>
                        <h1 className="text-lg font-semibold text-slate-800">
                            {isCreate ? "Create Course" : isSupport ? "Support Requests" : "Course Requests"}
                        </h1>
                        <p className="text-sm text-slate-500 mt-1">{isCreate ? "Create a new course" : isSupport ? "Manage support requests for courses" : "Review and manage incoming course requests"}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Do not show action buttons on Create page */}
                        {!isCreate && (
                            <>
                                {isRequests && (
                                    <Link
                                        href="/lecturer/manage-courses/requests/create"
                                        className="inline-flex items-center btn btn-gradient-slow gap-2 bg-violet-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-violet-700"
                                    >
                                        <ListPlus className="size-4" />
                                        New Course Request
                                    </Link>
                                )}

                                {isSupport && (
                                    <Link
                                        href="/lecturer/manage-courses/support-requests/create"
                                        className="inline-flex items-center gap-2 btn btn-gradient-slow bg-violet-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-violet-700"
                                    >
                                        <Wrench className="size-4" />New Support Request
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Top navbar for manager area */}
            <div className="w-full bg-white border-b" style={{ borderColor: "var(--border)" }}>
                <div
                    className="mx-auto flex items-center gap-6 py-3"
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
