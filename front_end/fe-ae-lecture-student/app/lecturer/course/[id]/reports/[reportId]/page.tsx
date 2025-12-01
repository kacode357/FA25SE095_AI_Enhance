"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useCourseStudents } from "@/hooks/enrollments/useCourseStudents";
import { useGetReportById } from "@/hooks/reports/useGetReportById";
import { normalizeAndSanitizeHtml } from "@/utils/sanitize-html";
import { ArrowLeft, ClipboardPenLine, Loader2, PencilOff, X } from "lucide-react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import HistoryReportLog from "../history/HistoryReportLog";
import TimelineReportLog from "../timeline/TimelineReportLog";
import StatusBadge from "../utils/status";
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

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    const target = courseId ? `/lecturer/course/${courseId}/reports${assignmentId ? `?assignmentId=${assignmentId}` : ""}` : "/lecturer/course";
    router.push(target);
  };

  return (
    <div className="pb-4 px-3">
      {/* Breadcrumb giữ nguyên */}
      {/* <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden mb-4">
        <div className="flex items-center justify-between">
          <ol className="flex items-center gap-0 mt-1.5 text-slate-500 flex-nowrap overflow-hidden">
            <Book className="size-4" />
            <li>
              <button onClick={() => router.push('/lecturer/course')} className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition">My Courses</button>
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
      </nav> */}

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
                {!showRevisionForm && (
                  <Button size="sm" className="cursor-pointer text-blue-500 shadow-lg mr-2" onClick={() => { setShowRevisionForm(true); setShowGradeForm(false); setShowRejectForm(false); }}><PencilOff className="size-4" />Request Revision</Button>
                )}

                {!showRejectForm && (
                  <Button size="sm" className="cursor-pointer text-red-500 shadow-lg mr-2" onClick={() => { setShowRejectForm(true); setShowRevisionForm(false); }}><X className="size-4" />Reject Report</Button>
                )}

                {!showGradeForm && !(Number(detail?.status) === 8) && !(Number(detail?.status) === 6) && (
                  <Button size="sm" className="cursor-pointer btn btn-gradient-slow" onClick={() => { setShowGradeForm(true); setShowRevisionForm(false); setShowRejectForm(false); }}><ClipboardPenLine className="size-4" />Grade</Button>
                )}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 items-stretch">
              {/* LEFT: moved to component for clarity */}
              <ReportInfoDetails
                detail={detail}
                course={course}
                enrolledStudents={enrolledStudents}
                getStudentName={getStudentName}
                statusBadgeElement={<StatusBadge status={detail.status} />}
                normalizeAssignmentDescription={detail.assignmentDescription ? normalizeAndSanitizeHtml(detail.assignmentDescription) : ''}
              />

              {/* === PHẢI: SUBMISSION + CÁC FORM === */}
              <div className="flex flex-col space-y-6 h-full">
                <div className="flex-1">
                  <div className="text-xs text-slate-500 mb-2">Submission</div>
                  <div className="prose prose-sm text-xs max-w-none border border-slate-200 rounded-lg p-6 bg-slate-50 min-h-96 h-full overflow-auto">
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
    </div>
  );
}