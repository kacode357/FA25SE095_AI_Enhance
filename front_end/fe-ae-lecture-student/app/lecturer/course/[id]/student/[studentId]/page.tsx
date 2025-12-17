"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; // Bỏ CardTitle ở đây để custom
import { Skeleton } from "@/components/ui/skeleton";
import { useEnrollmentStudent } from "@/hooks/enrollments/useEnrollmentStudent";
import { cn } from "@/lib/utils"; // Giả sử bạn có utility này từ shadcn
import { formatToVN } from "@/utils/datetime/time";
import {
    Activity,
    ArrowLeft,
    BadgeCheck,
    CalendarDays,
    Crown,
    Mail,
    User,
    Users
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function StudentDetailPage() {
    const params = useParams() as { id?: string; studentId?: string };
    const router = useRouter();
    const courseId = params?.id ?? "";
    const studentId = params?.studentId ?? "";

    const { loading, student, fetchCourseStudent } = useEnrollmentStudent();
    const didFetchRef = useRef(false);

    useEffect(() => {
        if (!courseId || !studentId) return;
        if (didFetchRef.current) return;
        didFetchRef.current = true;
        fetchCourseStudent(courseId, studentId);
    }, [courseId, studentId, fetchCourseStudent]);

    const goBack = () => router.back();

    // Helper để lấy màu badge trạng thái (Tuỳ chỉnh theo logic business của bạn)
    const getStatusColor = (status: string | undefined) => {
        const s = status?.toLowerCase();
        if (s === 'active') return "bg-green-100 text-green-700 border-green-200";
        if (s === 'inactive' || s === 'dropped') return "bg-red-100 text-red-700 border-red-200";
        return "bg-slate-100 text-slate-700 border-slate-200";
    };

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            {/* Header Navigation */}
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={goBack}
                    className="group flex items-center gap-2 pl-0 hover:pl-2 transition-all text-slate-500 hover:text-violet-900 hover:bg-transparent"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span className="font-medium">Back to Students List</span>
                </Button>
            </div>

            <div className="grid gap-6">
                {/* Main Card */}
                <Card className="overflow-hidden border-slate-200 shadow-sm">
                    {/* Header Background Pattern (Optional decoration) */}
                    <div className="h-24 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-b border-slate-100" />

                    <div className="px-6 pb-6 -mt-12">
                        {/* Profile Identity Section */}
                        <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
                            {/* Avatar */}
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl bg-white p-1 shadow-sm border border-slate-100">
                                    <div className="w-full h-full rounded-xl bg-violet-100 flex items-center justify-center text-violet-600 text-3xl font-bold uppercase">
                                        {loading ? (
                                            <Skeleton className="w-full h-full rounded-xl" />
                                        ) : (
                                            student?.studentName?.charAt(0) || "?"
                                        )}
                                    </div>
                                </div>
                                {/* Leader Badge Overlay */}
                                {student?.isGroupLeader && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 p-1.5 rounded-full shadow-sm border-2 border-white" title="Group Leader">
                                        <Crown className="w-4 h-4 fill-yellow-900" />
                                    </div>
                                )}
                            </div>

                            {/* Name & Email */}
                            <div className="flex-1 space-y-1 mb-1">
                                {loading ? (
                                    <div className="space-y-2">
                                        <Skeleton className="w-48 h-8" />
                                        <Skeleton className="w-32 h-4" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center gap-3 flex-wrap">
                                            <h1 className="text-2xl font-bold text-slate-900">
                                                {student?.studentName ?? "Unknown Student"}
                                            </h1>
                                            <div className="text-blue-500">
                                                <BadgeCheck className="size-5" />
                                            </div>
                                        </div>
                                        <div className="flex items-center text-slate-500 gap-2 text-sm font-medium">
                                            <Mail className="w-4 h-4" />
                                            {student?.email}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-slate-100 my-6" />

                        {/* Details Grid */}
                        <CardContent className="p-0">
                            {loading ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full rounded-lg" />)}
                                </div>
                            ) : !student ? (
                                <div className="text-center py-8 text-slate-500">
                                    Student details not found.
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Item 1: Enrollment Date */}
                                    <DetailItem
                                        icon={<CalendarDays className="w-5 h-5 text-blue-600" />}
                                        label="Enrolled Date"
                                        value={formatToVN(student.enrolledAt)}
                                        bgColor="bg-blue-50"
                                    />

                                    {/* Item 2: Group Info */}
                                    <DetailItem
                                        icon={<Users className="w-5 h-5 text-violet-600" />}
                                        label="Group"
                                        value={student.groupName || "Not assigned"}
                                        // subValue={student.groupName ? "Active Member" : "Pending Assignment"}
                                        bgColor="bg-violet-50"
                                    />

                                    {/* Item 3: Role / Leader Status */}
                                    <DetailItem
                                        icon={student.isGroupLeader ? <Crown className="w-5 h-5 text-yellow-600" /> : <User className="w-5 h-5 text-slate-600" />}
                                        label="Role in Group"
                                        value={student.isGroupLeader ? "Group Leader" : "Student Member"}
                                        bgColor={student.isGroupLeader ? "bg-yellow-50" : "bg-slate-100"}
                                    />

                                    {/* Item 4: Status Check */}
                                    <DetailItem
                                        icon={<Activity className="w-5 h-5 text-emerald-600" />}
                                        label="Current Status"
                                        value={
                                            <span
                                                className={
                                                    student.status === "Active"
                                                        ? "text-emerald-600 font-semibold"
                                                        : "text-muted-foreground"
                                                }
                                            >
                                                {student.status || "Unknown"}
                                            </span>
                                        }
                                        bgColor="bg-emerald-50"
                                    />
                                </div>
                            )}
                        </CardContent>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function DetailItem({ icon, label, value, subValue, bgColor }: { icon: React.ReactNode, label: string, value: string | React.ReactNode, subValue?: string, bgColor: string }) {
    return (
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", bgColor)}>
                {icon}
            </div>
            <div>
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
                <div className="font-semibold text-slate-900">{value}</div>
                {subValue && <p className="text-xs text-slate-400 mt-0.5">{subValue}</p>}
            </div>
        </div>
    );
}