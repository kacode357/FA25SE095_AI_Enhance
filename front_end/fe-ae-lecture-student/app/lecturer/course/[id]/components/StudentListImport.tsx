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
import { useCourseEnrollments } from "@/hooks/course/useCourseEnrollments";
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
    const { data, loading, fetchEnrollments } = useCourseEnrollments();
    const { unenrollStudent, loading: unenrolling } = useUnenrollStudent();

    useEffect(() => {
        if (courseId) {
            fetchEnrollments(courseId);
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
            fetchEnrollments(courseId);
        }
    };

    const students = data?.enrollments || [];

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
                                <TableHead className="text-center min-w-[140px]">
                                    Student Name
                                </TableHead>
                                <TableHead className="text-center w-[150px]">Joined At</TableHead>
                                <TableHead className="text-center w-[150px]">
                                    Unenrolled At
                                </TableHead>
                                <TableHead className="text-center w-[110px]">Status</TableHead>
                                <TableHead className="text-center min-w-[120px]">Reason</TableHead>
                                <TableHead className="text-center w-20">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {students.map((s, i) => (
                                <TableRow key={s.id} className="border-0">
                                    <TableCell className="text-center text-slate-500">
                                        {i + 1}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-800">
                                        {s.studentName}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {formatDate(s.joinedAt)}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {formatDate(s.unenrolledAt)}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(s.status as EnrollmentStatus)}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {s.unenrollmentReason || "-"}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {s.status === EnrollmentStatus.Active ? (
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <button
                                                        className="p-2 rounded-md hover:bg-red-50 text-red-600"
                                                        title="Unenroll student"
                                                    >
                                                        <UserMinus size={18} />
                                                    </button>
                                                </AlertDialogTrigger>

                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>
                                                            Unenroll {s.studentName}?
                                                        </AlertDialogTitle>
                                                        <AlertDialogDescription className="flex gap-2 items-start text-yellow-600">
                                                            <span className="flex gap-2 items-center text-xs"><TriangleAlert className="size-4" />This action cannot be undone. Remove this student from the course.</span>
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>

                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            variant="destructive"
                                                            onClick={() =>
                                                                handleUnenroll(s.studentId)
                                                            }
                                                        >
                                                            Unenroll
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">-</span>
                                        )}
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
