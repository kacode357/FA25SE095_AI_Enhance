"use client";

import { Card } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@/hooks/auth/useLogout";
import { useMyCourseRequests } from "@/hooks/course-request/useMyCourseRequests";
import { CircleArrowOutUpRight, EllipsisVertical, GitPullRequest, LayoutGrid, PanelLeftOpen, PanelRightOpen, Sparkles, Upload, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    // counts for requests badge
    const { listData: reqs } = useMyCourseRequests();
    const requestsCount = useMemo(() => (reqs ?? []).length, [reqs]);
    const { logout } = useLogout();

    const isImport = pathname?.includes("/lecturer/course/import");
    const isRequests = pathname?.includes("/lecturer/course/requests");
    // Treat any /lecturer/course/* (except requests/import) as part of All Courses section
    const isAllCourses = pathname?.startsWith("/lecturer/course") && !isRequests && !isImport;

    const sidebarWidth = collapsed ? "w-[72px]" : "w-[270px]";
    const contentPadding = collapsed ? "pl-[72px]" : "pl-[270px]";

    return (
        <div className="relative">
            {/* ======== Left Sidebar (single, collapsible) ======== */}
            <aside className={`fixed left-0 top-16 bottom-0 ${sidebarWidth} z-20 overflow-y-auto border-r border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 transition-[width] duration-200`}>
                <div className="h-full px-2 py-2 flex flex-col gap-3">
                    {/* Navigation */}
                    <Card className="p-3 gap-5 border-slate-200">
                        <div className="flex items-center justify-between text-slate-800">
                            <div className="flex items-center gap-2">
                                {!collapsed && (
                                    <>
                                        <Sparkles className="size-4 text-brand" />
                                        <h2 className="text-sm font-semibold">Menu</h2>
                                    </>
                                )}
                            </div>
                            <button
                                aria-label="Toggle sidebar"
                                className="rounded-md hover:bg-slate-100 text-slate-600"
                                onClick={() => setCollapsed((v) => !v)}
                            >
                                {collapsed ? <PanelLeftOpen className="size-5" color="#8851c2" /> : <PanelRightOpen className="size-5" color="#8851c2" />}
                            </button>
                        </div>
                        <nav aria-label="Sidebar" className="-mx-1">
                            <ul className="space-y-2">
                                {/* All Courses */}
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/lecturer/course")}
                                        className={`group w-full rounded-md px-2.5 py-2 text-sm flex items-center gap-2 transition ${isAllCourses
                                            ? "bg-brand/10 text-brand ring-1 ring-brand/20"
                                            : "text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        <LayoutGrid className={`size-4 transition-colors ${isAllCourses ? "text-brand" : "text-slate-400 group-hover:text-slate-600"}`} />
                                        <span className={`${collapsed ? "hidden" : "flex-1 text-left"}`}>All Courses</span>
                                    </button>
                                </li>
                                
                                {/* Course Request */}
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/lecturer/course/requests")}
                                        className={`group w-full rounded-md px-2.5 py-2 text-sm flex items-center gap-2 transition ${isRequests
                                            ? "bg-brand/10 text-brand ring-1 ring-brand/20"
                                            : "text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        <GitPullRequest className={`size-4 transition-colors ${isRequests ? "text-brand" : "text-slate-400 group-hover:text-slate-600"}`} />
                                        <span className={`${collapsed ? "hidden" : "flex-1 text-left"}`}>Course Request</span>
                                        {!collapsed && requestsCount > 0 && (
                                            <span className="ml-2 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-700">
                                                {requestsCount}
                                            </span>
                                        )}
                                    </button>
                                </li>
                                {/* Import enrollments */}
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/lecturer/course/import")}
                                        className={`group w-full rounded-md px-2.5 py-2 text-sm flex items-center gap-2 transition ${isImport
                                            ? "bg-brand/10 text-brand ring-1 ring-brand/20"
                                            : "text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        <Upload className={`size-4 transition-colors ${isImport ? "text-brand" : "text-slate-400 group-hover:text-slate-600"}`} />
                                        <span className={`${collapsed ? "hidden" : "flex-1 text-left"}`}>Import enrollments</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </Card>

                    {/* Lecturer profile */}
                    <Card className="px-3 py-3 border-none shadow-none mt-auto bg-white/95">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                            <div className={`${collapsed ? "mx-auto" : ""} relative`}>
                                <div className="h-12 w-12 rounded-full ring-2 ring-white shadow-md bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white grid place-items-center font-semibold text-sm">
                                    {(() => {
                                        const fn = (user?.firstName || "").trim();
                                        const ln = (user?.lastName || "").trim();
                                        const a = fn.charAt(0) || user?.email?.charAt(0) || "?";
                                        const b = ln.charAt(0) || fn.charAt(1) || "";
                                        return (a + b).toUpperCase();
                                    })()}
                                </div>
                            </div>

                            <div className={`min-w-0 ${collapsed ? "hidden" : ""}`}>
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <div className="text-sm font-semibold text-slate-800 truncate">
                                            {(() => {
                                                const fn = (user?.firstName || "").trim();
                                                const ln = (user?.lastName || "").trim();
                                                const name = [fn, ln].filter(Boolean).join(" ");
                                                return name || (user as any)?.name || user?.email || "Lecturer";
                                            })()}
                                        </div>
                                        <div className="text-xs text-yellow-600 truncate">{user?.email || "—"}</div>
                                    </div>

                                    <div className="flex items-center gap-1 ml-2">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button
                                                    type="button"
                                                    aria-label="Open user menu"
                                                    className="p-1 rounded-md hover:bg-slate-100 text-slate-600"
                                                >
                                                    <EllipsisVertical className="size-4" />
                                                </button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent side="bottom" align="end" sideOffset={6} className="z-50 border-slate-200">
                                                <DropdownMenuItem onClick={() => router.push('/lecturer/profile/my-profile')}>
                                                    <User className="size-4 mr-1.5" />
                                                    Profile
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => logout()}>
                                                    <CircleArrowOutUpRight className="size-3.5 mr-2" />
                                                    Logout
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                    </Card>
                </div>
            </aside>

            {/* ======== Right content area ======== */}
            <div className={`${contentPadding} bg-slate-50 h-[calc(100vh-4rem)] overflow-hidden transition-[padding] duration-200`}>
                <div className="flex h-full flex-col bg-slate-50">
                    {children}
                </div>
            </div>
        </div>
    );
}
