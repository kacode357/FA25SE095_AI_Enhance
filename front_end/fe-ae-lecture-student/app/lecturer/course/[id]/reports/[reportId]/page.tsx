"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
import { useGetReportById } from "@/hooks/reports/useGetReportById";
import { useGradeReport } from "@/hooks/reports/useGradeReport";
import { useRejectReport } from "@/hooks/reports/useRejectReport";
import { useRequestReportRevision } from "@/hooks/reports/useRequestReportRevision";
import { normalizeAndSanitizeHtml } from "@/utils/sanitize-html";
import { formatDistanceToNow, parseISO } from "date-fns";
import { ArrowLeft, Book, ChevronRight, ClipboardPenLine, Loader2, OctagonAlert, PencilOff, X } from "lucide-react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import HistoryReportLog from "../history/HistoryReportLog";
import TimelineReportLog from "../timeline/TimelineReportLog";
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
  const { students: enrolledStudents, fetchCourseStudents } = useCourseStudents("");

  const [detail, setDetail] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [gradeError, setGradeError] = useState<string | null>(null);
  const [revisionError, setRevisionError] = useState<string | null>(null);
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [gradeValue, setGradeValue] = useState<number | string>("");
  const [feedbackValue, setFeedbackValue] = useState<string>("");
  const [revisionFeedback, setRevisionFeedback] = useState<string>("");
  const [rejectFeedback, setRejectFeedback] = useState<string>("");
  const formRef = useRef<HTMLDivElement | null>(null);
  const initialTab = (() => {
    const t = sp?.get('tab');
    return t === 'history' || t === 'timeline' || t === 'details' ? (t as 'details' | 'history' | 'timeline') : 'details';
  })();

  const [activeTab, setActiveTab] = useState<'details' | 'history' | 'timeline'>(initialTab);
  const pathname = usePathname();

  const updateTabInUrl = (tab: string) => {
    try {
      const params = new URLSearchParams(Array.from(sp?.entries?.() || []));
      if (tab) params.set('tab', tab);
      else params.delete('tab');
      const search = params.toString();
      const url = `${pathname}${search ? `?${search}` : ''}`;
      router.replace(url);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    const t = sp?.get('tab');
    if (t === 'history' || t === 'timeline' || t === 'details') {
      if (t !== activeTab) setActiveTab(t as 'details' | 'history' | 'timeline');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const { gradeReport, loading: grading } = useGradeReport();
  const { requestReportRevision, loading: requestingRevision } = useRequestReportRevision();
  const { rejectReport, loading: rejecting } = useRejectReport();

  useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId);
      fetchCourseStudents(courseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Scroll to bottom when any form is shown
  useEffect(() => {
    if ((showGradeForm || showRevisionForm || showRejectForm) && formRef.current) {
      // small timeout to ensure layout updated
      setTimeout(() => {
        formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 50);
    }
  }, [showGradeForm, showRevisionForm, showRejectForm]);

  const getStudentName = (id?: string | null) => {
    if (!id) return "—";
    const s = enrolledStudents?.find((e) => e.studentId === id);
    if (!s) return id;
    return (s.fullName ?? `${s.firstName ?? ""} ${s.lastName ?? ""}`.trim()) || id;
  };

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
    <div className="pb-4 px-3 min-h-screen">
      <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden mb-4">
        <div className="flex items-center justify-between">
          <ol className="flex items-center gap-0 mt-1.5 text-slate-500 flex-nowrap overflow-hidden">
            <Book className="size-4" />
            <li>
              <button onClick={() => router.push('/lecturer/course')} className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition">Courses Management</button>
            </li>

            <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />

            <li className="text-slate-500 max-w-[220px] truncate">
              <button onClick={() => router.push(courseId ? `/lecturer/course/${courseId}` : '/lecturer/course')} className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition" title={course?.courseCodeTitle ?? `Course ${courseId}`}>
                {course?.courseCode ? `${course.courseCode} — ${course.courseCodeTitle}` : `Course ${courseId}`}
              </button>
            </li>

            <ChevronRight className="size-3 text-slate-400 mx-1 hidden sm:inline" />

            <li className="font-medium cursor-text text-slate-900 max-w-[150px] truncate">
              Report Details
            </li>
          </ol>
        </div>
      </nav>
      <Card className="shadow-md py-0 gap-0 border-slate-200 max-h-[calc(100vh-140px)] overflow-hidden">
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button size="sm" variant="ghost" className="cursor-pointer -ml-2" onClick={goBack}><ArrowLeft className="size-4" /></Button>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Report Details</h2>
                <div className="text-xs text-slate-600">Report ID: <span className="font-mono">{reportId}</span></div>
              </div>
            </div>

            {activeTab !== 'history' && (
              <div className="flex items-center gap-2">
                {!showRevisionForm && (
                  <Button size="sm" className="cursor-pointer text-blue-500 shadow-lg mr-2" onClick={() => { setShowRevisionForm(true); setRevisionError(null); setShowGradeForm(false); setShowRejectForm(false); }}><PencilOff className="size-4" />Request Revision</Button>
                )}

                {!showRejectForm && (
                  <Button size="sm" className="cursor-pointer text-red-500 shadow-lg mr-2" onClick={() => { setShowRejectForm(true); setRejectError(null); setShowRevisionForm(false); }}><X className="size-4" />Reject Report</Button>
                )}

                {!showGradeForm && detail?.status !== 'Rejected' && (
                  <Button size="sm" className="cursor-pointer btn btn-gradient-slow" onClick={() => { setShowGradeForm(true); setGradeError(null); setShowRevisionForm(false); setShowRejectForm(false); }}><ClipboardPenLine className="size-4" />Grade</Button>
                )}
              </div>
            )}
          </div>

          {/* Tabs: keep these inside header so they don't scroll with CardContent */}
          <div className="mt-3 px-0">
            <div className="px-6 py-2 bg-gradient-to-r from-blue-100 to-white rounded-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveTab('details'); updateTabInUrl('details'); }}
                  className={`px-3 cursor-pointer py-1 text-sm rounded ${activeTab === 'details' ? 'bg-violet-50 text-violet-700 rounded-md shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                >Details</button>

                <button
                  onClick={() => { setActiveTab('history'); updateTabInUrl('history'); }}
                  className={`px-3 cursor-pointer py-1 text-sm rounded ${activeTab === 'history' ? 'bg-violet-50 text-violet-700 rounded-md shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                >History Log</button>

                <button
                  onClick={() => { setActiveTab('timeline'); updateTabInUrl('timeline'); }}
                  className={`px-3 cursor-pointer py-1 text-sm rounded ${activeTab === 'timeline' ? 'bg-violet-50 text-violet-700 rounded-md shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                >Timeline</button>
              </div>
            </div>
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

          {/* Render tabs content */}
          {!loading && activeTab === 'details' && detail && (
            <div className="p-6">
              <div className="space-y-6 text-sm text-slate-700">
                {/* Assignment & Course meta */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-slate-200 pb-5">
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
                    <div className="mt-1 text-slate-700 bg-white p-5 border-slate-200 rounded-md shadow-md">
                      <div dangerouslySetInnerHTML={{ __html: normalizeAndSanitizeHtml(detail.assignmentDescription) }} />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-slate-200">
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
                    <div className="font-medium">{getStudentName(detail.submittedBy)}</div>
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
                {/* Grade form (hidden until Grade clicked) */}
                <div ref={formRef} className="my-6">
                  {/* Grade form */}
                  {showGradeForm && (
                    <div className="p-4 bg-white border border-slate-200 rounded">
                      <div className="text-sm text-red-600 uppercase mb-5">Submit grade and feedback for this report.</div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                        <div className="max-w-40">
                          <label className="text-xs text-slate-800">Grade</label>
                          <input
                            type="number"
                            min={0}
                            step="0.1"
                            value={gradeValue as any}
                            onChange={(e) => setGradeValue(e.target.value === "" ? "" : Number(e.target.value))}
                            className="mt-1 border-slate-500 w-full px-3 py-2 border rounded text-slate-800"
                            placeholder={detail.assignmentMaxPoints ? `0 - ${detail.assignmentMaxPoints}` : undefined}
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="text-xs text-slate-800">Feedback</label>
                          <textarea
                            value={feedbackValue}
                            onChange={(e) => setFeedbackValue(e.target.value)}
                            rows={3}
                            className="mt-1 border-slate-200 w-full px-3 py-2 border rounded text-slate-800"
                            placeholder="Optional feedback for the student"
                          />
                        </div>
                      </div>

                      {gradeError && <div className="text-xs text-red-600 mt-2">* {gradeError}</div>}

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="btn btn-gradient-slow"
                          onClick={async () => {
                            if (!detail?.id && !reportId) return;
                            // basic validation
                            if (gradeValue === "" || typeof gradeValue !== 'number' || Number.isNaN(gradeValue)) {
                              setGradeError("Please enter a valid numeric grade.");
                              return;
                            }

                            try {
                              const payload = {
                                reportId: reportId,
                                grade: Number(gradeValue),
                                feedback: feedbackValue || "",
                              };

                              const res = await gradeReport(payload as any);
                              if (res) {
                                // update UI immediately
                                setDetail((prev: any) => ({
                                  ...prev,
                                  grade: payload.grade,
                                  feedback: payload.feedback,
                                  status: 'Graded',
                                  gradedAt: new Date().toISOString(),
                                }));
                                setShowGradeForm(false);
                                setGradeValue("");
                                setFeedbackValue("");
                                setGradeError(null);
                                setError(null);
                              }
                            } catch (e: any) {
                              setGradeError(e?.message || 'Failed to submit grade');
                            }
                          }}
                          disabled={grading}
                        >
                          {grading ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving
                            </>
                          ) : (
                            'Save Grade'
                          )}
                        </Button>

                        <Button size="sm" variant="ghost" className="text-violet-800 hover:text-violet-500" onClick={() => { setShowGradeForm(false); setGradeError(null); }}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {/* Revision form */}
                  {showRevisionForm && (
                    <div className="p-4 bg-white border border-slate-200 rounded">
                      <div className="text-sm text-yellow-600 uppercase mb-3">Request revision for this report.</div>

                      <div>
                        <label className="text-xs cursor-text text-slate-800">Feedback (instructions for revision)</label>
                        <textarea
                          value={revisionFeedback}
                          onChange={(e) => setRevisionFeedback(e.target.value)}
                          rows={4}
                          className="mt-1 border-slate-200 w-full px-3 py-2 border rounded text-slate-800"
                          placeholder="Tell the student what to fix or improve"
                        />
                      </div>

                      {revisionError && <div className="text-xs text-red-600 mt-2">* {revisionError}</div>}

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="text-blue-500 shadow-lg"
                          onClick={async () => {
                            if (!reportId) return;
                            if (!revisionFeedback || revisionFeedback.trim() === "") {
                              setRevisionError("Please enter feedback for the revision request.");
                              return;
                            }

                            try {
                              const payload = {
                                reportId: reportId,
                                feedback: revisionFeedback || "",
                              };

                              const res = await requestReportRevision(payload as any);
                              if (res && res.success) {
                                setDetail((prev: any) => ({
                                  ...prev,
                                  status: 'RequiresRevision',
                                  feedback: payload.feedback,
                                }));
                                setShowRevisionForm(false);
                                setRevisionFeedback("");
                                setRevisionError(null);
                                setError(null);
                              } else {
                                setRevisionError(res?.message || 'Failed to request revision');
                              }
                            } catch (e: any) {
                              setRevisionError(e?.message || 'Failed to request revision');
                            }
                          }}
                          disabled={requestingRevision}
                        >
                          {requestingRevision ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending
                            </>
                          ) : (
                            'Send Revision Request'
                          )}
                        </Button>

                        <Button size="sm" variant="ghost" className="text-violet-800 hover:text-violet-500" onClick={() => { setShowRevisionForm(false); setRevisionError(null); }}>Cancel</Button>
                      </div>
                    </div>
                  )}

                  {/* Reject form */}
                  {showRejectForm && (
                    <div className="p-4 bg-white border border-slate-200 rounded">
                      <div className="text-sm flex gap-2 text-red-600 uppercase mb-3"><OctagonAlert className="size-4" />Reject this report.</div>

                      <div>
                        <label className="text-xs text-slate-800">Reason for rejection</label>
                        <textarea
                          value={rejectFeedback}
                          onChange={(e) => setRejectFeedback(e.target.value)}
                          rows={3}
                          className="mt-1 border-slate-200 w-full px-3 py-2 border rounded text-slate-800"
                          placeholder="Explain why this report is rejected"
                        />
                      </div>

                      {rejectError && <div className="text-xs text-red-600 mt-2">* {rejectError}</div>}

                      <div className="mt-4 flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          className="text-red-500 shadow-lg"
                          onClick={async () => {
                            if (!reportId) return;
                            if (!rejectFeedback || rejectFeedback.trim() === "") {
                              setRejectError("Please enter a reason for rejection.");
                              return;
                            }

                            try {
                              const payload = {
                                reportId: reportId,
                                feedback: rejectFeedback || "",
                              };

                              const res = await rejectReport(payload as any);
                              if (res && res.success) {
                                setDetail((prev: any) => ({
                                  ...prev,
                                  status: 'Rejected',
                                  feedback: payload.feedback,
                                }));
                                // after reject, hide grade button (detail.status check handles it)
                                setShowRejectForm(false);
                                setRejectFeedback("");
                                setRejectError(null);
                                setError(null);
                              } else {
                                setRejectError(res?.message || 'Failed to reject report');
                              }
                            } catch (e: any) {
                              setRejectError(e?.message || 'Failed to reject report');
                            }
                          }}
                          disabled={rejecting}
                        >
                          {rejecting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rejecting
                            </>
                          ) : (
                            'Send Reject Report'
                          )}
                        </Button>

                        <Button size="sm" variant="ghost" className="text-violet-800 hover:text-violet-500" onClick={() => { setShowRejectForm(false); setRejectError(null); }}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'history' && (
            <div className="p-6">
              <HistoryReportLog reportId={reportId} />
            </div>
          )}

            {!loading && activeTab === 'timeline' && (
              <div className="p-6">
                <TimelineReportLog reportId={reportId} courseId={courseId} />
              </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
