"use client";

import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Sparkles, Upload } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();

    const isImport = pathname?.includes("/lecturer/manager/course/import");
    const isCourses = pathname === "/lecturer/manager/course" || (!isImport && pathname?.startsWith("/lecturer/manager/course"));

    return (
        <div className="relative">
            {/* ======== Left Sidebar ======== */}
            <aside className="fixed left-0 top-16 bottom-0 w-[270px] z-20 overflow-y-auto border-r border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90">
                <div className="h-full px-2 py-2 flex flex-col gap-3">
                    {/* Navigation */}
                    <Card className="p-3 gap-5 border-slate-200">
                        <div className=" flex items-center gap-2 text-slate-800">
                            <Sparkles className="size-4 text-brand" />
                            <h2 className="text-sm font-semibold">Menu</h2>
                        </div>
                        <nav aria-label="Sidebar" className="-mx-1">
                            <ul className="space-y-1">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/lecturer/manager/course")}
                                        className={`group w-full rounded-md px-2.5 py-2 text-sm flex items-center gap-2 transition ${isCourses
                                                ? "bg-brand/10 text-brand ring-1 ring-brand/20"
                                                : "text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        <BookOpen
                                            className={`size-4 transition-colors ${isCourses ? "text-brand" : "text-slate-400 group-hover:text-slate-600"
                                                }`}
                                        />
                                        <span className="flex-1 text-left">Manager Courses</span>
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() => router.push("/lecturer/manager/course/import")}
                                        className={`group w-full mt-3 rounded-md px-2.5 py-2 text-sm flex items-center gap-2 transition ${isImport
                                                ? "bg-brand/10 text-brand ring-1 ring-brand/20"
                                                : "text-slate-700 hover:bg-slate-100"
                                            }`}
                                    >
                                        <Upload
                                            className={`size-4 transition-colors ${isImport ? "text-brand" : "text-slate-400 group-hover:text-slate-600"
                                                }`}
                                        />
                                        <span className="flex-1 text-left">Import enrollments</span>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </Card>

                    {/* Lecturer profile */}
                    <Card className="px-2 -py-1 border-none shadow-none mt-auto">
                        <div className="flex pt-2 items-center border-t border-slate-200 gap-3">
                            <div className="size-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white grid place-items-center font-semibold">
                                {(() => {
                                    const fn = (user?.firstName || "").trim();
                                    const ln = (user?.lastName || "").trim();
                                    const a = fn.charAt(0) || user?.email?.charAt(0) || "?";
                                    const b = ln.charAt(0) || fn.charAt(1) || "";
                                    return (a + b).toUpperCase();
                                })()}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-medium text-slate-800 truncate">
                                    {(() => {
                                        const fn = (user?.firstName || "").trim();
                                        const ln = (user?.lastName || "").trim();
                                        const name = [fn, ln].filter(Boolean).join(" ");
                                        return name || (user as any)?.name || user?.email || "Lecturer";
                                    })()}
                                </div>
                                <div className="text-xs text-slate-500 truncate">{user?.email || "—"}</div>
                            </div>
                        </div>
                    </Card>
                </div>
            </aside>

            {/* ======== Right content area ======== */}
            <div className="pl-[270px] bg-slate-50 h-[calc(100vh-4rem)] overflow-hidden">
                <div className="flex h-full flex-col bg-slate-50">
                    {children}
                </div>
            </div>
        </div>
    );
}
