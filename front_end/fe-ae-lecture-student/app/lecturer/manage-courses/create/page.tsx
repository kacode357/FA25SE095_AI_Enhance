"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { AccessCodeType, accessCodeTypeToString } from "@/config/access-code-type";
import { invalidateMyCoursesCache } from "@/hooks/course/useMyCourses";
import { useUploadSyllabus } from "@/hooks/course/useUploadSyllabus";
import { CourseCodeService } from "@/services/course-codes.services";
import { CourseService } from "@/services/course.services";
import { TermService } from "@/services/term.services";
import { CourseCodeOption } from "@/types/course-codes/course-codes.response";
import { CreateCoursePayload } from "@/types/courses/course.payload";
import { TermResponse } from "@/types/term/term.response";
import { toast } from "sonner";
import RightSidebar from "./components/AnnouncementForm";
import LeftForm from "./components/CreateCourseForm";
import UploadSyllabus from "./components/UploadSyllabus";

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
        accessCodeType: AccessCodeType;
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
    const [showAccessTooltip, setShowAccessTooltip] = useState(false);
    // disable main form after course created, but allow syllabus upload
    const disableMainForm = Boolean(createdCourseId);
    const codeTypeLabel = useMemo(() => {
        try {
            const s = accessCodeTypeToString(form.accessCodeType as AccessCodeType) || "";
            return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
        } catch {
            return "";
        }
    }, [form.accessCodeType]);
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
            // navigate back to Courses list after successful upload
            try {
                router.push("/lecturer/course");
            } catch (e) {
                // ignore navigation errors
            }
        }
    };

    // disable upload button when uploading or no file selected
    const uploadDisabled = uploading || !form.syllabus;

    return (
        <div className="p-3 max-w-7xl mx-auto h-screen flex flex-col">
            <div ref={scrollContainerRef} className="flex-1 overflow-auto pr-2 pb-24 scroll-pt-[72px]">
                <Card className="p-6 gap-0 border-slate-200 shadow-sm relative overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                        <LeftForm
                            codes={codes}
                            terms={terms}
                            loadingOptions={loadingOptions}
                            form={form}
                            setForm={setForm}
                            disableMainForm={disableMainForm}
                        />

                        <RightSidebar
                            form={form}
                            setForm={setForm}
                            disableMainForm={disableMainForm}
                        />
                    </div>

                    {/* bottom row: left - Upload Syllabus, right - actions */}
                    <div className="mt-6 flex items-start gap-4">
                        {/* Upload area is hidden until a course is successfully created */}
                        {createdCourseId && (
                            <UploadSyllabus
                                createdCourseId={createdCourseId}
                                form={form}
                                setForm={setForm}
                                uploadRef={uploadRef}
                                uploading={uploading}
                                handleUpload={handleUpload}
                                uploadedSyllabusUrl={uploadedSyllabusUrl}
                            />
                        )}

                        <div className="flex items-center gap-3 ml-auto">
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
                                <Button
                                    variant="ghost"
                                    className="text-violet-800 hover:text-violet-500"
                                    onClick={() => router.push("/lecturer/course")}
                                >
                                    Back
                                </Button>
                            )}
                        </div>
                    </div>

                </Card>
            </div>
        </div>
    );
}
