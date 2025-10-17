"use client";

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
import { format } from "date-fns";
import { useEffect } from "react";

export default function StudentList({
    courseId,
    refreshSignal,
}: {
    courseId: string;
    refreshSignal: number;
}) {
    const { data, loading, fetchEnrollments } = useCourseEnrollments();

    useEffect(() => {
        if (courseId) {
            fetchEnrollments(courseId);
        }
    }, [courseId, refreshSignal]);

    const formatDate = (dateStr: string | null) =>
        !dateStr ? "-" : format(new Date(dateStr), "dd/MM/yyyy HH:mm");

    const getStatusBadge = (status: number) => {
        switch (status) {
            case 1:
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300">
                        Active
                    </Badge>
                );
            case 2:
                return (
                    <Badge className="bg-rose-100 text-rose-700 border-rose-300">
                        Unenrolled
                    </Badge>
                );
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    const students = data?.enrollments || [];

    return (
        <div>
            {loading ? (
                <div className="text-center text-slate-500 py-6">Loading...</div>
            ) : students.length === 0 ? (
                <div className="text-sm text-slate-500 py-4 text-center">
                    No students found. Use <b>Import Excel</b> to add students.
                </div>
            ) : (
                <div className="overflow-x-auto rounded-md border border-slate-200">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="text-center w-14">NO</TableHead>
                                <TableHead
                                    className="text-center min-w-[90px] max-w-[120px] truncate"
                                >
                                    Student ID
                                </TableHead>
                                <TableHead className="text-center min-w-[140px]">
                                    Student Name
                                </TableHead>
                                <TableHead className="text-center w-[110px]">Status</TableHead>
                                <TableHead className="text-center w-[150px]">Joined At</TableHead>
                                <TableHead className="text-center w-[150px]">
                                    Unenrolled At
                                </TableHead>
                                <TableHead className="text-center min-w-[120px]">Reason</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {students.map((s, i) => (
                                <TableRow key={s.id}>
                                    <TableCell className="text-center text-slate-500">
                                        {i + 1}
                                    </TableCell>
                                    <TableCell
                                        className="text-center text-slate-600 truncate max-w-[120px]"
                                        title={s.studentId}
                                    >
                                        {s.studentId}
                                    </TableCell>
                                    <TableCell className="font-medium text-slate-800">
                                        {s.studentName}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {getStatusBadge(s.status)}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {formatDate(s.joinedAt)}
                                    </TableCell>
                                    <TableCell className="text-center text-slate-600">
                                        {formatDate(s.unenrolledAt)}
                                    </TableCell>
                                    <TableCell className="text-slate-500 text-sm">
                                        {s.unenrollmentReason || "-"}
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
