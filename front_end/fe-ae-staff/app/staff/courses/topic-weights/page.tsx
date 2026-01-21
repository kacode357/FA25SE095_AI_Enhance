"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { History, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useGetTopicWeights } from "@/hooks/topic/useGetTopicWeights";
import FilterRow from "./components/FilterRow";

import PaginationBar from "@/components/common/pagination-all";
import { formatToVN } from "@/utils/datetime/time";

export default function TopicWeightsPage() {
  const { data, loading, fetchTopicWeights } = useGetTopicWeights();
  const router = useRouter();

  const [items, setItems] = useState<any[]>([]);
  const [page, setPage] = useState(1);

  // Fixed page size similar to course-codes
  const pageSizeFixed = 10;

  // Filters
  const [filterTopicName, setFilterTopicName] = useState("");
  const [filterCourseCode, setFilterCourseCode] = useState("");
  const [filterSpecificCourse, setFilterSpecificCourse] = useState("");
  const [filterConfiguredAt, setFilterConfiguredAt] = useState("");
  const [filterEditable, setFilterEditable] = useState("");

  // Fetch with filters
  const fetchAll = async (p = 1) => {
    await fetchTopicWeights({
      pageNumber: p,
      pageSize: pageSizeFixed,
      courseCode: filterCourseCode || undefined,
      canEdit: filterEditable === "" ? undefined : filterEditable === "true",
    });
    setPage(p);
  };

  useEffect(() => {
    fetchAll(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (data?.data) setItems(data.data);
  }, [data]);

  // Client-side filtering for additional filters not supported by API
  const filtered = useMemo(() => {
    let arr = items ?? [];

    if (filterTopicName) {
      const query = filterTopicName.toLowerCase();
      arr = arr.filter((it) => (it.topicName || "").toLowerCase().includes(query));
    }

    if (filterSpecificCourse) {
      const query = filterSpecificCourse.toLowerCase();
      arr = arr.filter(
        (it) =>
          (it.specificCourseName || "").toLowerCase().includes(query) ||
          (it.specificCourseId || "").toLowerCase().includes(query)
      );
    }

    if (filterConfiguredAt) {
      arr = arr.filter((it) => {
        if (!it.configuredAt) return false;
        const configDate = new Date(it.configuredAt);
        const filterDate = new Date(filterConfiguredAt);
        return configDate >= filterDate;
      });
    }

    return arr;
  }, [items, filterTopicName, filterSpecificCourse, filterConfiguredAt]);

  const totalPages = data?.totalPages ?? Math.max(1, Math.ceil((data?.totalCount ?? 0) / pageSizeFixed));
  const totalCount = data?.totalCount ?? 0;

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 mb-4 bg-white/90 p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0">
            Manage and configure weight percentages for topics across different course codes.
          </p>
        </div>
      </header>

      {/* Table */}
      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-base text-slate-800">
            Topic Weights List{" "}
            <span className="text-slate-500">({typeof totalCount === "number" ? totalCount : 0})</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="px-0 flex-1 overflow-hidden">
          <div className="h-full overflow-auto">
            <Table className="table-auto w-full">
              <TableHeader className="sticky top-0 z-10 bg-slate-50">
                <TableRow className="text-slate-600 border-b border-t border-slate-200">
                  <TableHead className="w-40 text-xs text-left font-bold pl-5">Topic</TableHead>
                  <TableHead className="w-32 text-xs text-left font-bold">Course Code</TableHead>
                  <TableHead className="w-40 text-xs text-left font-bold">Specific Course</TableHead>
                  <TableHead className="w-28 text-xs text-center font-bold">Weight %</TableHead>
                  <TableHead className="w-36 text-xs text-center font-bold">Configured At</TableHead>
                  <TableHead className="w-24 text-xs text-center font-bold">Actions</TableHead>
                </TableRow>

                <FilterRow
                  filterTopicName={filterTopicName}
                  setFilterTopicName={setFilterTopicName}
                  filterCourseCode={filterCourseCode}
                  setFilterCourseCode={setFilterCourseCode}
                  filterSpecificCourse={filterSpecificCourse}
                  setFilterSpecificCourse={setFilterSpecificCourse}
                  filterConfiguredAt={filterConfiguredAt}
                  setFilterConfiguredAt={setFilterConfiguredAt}
                  filterEditable={filterEditable}
                  setFilterEditable={setFilterEditable}
                  fetchAll={() => fetchAll(1)}
                  clearAll={() => {
                    setFilterTopicName("");
                    setFilterCourseCode("");
                    setFilterSpecificCourse("");
                    setFilterConfiguredAt("");
                    setFilterEditable("");
                    fetchAll(1);
                  }}
                />
              </TableHeader>

              <TableBody>
                {filtered.map((t) => (
                  <motion.tr
                    key={t.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="border-b border-slate-100 hover:bg-emerald-50/50"
                  >
                    <TableCell className="text-xs text-left pl-5">{t.topicName || "-"}</TableCell>
                    <TableCell className="text-xs text-left">
                      {t.courseCodeName ? (
                        <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                          {t.courseCodeName}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-left">
                      {t.specificCourseName ? (
                        <span className="text-xs text-slate-700">{t.specificCourseName}</span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-center">
                      <span className="text-sm font-bold text-slate-900">{t.weightPercentage}%</span>
                    </TableCell>
                    <TableCell className="text-center text-xs whitespace-nowrap">
                      {t.configuredAt
                        ? formatToVN(t.configuredAt, { year: "numeric", month: "2-digit", day: "2-digit" })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 px-2 text-emerald-600 cursor-pointer hover:bg-emerald-50 hover:shadow-md"
                              onClick={() => router.push(`/staff/courses/topic-weights/${t.id}`)}
                            >
                              <PencilLine className="size-4 text-blue-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-slate-900">
                            Edit topic weight
                          </TooltipContent>
                        </Tooltip>

                        {/* History */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              className="h-8 px-2 text-sky-600 cursor-pointer hover:bg-sky-50 hover:shadow-md"
                              onClick={() => {
                                if (t.specificCourseId) {
                                  router.push(`/staff/courses/${t.specificCourseId}/weights/${t.id}/history`);
                                } else {
                                  router.push(`/staff/course-codes/${t.courseCodeId}/weights/${t.id}/history`);
                                }
                              }}
                            >
                              <History className="size-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="bg-slate-900">
                            View configuration history
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </motion.tr>
                ))}

                {!loading && filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      No topic weights found.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-slate-500">
                      Loading...
                    </td>
                  </tr>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>

        {/* Pagination */}
        <PaginationBar
          page={page}
          totalPages={totalPages}
          totalCount={totalCount ?? 0}
          loading={loading}
          onPageChange={(p) => {
            if (p !== page) {
              fetchAll(p);
            }
          }}
        />
      </Card>
    </div>
  );
}
