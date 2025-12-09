"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCourseRequestById } from "@/hooks/course-request/useCourseRequestById";
import { useDeleteSyllabus } from '@/hooks/course-request/useDeleteSyllabus';
import { useUploadSyllabus } from '@/hooks/course-request/useUploadSyllabus';
import { CourseRequestStatus } from "@/types/course-requests/course-request.response";
import { formatToVN } from "@/utils/datetime/time";
import { ArrowLeft, CloudUpload, Loader2, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LecturerCourseRequestDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data, loading, fetchCourseRequestById } = useCourseRequestById();
    const { deleteSyllabus, loading: deleting } = useDeleteSyllabus();
    const { uploadSyllabus, loading: uploading } = useUploadSyllabus();
    const fileRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (id && typeof id === "string") fetchCourseRequestById(id);
    }, [id]);

    if (loading) {
        return (
            <div className="p-6 text-center text-slate-500">Loading course request details...</div>
        );
    }

    const request = data?.courseRequest;

    if (!request) {
        return (
            <div className="p-6 text-center text-slate-500">
                Course request not found.
                <div className="mt-4 btn btn-green-slow">
                    <Button onClick={() => router.push('/lecturer/course/requests')}>← Back to Course Request List</Button>
                </div>
            </div>
        );
    }

    const fmtDate = (v?: string | null, withTime = false) =>
        v
            ? withTime
                ? formatToVN(v, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })
                : formatToVN(v, { year: "numeric", month: "2-digit", day: "2-digit" })
            : "-";

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
    const info = statusInfo(request.status);

    return (
        <div className="p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" className="text-sm btn btn-green-slow" onClick={() => router.push('/lecturer/manage-courses')}>
                    <ArrowLeft className="mr-0 h-4 w-4" />
                    Back to Course Requests
                </Button>
                <Badge className={`text-xs px-2 py-1 border ${info.className}`}>
                    {info.label}
                </Badge>
            </div>

            <Card className="border border-slate-200 shadow-sm">
                <CardHeader className="pb-3">
                    <CardTitle className="text-xl font-semibold">Course Request Detail</CardTitle>
                    <p className="text-slate-500 text-sm">Details of the lecturer's request.</p>
                </CardHeader>

                <CardContent className="space-y-6">
                    <section>
                        <h3 className="text-sm font-medium text-slate-600 mb-3">Basic Information</h3>
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-5 text-sm">
                            <Field label="Lecturer" value={request.lecturerName} />
                            <Field label="Course Code" value={request.courseCode} />
                            <Field label="Title" value={request.courseCodeTitle} />
                            <Field label="Department" value={request.department} />
                            <Field label="Term" value={request.term} />
                            <Field label="Created At" value={fmtDate(request.createdAt)} />
                            <Field
                                label="Syllabus"
                                value={
                                    request.syllabusFile
                                        ? (
                                            <div className="flex items-center space-x-3">
                                                <a href={request.syllabusFile}
                                                    target="_blank" rel="noopener noreferrer"
                                                    className="text-emerald-600 underline">
                                                    {request.syllabusFile || 'Download syllabus'}
                                                </a>
                                                <div className="flex items-center">
                                                    {deleting ? (
                                                        <Loader2 className="h-4 w-4 text-slate-500 animate-spin" />
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            title="Delete syllabus"
                                                            className="ml-2 text-slate-600 cursor-pointer hover:text-rose-800"
                                                            onClick={async () => {
                                                                if (!id || typeof id !== 'string') return;
                                                                const res = await deleteSyllabus(id);
                                                                if (res) {
                                                                    try { await fetchCourseRequestById(id); } catch {}
                                                                }
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 text-red-600" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-3">
                                                <span>-</span>
                                                <div>
                                                    <input ref={fileRef}
                                                        type="file"
                                                        aria-label="Upload syllabus file"
                                                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                                        className="hidden"
                                                        onChange={async (e) => {
                                                            const f = e.target.files?.[0];
                                                            if (!f) return;
                                                            if (!id || typeof id !== 'string') return;
                                                            const res = await uploadSyllabus(id, f);
                                                            if (res) {
                                                                try { await fetchCourseRequestById(id); } catch {}
                                                            }
                                                            if (fileRef.current) fileRef.current.value = '';
                                                        }}
                                                    />
                                                    {uploading ? (
                                                        <Loader2 className="h-4 w-4 text-slate-500 animate-spin" />
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            title="Upload syllabus"
                                                            className="ml-2 text-slate-600 cursor-pointer hover:text-emerald-600"
                                                            onClick={() => fileRef.current?.click()}
                                                        >
                                                            <CloudUpload className="h-4 w-4 text-blue-600" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                }
                            />
                        </div>
                    </section>

                    <section>
                        <h3 className="text-sm font-medium text-slate-600 mb-3">Notes</h3>
                        <div className="grid gap-5">
                            <HighlightBox label="Request Reason">
                                <span className="text-sm">{request.requestReason || '-'}</span>
                            </HighlightBox>

                            <Field label="Description" className="text-sm" value={request.description || "-"} multiline />
                        </div>
                    </section>
                </CardContent>
            </Card>
        </div>
    );
}

function Field({ label, value, multiline, className = "" }: { label: string; value: any; multiline?: boolean; className?: string; }) {
    return (
        <div className={className}>
            <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">{label}</div>
            <div className={`mt-1 text-slate-900 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</div>
        </div>
    );
}

function HighlightBox({ label, children, className = "" }: { label: string; children: any; className?: string }) {
    return (
        <div className={className}>
            <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium mb-2">{label}</div>
            <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded p-4 text-slate-900 whitespace-pre-wrap shadow-sm">
                {children}
            </div>
        </div>
    );
}
