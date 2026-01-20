"use client";

import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useGetCourseCodeById } from "@/hooks/course-code/useGetCourseCodeById";
// Import hook mới theo yêu cầu
import { useBulkUpdateTopicWeights } from "@/hooks/topic/useBulkUpdateTopicWeights";
import { useGetTopics } from "@/hooks/topic/useGetTopics";
import { useGetTopicWeightsByCourseCode } from "@/hooks/topic/useGetTopicWeightsByCourseCode";
import { BulkUpdateTopicWeightsPayload } from "@/types/topic/topic-weight.payload";
import { formatToVN } from "@/utils/datetime/time";
import {
    ArrowLeft,
    BookOpen,
    CalendarDays,
    FileText,
    History,
    PencilLine,
    PieChart
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ConfigureTopicWeightsButton from "./components/ConfigureTopicWeightsButton";
import ConfigureTopicWeightsDialog from "./components/ConfigureTopicWeightsDialog";

export default function WeightsPage() {
    const params = useParams();
    const courseCodeId = (params as any)?.id as string | undefined;
    const router = useRouter();
    const { user } = useAuth();

    // --- Data Fetching ---
    const { data, loading, fetchByCourseCode } = useGetTopicWeightsByCourseCode();
    const { data: courseCodeData, fetchCourseCodeById } = useGetCourseCodeById();
    const { data: topicsResp, fetchTopics } = useGetTopics();

    // --- Bulk Update Hook ---
    const { bulkUpdate, loading: bulkUpdating } = useBulkUpdateTopicWeights();

    useEffect(() => {
        if (courseCodeId) {
            fetchByCourseCode(courseCodeId);
            fetchCourseCodeById(courseCodeId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseCodeId]);

    // --- Edit Dialog State ---
    const topics = topicsResp?.topics || [];

    type EditRow = {
        topicId?: string | null;
        topicName?: string | null;
        weightPercentage?: number | null;
        description?: string | null;
    };

    const [editOpen, setEditOpen] = useState(false);
    const [editRows, setEditRows] = useState<EditRow[]>([]);

    // Initialize Edit Rows when dialog opens
    useEffect(() => {
        if (editOpen) {
            fetchTopics();
            if (data && data.length > 0) {
                setEditRows(
                    data.map((d) => ({
                        topicId: d.topicId,
                        topicName: d.topicName ?? null,
                        weightPercentage: d.weightPercentage ?? null,
                        description: d.description ?? null,
                    }))
                );
            } else {
                setEditRows([
                    { topicId: null, topicName: null, weightPercentage: null, description: null },
                ]);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editOpen]);

    // --- Helper Functions for Dialog ---
    const addEditRow = () =>
        setEditRows((prev) => [
            ...prev,
            { topicId: null, topicName: null, weightPercentage: null, description: null },
        ]);

    const updateEditRow = (index: number, patch: Partial<EditRow>) =>
        setEditRows((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

    const removeEditRow = (index: number) => setEditRows((prev) => prev.filter((_, i) => i !== index));

    const editTotalWeight = useMemo(() => editRows.reduce((acc, curr) => acc + (curr.weightPercentage || 0), 0), [editRows]);
    const editIsValidTotal = editTotalWeight === 100;
    const selectedEditTopicIds = useMemo(() => editRows.map((r) => r.topicId).filter(Boolean) as string[], [editRows]);

    // --- Handlers ---

    const handleEditSubmit = async () => {
        if (!courseCodeId) {
            toast.error("Missing course code id");
            return;
        }

        const validRows = editRows.filter(r => r.topicId);

        if (validRows.length === 0) {
            toast.error("Please configure at least one topic");
            return;
        }

        const payload: BulkUpdateTopicWeightsPayload = {
            courseCodeId,
            configuredBy: user?.id ?? "",
            changeReason: "Updated via UI",
            weights: validRows.map(r => ({
                topicId: r.topicId!,
                weightPercentage: r.weightPercentage ?? 0,
                description: r.description ?? null
            })) as any
        };

        const res = await bulkUpdate(courseCodeId, payload);

        if (res && res.success) {
            toast.success(res.message || "Topic weights updated successfully");
            setEditOpen(false);
            fetchByCourseCode(courseCodeId); // Refresh data
        } else {
            // Error handling
            if (res && res.errors && res.errors.length > 0) {
                toast.error(res.errors.join(", "));
            } else {
                toast.error("Failed to update topic weights");
            }
        }
    };

    const courseCodeName = courseCodeData?.code || (data && data.length > 0 ? data[0].courseCodeName : "Course Code");

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
                            Configuration for Course Code: <span className="font-semibold text-violet-500">{courseCodeName}</span>
                        </p>
                    </div>
                </div>
            </div>

            <Separator />

            {/* --- MAIN CONTENT --- */}
            <Card className="shadow-sm border gap-0 border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b flex flex-row items-center justify-between border-slate-200">
                    <div>
                        <div className="flex items-center gap-2">
                            <PieChart className="h-5 w-5 text-slate-500" />
                            <CardTitle className="text-lg">Weight Distribution</CardTitle>
                            <Badge className={totalWeight === 100 ? "ml-2 text-base text-emerald-700 bg-emerald-50" : "ml-2 text-base text-amber-600 bg-amber-50"}>
                                {totalWeight}%
                            </Badge>
                        </div>
                        <div className="mt-2 text-sm text-muted-foreground">
                            Last updated: {data && data.length > 0 && data[0].updatedAt ? formatToVN(data[0].updatedAt) : 'N/A'}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {data && data.length > 0 ? (
                            <>
                                <Button
                                    onClick={() => setEditOpen(true)}
                                    className="btn btn-green-slow bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={loading}
                                >
                                    <PencilLine className="w-4 h-4 mr-2" />
                                    Update Configuration
                                </Button>

                                <ConfigureTopicWeightsDialog
                                    open={editOpen}
                                    setOpen={setEditOpen}
                                    rows={editRows}
                                    addRow={addEditRow}
                                    updateRow={updateEditRow}
                                    removeRow={removeEditRow}
                                    topics={topics}
                                    selectedTopicIds={selectedEditTopicIds}
                                    totalWeight={editTotalWeight}
                                    isValidTotal={editIsValidTotal}
                                    loading={bulkUpdating} // Sử dụng loading state từ hook mới
                                    handleSubmit={handleEditSubmit}
                                    hideTrigger
                                />
                            </>
                        ) : (
                            <ConfigureTopicWeightsButton courseCodeId={courseCodeId} data={data} fetchByCourseCode={fetchByCourseCode} />
                        )}
                    </div>
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
                                    <TableHead className="py-5 font-semibold text-center w-[80px]">Action</TableHead>
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
                                            <TableCell><Skeleton className="h-8 w-8 mx-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                )}

                                {!loading && data && data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
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

                                        <TableCell className="text-slate-500 py-3 text-xs text-center">
                                            <div className="flex justify-center items-center gap-1">
                                                <CalendarDays className="h-3 w-3" />
                                                {row.configuredAt ? formatToVN(row.configuredAt) : "-"}
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-slate-500 py-3 text-center text-xs">
                                            {row.updatedAt ? formatToVN(row.updatedAt) : "-"}
                                        </TableCell>

                                        <TableCell className="text-center py-3">
                                            <div className="flex items-center justify-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 w-8 cursor-pointer shadow-lg text-slate-600 hover:bg-white hover:text-slate-900 hover:bg-slate-200 transition-colors"
                                                            onClick={() => router.push(`/staff/course-codes/${courseCodeId}/weights/${row.id}/history`)}
                                                        >
                                                            <History className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View Configuration History</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}