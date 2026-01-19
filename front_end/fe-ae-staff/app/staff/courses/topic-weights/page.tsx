"use client";

import PaginationBar from "@/components/common/pagination-all";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useDeleteTopicWeight } from "@/hooks/topic/useDeleteTopicWeight";
import { useGetTopicWeights } from "@/hooks/topic/useGetTopicWeights";
import { formatToVN } from "@/utils/datetime/time";
import { motion } from "framer-motion";
import { CalendarClock, Eye, History, Layers, Search, TriangleAlert, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function TopicWeightsPage() {
    // --- Hooks & State ---
    const { data, loading, fetchTopicWeights } = useGetTopicWeights();
    const router = useRouter();
    const params = useParams();
    const courseCodeId = (params as any)?.id as string | undefined;
    const [items, setItems] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // State cho filter Course Code
    const [searchCourseCode, setSearchCourseCode] = useState("");
    // State cho filter Specific Course
    const [searchSpecificCourseId, setSearchSpecificCourseId] = useState("");
    // Filter: only show editable weights
    const [onlyEditable, setOnlyEditable] = useState<boolean>(false);

    // Hook Delete
    const { loading: deleting, deleteTopicWeight } = useDeleteTopicWeight();
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const deletingItem = items.find((it) => String(it.id) === String(confirmId));

    // --- Logic Fetch Data ---
    // searchParam là tùy chọn, dùng để clear search ngay lập tức mà không đợi state update
    // canEditParam: true = filter editable only; null = explicitly clear filter; undefined = use current `onlyEditable` state
    const fetchAll = async (
        pageNum = 1,
        searchParam?: string,
        canEditParam?: boolean | null,
        specificCourseParam?: string,
    ) => {
        const codeToSearch = searchParam !== undefined ? searchParam : searchCourseCode;
        const specificToSearch = specificCourseParam !== undefined ? specificCourseParam : searchSpecificCourseId;
        let canEditToSend: boolean | undefined;
        if (canEditParam === null) {
            // explicit clear
            canEditToSend = undefined;
        } else if (canEditParam !== undefined) {
            canEditToSend = canEditParam;
        } else {
            canEditToSend = onlyEditable ? true : undefined;
        }

        // Only send specificCourseId to API when it's a valid UUID to avoid server validation errors
        const uuidRegex = /[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/i;
        const params: any = {
            pageNumber: pageNum,
            pageSize,
            courseCode: codeToSearch, // Truyền tham số filter vào API
            canEdit: canEditToSend,
        };
        if (specificToSearch && uuidRegex.test(specificToSearch)) {
            params.specificCourseId = specificToSearch;
        }

        await fetchTopicWeights(params);
        setPage(pageNum);
    };

    // --- Handlers Search ---
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchCourseCode(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            fetchAll(1); // Enter thì về trang 1 và search
        }
    };

    // For specific course input we filter client-side in realtime, so don't call API on keydown
    const handleSpecificKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            // prevent submitting or triggering server search
            e.preventDefault();
        }
    };

    const handleClearSearch = () => {
        setSearchCourseCode("");
        fetchAll(1, ""); // Gọi fetch với chuỗi rỗng ngay lập tức
    };

    const handleClearSpecific = () => {
        setSearchSpecificCourseId("");
        fetchAll(1, undefined, undefined, "");
    };

    // --- Handlers Delete ---
    const handleRequestDelete = (id: string) => {
        setConfirmId(id);
    };

    const handleConfirmDelete = async () => {
        const id = confirmId;
        if (!id) return;
        const ok = await deleteTopicWeight(id);
        if (ok) {
            // Refresh lại trang hiện tại, giữ nguyên filter nếu có
            fetchAll(page);
        }
        setConfirmId(null);
    };

    // --- Effects ---
    useEffect(() => {
        fetchAll(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (data?.data) setItems(data.data);
    }, [data]);

    const totalPages = data?.totalPages ?? Math.max(1, Math.ceil((data?.totalCount ?? 0) / pageSize));

    // Client-side realtime filtering for table display. Server search still available via Enter on Course Code input.
    const filtered = useMemo(() => {
        let arr = items ?? [];
        const courseQuery = (searchCourseCode || "").trim().toLowerCase();
        const specificQuery = (searchSpecificCourseId || "").trim().toLowerCase();

        if (onlyEditable) {
            arr = arr.filter((it) => !!it.canUpdate || !!it.canDelete);
        }

        if (courseQuery) {
            arr = arr.filter((it) => {
                const codeName = (it.courseCodeName || "").toString().toLowerCase();
                const codeId = (it.courseCodeId || "").toString().toLowerCase();
                const topicName = (it.topicName || "").toString().toLowerCase();
                return codeName.includes(courseQuery) || codeId.includes(courseQuery) || topicName.includes(courseQuery);
            });
        }

        if (specificQuery) {
            arr = arr.filter((it) => {
                const specificName = (it.specificCourseName || "").toString().toLowerCase();
                const specificId = (it.specificCourseId || "").toString().toLowerCase();
                return specificName.includes(specificQuery) || specificId.includes(specificQuery);
            });
        }

        return arr;
    }, [items, searchCourseCode, searchSpecificCourseId, onlyEditable]);

    return (
        <div className="flex flex-col h-full space-y-6 p-6 bg-slate-50/50 min-h-screen text-slate-900">
            {/* --- Page Header --- */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Topic Weights Configuration</h1>
                    <p className="text-sm text-slate-500">
                        Manage and configure weight percentages for topics across different course codes.
                    </p>
                </div>

                {/* <div className="flex items-center gap-2">
                    <Button
                        onClick={() => router.push(`/staff/courses/topic-weights/configure`)}
                        className="h-10 bg-indigo-600 btn btn-green-slow hover:bg-indigo-700 text-white shadow-sm transition-all font-medium px-4"
                    >
                        <Settings2 className="w-4 h-4 mr-2" />
                        Configuration Topic Weight
                    </Button>
                </div> */}
            </div>

            {/* --- Main Content Card --- */}
            <Card className="border-slate-200 shadow-sm flex flex-col overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 px-6 bg-white space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <CardTitle className="text-base font-semibold flex items-center gap-2 text-slate-800">
                            <Layers className="w-4 h-4 text-indigo-600" />
                            All Records
                            <span className="ml-2 inline-flex items-center justify-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                {data?.totalCount ?? 0}
                            </span>
                        </CardTitle>

                        {/* --- Filter Search Bar --- */}
                        <div className="flex items-center justify-end gap-8">
                            <div className="relative w-64 flex-1">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-slate-400" />
                                </div>
                                <Input
                                    placeholder="Filter by Course Code..."
                                    className="pl-9 pr-9 h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm w-full"
                                    value={searchCourseCode}
                                    onChange={handleSearchChange}
                                    onKeyDown={handleKeyDown}
                                />
                                {searchCourseCode && (
                                    <button
                                        title="Clear"
                                        onClick={handleClearSearch}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            {/* Specific Course filter input */}
                            <div className="relative w-64">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Layers className="h-4 w-4 text-slate-400" />
                                </div>
                                <Input
                                    placeholder="Filter by Specific Course ..."
                                    className="pl-9 pr-9 h-9 bg-slate-50 border-slate-200 focus:bg-white transition-all text-sm w-44"
                                    value={searchSpecificCourseId}
                                    onChange={(e) => setSearchSpecificCourseId(e.target.value)}
                                    onKeyDown={handleSpecificKeyDown}
                                />
                                {searchSpecificCourseId && (
                                    <button
                                        title="Clear"
                                        onClick={handleClearSpecific}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                )}
                            </div>

                            <label className="relative inline-flex items-center cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={onlyEditable}
                                    onChange={(e) => {
                                        const checked = e.target.checked;
                                        setOnlyEditable(checked);
                                        if (checked) fetchAll(1, undefined, true);
                                        else fetchAll(1, undefined, null);
                                    }}
                                />
                                {/* Switch Track */}
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>

                                {/* Label Text */}
                                <span className="ml-3 text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors select-none">
                                    Only editable
                                </span>
                            </label>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 overflow-auto bg-white min-h-[500px]">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow className="border-b border-slate-200 hover:bg-slate-50">
                                <TableHead className="w-[150px] px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Topic</TableHead>
                                <TableHead className="w-[130px] px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Course Code</TableHead>
                                <TableHead className="w-[150px] px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Specific Course</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Weight & Description</TableHead>
                                <TableHead className="w-[100px] px-6 py-3 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {loading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={5} className="h-16 px-6">
                                            <div className="h-4 bg-slate-100 rounded animate-pulse w-full max-w-[80%]" />
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : filtered.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-[400px] text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                                            <Search className="w-12 h-12 opacity-20" />
                                            <p className="text-sm font-medium">No topic weights found.</p>
                                            {searchCourseCode && (
                                                <Button
                                                    // variant="link" 
                                                    onClick={handleClearSearch}
                                                    className="text-indigo-600 h-auto p-0 font-normal"
                                                >
                                                    Clear filter
                                                </Button>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filtered.map((t) => (
                                    <motion.tr
                                        key={t.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className="group border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                                    >
                                        <TableCell className="px-6 py-4 align-top">
                                            <span className="font-semibold text-slate-800 text-sm">{t.topicName}</span>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 text-center align-top">
                                            {t.courseCodeName ? (
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 whitespace-nowrap">
                                                    {t.courseCodeName}
                                                </span>
                                            ) :
                                                <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-blue-700/10 whitespace-nowrap">
                                                    Not config
                                                </span>
                                            }
                                        </TableCell>

                                        <TableCell className="px-6 py-4 align-top">
                                            {t.specificCourseName ? (
                                                <span className="text-xs text-slate-700">{t.specificCourseName}</span>
                                            ) : (
                                                <span className="text-xs text-slate-400 italic">Not config.</span>
                                            )}
                                        </TableCell>

                                        <TableCell className="px-6 py-4 align-top">
                                            <div className="flex flex-col gap-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-sm font-bold text-slate-900">{t.weightPercentage}%</span>
                                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 rounded uppercase tracking-wider font-semibold">Weight</span>
                                                </div>
                                                <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed" title={t.description}>
                                                    {t.description || <span className="text-slate-300 italic">No description</span>}
                                                </p>
                                                <div className="mt-2">
                                                    {t.configuredAt ? (
                                                        <div className="flex items-center gap-1 text-xs font-medium text-violet-400">
                                                            <CalendarClock className="w-3.5 h-3.5 text-violet-400" /> Configured At:
                                                            <span className="text-slate-600">{formatToVN(t.configuredAt)}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-300 text-xs">-</span>
                                                    )}
                                                </div>
                                            </div>
                                        </TableCell>

                                        <TableCell className="px-6 py-4 flex gap-2 items-center text-center align-top">
                                            {/* <div className="flex items-center justify-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-8 border-slate-200 btn btn-green-slow text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 transition-all"
                                                    onClick={() => {
                                                        // Logic điều hướng edit
                                                        if (t.courseCodeId && !t.specificCourseId) {
                                                            router.push(`/staff/course-codes/${t.courseCodeId}/weights`);
                                                        }
                                                        else {
                                                            router.push(`/staff/courses/topic-weights/${t.id}`);
                                                        }
                                                    }}
                                                >
                                                    <PencilLine className="size-3" />Edit
                                                </Button>
                                            </div> */}

                                            <div className="flex items-center justify-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 cursor-pointer shadow-lg w-8 text-slate-600 hover:bg-white"
                                                            onClick={() => router.push(`/staff/courses/topic-weights/${t.id}`)}
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>View details</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>

                                            <div className="flex items-center justify-center">
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="h-8 cursor-pointer shadow-lg w-8 text-slate-600 hover:bg-white"
                                                            onClick={() => {
                                                                if (t.specificCourseId) {
                                                                    router.push(`/staff/courses/${t.specificCourseId}/weights/${t.id}/history`);
                                                                } else {
                                                                    router.push(`/staff/course-codes/${t.courseCodeId}/weights/${t.id}/history`);
                                                                }
                                                            }}
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
                                    </motion.tr>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>

                {/* --- Confirm Delete Dialog --- */}
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
                                </div>

                                <p className="mt-3 mb-6 text-xs text-yellow-600">
                                    <em className="flex items-start gap-1"><TriangleAlert className="size-3.5" />This action can’t be undone.</em>
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

                <CardFooter className="border-t border-slate-100 bg-slate-50/50 p-4">
                    <PaginationBar
                        page={page}
                        totalPages={totalPages}
                        totalCount={data?.totalCount ?? 0}
                        loading={loading}
                        onPageChange={(p) => {
                            if (p !== page) fetchAll(p);
                        }}
                    />
                </CardFooter>
            </Card>
        </div>
    );
}