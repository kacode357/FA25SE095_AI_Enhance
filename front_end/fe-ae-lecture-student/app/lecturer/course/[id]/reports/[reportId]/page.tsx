"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
import { useAiCheckReport } from "@/hooks/reports/useAiCheckReport";
import { useGetAiChecksReport } from "@/hooks/reports/useGetAiChecksReport";
import { useGetReportById } from "@/hooks/reports/useGetReportById";
import type { ReportAiCheckResult } from "@/types/reports/reports.response";
import { ArrowLeft, ClipboardPenLine, Info, Loader2, PencilOff, X } from "lucide-react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import HistoryReportLog from "../history/HistoryReportLog";
import TimelineReportLog from "../timeline/TimelineReportLog";
import StatusBadge from "../utils/status";
import AiCheckModal from "./components/AiCheckModal";
import GradeForm from './components/GradeForm';
import RejectForm from './components/RejectForm';
import ReportInfoDetails from "./components/ReportInfoDetails";
import RevisionForm from './components/RevisionForm';

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
  const [showGradeForm, setShowGradeForm] = useState(false);
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const formRef = useRef<HTMLDivElement | null>(null);
  const aiCheckedRef = useRef<number | string | null>(null);
  const [aiResult, setAiResult] = useState<ReportAiCheckResult | null>(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);

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

  useEffect(() => {
    if (courseId) {
      fetchCourseById(courseId);
      fetchCourseStudents(courseId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  // Scroll to form khi mở
  useEffect(() => {
    if ((showGradeForm || showRevisionForm || showRejectForm) && formRef.current) {
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

  // Auto-run AI check when there's submission text and status is Submitted/Resubmitted
  const { aiCheckReport, loading: aiLoading } = useAiCheckReport();
  const { getAiChecks, loading: getChecksLoading } = useGetAiChecksReport();

  useEffect(() => {
    if (!detail) return;
    // only check when submission exists
    if (!detail.submission) return;
    const status = Number(detail.status);
    // only for Submitted (2) or Resubmitted (5)
    if (![2, 5].includes(status)) return;

    // avoid repeated checks for same report version; prefer 'version' or 'updatedAt'
    const key = detail.version ?? detail.updatedAt ?? detail.id;
    if (aiCheckedRef.current === key) return;
    aiCheckedRef.current = key;

    (async () => {
      try {
        // First, check whether this report already has AI check history.
        const history = await getAiChecks(reportId);
        const existing = (history as any)?.checks && (history as any).checks.length > 0 ? (history as any).checks[0] : null;
        if (existing) {
          // If there's an existing check, set it as the current result and do not re-run or open modal.
          setAiResult(existing as ReportAiCheckResult);
          return;
        }

        // No existing checks — run auto AI check and open modal
        setAiModalOpen(true);
        const res = await aiCheckReport({ reportId, notes: "Auto run AI check" });
        if (res?.result) setAiResult(res.result);
      } catch (e) {
        // swallow — toast handled by hook
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.submission, detail?.status, detail?.version, reportId]);

  const handleReassess = async () => {
    if (aiLoading) return;
    // allow re-run even if previously checked
    aiCheckedRef.current = null;
    setAiResult(null);
    setAiModalOpen(true);
    try {
      const res = await aiCheckReport({ reportId, notes: "Manual re-assess" });
      if (res?.result) setAiResult(res.result);
    } catch (e) {
      // ignore; hook handles errors
    }
  };

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    const target = courseId ? `/lecturer/course/${courseId}/reports${assignmentId ? `?assignmentId=${assignmentId}` : ""}` : "/lecturer/course";
    router.push(target);
  };

  const openSubmissionInNewTab = () => {
    if (typeof window === 'undefined') return;
    if (!detail?.submission) return;

    try {
      const win = window.open('', '_blank');
      if (!win) return;
      const title = detail?.assignmentTitle ?? 'Submission';
      const student = detail ? getStudentName(detail?.submittedBy) : '';
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${String(title)} - ${String(student)}</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,'Helvetica Neue',Arial;line-height:1.6;padding:24px;background:#f8fafc;color:#0f172a} .container{max-width:980px;margin:0 auto;background:#fff;padding:24px;border-radius:8px;box-shadow:0 6px 18px rgba(15,23,42,0.06);} h1{font-size:20px;margin:0 0 12px} .meta{color:#475569;font-size:13px;margin-bottom:18px}</style></head><body><div class="container"><h1>${String(title)}</h1><div class="meta">${String(student)}</div><div>${detail.submission}</div></div></body></html>`;
      win.document.open();
      win.document.write(html);
      win.document.close();
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="pb-4 px-3">
      <Card className="shadow-md py-0 gap-0 border-slate-200 max-h-[calc(100vh-140px)] overflow-hidden">
        <CardHeader className="p-4 gap-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Button size="sm" variant="ghost" className="cursor-pointer -ml-2" onClick={goBack}><ArrowLeft className="size-4" /></Button>
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Report Details</h2>
              </div>
            </div>

            {activeTab !== 'history' && (
              <div className="flex items-center gap-2">
                {
                  (() => {
                    const statusNum = Number(detail?.status);
                    const isGraded = statusNum === 6; // ReportStatus.Graded
                    const isRejected = statusNum === 8; // ReportStatus.Rejected
                    const isRevisionRequested = statusNum === 4; // ReportStatus.RequiresRevision

                    return (
                      <>
                        {!showRevisionForm && !isGraded && !isRejected && (
                          <Button size="sm" className="cursor-pointer text-blue-500 shadow-lg mr-2" onClick={() => { setShowRevisionForm(true); setShowGradeForm(false); setShowRejectForm(false); }}><PencilOff className="size-4" />Request Revision</Button>
                        )}

                        {!showRejectForm && !isGraded && !isRevisionRequested && (
                          <Button size="sm" className="cursor-pointer text-red-500 shadow-lg mr-2" onClick={() => { setShowRejectForm(true); setShowRevisionForm(false); }}><X className="size-4" />Reject Report</Button>
                        )}

                        {!showGradeForm && !isGraded && !isRejected && !isRevisionRequested && (
                          <Button size="sm" className="cursor-pointer btn btn-gradient-slow" onClick={() => { setShowGradeForm(true); setShowRevisionForm(false); setShowRejectForm(false); }}><ClipboardPenLine className="size-4" />Grade</Button>
                        )}
                      </>
                    );
                  })()
                }
              </div>
            )}
          </div>

          {/* Tabs giữ nguyên */}
          <div className="mt-3 px-0">
            <div className="px-6 py-1 bg-gradient-to-r from-blue-100 to-white rounded-md">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setActiveTab('details'); updateTabInUrl('details'); }}
                  className={`px-3 cursor-pointer py-1.5 text-sm rounded ${activeTab === 'details' ? 'bg-white text-violet-700 rounded-lg shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                >Details</button>

                <button
                  onClick={() => { setActiveTab('history'); updateTabInUrl('history'); }}
                  className={`px-3 cursor-pointer py-1.5 text-sm rounded ${activeTab === 'history' ? 'bg-white text-violet-700 rounded-lg shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                >History Log</button>

                <button
                  onClick={() => { setActiveTab('timeline'); updateTabInUrl('timeline'); }}
                  className={`px-3 cursor-pointer py-1.5 text-sm rounded ${activeTab === 'timeline' ? 'bg-white text-violet-700 rounded-lg shadow-md' : 'text-slate-600 hover:bg-slate-100'}`}
                >Timeline</button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 mb-5 overflow-y-auto">
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

          {/* ==================== TAB DETAILS - CHỈ SỬA PHẦN NÀY ==================== */}
          {!loading && activeTab === 'details' && detail && (
            <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-5 px-6 pb-6 items-stretch">
              {/* LEFT: moved to component for clarity */}
              <ReportInfoDetails
                detail={detail}
                course={course}
                enrolledStudents={enrolledStudents}
                getStudentName={getStudentName}
                statusBadgeElement={<StatusBadge status={detail.status} />}
                normalizeAssignmentDescription={detail.assignmentDescription ?? ''}
              />

              {/* === PHẢI: SUBMISSION + CÁC FORM === */}
              <div className="flex flex-col space-y-6 h-full">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-slate-500">Submission</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="xs"
                              onClick={async () => {
                                if (!reportId) return;
                                // open modal and fetch existing AI checks for this report
                                setAiModalOpen(true);
                                setAiResult(null);
                                try {
                                  const res = await getAiChecks(reportId);
                                  // try several possible shapes for the response
                                  const candidate = (res as any)?.latestCheck ?? (res as any)?.checks?.[0] ?? (res as any)?.result ?? null;
                                  setAiResult(candidate ?? null);
                                } catch (e) {
                                  setAiResult(null);
                                }
                              }}
                              className="text-emerald-700 hover:text-emerald-800"
                            >
                              <Info className="size-4" />AI-Asserted
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="top">Submissions have been evaluated by AI, review history now..</TooltipContent>
                        </Tooltip>

                        <Button size="xs" variant="ghost" onClick={openSubmissionInNewTab} className="text-slate-600 bg-slate-50 hover:shadow-md hover:text-slate-800">
                          Open in new tab
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="prose prose-sm text-xs max-w-none border border-slate-200 rounded-lg p-6 bg-slate-50 overflow-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
                    {detail.submission ? (
                      <div dangerouslySetInnerHTML={{ __html: detail.submission }} />
                    ) : (
                      <div className="text-slate-600">No submission body provided.</div>
                    )}
                  </div>
                </div>

                <div ref={formRef} className="space-y-6">
                  {showGradeForm && (
                    <GradeForm
                      reportId={reportId}
                      detail={detail}
                      onSuccess={(patch) => {
                        setDetail((prev: any) => ({ ...prev, ...patch }));
                        setShowGradeForm(false);
                        setError(null);
                      }}
                      onCancel={() => setShowGradeForm(false)}
                    />
                  )}

                  {showRevisionForm && (
                    <RevisionForm
                      reportId={reportId}
                      onSuccess={(patch) => {
                        setDetail((prev: any) => ({ ...prev, ...patch }));
                        setShowRevisionForm(false);
                        setError(null);
                      }}
                      onCancel={() => setShowRevisionForm(false)}
                    />
                  )}

                  {showRejectForm && (
                    <RejectForm
                      reportId={reportId}
                      onSuccess={(patch) => {
                        setDetail((prev: any) => ({ ...prev, ...patch }));
                        setShowRejectForm(false);
                        setError(null);
                      }}
                      onCancel={() => setShowRejectForm(false)}
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {!loading && activeTab === 'history' && (
            <div className="px-6">
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
      <AiCheckModal
        open={aiModalOpen}
        onClose={() => setAiModalOpen(false)}
        loading={aiLoading || getChecksLoading}
        result={aiResult}
        assignmentTitle={detail?.assignmentTitle ?? aiResult?.assignmentTitle ?? null}
        studentName={detail ? getStudentName(detail?.submittedBy) : aiResult?.studentName ?? null}
        onReassess={handleReassess}
      />
    </div>
  );
}