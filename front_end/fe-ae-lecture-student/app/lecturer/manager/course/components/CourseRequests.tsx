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
    <div className="h-full w-full grid grid-cols-1 xl:grid-cols-10 gap-3 overflow-hidden">
      {/* Left: Filter (fixed) */}
      <div className="hidden xl:block xl:col-span-3 pr-1 self-start">
        <Card className="p-3 border-slate-200 shadow-sm">
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
            stacked
          />
        </Card>
      </div>

      {/* Right: Scrollable list */}
      <div className="xl:col-span-7 overflow-y-auto scroll-smooth scrollbar-stable">
        {/* Mobile/Tablet Filter (hidden on xl) */}
        <div className="xl:hidden mb-2 sticky top-0 bg-white/80 backdrop-blur z-10">
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
            <div className="grid grid-cols-2 gap-5">
              {reqs.map((r) => (
                <Card key={r.id} className="border-slate-200/80 hover:border-slate-300 transition cursor-default relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7f71f4] to-[#f4a23b]" />
                  <div className="px-3 sm:px-3 py-2 text-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium cursor-text pb-1 text-slate-900 truncate">
                          <span className="font-mono text-base text-[#7f71f4] mr-1">[{r.courseCode}]</span>
                          <span className="align-middle text-base">{r.courseCodeTitle}</span>
                        </div>
                        <div className="text-xs text-slate-700 mt-0.5 mb-3 flex flex-wrap gap-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {r.term} • {r.year}
                          </span>
                          {r.department && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                              Dept: {r.department}
                            </span>
                          )}
                        </div>
                      </div>
                      <Badge variant="outline" className={`text-xs h-5 px-2 cursor-text ${statusInfo(r.status).className}`}>
                        {statusInfo(r.status).label}
                      </Badge>
                    </div>

                    {r.description && (
                      <div className="text-[12px] ml-2 cursor-text pb-1 mb-3 text-slate-700 mt-2 line-clamp-1">
                        {r.description}
                      </div>
                    )}

                    <div className="text-xs text-slate-600 mt-1 flex flex-wrap justify-between gap-1.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50">
                        Lecturer: <span className="ml-1 text-slate-700">{r.lecturerName}</span>
                      </span>
                      {r.requestReason && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50 max-w-full truncate">
                          Reason: <span className="ml-1 text-slate-700 truncate">{r.requestReason}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-slate-50">
                        Created: <span className="ml-1 text-slate-700">{new Date(r.createdAt).toLocaleDateString("en-GB")}</span>
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
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
