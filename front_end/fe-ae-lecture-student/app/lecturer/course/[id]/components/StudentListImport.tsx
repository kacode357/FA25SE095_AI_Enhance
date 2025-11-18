"use client";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
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
import { EnrollmentStatus } from "@/types/enrollments/enrollments.response";
import { format } from "date-fns";
import { TriangleAlert, UserMinus } from "lucide-react";
import { useEffect } from "react";

export default function StudentList({
    courseId,
    refreshSignal,
}: {
    courseId: string;
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
        !dateStr ? "-" : format(new Date(dateStr), "dd/MM/yyyy HH:mm");

    const getStatusBadge = (status: EnrollmentStatus) => {
        switch (status) {
            case EnrollmentStatus.Active:
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                        Active
                    </Badge>
                );
            case EnrollmentStatus.Inactive:
                return (
                    <Badge className="bg-rose-100 text-rose-700 border-rose-300">
                        Inactive
                    </Badge>
                );
            case EnrollmentStatus.Withdrawn:
                return (
                    <Badge className="bg-slate-100 text-slate-700 border-slate-300">
                        Withdrawn
                    </Badge>
                );
            case EnrollmentStatus.Suspended:
                return (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-300">
                        Suspended
                    </Badge>
                );
            case EnrollmentStatus.Completed:
                return (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-300">
                        Completed
                    </Badge>
                );
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

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

    return (
        <div className="-mt-10">
            <div className="text-sm flex justify-end mb-2 mt-6 mr-1 text-slate-500">{students.length} student(s)</div>
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
                                <TableHead className="text-center min-w-[120px]">
                                    Avatar
                                </TableHead>
                                <TableHead className="text-center min-w-[120px]">
                                    Student Name
                                </TableHead>
                                <TableHead className="text-center min-w-[140px]">
                                    Email
                                </TableHead>
                                <TableHead className="text-center w-[150px]">Student ID</TableHead>

                                <TableHead className="text-center w-[150px]">Joined At</TableHead>
                                {/* <TableHead className="text-center w-[110px]">Status</TableHead> */}
                                <TableHead className="text-center w-20">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {students.map((s, i) => (
                                <TableRow key={s.enrollmentId} className="border-0">
                                    <TableCell className="text-center text-slate-500">
                                        {i + 1}
                                    </TableCell>
                                    <TableCell className="text-center w-20 text-slate-600">
                                        {s.profilePictureUrl ? (
                                            <img
                                                src={s.profilePictureUrl}
                                                alt={s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()}
                                                className="inline-block w-8 h-8 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-violet-100 text-violet-700 font-medium">
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
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-800">
                                        {s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {s.email}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {s.studentIdNumber}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {formatDate(s.joinedAt)}
                                    </TableCell>
                                    {/* <TableCell className="text-center">
                                        {getStatusBadge(s.status as EnrollmentStatus)}
                                    </TableCell> */}
                                    <TableCell className="text-center">
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button
                                                    className="p-2 cursor-pointer rounded-md hover:bg-red-50 text-red-600"
                                                    title="Unenroll student"
                                                >
                                                    <UserMinus size={18} />
                                                </button>
                                            </AlertDialogTrigger>

                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle className="font-normal">
                                                        Unenroll <span className="font-bold">{s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()}</span> ?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription className="flex gap-2 items-start text-yellow-600">
                                                        <span className="flex gap-2 items-center text-xs"><TriangleAlert className="size-4" />This action cannot be undone. Remove this student from the course.</span>
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>

                                                <AlertDialogFooter>
                                                    <AlertDialogCancel className="border-slate-300 cursor-pointer">Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                        variant="destructive"
                                                        onClick={() =>
                                                            handleUnenroll(s.studentId)
                                                        }
                                                        className="cursor-pointer"
                                                    >
                                                        Unenroll
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}
