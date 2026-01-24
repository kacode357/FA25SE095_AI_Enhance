"use client";

import ConfigureTopicWeightsButton from "@/app/staff/courses/[id]/weights/components/ConfigureTopicWeightsButton";
import ConfigureTopicWeightsDialog from "@/app/staff/courses/[id]/weights/components/ConfigureTopicWeightsDialog";
import { Badge } from "@/components/ui/badge";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCourses } from "@/hooks/course/useCourses";
import { useBulkUpdateTopicWeights } from "@/hooks/topic/useBulkUpdateTopicWeights";
import { useDeleteTopicWeight } from "@/hooks/topic/useDeleteTopicWeight";
import { useGetTopics } from "@/hooks/topic/useGetTopics";
import { useGetTopicWeightsByCourse } from "@/hooks/topic/useGetTopicWeightsByCourse";
import { useUpdateTopicWeight } from "@/hooks/topic/useUpdateTopicWeight";
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

// Normalize backend messages to avoid duplicated text inside a single toast
const dedupeMessage = (msg?: string | null) => {
    if (!msg) return msg ?? undefined;
    const s = String(msg).trim();
    const m = s.match(/^(.+?)([:\-–—\.]{1}\s*)(\1)$/);
    if (m) return m[1].trim();
    const parts = s.split(/[:\-–—\.]{1}\s*/).map(p => p.trim()).filter(Boolean);
    if (parts.length === 2 && parts[0] === parts[1]) return parts[0];
    return s;
};

