"use client";

import PaginationBar from "@/components/common/pagination-all";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCourses } from "@/hooks/course/useCourses";
import { useGetTopicWeights } from "@/hooks/topic/useGetTopicWeights";
import { cn } from "@/lib/utils";
import { Course } from "@/types/course/course.response";
import { TopicWeight } from "@/types/topic/topic-weight.response";
import { formatToVN } from "@/utils/datetime/time";
import { motion } from "framer-motion";
import { Check, GraduationCap, Plus, Scale, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FilterRow from "../components/FilterRow";

export default function TopicWeightsSpecificCoursePage() {
    const router = useRouter();
    const { data: topicResp, loading, fetchTopicWeights } = useGetTopicWeights();

    const [items, setItems] = useState<TopicWeight[]>([]);
    const [page, setPage] = useState(1);

    // Filters
    const [name, setName] = useState("");
    const [courseCode, setCourseCode] = useState("");
    const [lecturerName, setLecturerName] = useState("");

    const pageSize = 10;

    // --- CONFIG DIALOG STATE (copied from course-approvals) ---
    const { listData: courseListData, fetchCourses } = useCourses();
    const [pendingCourses, setPendingCourses] = useState<Course[]>([]);
    const [showConfigureDialog, setShowConfigureDialog] = useState(false);
    const [selectedCourseForConfigure, setSelectedCourseForConfigure] = useState<string | null>(null);
    const [dialogSearchTerm, setDialogSearchTerm] = useState("");

    const dialogFilteredCourses = useMemo(() => {
        if (!dialogSearchTerm) return pendingCourses;
        const lowerTerm = dialogSearchTerm.toLowerCase();
        return pendingCourses.filter(
            (c) => c.name.toLowerCase().includes(lowerTerm) || c.courseCode.toLowerCase().includes(lowerTerm)
        );
    }, [pendingCourses, dialogSearchTerm]);

    useEffect(() => {
        const load = async () => {
            // fetch only pending-approval courses for selection (status = 1)
            await fetchCourses({ page: 1, pageSize: 1000, status: 1 });
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (courseListData?.courses) setPendingCourses(courseListData.courses);
    }, [courseListData]);

    // Fetch helper
    const fetchAll = async (pageNum = 1) => {
        await fetchTopicWeights({
            pageNumber: pageNum,
            pageSize,
            courseCode: courseCode || undefined,
            topicName: name || undefined,
            specificCourseId: undefined,
        });
        setPage(pageNum);
    };

    useEffect(() => {
        fetchAll(1);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (topicResp?.data) {
            // keep only items that are tied to a specific course
            setItems(topicResp.data.filter((t) => !!t.specificCourseId));
        }
    }, [topicResp]);

    // Group topic weights by specificCourseId and pick representative info
    const groupedBySpecificCourse = useMemo(() => {
        const map = new Map<string, { id: string; name: string; count: number; configuredAt?: string | null; description?: string | null; courseCodeName?: string | null }>();
        items.forEach((t) => {
            const id = t.specificCourseId ?? "-unknown-";
            const nm = t.specificCourseName ?? "(No name)";
            const existing = map.get(id);
            if (!existing) {
                map.set(id, { id, name: nm, count: 1, configuredAt: t.configuredAt ?? t.updatedAt, description: t.description ?? null, courseCodeName: t.courseCodeName });
            } else {
                existing.count += 1;
                if ((t.configuredAt ?? t.updatedAt) && (existing.configuredAt ?? "") < (t.configuredAt ?? t.updatedAt ?? "")) {
                    existing.configuredAt = t.configuredAt ?? t.updatedAt;
                }
                if (!existing.description && t.description) existing.description = t.description;
            }
        });
        return Array.from(map.values());
    }, [items]);

    const filtered = groupedBySpecificCourse;

    // compute pagination based on grouped/filtered items for specific-course view
    const totalPages = Math.max(1, Math.ceil((filtered.length ?? 0) / pageSize));

    return (
        <div className="min-h-full flex flex-col p-4 md:p-6 bg-slate-50/50 text-slate-900 space-y-4">

            {/* --- HEADER --- */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                        <Scale className="w-6 h-6 text-emerald-600" />
                        Topic Weights — Specific Course
                    </h1>
                    <p className="text-muted-foreground text-sm mt-1">
                        Select a specific course to manage and configure topic weight percentages.
                    </p>
                </div>
            </div>

            {/* --- MAIN CARD --- */}
            <Card className="border-none shadow-sm bg-white ring-1 ring-slate-200 flex-1 flex flex-col">
                <CardHeader className="">
                    <div className="flex items-center justify-between w-full">
                        <CardTitle className="text-base font-semibold text-slate-800">
                            <div className="flex items-center gap-2">
                                <span>Active Courses</span>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-slate-200">
                                    {filtered.length} total
                                </Badge>
                            </div>
                        </CardTitle>

                        <Button
                            className="shadow-sm bg-emerald-600 btn btn-green-slow hover:bg-emerald-700 text-white transition-all"
                            onClick={() => {
                                setDialogSearchTerm("");
                                setSelectedCourseForConfigure(null);
                                setShowConfigureDialog(true);
                            }}
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Configure Topic Weight
                        </Button>
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1 flex flex-col">
                    <div className="flex-1 overflow-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                                <TableRow className="border-b border-slate-200 hover:bg-slate-50">
                                    <TableHead className="w-[40%] pl-6 font-semibold text-slate-700">Specific Course</TableHead>
                                    <TableHead className="w-[20%] font-semibold text-center text-slate-700">Topics Number</TableHead>
                                    <TableHead className="w-[20%] font-semibold text-center text-slate-700">Configured At</TableHead>
                                    <TableHead className="w-[20%] text-center font-semibold text-slate-700">Action</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {/* Filter Row */}
                                <FilterRow
                                    name={name}
                                    setName={(v) => {
                                        // typing resets select and fetch by courseCode string
                                        setCourseCode("");
                                        setName(v);
                                        fetchTopicWeights({ pageNumber: 1, pageSize, courseCode: v || undefined });
                                        setPage(1);
                                    }}
                                    courseCode={courseCode}
                                    setCourseCode={(v) => {
                                        // selecting specific course resets text input and fetches by specificCourseId
                                        setName("");
                                        setCourseCode(v);
                                        fetchTopicWeights({ pageNumber: 1, pageSize, specificCourseId: v || undefined });
                                        setPage(1);
                                    }}
                                    mode="specific-course"
                                    onFilterChange={({ name: n, specificCourseId }) => {
                                        fetchTopicWeights({ pageNumber: 1, pageSize, topicName: n || undefined, specificCourseId: specificCourseId || undefined });
                                        setPage(1);
                                    }}
                                />

                                {/* Data Rows */}
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center text-slate-500">
                                            <div className="flex justify-center items-center gap-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600"></div>
                                                Loading courses...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-48 text-center italic text-sm text-slate-400">
                                            No specific-course topic weights found matching your criteria.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filtered.map((c) => (
                                        <motion.tr
                                            key={c.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.2 }}
                                            className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group"
                                        >
                                            <TableCell className="pl-6 py-5 font-medium text-sm text-slate-800">
                                                <div className="truncate">{c.name}</div>
                                                {c.description && (
                                                    <div className="text-xs text-slate-500 mt-1 truncate">{c.description}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-slate-600 text-center">{c.count}</TableCell>
                                            <TableCell className="text-slate-500 text-center text-xs">{c.configuredAt ? formatToVN(c.configuredAt) : "-"}</TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-emerald-600 btn btn-green-slow cursor-pointer hover:text-emerald-700 hover:bg-emerald-50 h-8"
                                                    onClick={() => router.push(`/staff/courses/${encodeURIComponent(c.id)}/weights`)}
                                                >
                                                    View
                                                </Button>
                                            </TableCell>
                                        </motion.tr>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="border-t border-slate-100 p-4 bg-white">
                        <PaginationBar
                            page={page}
                            totalPages={totalPages}
                            totalCount={filtered.length}
                            loading={loading}
                            onPageChange={(p) => {
                                if (p !== page) fetchAll(p);
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* --- CONFIGURE TOPIC WEIGHT DIALOG (CUSTOM MODAL) --- */}
            {showConfigureDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowConfigureDialog(false)}
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="relative bg-white w-full max-w-xl rounded-xl shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
                    >
                        {/* Modal Header */}
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Configure Topic Weights</h3>
                                <p className="text-sm text-slate-500 mt-0.5">Select a course to proceed with configuration.</p>
                            </div>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-slate-600 rounded-full" onClick={() => setShowConfigureDialog(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Modal Search */}
                        <div className="px-6 py-3 bg-slate-50/50 border-b border-slate-100">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by course name or code..."
                                    className="pl-9 bg-white border-slate-200 focus-visible:ring-emerald-500"
                                    value={dialogSearchTerm}
                                    onChange={(e) => setDialogSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Modal List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50/30">
                            {dialogFilteredCourses.length > 0 ? (
                                dialogFilteredCourses.map((c) => {
                                    const isSelected = selectedCourseForConfigure === c.id;
                                    return (
                                        <div
                                            key={c.id}
                                            onClick={() => setSelectedCourseForConfigure(c.id)}
                                            className={cn(
                                                "group flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all duration-200",
                                                isSelected
                                                    ? "bg-emerald-50 border-emerald-500 shadow-sm ring-1 ring-emerald-500"
                                                    : "bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm"
                                            )}
                                        >
                                            <div className="flex justify-between items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-full flex items-center justify-center border",
                                                    isSelected ? "bg-emerald-100 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100 text-slate-400"
                                                )}>
                                                    <GraduationCap className="w-5 h-5" />
                                                </div>
                                                <div className="">
                                                    <p className={cn("font-semibold text-sm", isSelected ? "text-emerald-900" : "text-slate-700")}>
                                                        {c.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                                                        <span className="font-mono bg-violet-100 px-1.5 py-0.5 rounded text-violet-500">{c.courseCode}</span>
                                                        <span>{c.courseCodeTitle}</span>
                                                        <span>•</span>
                                                        <span>{c.lecturerName}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {isSelected && (
                                                <div className="text-emerald-600 animate-in zoom-in duration-200">
                                                    <Check className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                                    <p className="text-sm">No courses match your search.</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3 sticky bottom-0 z-10">
                            <Button
                                disabled={!selectedCourseForConfigure}
                                onClick={() => {
                                    if (selectedCourseForConfigure) {
                                        setShowConfigureDialog(false);
                                        // Navigate to weights config for selected course
                                        router.push(`/staff/courses/${selectedCourseForConfigure}/weights`);
                                    }
                                }}
                                className={cn(
                                    "transition-all",
                                    selectedCourseForConfigure ? "bg-emerald-600 btn btn-green-slow hover:bg-emerald-700 text-white" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                )}
                            >
                                Go to Configuration
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
