"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useImportStudentTemplate } from "@/hooks/enrollments/useImportStudentTemplate";
import { FolderPlus, HardDriveDownload } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";

export default function CourseLayout({ children }: { children: React.ReactNode }) {
    const params = useParams() as { id: string };
    const { id } = params || {};
    const { data: course, loading, fetchCourseById } = useGetCourseById();

    useEffect(() => {
        if (id) fetchCourseById(id);
    }, [id, fetchCourseById]);

    const title = useMemo(() => {
        if (!course) return "";
        const code = course.courseCode ?? "";
        const codeTitle = course.courseCodeTitle ?? course.name ?? "";
        return `${code} — ${codeTitle}`;
    }, [course]);

        const router = useRouter();
        const pathname = usePathname();
        const { downloadTemplate, loading: downloading } = useImportStudentTemplate();

        function openAction(action: string) {
            // set query param ?action=...
            router.push(`${pathname}?action=${action}`);
        }

        return (
            <div className="p-3 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/manager/course">
                            <Button variant="ghost" className="h-8 px-2 cursor-pointer">
                                ←
                            </Button>
                        </Link>
                        <div>
                            <div className="text-sm text-slate-500">Course Detail</div>
                            {loading ? (
                                <div className="h-6 w-64 rounded bg-slate-100 animate-pulse" />
                            ) : (
                                <>
                                    <h1 className="text-lg font-semibold text-slate-800">{title}</h1>
                                    {course && (
                                        <div className="mt-1 flex flex-wrap items-center gap-2">
                                            {(course.term || course.year) && (
                                                <Badge className="text-[10px]">
                                                    {course.term}
                                                    {course.term && course.year ? " • " : ""}
                                                    {course.year}
                                                </Badge>
                                            )}
                                            {course.department && (
                                                <Badge variant="outline" className="text-[10px]">{course.department}</Badge>
                                            )}
                                            {course.lecturerName && (
                                                <Badge variant="secondary" className="text-[10px]">{course.lecturerName}</Badge>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center mr-8">
                        {/* Download Template */}
                        <button
                            onClick={() => downloadTemplate()}
                            disabled={downloading}
                            className="flex cursor-pointer items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 underline disabled:opacity-50"
                            title="Download Template"
                        >
                            <HardDriveDownload className="size-4 mr-1" />
                            {downloading ? "Downloading..." : "Download Template"}
                        </button>
                    </div>
                </div>

            <Card className="border border-slate-200 shadow-sm rounded-lg !p-0">
                <div className="px-4 py-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        <FolderPlus className="size-4 text-emerald-600" />
                        About This Course
                    </div>

                    <p className="text-sm text-slate-700 mt-2">{course?.description || "No description provided."}</p>
                </div>
            </Card>

            {/* render nested pages (tabs / group detail) */}
            {children}
        </div>
    );
}