export default function WeightsPage() {
    const params = useParams();
    const courseId = (params as any)?.id as string | undefined;
    const router = useRouter();
    const { data, loading, fetchByCourse } = useGetTopicWeightsByCourse();
    const { listData: coursesListData, fetchCourses: fetchCoursesList } = useCourses();

    const [fetchedCourseName, setFetchedCourseName] = useState<string | null>(null);

    useEffect(() => {
        if (courseId) fetchByCourse(courseId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    // If no topic weights are returned, try to fetch the specific course info
    useEffect(() => {
        if (!courseId) return;
        // FIX: Check Array.isArray to avoid crash
        if (Array.isArray(data) && data.length > 0) return; // already have data-based name

        (async () => {
            try {
                // fetch all courses (no status filter) so we can find the specific course regardless of its state
                await fetchCoursesList({ page: 1, pageSize: 1000 });
            } catch (e) { }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, data]);

    useEffect(() => {
        if (!coursesListData?.courses || !courseId) return;
        const found = coursesListData.courses.find((c: any) => String(c.id) === String(courseId));
        if (found) setFetchedCourseName(found.name || 'Course');
    }, [coursesListData, courseId]);

    // Delete / Update hooks and confirmation state
    const { loading: deleting, deleteTopicWeight } = useDeleteTopicWeight();
    const { updateTopicWeight } = useUpdateTopicWeight();
    const [confirmId, setConfirmId] = useState<string | null>(null);

    // --- FIX HERE: Check Array.isArray(data) before using .find() ---
    const deletingItem = Array.isArray(data) ? data.find((it) => String(it.id) === String(confirmId)) : undefined;

    // Edit (bulk update) dialog state and helpers
    const { data: topicsResp, fetchTopics } = useGetTopics();
    const topics = topicsResp?.topics || [];

    const { bulkUpdate, loading: bulkUpdating } = useBulkUpdateTopicWeights();

    type EditRow = {
        topicId?: string | null;
        topicName?: string | null;
        weightPercentage?: number | null;
        description?: string | null;
    };

    const [editOpen, setEditOpen] = useState(false);
    const [editRows, setEditRows] = useState<EditRow[]>([]);

    useEffect(() => {
        if (editOpen) {
            fetchTopics();
            // FIX: Check Array.isArray
            if (Array.isArray(data) && data.length > 0) {
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

    const handleEditSubmit = async () => {
        if (!courseId) {
            toast.error("Missing course id");
            return;
        }

        // map rows to updates array with existing topic weight ids
        const updates = [] as { id: string; weightPercentage: number; description?: string | null }[];
        for (const r of editRows) {
            if (!r.topicId) continue;
            // FIX: Check Array.isArray
            const found = Array.isArray(data) ? data.find((d) => d.topicId === r.topicId) : undefined;
            if (!found) {
                toast.error("All edited rows must correspond to existing configured topics");
                return;
            }
            updates.push({ id: found.id, weightPercentage: r.weightPercentage ?? 0, description: r.description ?? null });
        }

        if (updates.length === 0) {
            toast.error("Please select at least one topic");
            return;
        }

        // Determine specificCourseId for UI and courseCodeId for API if available
        // FIX: Check Array.isArray
        const specificCourseIdFromData = Array.isArray(data) && data.length > 0 ? data[0].specificCourseId : undefined;
        const courseIdForApi = Array.isArray(data) && data.length > 0 ? data[0].specificCourseId : undefined;
        if (!courseIdForApi) {
            toast.error("Cannot determine course code id for bulk update");
            return;
        }

        const payload = {
            specificCourseId: courseIdForApi,
            configuredBy: "",
            changeReason: "Updated via UI",
            updates,
        };

        const res = await bulkUpdate(courseIdForApi, payload as any);
        if (res && res.success) {
            toast.success(dedupeMessage(res.message) || "Topic weights updated");
            setEditOpen(false);
            try {
                await fetchByCourse(courseId);
            } catch (e) { }
        } else {
            throw Error;
        }
    };

    const handleRequestDelete = (id: string) => {
        setConfirmId(id);
    };

    const handleConfirmDelete = async () => {
        const id = confirmId;
        if (!id) return;
        const ok = await deleteTopicWeight(id);
        if (ok) {
            if (courseId) fetchByCourse(courseId);
        }
        setConfirmId(null);
    };

    // FIX: Check Array.isArray
    const courseName = fetchedCourseName ?? (Array.isArray(data) && data.length > 0 ? (data[0].specificCourseName || data[0].courseCodeName || "Course") : "Course");

    // FIX: Check Array.isArray
    const totalWeight = useMemo(() => {
        return Array.isArray(data) ? data.reduce((acc, curr) => acc + (curr.weightPercentage || 0), 0) : 0;
    }, [data]);

    // FIX: Helper to safely get first element
    const firstDataItem = Array.isArray(data) && data.length > 0 ? data[0] : null;

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
                        <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            Configuration for Course: <span className="font-semibold text-violet-500 text-primary">{courseName}</span>
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
                            Last updated: {firstDataItem && firstDataItem.updatedAt ? formatToVN(firstDataItem.updatedAt) : 'N/A'}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {Array.isArray(data) && data.length > 0 ? (
                            <>
                                <Button
                                    onClick={() => setEditOpen(true)}
                                    className="btn btn-green-slow bg-emerald-600 hover:bg-emerald-700 text-white"
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
                                    courseId={courseId}
                                    existingTopicWeights={data ?? undefined}
                                    hideTrigger
                                    onSuccess={() => {
                                        if (courseId) fetchByCourse(courseId);
                                    }}
                                />
                            </>
                        ) : (
                            <ConfigureTopicWeightsButton
                                courseId={courseId}
                                data={Array.isArray(data) ? data : []}
                                fetchByCourse={(id: string) => fetchByCourse(id as any)}
                            />
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

                                {!loading && Array.isArray(data) && data.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-32 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                                <FileText className="h-8 w-8 text-slate-300" />
                                                <p className="italic text-slate-400">No configuration found for this course.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}

                                {/* FIX: Ensure data is an array before mapping */}
                                {Array.isArray(data) && data.map((row) => (
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

                                        <TableCell className="text-center py-3">
                                            <div className="flex items-center justify-center">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 cursor-pointer shadow-lg w-8 text-slate-600 hover:bg-white"
                                                    onClick={() => router.push(`/staff/courses/${row.specificCourseId}/weights/${row.id}/history`)}
                                                >
                                                    <History className="w-4 h-4" />
                                                </Button>
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