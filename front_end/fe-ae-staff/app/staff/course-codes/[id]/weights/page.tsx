"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetCourseCodeById } from "@/hooks/course-code/useGetCourseCodeById";
import { useGetTopicWeightsByCourseCode } from "@/hooks/topic/useGetTopicWeightsByCourseCode";
import { formatToVN } from "@/utils/datetime/time";
// TopicWeight type no longer needed in this file
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import Button from "@/components/ui/button";
import { useDeleteTopicWeight } from "@/hooks/topic/useDeleteTopicWeight";
import { useUpdateTopicWeight } from "@/hooks/topic/useUpdateTopicWeight";
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    FileText,
    PencilLine,
    PieChart,
    TriangleAlert
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import ConfigureTopicWeightsButton from "./components/ConfigureTopicWeightsButton";

export default function WeightsPage() {
    const params = useParams();
    const courseCodeId = (params as any)?.id as string | undefined;
    const router = useRouter();
    const { data, loading, fetchByCourseCode } = useGetTopicWeightsByCourseCode();

    useEffect(() => {
        if (courseCodeId) fetchByCourseCode(courseCodeId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseCodeId]);

    const { data: courseCodeData, fetchCourseCodeById } = useGetCourseCodeById();

    useEffect(() => {
        if (courseCodeId) fetchCourseCodeById(courseCodeId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseCodeId]);

    // Delete / Update hooks and confirmation state
    const { loading: deleting, deleteTopicWeight } = useDeleteTopicWeight();
    const { updateTopicWeight } = useUpdateTopicWeight();
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const deletingItem = data ? data.find((it) => String(it.id) === String(confirmId)) : undefined;

    const handleRequestDelete = (id: string) => {
        setConfirmId(id);
    };

    const handleConfirmDelete = async () => {
        const id = confirmId;
        if (!id) return;
        const ok = await deleteTopicWeight(id);
        if (ok) {
            if (courseCodeId) fetchByCourseCode(courseCodeId);
        }
        setConfirmId(null);
    };

    const courseCodeName = courseCodeData?.code || (data && data.length > 0 ? data[0].courseCodeName : "Course Code");

    // Tính tổng % để hiển thị (Optional UX improvement)
    const totalWeight = useMemo(() => {
        return data ? data.reduce((acc, curr) => acc + (curr.weightPercentage || 0), 0) : 0;
    }, [data]);

    return (
        <div className="flex flex-col gap-4 p-6 max-w-7xl mx-auto">
            {/* --- HEADER SECTION --- */}
            <div className="flex flex-col gap-2">
                <div className="flex gap-5 items-center">
                    <Button
                        onClick={() => router.back()}
                            className="btn btn-green-slow rounded-full w-10 h-10 p-0 flex items-center justify-center hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 text-white" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                            Weighting Configuration
                        </h1>
                        <p className="text-muted-foreground mt-1 flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Configuration for Course Code: <span className="font-semibold text-violet-500 text-primary">{courseCodeName}</span>
                        </p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* --- MAIN CONTENT --- */}
            <Card className="shadow-sm border gap-0 border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b flex justify-between border-slate-200">
                    <div>
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex flex-col items-start gap-2 text-lg">
                                <div className="flex gap-2 items-center">
                                    <PieChart className="h-5 w-5 text-slate-500" />
                                    Weight Distribution:
                                    <Badge className={totalWeight === 100 ? "text-base text-emerald-700 bg-emerald-50" : "text-base text-amber-600 bg-amber-50"}>
                                        {totalWeight}%
                                    </Badge>
                                </div>
                            </CardTitle>
                        </div>

                        <div className="mt-2 text-sm text-muted-foreground">
                            Last updated: {data && data.length > 0 && data[0].updatedAt ? formatToVN(data[0].updatedAt) : 'N/A'}
                        </div>
                    </div>
                    {data && data.length > 0 ? (
                        <Button
                            className="btn btn-green-slow bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <PencilLine className="w-4 h-4 mr-2" />
                            Edit Configuration
                        </Button>
                    ) : (
                        <ConfigureTopicWeightsButton courseCodeId={courseCodeId} data={data} fetchByCourseCode={fetchByCourseCode} />
                    )}

                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-hidden">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead className="py-5 w-[250px] pl-3 font-semibold">Topic</TableHead>
                                    <TableHead className="py-5 font-semibold text-center">Weight</TableHead>
                                    <TableHead className="py-5 font-semibold">Description</TableHead>
                                    <TableHead className="py-5 font-semibold text-center w-[180px]">Configured At</TableHead>
                                    <TableHead className="py-5 font-semibold text-center w-[180px]">Updated At</TableHead>
                                    {/* <TableHead className="py-5 font-semibold text-center w-[180px]">Action</TableHead> */}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    // Skeleton Loading State
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-[50px] mx-auto" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        </TableRow>
                                    ))
                                )}

                                {!loading && data && data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                <FileText className="h-8 w-8 text-slate-300" />
                                                <p className="italic text-slate-400">No configuration found for this course.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {data && data.map((row) => (
                                    <TableRow key={row.id} className="group py-3 hover:bg-slate-50 transition-colors">
                                        <TableCell className="font-medium pl-3 py-3 text-slate-900">
                                            {row.topicName || row.topicId}
                                        </TableCell>

                                        <TableCell className="text-center py-3">
                                            <Badge
                                                variant="secondary"
                                                className="font-bold text-xs text-slate-700 bg-slate-100 group-hover:bg-white group-hover:border-slate-300 border border-transparent transition-all"
                                            >
                                                {row.weightPercentage}%
                                            </Badge>
                                        </TableCell>

                                        <TableCell className="text-slate-600 py-3 max-w-[400px] truncate text-xs" title={row.description ?? undefined}>
                                            {row.description || <span className="text-slate-400 italic">No description</span>}
                                        </TableCell>

                                        <TableCell className="text-slate-500 py-3 text-xs">
                                            <div className="flex justify-around py-3 text-center items-center">
                                                <CalendarDays className="h-3.5 w-3.5 text-slate-500" />
                                                {row.configuredAt ? formatToVN(row.configuredAt) : "-"}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-slate-500 py-3 text-center text-xs">
                                            {row.updatedAt ? formatToVN(row.updatedAt) : "-"}
                                        </TableCell>
{/* 
                                        <TableCell className="text-center py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-slate-200 btn btn-green-slow text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all"
                                                    onClick={() => router.push(`/staff/courses/topic-weights/${row.id}`)}
                                                >
                                                    <PencilLine className="w-3.5 h-3.5 mr-1" />Edit
                                                </Button>
                                            </div>
                                        </TableCell> */}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
                {/* Confirm Delete Dialog */}
                <AlertDialog
                    open={!!confirmId}
                    onOpenChange={(open) => {
                        if (!open) setConfirmId(null);
                    }}
                >
                    <AlertDialogContent className="bg-white border-white">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete this topic weight?</AlertDialogTitle>
                            <div className="mt-3">
                                <div className="bg-slate-50 p-4 rounded-md space-y-4 text-sm text-slate-700">
                                    <div>
                                        <span className="text-slate-900 font-semibold">Topic:</span>
                                        <span className="ml-2">{deletingItem?.topicName || "-"}</span>
                                    </div>
                                    {deletingItem?.courseCodeName && (
                                        <div>
                                            <span className="text-slate-900 font-semibold">Course Code:</span>
                                            <span className="ml-2">{deletingItem.courseCodeName}</span>
                                        </div>
                                    )}
                                    {deletingItem?.specificCourseName && (
                                        <div>
                                            <span className="text-slate-900 font-semibold">Specific Course:</span>
                                            <span className="ml-2">{deletingItem.specificCourseName}</span>
                                        </div>
                                    )}
                                    <div>
                                        <span className="text-slate-900 font-semibold">Weight:</span>
                                        <span className="ml-2">{deletingItem ? `${deletingItem.weightPercentage}%` : "-"}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-900 font-semibold">Description:</span>
                                        <span className="ml-2">{deletingItem ? `${deletingItem.description}` : "-"}</span>
                                    </div>
                                </div>

                                <p className="mt-3 mb-6 text-xs text-yellow-600">
                                    <em className="flex items-start gap-1"><TriangleAlert className="size-3.5" />This action can’t be undone. The topic weight will be permanently removed.</em>
                                </p>
                            </div>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                className="bg-red-600 hover:bg-red-700 cursor-pointer text-white"
                                onClick={handleConfirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting…" : "Delete"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </Card>
        </div>
    );
}
