import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Select from "@/components/ui/select/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useGetTopicWeightHistory } from "@/hooks/topic/useGetTopicWeightHistory";
import { useGetTopicWeightsByCourse } from "@/hooks/topic/useGetTopicWeightsByCourse";
import { TopicWeightHistoryResponse } from "@/types/topic/topic-weight.response";
import { formatToVN } from "@/utils/datetime/time";
import { ArrowRight, Calendar, History } from "lucide-react"; // Import thêm ArrowLeft
import { useParams, useRouter } from "next/navigation"; // Import thêm useRouter
import React, { useEffect, useState } from "react";

type Props = {
    topicWeightId?: string | undefined;
    items?: TopicWeightHistoryResponse[] | undefined;
    onTopicNameChange?: (name: string) => void;
};

const TopicWeightHistory: React.FC<Props> = ({ topicWeightId, items, onTopicNameChange }) => {
    const router = useRouter();
    const params = useParams() as any;
    const courseId = params?.id as string | undefined;

    // 1. Hook lấy danh sách Topic (Dropdown) - course-scoped
    const { data: topicWeightsResp, loading: topicsLoading, fetchByCourse } = useGetTopicWeightsByCourse();
    const topicWeights = topicWeightsResp ?? [];

    // 2. Hook lấy lịch sử (Table)
    const { data: hookData, loading: hookLoading, error: hookError, fetchHistory } = useGetTopicWeightHistory();

    const [selectedId, setSelectedId] = useState<string | undefined>(topicWeightId);

    // --- EFFECT: Fetch Topics by course ---
    useEffect(() => {
        if (courseId) fetchByCourse(courseId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    // --- EFFECT: Auto Select & Notify Name ---
    useEffect(() => {
        if (topicWeights.length > 0 && !selectedId) {
            setSelectedId(topicWeights[0].id);
        }

        if (selectedId && topicWeights.length > 0) {
            const current = topicWeights.find(t => t.id === selectedId);
            if (current && onTopicNameChange) {
                onTopicNameChange(current.topicName ?? current.topicId);
            }
        }
    }, [topicWeights, selectedId, onTopicNameChange]);

    // --- EFFECT: Fetch History ---
    useEffect(() => {
        if (selectedId) fetchHistory(selectedId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    const displayItems = items ?? hookData ?? [];
    const isLoading = topicsLoading || (hookLoading && !items);
    const currentTopic = topicWeights.find(t => t.id === selectedId);

    const isSpecificContext = displayItems.some(item => item.specificCourseName);
    const contextHeaderTitle = isSpecificContext ? "Specific Course" : "Course Code";

    const renderActionBadge = (action: string | null | undefined) => {
        const val = action?.toLowerCase() || "";
        if (val.includes("create")) return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Created</Badge>;
        if (val.includes("update")) return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Updated</Badge>;
        if (val.includes("delete")) return <Badge variant="destructive">Deleted</Badge>;
        return <Badge variant="outline">{action}</Badge>;
    };

    return (
        <Card className="border-none shadow-none md:border md:shadow-sm">
            <CardHeader className="bg-gray-50/50">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <History className="w-5 h-5 text-blue-600" />
                            Configuration History
                        </CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                            Select a topic to view its detailed modification logs.
                        </p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <div className="w-full md:w-[300px]">
                            <Select
                                disabled={topicsLoading}
                                value={selectedId ?? ""}
                                onChange={(v) => setSelectedId(String(v))}
                                placeholder={topicsLoading ? "Loading..." : (currentTopic?.topicName ?? "Select topic")}
                                options={topicWeights.map((t) => ({
                                    value: t.id,
                                    label: t.topicName ?? t.topicId
                                }))}
                            />
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead className="w-[200px] pl-4">Activity</TableHead>
                                <TableHead className="w-[200px]">{contextHeaderTitle}</TableHead>
                                <TableHead className="text-center justify-center w-[180px]">Weight Change</TableHead>
                                <TableHead className="pl-10">Reason</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                            <span className="text-sm">Retrieving history data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : hookError ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-red-500 bg-red-50/30">
                                        Error: {hookError}
                                    </TableCell>
                                </TableRow>
                            ) : displayItems.length > 0 ? (
                                displayItems.map((it) => (
                                    <TableRow key={it.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="align-top py-4 pl-4">
                                            <div className="flex flex-col gap-4 items-start">
                                                {renderActionBadge(it.action)}
                                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                                                    <span className="font-normal">
                                                        {it.modifiedAt ? formatToVN(it.modifiedAt) : "-"}
                                                    </span>
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="align-top py-4">
                                            <div className="flex flex-col text-sm">
                                                <span className="font-medium text-slate-800 break-words">
                                                    {it.specificCourseName ? it.specificCourseName : (it.courseCodeName ?? "Unknown")}
                                                </span>
                                                <div className="text-xs text-slate-500 flex flex-col gap-1 mt-1">
                                                    <span>Term: {it.termName || "N/A"}</span>
                                                    {it.affectedTerms && (
                                                        <span className="text-amber-600 block">Affected: {it.affectedTerms}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-center align-top py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="text-slate-400 text-sm line-through decoration-slate-400/50">
                                                    {it.oldWeightPercentage !== null ? `${it.oldWeightPercentage}%` : "—"}
                                                </span>
                                                <ArrowRight className="w-3 h-3 text-slate-400" />
                                                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-sm">
                                                    {it.newWeightPercentage !== null ? `${it.newWeightPercentage}%` : "—"}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="align-top pl-10 py-4">
                                            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
                                                {it.changeReason || <span className="italic text-slate-400">No reason provided</span>}
                                            </p>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-48 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                            <History className="w-10 h-10 opacity-20" />
                                            <p className="text-sm">No modification history found for this topic.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
};

export default TopicWeightHistory;
