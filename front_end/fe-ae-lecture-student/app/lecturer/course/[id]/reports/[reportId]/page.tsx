"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useGetReportById } from "@/hooks/reports/useGetReportById";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import StatusBadge from "../utils/status";

export default function ReportDetailsPage() {
  const params = useParams();
  const sp = useSearchParams();
  const router = useRouter();

  const courseId = typeof params?.id === "string" ? params.id : "";
  const reportId = typeof params?.reportId === "string" ? params.reportId : "";
  const assignmentId = sp.get("assignmentId") || "";

  const { getReportById, loading } = useGetReportById();
  const { data: course, fetchCourseById } = useGetCourseById();

  const [detail, setDetail] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId) fetchCourseById(courseId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  useEffect(() => {
    (async () => {
      if (!reportId) return;
      try {
        const res = await getReportById(reportId);
        if (res?.report) setDetail(res.report);
        else setError("Report not found");
      } catch (e: any) {
        setError(e?.message || "Failed to fetch report");
      }
    })();
  }, [reportId]);

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    const target = courseId ? `/lecturer/course/${courseId}/reports${assignmentId ? `?assignmentId=${assignmentId}` : ""}` : "/lecturer/course";
    router.push(target);
  };

  return (
    <div className="py-4 px-3 min-h-screen">
      <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden mb-4">
        <div className="flex items-center justify-between">
          <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
            <li>
              <button onClick={() => router.push('/lecturer/course')} className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition">Courses Management</button>
            </li>
            <li className="text-slate-500 max-w-[220px] truncate">
              <button onClick={() => router.push(courseId ? `/lecturer/course/${courseId}` : '/lecturer/course')} className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition" title={course?.courseCodeTitle ?? `Course ${courseId}`}>
                {course?.courseCode ? `${course.courseCode} — ${course.courseCodeTitle}` : `Course ${courseId}`}
              </button>
            </li>
          </ol>
        </div>
        </nav>
      <Card className="shadow-md py-0 gap-0 border-slate-200 max-h-[calc(100vh-160px)] overflow-hidden">
        <CardHeader className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Report Details</h2>
            <div className="text-sm text-slate-600">Report ID: <span className="font-mono">{reportId}</span></div>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" className="cursor-pointer" onClick={goBack}><ArrowLeft className="size-4" />Back</Button>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-y-auto">
          <Separator />

          {loading && (
            <div className="flex items-center justify-center p-8 text-slate-600">
              <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Loading report...
            </div>
          )}

          {!loading && error && (
            <div className="p-6 text-red-600">{error}</div>
          )}

          {!loading && !error && !detail && (
            <div className="p-6 text-slate-600">No report data available.</div>
          )}

          {!loading && detail && (
            <div className="p-6">
              <div className="space-y-6 text-sm text-slate-700">
                {/* Assignment & Course meta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Assignment ID</div>
                    <div className="font-mono text-xs text-slate-700 truncate">{detail.assignmentId ?? '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Assignment Title</div>
                    <div className="font-medium">{detail.assignmentTitle ?? '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Max Points</div>
                    <div className="font-medium">{typeof detail.assignmentMaxPoints === 'number' ? detail.assignmentMaxPoints : '—'}</div>
                  </div>
                </div>

                {detail.assignmentDescription && (
                  <div>
                    <div className="text-xs text-slate-500">Assignment Description</div>
                    <div className="mt-1 text-slate-700 whitespace-pre-wrap">{detail.assignmentDescription}</div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Due Date</div>
                    <div className="font-medium">{detail.assignmentDueDate ? new Date(detail.assignmentDueDate).toLocaleString() : '—'}</div>
                    {detail.assignmentDueDate && (
                      <div className="text-xs text-slate-400">{formatDistanceToNow(parseISO(detail.assignmentDueDate), { addSuffix: true })}</div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Course</div>
                    <div className="font-medium">{detail.courseCode ? `${detail.courseCode} — ${detail.courseName ?? ''}` : (detail.courseName ?? '—')}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Group ID</div>
                    <div className="font-mono text-xs text-slate-700 truncate">{detail.groupId ?? '—'}</div>
                  </div>
                </div>

                {/* Submission & meta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Submitted By</div>
                    <div className="font-medium">{detail.submittedBy ?? '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Submitted At</div>
                    <div className="font-medium">{detail.submittedAt ? new Date(detail.submittedAt).toLocaleString() : '—'}</div>
                    {detail.submittedAt && (
                      <div className="text-xs text-slate-400">{formatDistanceToNow(parseISO(detail.submittedAt), { addSuffix: true })}</div>
                    )}
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Is Group Submission</div>
                    <div className="font-medium">{detail.isGroupSubmission ? 'Yes' : 'No'}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Status</div>
                    <div className="font-medium mt-1"><StatusBadge status={detail.status} /></div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Grade</div>
                    <div className="font-medium">{detail.grade ?? '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Version</div>
                    <div className="font-medium">{typeof detail.version === 'number' ? detail.version : '—'}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Feedback</div>
                  <div className="mt-1 text-slate-700 whitespace-pre-wrap">{detail.feedback ?? '—'}</div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Graded By</div>
                    <div className="font-medium">{detail.gradedBy ?? '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Graded At</div>
                    <div className="font-medium">{detail.gradedAt ? new Date(detail.gradedAt).toLocaleString() : '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">File URL</div>
                    <div className="text-xs font-mono truncate">{detail.fileUrl ?? '—'}</div>
                    {detail.fileUrl && (
                      <div className="mt-2">
                        <a href={detail.fileUrl} target="_blank" rel="noreferrer" className="btn bg-white border border-slate-200 text-slate-700 px-3 py-1 rounded">Download</a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-500">Submission</div>
                  <div className="mt-2 prose max-w-full">
                    {detail.submission ? (
                      <div dangerouslySetInnerHTML={{ __html: detail.submission }} />
                    ) : (
                      <div className="text-slate-600">No submission body provided.</div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-slate-500">Created At</div>
                    <div className="font-medium">{detail.createdAt ? new Date(detail.createdAt).toLocaleString() : '—'}</div>
                  </div>

                  <div>
                    <div className="text-xs text-slate-500">Updated At</div>
                    <div className="font-medium">{detail.updatedAt ? new Date(detail.updatedAt).toLocaleString() : '—'}</div>
                  </div>

                  <div />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
