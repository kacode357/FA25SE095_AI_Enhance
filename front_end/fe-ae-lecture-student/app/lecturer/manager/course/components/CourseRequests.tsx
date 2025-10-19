"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useMyCourseRequests } from "@/hooks/course-request/useMyCourseRequests";
import { CourseRequestStatus } from "@/types/course-requests/course-request.response";
import { useEffect, useState } from "react";
import RequestsFilterBar from "./RequestsFilterBar";

type Props = {
  active?: boolean;
};

export default function CourseRequests({ active = true }: Props) {
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
    <div className="flex-1 flex flex-col">
      {/* Filters */}
      <div className="mb-2">
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
      </div>
      {loadingReqs && (
        <div className="grid grid-cols-1 gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="h-16 animate-pulse bg-slate-50 border-slate-200" />
          ))}
        </div>
      )}

      {!loadingReqs && (reqs?.length ?? 0) === 0 && (
        <div className="h-[40vh] grid place-items-center">
          <div className="text-center text-slate-500">No course requests found.</div>
        </div>
      )}

      {!loadingReqs && (reqs?.length ?? 0) > 0 && (
        <div className="flex flex-col gap-2">
          <div className="grid grid-cols-1 gap-2">
            {reqs.map((r) => (
              <Card key={r.id} className="border-slate-200 cursor-default">
                <div className="px-3 text-sm">
                  <div className="flex items-start justify-between gap-5">
                    <div className="min-w-0">
                      <div className="font-medium cursor-text pb-3 text-slate-900 truncate">
                        {r.courseCode} — {r.courseCodeTitle}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-2 gap-y-1">
                        <span><span className="font-medium cursor-text text-slate-700">{r.term}</span></span>•
                        <span><span className="font-medium cursor-text text-slate-700">{r.year}</span></span>
                        {r.department && (
                          <span className="cursor-text">Dept: <span className="font-medium cursor-text text-slate-700">{r.department}</span></span>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[11px] cursor-text ${statusInfo(r.status).className}`}>
                      {statusInfo(r.status).label}
                    </Badge>
                  </div>

                  {r.description && (
                    <div className="text-xs cursor-text pb-3 text-slate-700 mt-4 line-clamp-2">
                      {r.description}
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 mt-2 flex flex-wrap gap-x-2 gap-y-1">
                    <span className="cursor-text">Lecturer: <span className="text-slate-700 cursor-text">{r.lecturerName}</span></span>
                    <span className="cursor-text">Created: <span className="text-slate-700 cursor-text">{new Date(r.createdAt).toLocaleDateString("en-GB")}</span></span>
                    {r.requestReason && (
                      <span className="truncate">Reason: <span className="text-slate-700">{r.requestReason}</span></span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-xs cursor-text flex justify-end px-2 pt-2 text-slate-500">Total: {reqTotal} • Page {reqPage} of {totalPages}</div>
        </div>
      )}
    </div>
  );
}
