// app/lecture/manager/course/[id]/assignments/AssignmentsPanel.tsx
"use client";

import PaginationBar from "@/components/common/PaginationBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useEffect, useMemo, useState } from "react";

import { useAssignments } from "@/hooks/assignment/useAssignments";
import type { AssignmentStatusFilter, GetAssignmentsQuery } from "@/types/assignments/assignment.payload";
import type { AssignmentStatus } from "@/types/assignments/assignment.response";

import { toast } from "sonner";
import AssignmentDetailView from "./components/AssignmentDetailView";
import AssignmentsFilterBar, { FilterState } from "./components/AssignmentsFilterBar";
import NewAssignmentForm from "./components/NewAssignmentForm";
import NewTopicSheet from "./components/NewTopicSheet";

type Props = {
  courseId: string;
  isActive: boolean;
  refreshSignal?: number;
  children?: React.ReactNode;
};

const statusColor: Record<AssignmentStatus, string> = {
  // 0: "bg-slate-200 text-slate-700",
  1: "bg-emerald-200 text-emerald-700",
  2: "bg-blue-200 text-blue-700",
  3: "bg-red-200 text-red-700",
  4: "bg-slate-300 text-slate-700",
  5: "bg-slate-200 text-slate-700",
};

const defaultFilter: FilterState = {
  search: "",
  statuses: { 1: true }, // default: Active
  groupType: "all",
  dueFrom: "",
  dueTo: "",
  isUpcoming: false,
  isOverdue: false,
  sortBy: "DueDate",
  sortOrder: "asc",
  pageSize: 10,
};

export default function AssignmentsPanel({
  courseId,
  isActive,
  refreshSignal = 0,
  children,
}: Props) {
  const { listData, loading, fetchAssignments } = useAssignments();
  const assignments = listData?.assignments ?? [];
  const totalPages = listData?.totalPages ?? 1;
  const totalCount = listData?.totalCount ?? 0;

  const [mode, setMode] = useState<"list" | "create" | "detail">("list");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [topicSheetOpen, setTopicSheetOpen] = useState(false);

  // paging (page tách riêng để giữ PaginationBar đơn giản)
  const [page, setPage] = useState<number>(1);

  // controlled filter state
  const [filter, setFilter] = useState<FilterState>(defaultFilter);

  // debounce search
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(filter.search.trim()), 350);
    return () => clearTimeout(t);
  }, [filter.search]);

  // build query
  const query: GetAssignmentsQuery = useMemo(() => {
    const statuses = Object.entries(filter.statuses)
      .filter(([, v]) => v)
      .map(([k]) => Number(k) as AssignmentStatusFilter);

    return {
      courseId,
      statuses: statuses.length ? statuses : undefined,
      isGroupAssignment:
        filter.groupType === "all" ? undefined : filter.groupType === "group" ? true : false,
      dueDateFrom: filter.dueFrom ? new Date(filter.dueFrom).toISOString() : undefined,
      dueDateTo: filter.dueTo ? new Date(filter.dueTo).toISOString() : undefined,
      isUpcoming: filter.isUpcoming || undefined,
      isOverdue: filter.isOverdue || undefined,
      searchQuery: debouncedSearch || undefined,
      pageNumber: page,
      pageSize: filter.pageSize,
      sortBy: filter.sortBy,
      sortOrder: filter.sortOrder,
    };
  }, [courseId, filter, debouncedSearch, page]);

  // load list on query/refresh change
  useEffect(() => {
    if (!courseId) return;
    fetchAssignments(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, refreshSignal]);

  // handlers
  const patchFilter = (patch: Partial<FilterState>) => {
    setFilter((prev) => ({ ...prev, ...patch }));
    // reset page khi filter thay đổi (trừ pageSize riêng sẽ tự set 1 từ component)
    if ("search" in patch ||
      "statuses" in patch ||
      "groupType" in patch ||
      "dueFrom" in patch ||
      "dueTo" in patch ||
      "isUpcoming" in patch ||
      "isOverdue" in patch ||
      "sortBy" in patch ||
      "sortOrder" in patch ||
      "pageSize" in patch) {
      setPage(1);
    }
  };

  const resetFilters = () => {
    setFilter(defaultFilter);
    setPage(1);
  };

  const backToList = () => {
    setMode("list");
    fetchAssignments(query); // keep current filters
  };

  const openCreate = () => setMode("create");
  const openDetail = (id: string) => {
    setDetailId(id);
    setMode("detail");
  };

  // Create view
  if (mode === "create") {
    return (
      <Card className="border-0 shadow-none border-slate-100">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm md:text-lg">New Assignment</CardTitle>
          <Button variant="outline" onClick={backToList}>
            Back
          </Button>
        </CardHeader>
        <CardContent>
          <NewAssignmentForm courseId={courseId} onCreated={backToList} onCancel={backToList} />
        </CardContent>
      </Card>
    );
  }

  // Detail view
  if (mode === "detail" && detailId) {
    return <AssignmentDetailView id={detailId} onBack={backToList} />;
  }

  // List view
  return (
    <Card className="border-0 shadow-none">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="text-xl font-semibold md:text-xl">Assignments</CardTitle>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 cursor-pointer">
            <Button className="text-xs cursor-pointer" onClick={() => setTopicSheetOpen(true)}>Topic</Button>
          </div>
          <div className="flex items-center gap-2 cursor-pointer">
            <Button className="text-xs cursor-pointer" onClick={openCreate}>New Assignment</Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {children && <div>{children}</div>}

        {/* FILTER BAR (tách component) */}
        <AssignmentsFilterBar
          value={filter}
          loading={loading}
          onChange={patchFilter}
          onReset={resetFilters}
        />

        {/* LIST */}
        <div className="bg-white border rounded-xl border-slate-200">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="text-sm text-slate-600">
              {loading ? "Loading..." : `${assignments.length} items on this page`}
            </div>
            <div className="text-xs text-slate-500">
              Sorted by {filter.sortBy} ({filter.sortOrder})
            </div>
          </div>
          <Separator />

          <div className="divide-y">
            {assignments.length === 0 && !loading && (
              <div className="px-4 py-8 text-sm text-center text-slate-500">
                No assignments found with current filters.
              </div>
            )}

            {assignments.map((a) => (
              <div key={a.id} className="px-4 py-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  {/* Left */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="font-medium truncate">{a.title}</div>
                      <Badge className={statusColor[a.status]}>{a.statusDisplay}</Badge>
                      {a.isGroupAssignment && <Badge variant="secondary">Group</Badge>}
                    </div>
                    <div className="flex mt-1 text-xs text-slate-500">
                      <div className="flex gap-1 mr-1">Topic: <p className="text-slate-900">{a.topicName}</p></div>
                      • Due: {new Date(a.dueDate).toLocaleString()} • Assigned groups: {a.assignedGroupsCount} •{" "}
                      {a.isOverdue ? "Overdue" : `D-${a.daysUntilDue}`}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" onClick={() => openDetail(a.id)}>
                      Details
                    </Button>
                    {a.isGroupAssignment && (
                      <Button onClick={() => openDetail(a.id)}>
                        Assign Groups
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <PaginationBar
            page={page}
            totalPages={totalPages}
            totalCount={totalCount}
            loading={loading}
            onPageChange={(p) => setPage(p)}
          />

          <NewTopicSheet
            open={topicSheetOpen}
            onOpenChange={setTopicSheetOpen}
            onCreated={() => {
              toast.success("Topic created!");
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
