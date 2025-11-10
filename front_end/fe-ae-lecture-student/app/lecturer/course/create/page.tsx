"use client";

import { Book, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { AccessCodeType } from "@/config/access-code-type";
import { invalidateMyCoursesCache } from "@/hooks/course/useMyCourses";
import { CourseCodeService } from "@/services/course-codes.services";
import { CourseService } from "@/services/course.services";
import { TermService } from "@/services/term.services";
import { CourseCodeOption } from "@/types/course-codes/course-codes.response";
import { CreateCoursePayload } from "@/types/courses/course.payload";
import { TermResponse } from "@/types/term/term.response";
import UploadCourseImageCard from "./components/UploadCourseImageCard";

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
        requiresAccessCode: boolean;
        accessCodeType?: number;
        customAccessCode?: string;
        accessCodeExpiresAt?: string;
    }>({
        courseCodeId: "",
        termId: "",
        year: now.getFullYear(),
        description: "",
        requiresAccessCode: false,
    });

    const [submitting, setSubmitting] = useState(false);
    const [createdCourseId, setCreatedCourseId] = useState<string | null>(null);
    const formDisabled = Boolean(createdCourseId);
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
        if (!isValid || submitting) return;
        setSubmitting(true);
        try {
            const payload: CreateCoursePayload = {
                courseCodeId: form.courseCodeId,
                description: form.description,
                termId: form.termId,
                year: Number(form.year),
                requiresAccessCode: form.requiresAccessCode,
                accessCodeType: form.requiresAccessCode ? form.accessCodeType : undefined,
                customAccessCode: form.requiresAccessCode ? form.customAccessCode : undefined,
                accessCodeExpiresAt: form.requiresAccessCode ? form.accessCodeExpiresAt : undefined,
            };
            const res = await CourseService.createCourse(payload);
            if (res?.success) {
                // Invalidate cached course lists so CoursesPage fetches fresh data
                try { invalidateMyCoursesCache(); } catch { }
                // Keep user on this page and enable image upload by storing the newly created courseId
                setCreatedCourseId(res.courseId);
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-3 mr-3 min-h-screen overflow-auto">
            {/* Top bar header to match CoursesPage */}
            <div className="sticky top-0 z-30 backdrop-blur w-full pb-3 pt-1 flex items-center justify-between">
                <h1 className="text-sm font-semibold uppercase tracking-wide whitespace-nowrap mr-4">Create Course</h1>
                <BreadcrumbCreate router={router} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                <div className="lg:col-span-2 flex flex-col gap-3">
                    <Card className="p-6 border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b]" />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-7">
                            {/* Course code */}
                            <div>
                                <Label className="text-lg mb-2">Course Code</Label>
                                <div className="mt-1">
                                    <Select value={form.courseCodeId} onValueChange={(v) => setForm((f) => ({ ...f, courseCodeId: v }))} disabled={formDisabled}>
                                        <SelectTrigger className="w-full border-slate-200 bg-white">
                                            <SelectValue className="w-full border-slate-300 bg-white" placeholder={loadingOptions ? "Loading..." : "Select course code"} />
                                        </SelectTrigger>
                                        <SelectContent className="border-slate-300">
                                            {codes.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    <div className="flex items-start flex-col">
                                                        <span className="text-sm font-medium">{c.code} — {c.title}</span>
                                                        <span className="text-[11px] text-slate-500">{c.department}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Term */}
                            <div>
                                <Label className="text-lg mb-2">Term</Label>
                                <div className="mt-1">
                                    <Select value={form.termId} onValueChange={(v) => setForm((f) => ({ ...f, termId: v }))} disabled={formDisabled}>
                                        <SelectTrigger className="w-full bg-white border-slate-200">
                                            <SelectValue placeholder={loadingOptions ? "Loading..." : "Select term"} />
                                        </SelectTrigger>
                                        <SelectContent className="border-slate-300">
                                            {terms.map((t) => (
                                                <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Year */}
                            <div>
                                <Label className="text-lg mb-2">Year</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Input
                                        type="number"
                                        value={form.year}
                                        onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                                        className="h-9"
                                        placeholder="e.g., 2025"
                                        disabled={formDisabled}
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <Label className="text-lg mb-2">Description</Label>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    className="mt-1 min-h-24 border-slate-200"
                                    placeholder="Short overview for this course.."
                                    disabled={formDisabled}
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
                                    disabled={formDisabled}
                                />
                                <Label htmlFor="requiresAccessCode" className="text-sm">Require</Label>
                            </div>
                        </div>

                        {form.requiresAccessCode && (
                            <div className="flex flex-wrap gap-3">
                                {/* Code Type */}
                                <div className="flex-1 min-w-[150px]">
                                    <Label className="text-sm mb-1">Code Type</Label>
                                    <Select
                                        value={String(form.accessCodeType ?? "")}
                                        onValueChange={(v) => setForm((f) => ({ ...f, accessCodeType: Number(v) }))}
                                        disabled={formDisabled}
                                    >
                                        <SelectTrigger className="w-full border bg-white border-slate-200">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent className="border border-slate-300">
                                            <SelectItem value={String(AccessCodeType.Numeric)}>Numeric</SelectItem>
                                            <SelectItem value={String(AccessCodeType.AlphaNumeric)}>Alphanumeric</SelectItem>
                                            <SelectItem value={String(AccessCodeType.Words)}>Words</SelectItem>
                                            <SelectItem value={String(AccessCodeType.Custom)}>Custom</SelectItem>
                                        </SelectContent>
                                    </Select>
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
                                            disabled={formDisabled}
                                        />
                                    </div>
                                )}

                                {/* Expires At */}
                                <div className="flex-1 min-w-[200px]">
                                    <Label className="text-sm mb-1">Expires At</Label>
                                    <Input
                                        type="datetime-local"
                                        value={form.accessCodeExpiresAt ?? ""}
                                        onChange={(e) => setForm((f) => ({ ...f, accessCodeExpiresAt: e.target.value }))}
                                        className="h-9 text-sm"
                                        disabled={formDisabled}
                                    />
                                </div>
                            </div>
                        )}

                    </Card>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <div className="">
                            <UploadCourseImageCard courseId={createdCourseId ?? undefined} />
                        </div>
                    <Card className="p-4 border-slate-200 shadow-sm">
                        <div className="flex flex-col gap-2">
                            {!createdCourseId ? (
                                <Button
                                    onClick={handleSubmit}
                                    loading={submitting}
                                    className="btn btn-gradient text-white"
                                    disabled={!isValid || submitting}
                                >
                                    Create Course
                                </Button>
                            ) : (
                                <div className="text-sm text-green-700">Course created — you can now upload an image.</div>
                            )}
                            <Button
                                variant="ghost"
                                className="text-violet-800 hover:text-violet-500"
                                onClick={() => router.push("/lecturer/course")}
                            >
                                Cancel
                            </Button>
                            {!isValid && (
                                <div className="text-xs mt-2.5 text-amber-600">Please complete all required fields.</div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
