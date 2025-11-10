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

import { useDeleteAssignment } from "@/hooks/assignment/useDeleteAssignment";
import { AssignmentStatus } from "@/types/assignments/assignment.response";
import { ArrowLeft, Trash2 } from "lucide-react";
import { toast } from "sonner";
import AssignmentDetailView from "./components/AssignmentDetailView";
import AssignmentsFilterBar, { FilterState } from "./components/AssignmentsFilterBar";
import EditAssignmentForm from "./components/EditAssignmentForm";
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

  const [mode, setMode] = useState<"list" | "create" | "detail" | "edit">("list");
  const [detailId, setDetailId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [topicSheetOpen, setTopicSheetOpen] = useState(false);
  const { deleteAssignment, loading: deleting } = useDeleteAssignment();

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
  const openEdit = (id: string) => {
    setEditId(id);
    setMode("edit");
  };

  // Create view
  if (mode === "create") {
    return (
      <div className="flex flex-col max-h-[calc(100vh-180px)] min-h-0">
        <div className="flex items-center justify-between px-4 py-0 mr-3.5 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h2 className="text-sm text-[#000D83] font-semibold">Create Assignment</h2>
          <Button className="text-[#000D83]" variant="outline" onClick={backToList}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4 mr-3.5 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <NewAssignmentForm courseId={courseId} onCreated={backToList} onCancel={backToList} />
          </div>
        </div>
      </div>
    );
  }

  // Detail view
  if (mode === "detail" && detailId) {
    return (
      <div className="flex flex-col max-h-[calc(100vh-180px)] min-h-0">
        <div className="flex-1 overflow-auto">
          <AssignmentDetailView id={detailId} onBack={backToList} onEdit={(id) => openEdit(id)} />
        </div>
      </div>
    );
  }

  // Edit view
  if (mode === "edit" && editId) {
    return (
      <div className="flex flex-col max-h-[calc(100vh-180px)] min-h-0">
        <div className="flex items-center justify-between px-4 py-0 mr-3.5 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h2 className="text-sm text-[#000D83] font-semibold">Edit Assignment</h2>
          <Button className="text-[#000D83]" variant="outline" onClick={backToList}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
        <div className="flex-1 overflow-auto p-4 mr-3.5 bg-slate-50">
          <div className="max-w-5xl mx-auto">
            <EditAssignmentForm id={editId} onUpdated={backToList} onCancel={backToList} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[calc(100vh-180px)] min-h-0">
      <div className="flex-1 overflow-auto space-y-4 pr-1 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-3">
          {/* Left: Filters (4/10 = 40%) */}
          <div className="lg:col-span-4 lg:sticky lg:top-2 h-max">
            <Card className="border py-4 gap-2 border-slate-200 shadow-sm bg-gradient-to-b from-slate-50 to-white">
              <CardHeader className="flex items-center justify-between">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base text-[#000D83] font-semibold">Assignments</h3>
                    <div className="text-xs text-slate-500">{totalCount} assignment(s)</div>
                  </div>
                </div>
                <CardTitle className="text-sm font-medium text-slate-700">Filters</CardTitle>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hidden lg:inline-flex text-sm text-slate-500 hover:text-slate-700"
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </CardHeader>
              <Separator />
              <CardContent className="space-y-3">
                <AssignmentsFilterBar
                  value={filter}
                  loading={loading}
                  onChange={patchFilter}
                  onReset={resetFilters}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right: Assignment items (6/10 = 60%) */}
          <div className="lg:col-span-6">
            <Card className="border-slate-200 shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-white flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-3 px-4">
                <div className="text-sm text-slate-600">
                  {loading ? "Loading..." : `${assignments.length} item(s) on this page`}
                </div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    className="lg:hidden text-[#000D83]"
                    onClick={() => setTopicSheetOpen(true)}
                  >
                    Manage Topics
                  </Button>
                  <Button size="sm" className="lg:hidden text-[#000D83]" onClick={openCreate}>
                    New Assignment
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Separator />

                <div className="divide-y divide-slate-100">
                  {assignments.length === 0 && !loading && (
                    <div className="px-4 py-10 text-sm text-center text-slate-500">
                      No assignments found with current filters.
                    </div>
                  )}

                  {assignments.map((a) => (
                    <div
                      key={a.id}
                      className="px-4 border-b border-slate-200 hover:bg-slate-50 mb-5 pb-3 transition-colors"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        {/* Left info */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-medium truncate text-slate-800">{a.title}</div>
                            <Badge className={statusColor[a.status]}>{a.statusDisplay}</Badge>
                            {a.isGroupAssignment && <Badge variant="secondary">Group</Badge>}
                          </div>
                          <div className="flex flex-col mt-2 gap-2 text-xs text-slate-500">
                            <div className="flex gap-1 mr-2">
                              Topic:
                              <span className="text-slate-900">{a.topicName}</span>
                              &nbsp;&nbsp;•&nbsp;&nbsp; Groups: {a.assignedGroupsCount}

                            </div>
                            <div className="flex gap-1 mr-2">
                              Due: {new Date(a.dueDate).toLocaleString()}
                              &nbsp;&nbsp;&nbsp;•&nbsp; {a.isOverdue ? (
                                <span className="text-red-600 ml-1">Overdue</span>
                              ) : (
                                <span className="flex gap-2 ml-1">Days until Due &nbsp; - <p className="text-violet-800">{a.daysUntilDue}</p></span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right actions */}
                        <div className="flex items-center cursor-pointer text-violet-800 hover:text-violet-500 gap-2 shrink-0">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs btn btn-gradient-slow cursor-pointer"
                            onClick={() => openDetail(a.id)}
                          >
                            Details
                          </Button>
                          {/* Edit moved into detail view header */}
                          {a.status === (AssignmentStatus.Draft as number) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="text-xs cursor-pointer flex items-center gap-1"
                              disabled={deleting}
                              onClick={async () => {
                                if (!confirm("Delete this draft assignment? This cannot be undone.")) return;
                                const res = await deleteAssignment(a.id, a.status as AssignmentStatus);
                                if (res?.success) {
                                  toast.success(res.message || "Deleted");
                                  fetchAssignments(query);
                                }
                              }}
                              title="Delete (Draft only)"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </Button>
                          )}
                          {/* {a.isGroupAssignment && (
                            <Button
                              size="sm"
                              className="text-xs cursor-pointer btn btn-gradient-slow bg-indigo-600 text-white hover:bg-indigo-700"
                              onClick={() => openDetail(a.id)}
                            >
                              Assign Groups
                            </Button>
                          )} */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="px-4 pb-4 pt-3">
                  <PaginationBar
                    page={page}
                    totalPages={totalPages}
                    totalCount={totalCount}
                    loading={loading}
                    onPageChange={(p) => setPage(p)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          <NewTopicSheet
            open={topicSheetOpen}
            onOpenChange={setTopicSheetOpen}
            onCreated={() => {
              toast.success("Topic created!");
            }}
          />
        </div>
      </div>
    </div>
  );
}
