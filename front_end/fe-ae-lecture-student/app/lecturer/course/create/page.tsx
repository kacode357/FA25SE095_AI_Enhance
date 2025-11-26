"use client";

import { Book, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import TinyMCE from "@/components/common/TinyMCE";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea";

import { AccessCodeType } from "@/config/access-code-type";
import { invalidateMyCoursesCache } from "@/hooks/course/useMyCourses";
import { useUploadSyllabus } from "@/hooks/course/useUploadSyllabus";
import { CourseCodeService } from "@/services/course-codes.services";
import { CourseService } from "@/services/course.services";
import { TermService } from "@/services/term.services";
import { CourseCodeOption } from "@/types/course-codes/course-codes.response";
import { CreateCoursePayload } from "@/types/courses/course.payload";
import { TermResponse } from "@/types/term/term.response";
import { toast } from "sonner";
// image upload removed per design request: full-width form

function BreadcrumbCreate({ router }: { router: ReturnType<typeof useRouter> }) {
    return (
        <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden">
            <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
                <li className="flex flex-row gap-0 hover:text-violet-800 items-center">
                    <Book className="size-4" />
                    <button
                        onClick={() => router.push("/lecturer/course")}
                        className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition max-w-[130px] truncate"
                    >
                        Courses Management
                    </button>
                </li>
                <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                <li className="font-medium cursor-text text-slate-900 max-w-[150px] truncate">
                    Create Course
                </li>
            </ol>
        </nav>
    );
}

export default function CreateCoursePage() {
    const router = useRouter();

    // options
    const [codes, setCodes] = useState<CourseCodeOption[]>([]);
    const [terms, setTerms] = useState<TermResponse[]>([]);
    const [loadingOptions, setLoadingOptions] = useState(false);

    // form
    const now = new Date();
    const [form, setForm] = useState<{
        courseCodeId: string;
        termId: string;
        year: number;
        description: string;
        // optional announcement text
        announcement?: string;
        // optional uploaded syllabus file
        syllabus?: File | null;
        requiresAccessCode: boolean;
        accessCodeType: AccessCodeType.Custom,
        customAccessCode?: string;
        accessCodeExpiresAt?: string;
    }>({
        courseCodeId: "",
        termId: "",
        year: now.getFullYear(),
        description: "",
        announcement: "",
        syllabus: null,
        requiresAccessCode: false,
        accessCodeType: AccessCodeType.Custom,
    });

    const [submitting, setSubmitting] = useState(false);
    const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
    // disable main form after course created, but allow syllabus upload
    const disableMainForm = Boolean(createdCourseId);
    const isValid = useMemo(() => {
        if (!form.courseCodeId || !form.termId || !form.year || !form.description) return false;
        if (form.requiresAccessCode && form.accessCodeType === AccessCodeType.Custom && !form.customAccessCode) return false;
        return true;
    }, [form]);

    useEffect(() => {
        const loadOptions = async () => {
            setLoadingOptions(true);
            try {
                const [codeRes, termRes] = await Promise.all([
                    CourseCodeService.getOptions({ activeOnly: true }),
                    TermService.getAll(),
                ]);
                setCodes(codeRes || []);
                setTerms(termRes.terms || []);
            } finally {
                setLoadingOptions(false);
            }
        };
        loadOptions();
    }, []);

    const handleSubmit = async () => {
        if (!form.courseCodeId || !form.termId || !form.description) {
            toast.error("Please complete all required fields.");
            return;
        }

        if (form.requiresAccessCode && form.accessCodeType === AccessCodeType.Custom && !form.customAccessCode) {
            toast.error("Please enter custom access code.");
            return;
        }

        setSubmitting(true);

        const extractErrorMessage = (data: any) => {
            if (!data) return null;
            if (data.errors && typeof data.errors === "object") {
                for (const key of Object.keys(data.errors)) {
                    const val = data.errors[key];
                    if (Array.isArray(val) && val.length > 0) return String(val[0]);
                    if (typeof val === "string" && val) return val;
                }
            }
            if (data.message) return data.message;
            return null;
        };

        try {
            const payload: CreateCoursePayload = {
                courseCodeId: form.courseCodeId,
                description: form.description,
                announcement: form.announcement ?? undefined,
                termId: form.termId,
                year: Number(form.year),
                requiresAccessCode: form.requiresAccessCode,
                accessCodeType: form.requiresAccessCode ? form.accessCodeType : undefined,
                customAccessCode: form.requiresAccessCode ? form.customAccessCode : undefined,
                accessCodeExpiresAt: form.requiresAccessCode ? form.accessCodeExpiresAt : undefined,
            };

            const res = await CourseService.createCourse(payload);

            if (res?.success) {
                // stay on page, show upload area and set createdCourseId
                try { invalidateMyCoursesCache(); } catch { }
                try { toast.success(res?.message || "Course created."); } catch { }
                // set id so UI reveals upload section
                setCreatedCourseId(res.courseId || res.course?.id || null);
                // scroll to upload area after render, account for sticky header
                setTimeout(() => {
                    try {
                        const container = scrollContainerRef.current;
                        const target = uploadRef.current;
                        if (container && target) {
                            const containerRect = container.getBoundingClientRect();
                            const targetRect = target.getBoundingClientRect();
                            const offsetTop = targetRect.top - containerRect.top - HEADER_OFFSET;
                            const scrollTop = Math.max(0, offsetTop + (container.scrollTop || 0));
                            container.scrollTo({ top: scrollTop, behavior: "smooth" });
                        } else {
                            // fallback
                            uploadRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                        }
                    } catch { }
                }, 150);
            } else {
                // Throw so single catch handler shows one toast (prefer field errors)
                throw res || new Error("Failed to create course");
            }
        } catch (err: any) {
            const data = err?.response?.data ?? err;
            const msg = extractErrorMessage(data) || data?.message || "Server error";
            toast.error(String(msg));
        } finally {
            setSubmitting(false);
        }
    };

    // upload syllabus hook
    const uploadRef = useRef<HTMLDivElement | null>(null);
    // ref to the scrollable content container so we can scroll with header offset
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);
    // approximate header/sticky height (px) to offset scroll so content isn't hidden behind header
    const HEADER_OFFSET = 72; // adjust if header height changes
    const { uploadSyllabus, loading: uploading } = useUploadSyllabus();
    const [uploadedSyllabusUrl, setUploadedSyllabusUrl] = useState<string | null>(null);

    const handleUpload = async () => {
        if (!createdCourseId) return;
        if (!form.syllabus) {
            toast.error("Please choose a file to upload.");
            return;
        }

        const fileUrl = await uploadSyllabus(createdCourseId, { file: form.syllabus });
        if (fileUrl) {
            // store uploaded url to show link and clear file input
            setUploadedSyllabusUrl(fileUrl);
            setForm((f) => ({ ...f, syllabus: null }));
        }
    };

    // disable upload button when uploading or no file selected
    const uploadDisabled = uploading || !form.syllabus;

    return (
        <div className="p-3 mr-3 h-screen flex flex-col">
            <div className="sticky top-0 z-30 backdrop-blur w-full pb-3 pt-3 flex items-center justify-between">
                <h1 className="text-sm font-semibold uppercase tracking-wide whitespace-nowrap mr-4">Create Course</h1>
                <BreadcrumbCreate router={router} />
            </div>

            <div ref={scrollContainerRef} className="flex-1 overflow-auto pr-2 pt-5 pb-15 scroll-pt-[72px]">
                <div className="grid grid-cols-1 gap-3">
                    <div className="flex flex-col gap-10">
                        <Card className="p-6 border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b]" />
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                                {/* Course code */}
                                <div>
                                    <Label className="text-base mb-2">Course Code <span className="text-red-500 text-xs">(* required)</span></Label>
                                    <div className="mt-1">
                                        <Select
                                            value={form.courseCodeId ?? ""}
                                            options={codes.map((c) => ({ value: c.id, label: `${c.code} — ${c.title}` }))}
                                            placeholder={loadingOptions ? "Loading..." : "Select course code"}
                                            onChange={(v) => setForm((f) => ({ ...f, courseCodeId: v }))}
                                            className="w-full border-slate-200 bg-white"
                                            disabled={disableMainForm}
                                        />
                                    </div>
                                </div>

                                {/* Term */}
                                <div>
                                    <Label className="text-base mb-2">Term <span className="text-red-500 text-xs">(* required)</span></Label>
                                    <div className="mt-1">
                                        <Select
                                            value={form.termId ?? ""}
                                            options={terms.map((t) => ({ value: t.id, label: t.name }))}
                                            placeholder={loadingOptions ? "Loading..." : "Select term"}
                                            onChange={(v) => setForm((f) => ({ ...f, termId: v }))}
                                            className="w-full bg-white border-slate-200"
                                            disabled={disableMainForm}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="sm:col-span-2">
                                    <Label className="text-base mb-2">Description <span className="text-red-500 text-xs">(* required)</span></Label>
                                    <Textarea
                                        value={form.description}
                                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                        className="mt-1 min-h-24 bg-white border-slate-200"
                                        placeholder="Short overview for this course.."
                                        disabled={disableMainForm}
                                    />
                                </div>

                                {/* Announcement (optional) */}
                                <div className="sm:col-span-2">
                                    <Label className="text-base mb-2">Announcement <span className="text-slate-400 text-xs">(optional)</span></Label>
                                        <TinyMCE
                                            value={form.announcement ?? ""}
                                            onChange={(html) => setForm((f) => ({ ...f, announcement: html }))}
                                            placeholder="An optional announcement for students (short)."
                                            className="mt-1 bg-white border-slate-200"
                                            readOnly={disableMainForm}
                                        />
                                </div>
                            </div>
                        </Card>

                        <Card className="p-4 border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b]" />
                            <div className="flex flex-row items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">Access Code (optional)</h2>
                                    <p className="text-sm mt-1 text-slate-600">Require a code for students to enroll.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="requiresAccessCode"
                                        checked={form.requiresAccessCode}
                                        onCheckedChange={(v) => setForm((f) => ({ ...f, requiresAccessCode: Boolean(v) }))}
                                        disabled={disableMainForm}
                                    />
                                    <Label htmlFor="requiresAccessCode" className="text-sm">Require</Label>
                                </div>
                            </div>

                            {form.requiresAccessCode && (
                                <div className="flex flex-wrap gap-3">
                                    {/* Code Type */}
                                    <div className="flex-1 min-w-[150px]">
                                        <Label className="text-sm mb-1">Code Type</Label>
                                        <Input value="Custom" disabled className="h-9 text-sm bg-white border-slate-200" />
                                    </div>

                                    {/* Custom Code (chỉ hiển thị khi chọn Custom) */}
                                    {form.accessCodeType === AccessCodeType.Custom && (
                                        <div className="flex-1 min-w-[150px]">
                                            <Label className="text-sm mb-1">Custom Code</Label>
                                            <Input
                                                value={form.customAccessCode ?? ""}
                                                onChange={(e) => setForm((f) => ({ ...f, customAccessCode: e.target.value }))}
                                                placeholder="Enter custom access code"
                                                className="h-9 text-sm placeholder:text-sm"
                                                disabled={disableMainForm}
                                            />
                                        </div>
                                    )}

                                    {/* Expires At */}
                                    <div className="flex-1 min-w-[200px]">
                                        <Label className="text-sm mb-1">Expires At</Label>
                                        <div>
                                            <DateTimePicker
                                                value={form.accessCodeExpiresAt}
                                                onChange={(v) => setForm((f) => ({ ...f, accessCodeExpiresAt: v }))}
                                                placeholder="yyyy-MM-dd HH:mm"
                                                size="sm"
                                                timeIntervals={5}
                                                minDate={new Date()}
                                                minTime={new Date()}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                        </Card>

                        {/* Upload Syllabus (only visible after course created) */}
                        {createdCourseId && (
                            <div ref={uploadRef} className="sm:col-span-2">
                                <Label className="text-base mb-2">Upload Syllabus <span className="text-slate-400 text-xs">(optional)</span></Label>

                                <Card className="mt-2 p-4 border-dashed border-2 border-slate-200 bg-white">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="w-12 h-12 flex items-center justify-center bg-violet-50 rounded-lg">
                                                <Book className="text-violet-600" />
                                            </div>

                                            <div className="min-w-0">
                                                {form.syllabus ? (
                                                    <>
                                                        <div className="text-sm font-medium truncate">{form.syllabus.name}</div>
                                                        <div className="text-xs text-slate-500">Selected file</div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="text-sm text-slate-700">No file selected</div>
                                                        <div className="text-xs text-slate-500">Accepted: .pdf, .doc, .docx — Max size depends on server</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <label className="inline-flex items-center px-3 py-2 border rounded-md cursor-pointer text-sm bg-white hover:bg-slate-50">
                                                Choose file
                                                <input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx"
                                                    onChange={(e) => setForm((f) => ({ ...f, syllabus: e.target.files?.[0] ?? null }))}
                                                    disabled={!createdCourseId}
                                                    className="sr-only"
                                                />
                                            </label>

                                            {form.syllabus && (
                                                <button
                                                    onClick={() => setForm((f) => ({ ...f, syllabus: null }))}
                                                    className="text-sm cursor-pointer text-red-500 hover:text-red-600 px-2 py-1 rounded"
                                                    disabled={!createdCourseId}
                                                >
                                                    Remove
                                                </button>
                                            )}

                                            <Button
                                                onClick={handleUpload}
                                                loading={uploading}
                                                className={`btn btn-gradient text-sm text-white ${uploadDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                                                disabled={uploadDisabled}
                                                aria-disabled={uploadDisabled}
                                            >
                                                Upload
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Actions - sticky inside content area so it stays within page width */}
                    <Card className="p-4 mb-5 border-slate-200 shadow-sm z-40 w-full">
                        <div className="flex items-center justify-between">
                            {!isValid ? (
                                <div className="text-xs text-amber-600">Please complete all required fields.</div>
                            ) : (
                                <div />
                            )}

                            <div className="flex items-center gap-3 justify-end">
                                {!createdCourseId ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="text-violet-800 hover:text-violet-500"
                                            onClick={() => router.push("/lecturer/course")}
                                        >
                                            Cancel
                                        </Button>

                                        <Button
                                            onClick={handleSubmit}
                                            loading={submitting}
                                            className="btn btn-gradient text-sm text-white"
                                            disabled={submitting}
                                        >
                                            Create
                                        </Button>
                                    </>
                                ) : (
                                    // After create: replace with Done (return to list) — upload moved into Upload card
                                    <>
                                        <Button
                                            variant="ghost"
                                            className="text-violet-800 hover:text-violet-500"
                                            onClick={() => router.push("/lecturer/course")}
                                        >
                                            Back
                                        </Button>
                                    </>
                                )}
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
