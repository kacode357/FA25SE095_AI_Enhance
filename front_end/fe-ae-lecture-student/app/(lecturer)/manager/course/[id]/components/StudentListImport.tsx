"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function StudentList({ courseId }: { courseId: string }) {
    const { data, loading, fetchEnrollments } = useCourseEnrollments();

    useEffect(() => {
        if (courseId) {
            fetchEnrollments(courseId);
        }
    }, [courseId]);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "-";
        const date = new Date(dateStr);
        return format(date, "dd/MM/yyyy HH:mm");
    };

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
        <Card className="border-emerald-500">
            <CardHeader>
                <CardTitle className="text-base">Student List</CardTitle>
            </CardHeader>
            <CardContent>
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
                                    <TableHead className="text-center w-12">NO</TableHead>
                                    <TableHead className="text-center">Student ID</TableHead>
                                    <TableHead className="text-center">Student Name</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-center">Joined At</TableHead>
                                    <TableHead className="text-center">Unenrolled At</TableHead>
                                    <TableHead className="text-center">Reason</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {students.map((s, i) => (
                                    <TableRow key={s.id}>
                                        <TableCell className="text-center text-slate-500">
                                            {i + 1}
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-center">
                                            {s.studentId}
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-800">
                                            {s.studentName}
                                        </TableCell>
                                        <TableCell className="text-center">{getStatusBadge(s.status)}</TableCell>
                                        <TableCell className="text-slate-600 text-center">
                                            {formatDate(s.joinedAt)}
                                        </TableCell>
                                        <TableCell className="text-slate-600 text-center">
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
            </CardContent>
        </Card>
    );
}
