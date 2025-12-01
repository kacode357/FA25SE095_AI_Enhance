// app/lecture/course/[id]/assignments/AssignmentsPanel.tsx
"use client";

import PaginationBar from "@/components/common/PaginationBar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGroupsByCourseId } from "@/hooks/group/useGroupsByCourseId";
import { useEffect, useMemo, useRef, useState } from "react";

import { useAssignments } from "@/hooks/assignment/useAssignments";
import type { AssignmentStatusFilter, GetAssignmentsQuery } from "@/types/assignments/assignment.payload";
import { formatToVN } from "@/utils/datetime/time";

import { useDeleteAssignment } from "@/hooks/assignment/useDeleteAssignment";
import type { AssignmentItem } from "@/types/assignments/assignment.response";
import { AssignmentStatus } from "@/types/assignments/assignment.response";
import { ArrowLeft, ChevronDown, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AssignmentDetailView from "./components/AssignmentDetailView";
import AssignmentsFilterBar, { FilterState } from "./components/AssignmentsFilterBar";
import ConfirmDeleteAssignmentDialog from "./components/ConfirmDeleteAssignmentDialog";
import EditAssignmentForm from "./components/EditAssignmentForm";
import NewAssignmentForm from "./components/NewAssignmentForm";
import NewTopicSheet from "./components/NewTopicSheet";

type Props = {
  courseId: string;
  isActive: boolean;
  refreshSignal?: number;
  children?: React.ReactNode;
};

const statusClass: Record<AssignmentStatus, string> = {
  [AssignmentStatus.Draft]: "badge-assignment badge-assignment--draft",
  [AssignmentStatus.Scheduled]: "badge-assignment badge-assignment--scheduled",
  [AssignmentStatus.Active]: "badge-assignment badge-assignment--active",
  [AssignmentStatus.Extended]: "badge-assignment badge-assignment--extended",
  [AssignmentStatus.Overdue]: "badge-assignment badge-assignment--overdue",
  [AssignmentStatus.Closed]: "badge-assignment badge-assignment--closed",
  [AssignmentStatus.Graded]: "badge-assignment badge-assignment--graded",
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  // assignments list returns trimmed items; accept Partial so types align
  const [toDelete, setToDelete] = useState<Partial<AssignmentItem> | null>(null);

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

  // load groups for mapping group ids -> names
  const { listData: groups, fetchByCourseId: fetchGroupsByCourseId } = useGroupsByCourseId();
  useEffect(() => {
    if (!courseId) return;
    fetchGroupsByCourseId(courseId);
  }, [courseId, fetchGroupsByCourseId]);

  const groupNameMap = useMemo(() => {
    const m = new Map<string, string>();
    (groups || []).forEach((g: any) => {
      if (g?.id) m.set(g.id, g.name || g.id);
    });
    return m;
  }, [groups]);

  // group assignments by topic for UI grouping
  const topics = useMemo(() => {
    const m = new Map<string, AssignmentItem[]>();
    (assignments || []).forEach((a) => {
      const t = (a as any).topicName || "Uncategorized";
      if (!m.has(t)) m.set(t, []);
      m.get(t)!.push(a as AssignmentItem);
    });
    return Array.from(m.entries()).map(([name, items]) => ({ name, items }));
  }, [assignments]);

  const [expandedTopics, setExpandedTopics] = useState<Record<string, boolean>>({});
  const topicRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());

  const toggleTopic = (name: string) => {
    setExpandedTopics((prev) => {
      const opening = !prev[name];
      const next = { ...prev, [name]: opening };

      // if opening, schedule a smooth scroll to the topic's container
      if (opening) {
        // wait briefly for DOM to update
        setTimeout(() => {
          const el = topicRefs.current.get(name);
          if (el && typeof el.scrollIntoView === "function") {
            try {
              el.scrollIntoView({ behavior: "smooth", block: "center" });
            } catch (e) {
              // fallback: compute position
              const rect = el.getBoundingClientRect();
              const top = window.scrollY + rect.top - 120;
              window.scrollTo({ top, behavior: "smooth" });
            }
          }
        }, 60);
      }

      return next;
    });
  };

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

  const router = useRouter();

  // Create view
  if (mode === "create") {
    return (
      <div className="flex flex-col max-h-[calc(100vh-180px)] min-h-0">
        <div className="flex items-center justify-between py-0 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h2 className="text-sm text-[#000D83] font-semibold">Create Assignment</h2>
          <Button className="text-[#000D83] -mr-3.5" variant="outline" onClick={backToList}>
            <ArrowLeft className="size-4" />
            Back to Assignments
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-4 bg-slate-50">
          <div className="max-w-full mx-auto">
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
        <div className="flex items-center justify-between py-0 border-b border-slate-200 bg-white sticky top-0 z-10">
          <h2 className="text-sm text-[#000D83] font-semibold">Edit Assignment</h2>
          <Button className="text-[#000D83]" variant="outline" onClick={backToList}>
            <ArrowLeft className="size-4" />
            Back
          </Button>
        </div>
        <div className="flex-1 overflow-auto py-4 mr-3.5 bg-slate-50">
          <div className="max-w-full mx-auto">
            <EditAssignmentForm id={editId} onUpdated={backToList} onCancel={backToList} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[calc(100vh-180px)] min-h-0">
      <div className="flex-1 overflow-auto border border-slate-200 rounded-sm space-y-0 pb-0">
        {/* Top: Full-width filter bar styled like Courses FilterBar and sticky */}
        <div className="sticky top-0 z-10">
          <Card className="p-0 rounded-t-sm gap-0 rounded-b-none mx-0 border-none border-b bg-slate-50 border-slate-200 shadow-sm min-h-[64px]">
            <AssignmentsFilterBar
              value={filter}
              loading={loading}
              onChange={patchFilter}
              onReset={resetFilters}
              resultCount={assignments.length}
              totalCount={totalCount}
            />
          </Card>
        </div>

        {/* Assignment items list */}
        <Card className="border-none rounded-sm shadow-md gap-3 py-0">
          <CardHeader className="sticky top-16 z-30 bg-white shadow-sm flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between py-3 px-4">
            <div className="text-sm text-slate-600">
              {loading ? "Loading..." : `${assignments.length} item(s) on this page`}
            </div>
            <div className="flex items-center gap-2 sm:justify-end">
              <Button
                size="sm"
                variant="outline"
                className="text-[#000D83] shadow-md"
                onClick={() => setTopicSheetOpen(true)}
              >
                Manage Topics
              </Button>
              <Button size="sm" className="text-[#000D83] shadow-md" onClick={openCreate}>
                New Assignment
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Separator />

            <div className="divide-y divide-slate-50">
              {assignments.length === 0 && !loading && (
                <div className="px-4 py-10 text-sm text-center text-slate-500">
                  No assignments found with current filters.
                </div>
              )}

              {topics.map((t) => (
                <div key={t.name} className={`px-0 ${expandedTopics[t.name] ? 'mb-4' : 'mb-1'}`}>
                  <div
                    className={`px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 ${
                      expandedTopics[t.name]
                        ? 'bg-slate-50 rounded-t-sm'
                        : 'bg-white border border-slate-50 rounded-sm shadow-sm'
                    }`}
                    onClick={() => toggleTopic(t.name)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`font-medium ${expandedTopics[t.name] ? 'text-violet-800' : 'text-slate-800'}`}>{t.name}</div>
                      <div className="text-sm text-slate-500">{t.items.length} item(s)</div>
                    </div>
                    <ChevronDown className={`h-4 w-4 transform transition-transform ${expandedTopics[t.name] ? 'rotate-180' : ''}`} />
                  </div>

                  <div
                    ref={(el) => { topicRefs.current.set(t.name, el); }}
                    className={`pl-6 pr-4 rounded-b-sm overflow-hidden transition-all duration-300 ease-out ${
                      expandedTopics[t.name]
                        ? "bg-slate-50 max-h-[1200px] opacity-100 py-4"
                        : "max-h-0 bg-transparent opacity-0"
                    }`}
                  >
                    <div className="transition-opacity duration-300">
                      {t.items.map((a) => (
                        <div
                          key={a.id}
                          className="bg-white border border-slate-200 rounded-lg p-4 mb-3 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            {/* Left info */}
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-medium truncate text-slate-800">{a.title ?? "Untitled"}</div>
                                <Badge className={statusClass[a.status]}>{a.statusDisplay}</Badge>
                                {a.isGroupAssignment ? (
                                  <Badge variant="outline">Group</Badge>
                                ) : (
                                  <Badge variant="outline">Individual</Badge>
                                )}
                              </div>
                              <div className="flex flex-col mt-2 gap-2 text-xs text-slate-500">
                                <div className="flex gap-1 mr-2 items-center">
                                  {a.isGroupAssignment && (
                                    <>
                                    <span>Group:</span>
                                      <span className="text-slate-900 truncate">
                                        {((a as any).groupIds && (a as any).groupIds.length > 0)
                                          ? (a as any).groupIds.map((id: string) => groupNameMap.get(id) ?? id).join(", ")
                                          : "-"}
                                      </span>
                                    </>
                                  )}
                                </div>

                                <div className="flex gap-2 flex-wrap items-center mr-2">
                                  <span>Start:</span>
                                  <span className="text-slate-900">{a.startDate ? formatToVN(a.startDate, { dateStyle: 'medium', timeStyle: 'short' }) : "-"}</span>
                                  <span className="text-slate-400">·</span>

                                  <span>Due:</span>
                                  <span className="text-slate-900">{a.dueDate ? formatToVN(a.dueDate, { dateStyle: 'medium', timeStyle: 'short' }) : "-"}</span>
                                  <span className="text-slate-400">·</span>

                                  <span>Extended Due:</span>
                                  <span className="text-slate-900">{a.extendedDueDate ? formatToVN(a.extendedDueDate, { dateStyle: 'medium', timeStyle: 'short' }) : "-"}</span>
                                  <span className="text-slate-400">·</span>

                                  {a.isOverdue ? (
                                    <span className="text-red-600 ml-1">Overdue</span>
                                  ) : (
                                    <span className="text-slate-500">Days until Due: <span className="text-violet-800">{a.daysUntilDue}</span></span>
                                  )}
                                </div>

                                <div className="text-xs text-slate-400">
                                  Created: {a.createdAt ? formatToVN(a.createdAt, { dateStyle: 'medium', timeStyle: 'short' }) : "-"}
                                </div>
                              </div>
                            </div>

                            {/* Right actions */}
                            <div className="flex flex-row items-end cursor-pointer text-violet-800 hover:text-violet-500 gap-2 shrink-0">
                              {/* Edit moved into detail view header */}
                              {a.status === (AssignmentStatus.Draft as number) ? (
                                <>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    className="text-xs cursor-pointer justify-end mr-1.5 flex items-end text-red-500 hover:text-red-600"
                                    disabled={deleting}
                                    onClick={() => {
                                      // open confirmation dialog with assignment info
                                      setToDelete(a);
                                      setConfirmOpen(true);
                                    }}
                                    title="Delete (Draft only)"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                  </Button>

                                  <ConfirmDeleteAssignmentDialog
                                    open={confirmOpen}
                                    onOpenChange={(v) => {
                                      setConfirmOpen(v);
                                      if (!v) setToDelete(null);
                                    }}
                                    assignment={toDelete}
                                    loading={deleting}
                                    onConfirm={async () => {
                                      const id = toDelete?.id;
                                      if (!id) {
                                        setConfirmOpen(false);
                                        setToDelete(null);
                                        return;
                                      }
                                      const res = await deleteAssignment(id, toDelete?.status as AssignmentStatus | undefined);
                                      if (res?.success) {
                                        fetchAssignments(query);
                                      }
                                      setConfirmOpen(false);
                                      setToDelete(null);
                                    }}
                                  />
                                </>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="text-xs cursor-pointer"
                                  onClick={() =>
                                    router.push(`/lecturer/course/${courseId}/reports?assignmentId=${a.id}`)
                                  }
                                >
                                  View Report
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs btn btn-gradient-slow cursor-pointer"
                                onClick={() => openDetail(a.id)}
                              >
                                Details
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
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

        <NewTopicSheet
          open={topicSheetOpen}
          onOpenChange={setTopicSheetOpen}
          onCreated={() => {
            toast.success("Topic created!");
          }}
        />
      </div>
    </div>
  );
}
