"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useMyCourseRequests } from "@/hooks/course-request/useMyCourseRequests";
import { CourseRequestStatus } from "@/types/course-requests/course-request.response";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import RequestsFilterBar from "./RequestsFilterBar";

type Props = {
  active?: boolean;
};

export default function CourseRequests({ active = true }: Props) {
  const router = useRouter();
  const {
    listData: reqs,
    totalCount: reqTotal,
    currentPage: reqPage,
    pageSize: reqPageSize,
    loading: loadingReqs,
    fetchMyCourseRequests,
  } = useMyCourseRequests();

  const [page, setPage] = useState(1);
  // Filters
  const [filterName, setFilterName] = useState("");
  const [filterCode, setFilterCode] = useState("");
  const [lecturerName, setLecturerName] = useState("");
  const [createdAfter, setCreatedAfter] = useState("");
  const [createdBefore, setCreatedBefore] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!active) return;
    fetchMyCourseRequests({
      page,
      pageSize: 10,
      sortBy: "CreatedAt",
      sortDirection: "desc",
      name: filterName || undefined,
      courseCode: filterCode || undefined,
      lecturerName: lecturerName || undefined,
      createdAfter: createdAfter || undefined,
      createdBefore: createdBefore || undefined,
      status: status || undefined,
    });
  }, [active, page, filterName, filterCode, lecturerName, createdAfter, createdBefore, status, fetchMyCourseRequests]);

  const totalPages = Math.max(1, Math.ceil((reqTotal || 0) / (reqPageSize || 10)));
  const statusInfo = (s: number | string | undefined) => {
    const n = typeof s === "string" ? Number(s) : s ?? CourseRequestStatus.Pending;
    switch (n) {
      case CourseRequestStatus.Pending:
        return { label: "Pending", className: "bg-amber-50 text-amber-700 border-amber-200" };
      case CourseRequestStatus.Approved:
        return { label: "Approved", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case CourseRequestStatus.Rejected:
        return { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" };
      case CourseRequestStatus.Cancelled:
        return { label: "Cancelled", className: "bg-slate-100 text-slate-600 border-slate-200" };
      default:
        return { label: "Unknown", className: "bg-slate-50 text-slate-600 border-slate-200" };
    }
  };

  return (
    <div className="h-full w-full flex flex-col overflow-hidden">
      {/* Top filter bar (same position as courses) */}
      <div className="mb-3 sticky top-0 bg-slate-50 backdrop-blur z-10">
        <Card className="p-0 border-none shadow-none rounded-none">
          <RequestsFilterBar
            filterName={filterName}
            setFilterName={setFilterName}
            filterCode={filterCode}
            setFilterCode={setFilterCode}
            lecturerName={lecturerName}
            setLecturerName={setLecturerName}
            createdAfter={createdAfter}
            setCreatedAfter={setCreatedAfter}
            createdBefore={createdBefore}
            setCreatedBefore={setCreatedBefore}
            status={status}
            setStatus={setStatus}
            onApply={() => setPage(1)}
            onClear={() => {
              setFilterName("");
              setFilterCode("");
              setLecturerName("");
              setCreatedAfter("");
              setCreatedBefore("");
              setStatus("");
              setPage(1);
            }}
            resultCount={reqs.length}
            totalCount={reqTotal}
            loading={loadingReqs}
          />
        </Card>
      </div>
      
      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto scroll-smooth scrollbar-stable">

        {loadingReqs && (
          <div className="grid grid-cols-1 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-14 animate-pulse bg-slate-50 border-slate-200" />
            ))}
          </div>
        )}

        {!loadingReqs && (reqs?.length ?? 0) === 0 && (
          <div className="h-[40vh] grid place-items-center">
            <div className="text-center text-slate-500 text-sm">
              No course requests found.
            </div>
          </div>
        )}

        {!loadingReqs && (reqs?.length ?? 0) > 0 && (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {reqs.map((r) => {
                const s = statusInfo(r.status);
                return (
                  <Card key={r.id} className="relative overflow-hidden h-full py-3 flex flex-col border-slate-200 hover:shadow-[0_8px_24px_rgba(2,6,23,0.06)] hover:border-slate-300 focus:outline-none">
                    {/* Left gradient accent */}
                    <div aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7f71f4] via-[#a786f9] to-[#f4a23b]" />

                    {/* Header */}
                    <div className="px-3.5 pb-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <div className="flex items-center gap-1 truncate max-w-[65%]">
                          <span className="font-medium text-slate-600 truncate">{r.lecturerName}</span>
                        </div>
                        <Badge variant="outline" className={`text-[11px] ${s.className}`}>{s.label}</Badge>
                      </div>
                      <div className="mt-2 flex items-start justify-between gap-3 min-w-0">
                        <div className="text-sm text-slate-800 flex-1 min-w-0 overflow-hidden flex items-baseline gap-1">
                          <span className="font-mono text-sm text-[#7f71f4]">[{r.courseCode}]</span>
                          <span className="text-slate-700 font-bold truncate">{r.courseCodeTitle}</span>
                        </div>
                        {r.department && (
                          <Badge variant="outline" className="text-[11px] border-slate-300 text-slate-700 whitespace-nowrap">{r.department}</Badge>
                        )}
                      </div>
                      {/* Description */}
                      {r.description && (
                        <div className="mt-2 text-[13px] text-slate-600 line-clamp-2 overflow-hidden">
                          {r.description}
                        </div>
                      )}
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Reason badge (if any) above footer */}
                    {r.requestReason && (
                      <div className="px-3.5">
                        <Badge className="bg-slate-100 text-slate-700 max-w-full truncate" title={r.requestReason}>
                          Reason: {r.requestReason}
                        </Badge>
                      </div>
                    )}

                    {/* Footer pinned */}
                    <div className="px-3.5 pt-2 mt-auto gap-2">
                      <div className="flex flex-row items-center justify-between gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className="text-xs bg-brand/10 text-brand border border-brand/20">
                            {r.term} • {r.year}
                          </Badge>
                        </div>
                        <div className="text-[11px] text-slate-500">Created: {new Date(r.createdAt).toLocaleDateString("en-GB")}</div>
                      </div>
                      {/* <Button
                        size="sm"
                        variant="ghost"
                        className="btn btn-gradient-slow rounded-md text-white px-3 py-1 shadow text-xs cursor-pointer"
                        onClick={() => router.push(`/lecturer/course/request/${r.id}`)}
                        aria-label="Request details"
                      >
                        Details
                      </Button> */}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-1 sm:px-2 pt-1">
              <div className="text-xs text-slate-500 cursor-text">Total: {reqTotal}</div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="h-8 px-2 text-xs rounded-md"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Previous
                </Button>
                <span className="text-xs text-slate-600 cursor-text">Page {page} of {totalPages}</span>
                <Button
                  variant="outline"
                  className="h-8 px-2 text-xs rounded-md"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
