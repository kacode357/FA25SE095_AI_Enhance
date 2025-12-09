"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import Button from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
import { useUnenrollStudent } from "@/hooks/enrollments/useUnenrollStudent";
import { formatToVN } from "@/utils/datetime/time";
import { Eye, MessageSquare, MessageSquareDot, MoreHorizontalIcon, TriangleAlert, UserMinus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function StudentList({
    courseId,
    courseName,
    refreshSignal,
}: {
    courseId: string;
    courseName?: string;
    refreshSignal: number;
}) {
    const { students: courseStudents, loading, fetchCourseStudents } = useCourseStudents(courseId);
    const { unenrollStudent, loading: unenrolling } = useUnenrollStudent();

    useEffect(() => {
        if (courseId) {
            fetchCourseStudents(courseId);
        }
    }, [courseId, refreshSignal]);

    const formatDate = (dateStr: string | null) =>
        !dateStr ? "-" : formatToVN(dateStr);

    const handleUnenroll = async (studentId: string) => {
        const res = await unenrollStudent(
            { courseId, studentId },
            { reason: "Unenrolled by lecturer" }
        );

        if (res?.success) {
            fetchCourseStudents(courseId);
        }
    };

    const students = courseStudents || [];
    const [unenrollTarget, setUnenrollTarget] = useState<string | null>(null);
    const router = useRouter();

    return (
        <div className="-mt-9">
            <div className="flex justify-between">
                <Button
                    className="btn btn-gradient-slow text-xs w-24 h-10 text-white"
                    onClick={() => {
                        if (!courseId) return;
                        const qs = courseName ? `?courseName=${encodeURIComponent(courseName)}` : "";
                        router.push(`/lecturer/course/${courseId}/messages${qs}`);
                    }}
                >
                    <MessageSquareDot className="size-3.5" />CHAT
                </Button>
                <div className="text-sm flex justify-end mb-2 mt-6 mr-1 text-slate-500">{students.length} student(s)</div>
            </div>
            {loading ? (
                <div className="text-center text-slate-500 py-6">Loading...</div>
            ) : students.length === 0 ? (
                <div className="text-sm text-slate-500">
                    No students found. Use <b>Import Excel</b> to add students. This action is only available when the course is active.
                </div>
            ) : (
                <div className="overflow-x-auto overflow-y-auto max-h-[480px] rounded-md border border-slate-200">
                    <Table>
                        <TableHeader className="bg-slate-50 sticky top-0 z-20">
                            <TableRow className="border-b-slate-300">
                                <TableHead className="text-center w-14">NO</TableHead>
                                <TableHead className="text-left min-w-[140px] md:min-w-[160px]">
                                    Student
                                </TableHead>
                                <TableHead className="text-center w-[180px]">Student ID</TableHead>
                                <TableHead className="text-center w-[180px]">Joined At</TableHead>
                                <TableHead className="text-center w-[180px]">Status</TableHead>
                                <TableHead className="text-center w-20">Actions</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {students.map((s, i) => (
                                <TableRow key={s.enrollmentId} className="border-0">
                                    <TableCell className="text-center text-slate-500">
                                        {i + 1}
                                    </TableCell>
                                    <TableCell className="py-4 px-3 align-top">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-shrink-0">
                                                {s.profilePictureUrl ? (
                                                    <img
                                                        src={s.profilePictureUrl}
                                                        alt={s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 font-medium flex items-center justify-center">
                                                        {(() => {
                                                            const fn = (s.firstName ?? "").trim();
                                                            const ln = (s.lastName ?? "").trim();
                                                            if (fn && ln) return `${fn.charAt(0).toUpperCase()}${ln.charAt(0).toUpperCase()}`;
                                                            if (fn) return fn.charAt(0).toUpperCase();
                                                            if (ln) return ln.charAt(0).toUpperCase();
                                                            const full = (s.fullName ?? "").trim();
                                                            return (full ? full.charAt(0).toUpperCase() : "?");
                                                        })()}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <div className="font-medium text-slate-800 truncate">{s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()}</div>
                                                <div className="text-xs text-slate-500 truncate">{s.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {s.studentIdNumber}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {formatDate(s.joinedAt)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="bg-green-50 px-2 py-1 rounded-full text-green-500">{s.status}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <button className="p-1.5 rounded-md cursor-pointer bg-violet-50 hover:bg-slate-100 text-violet-600" title="Actions">
                                                    <MoreHorizontalIcon size={18} />
                                                </button>
                                            </DropdownMenuTrigger>

                                            <DropdownMenuContent className="border-white flex flex-col gap-2 shadow-md cursor-pointer -translate-x-10">
                                                <DropdownMenuItem className="cursor-pointer hover:bg-violet-50" onSelect={() => { /* details handler */ }}>
                                                    <Eye className="size-4 mr-2 text-violet-500" /> Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="cursor-pointer hover:bg-blue-50" onSelect={() => { /* message handler */ }}>
                                                    <MessageSquare className="size-4 mr-2 text-blue-500" /> Message
                                                </DropdownMenuItem>

                                                <DropdownMenuItem className="cursor-pointer hover:bg-red-50" onSelect={() => setUnenrollTarget(s.studentId)}>
                                                    <UserMinus className="size-4 mr-2 text-red-500 text-destructive" /> Unenroll
                                                </DropdownMenuItem>

                                                {/* AlertDialog moved out to top-level so it doesn't unmount when the menu closes */}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    {/* Top-level Unenroll AlertDialog (renders outside dropdown to avoid unmounting) */}
                    <AlertDialog open={!!unenrollTarget} onOpenChange={(open) => { if (!open) setUnenrollTarget(null); }}>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle className="font-normal">
                                    Unenroll <span className="font-bold">{students.find((x) => x.studentId === unenrollTarget)?.fullName ?? ""}</span> ?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="flex gap-2 items-start text-yellow-600">
                                    <span className="flex gap-2 items-center text-xs"><TriangleAlert className="size-4" />This action cannot be undone. Remove this student from the course.</span>
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel className="border-slate-300 cursor-pointer">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={async () => {
                                        if (!unenrollTarget) return;
                                        await handleUnenroll(unenrollTarget);
                                        setUnenrollTarget(null);
                                    }}
                                    className="cursor-pointer"
                                >
                                    Unenroll
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}
        </div>
    );
}
