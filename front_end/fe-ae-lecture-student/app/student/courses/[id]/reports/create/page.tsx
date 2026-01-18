"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  FilePlus2,
  RefreshCw,
  Loader2,
  FileText,
  CalendarDays,
  Clock,
  AlertCircle,
  Search,
  Filter,
  X,
  Users,
  Star,
  BookOpen,
  User,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useGetMyReports } from "@/hooks/reports/useGetMyReports";
import type { ReportListItem } from "@/types/reports/reports.response";
import type { MyReportsQuery } from "@/types/reports/reports.payload";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import { getReportStatusMeta } from "../components/report-labels";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const headerButtonClass = "btn bg-white border border-brand text-nav hover:text-nav-active";

// Status options for filter
const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "1", label: "Draft" },
  { value: "2", label: "Submitted" },
  { value: "3", label: "Under Review" },
  { value: "4", label: "Requires Revision" },
  { value: "5", label: "Resubmitted" },
  { value: "6", label: "Graded" },
  { value: "7", label: "Late" },
  { value: "8", label: "Rejected" },
];

export default function ReportsCreatePage() {
  const params = useParams();
  const router = useRouter();
  const sp = useSearchParams();

  const courseId = typeof params?.id === "string" ? params.id : "";
  const assignmentIdFromUrl = sp.get("assignmentId") || undefined;

  const { getMyReports, loading } = useGetMyReports();

  const [items, setItems] = useState<ReportListItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [filterCourseName, setFilterCourseName] = useState("");
  const [filterAssignmentName, setFilterAssignmentName] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;

  const pageTitle = useMemo(() => {
    if (assignmentIdFromUrl) return "Create / Continue Report";
    return "Your Reports";
  }, [assignmentIdFromUrl]);

  const fetchReports = useCallback(async (page: number = 1) => {
    setError(null);
    try {
      const query: MyReportsQuery = {
        pageNumber: page,
        pageSize,
      };

      // Add filters
      if (assignmentIdFromUrl) {
        query.assignmentId = assignmentIdFromUrl;
      }
      if (filterCourseName.trim()) {
        query.courseName = filterCourseName.trim();
      }
      if (filterAssignmentName.trim()) {
        query.assignmentName = filterAssignmentName.trim();
      }
      if (filterStatus && filterStatus !== "all") {
        query.status = filterStatus;
      }

      const res = await getMyReports(query);
      if (!res?.success) {
        setError(res?.message || "Failed to load reports");
        setItems([]);
        return;
      }
      setItems(res.reports || []);
      setTotalPages(res.totalPages || 1);
      setTotalCount(res.totalCount || 0);
      setCurrentPage(res.currentPage || 1);
    } catch (e: any) {
      setError(e?.message || "Failed to load reports");
      setItems([]);
    }
  }, [assignmentIdFromUrl, filterCourseName, filterAssignmentName, filterStatus, getMyReports, pageSize]);

  useEffect(() => {
    fetchReports(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assignmentIdFromUrl]);

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchReports(1);
  };

  const handleClearFilters = () => {
    setFilterCourseName("");
    setFilterAssignmentName("");
    setFilterStatus("all");
    setCurrentPage(1);
    // Fetch with cleared filters
    setTimeout(() => fetchReports(1), 0);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    fetchReports(page);
  };

  const handleBack = () => {
    router.push(`/student/courses/${courseId}`);
  };

  const handleOpenReport = (reportId: string) => {
    router.push(`/student/courses/${courseId}/reports/${reportId}`);
  };

  const handleReload = () => {
    fetchReports(currentPage);
  };

  const existsDraftForAssignment = useMemo(() => {
    if (!assignmentIdFromUrl) return false;
    return items.some((x) => x.status === 1 /* Draft */);
  }, [items, assignmentIdFromUrl]);

  const hasActiveFilters = filterCourseName || filterAssignmentName || (filterStatus && filterStatus !== "all");

  return (
    <motion.div
      className="flex flex-col gap-6 py-6 px-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-3xl font-bold text-nav flex items-center gap-2">
            <FilePlus2 className="w-7 h-7 text-nav-active shrink-0" />
            <span className="truncate">{pageTitle}</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {assignmentIdFromUrl
              ? "Find your existing report for this assignment or start fresh."
              : "Browse and filter your submitted reports."}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className={`${headerButtonClass} ${showFilters ? "bg-slate-100" : ""}`}
            title="Toggle Filters"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 w-2 h-2 rounded-full bg-nav-active" />
            )}
          </Button>
          <Button
            onClick={handleReload}
            variant="outline"
            className={headerButtonClass}
            title="Refresh"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            onClick={handleBack}
            variant="outline"
            className={headerButtonClass}
            title="Back to Course"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-nav flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filter Reports
            </h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                <X className="w-3 h-3 mr-1" />
                Clear all
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Course Name Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Course Name</label>
              <div className="relative">
                <BookOpen className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by course..."
                  value={filterCourseName}
                  onChange={(e) => setFilterCourseName(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {/* Assignment Name Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Assignment Name</label>
              <div className="relative">
                <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search by assignment..."
                  value={filterAssignmentName}
                  onChange={(e) => setFilterAssignmentName(e.target.value)}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="h-9 text-sm border-slate-200 focus:border-brand focus:ring-brand">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Apply Button */}
            <div className="flex items-end">
              <Button
                onClick={handleApplyFilters}
                className="w-full h-9 btn-gradient"
                disabled={loading}
              >
                <Search className="w-4 h-4 mr-1" />
                Apply Filters
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Assignment ID Info (if from URL) */}
      {assignmentIdFromUrl && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
          Filtering by <b>assignmentId</b>: <code className="text-[11px]">{assignmentIdFromUrl}</code>
        </div>
      )}

      {/* Results Summary */}
      {!loading && items.length > 0 && (
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>
            Showing <b>{items.length}</b> of <b>{totalCount}</b> reports
          </span>
          {hasActiveFilters && (
            <span className="text-xs text-slate-500">Filters applied</span>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && !items.length ? (
        <div className="flex items-center justify-center h-[40vh] text-nav">
          <Loader2 className="w-6 h-6 mr-2 animate-spin text-nav-active" />
          <span className="text-sm">Loading your reports…</span>
        </div>
      ) : null}

      {/* Empty State */}
      {!loading && items.length === 0 && !error && (
        <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-600">
          <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">No reports found{assignmentIdFromUrl ? " for this assignment" : ""}.</p>
          {hasActiveFilters && (
            <p className="text-xs mt-2 text-slate-500">
              Try adjusting your filters or{" "}
              <button onClick={handleClearFilters} className="text-nav-active underline">
                clear all filters
              </button>
            </p>
          )}
        </div>
      )}

      {/* Reports Grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((r) => {
            const statusMeta = getReportStatusMeta(r.status);
            return (
              <div
                key={r.id}
                className="card rounded-2xl p-4 hover:shadow-md transition-shadow cursor-pointer border border-slate-100 hover:border-slate-200"
                onClick={() => handleOpenReport(r.id)}
              >
                <div className="flex flex-col gap-3">
                  {/* Header with Status Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-5 h-5 text-nav-active shrink-0" />
                      <div className="font-semibold text-nav truncate text-sm">
                        {r.assignmentTitle}
                      </div>
                    </div>
                    <Badge className={`${statusMeta.className} shrink-0 text-[10px]`}>
                      {statusMeta.label}
                    </Badge>
                  </div>

                  {/* Course Name */}
                  {r.courseName && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{r.courseName}</span>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="w-3 h-3" />
                      Created: {formatDateTimeVN(r.createdAt)}
                    </span>
                    {r.submittedAt && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Submitted: {formatDateTimeVN(r.submittedAt)}
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-slate-100" />

                  {/* Footer Info */}
                  <div className="flex items-center justify-between text-xs">
                    {/* Group/Individual */}
                    <div className="flex items-center gap-1.5 text-slate-600">
                      {r.groupName ? (
                        <>
                          <Users className="w-3.5 h-3.5 text-indigo-500" />
                          <span className="truncate max-w-[120px]">{r.groupName}</span>
                        </>
                      ) : (
                        <>
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>Individual</span>
                        </>
                      )}
                    </div>

                    {/* Grade (if graded) */}
                    {r.grade !== null && r.grade !== undefined && (
                      <div className="flex items-center gap-1 text-amber-600 font-medium">
                        <Star className="w-3.5 h-3.5" />
                        <span>{r.grade}</span>
                      </div>
                    )}

                    {/* Version */}
                    <div className="flex items-center gap-1 text-slate-400">
                      <span>v{r.version}</span>
                    </div>
                  </div>

                  {/* Graded By Info */}
                  {r.gradedByName && r.gradedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded-lg px-2 py-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        Graded by {r.gradedByName} on {formatDateTimeVN(r.gradedAt)}
                      </span>
                    </div>
                  )}

                  {/* Feedback Preview */}
                  {r.feedback && (
                    <div className="text-xs text-slate-600 bg-slate-50 rounded-lg px-2 py-1.5 line-clamp-2">
                      <span className="font-medium">Feedback:</span> {r.feedback}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className="h-8"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                  disabled={loading}
                  className={`h-8 w-8 p-0 ${pageNum === currentPage ? "btn-gradient" : ""}`}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className="h-8"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Draft Notice */}
      {assignmentIdFromUrl && existsDraftForAssignment && (
        <div className="text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          ⚠️ You already have a draft for this assignment. Click the card above to continue.
        </div>
      )}
    </motion.div>
  );
}
