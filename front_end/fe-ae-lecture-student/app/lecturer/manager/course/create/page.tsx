"use client";

import { ChevronRight, Home } from "lucide-react";
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

function BreadcrumbCreate({ router }: { router: ReturnType<typeof useRouter> }) {
    return (
        <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden">
            <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
                <li>
                    <button
                        onClick={() => router.push("/")}
                        className="inline-flex items-center gap-1 rounded px-1 py-0.5 text-slate-500 hover:text-brand transition shrink-0"
                    >
                        <Home className="size-3.5" />
                        <span className="sr-only sm:not-sr-only sm:inline">Home</span>
                    </button>
                </li>
                <ChevronRight className="size-3 text-slate-400" />
                <li>
                    <button
                        onClick={() => router.push("/lecturer/manager/course")}
                        className="px-1 py-0.5 rounded hover:text-brand transition max-w-[110px] truncate"
                    >
                        Lecturer
                    </button>
                </li>
                <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                <li className="hidden sm:inline">
                    <button
                        onClick={() => router.push("/lecturer/manager/course")}
                        className="px-1 py-0.5 rounded hover:text-brand transition max-w-[130px] truncate"
                    >
                        Manager Courses
                    </button>
                </li>
                <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                <li className="font-medium text-slate-900 max-w-[150px] truncate">
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
                router.push("/lecturer/manager/course");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-3">
            {/* Top bar header to match CoursesPage */}
            <div className="sticky top-0 z-30 backdrop-blur w-full pr-6.5 pb-3 flex items-center justify-between">
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
                                    <Select value={form.courseCodeId} onValueChange={(v) => setForm((f) => ({ ...f, courseCodeId: v }))}>
                                        <SelectTrigger className="w-full border-slate-200 bg-white">
                                            <SelectValue className="w-full border-slate-300 bg-white" placeholder={loadingOptions ? "Loading..." : "Select course code"} />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                    <Select value={form.termId} onValueChange={(v) => setForm((f) => ({ ...f, termId: v }))}>
                                        <SelectTrigger className="w-full bg-white border-slate-200">
                                            <SelectValue placeholder={loadingOptions ? "Loading..." : "Select term"} />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                    >
                                        <SelectTrigger className="w-full border bg-white border-slate-200">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
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
                                            className="h-9 placeholder:text-sm"
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
                                        className="h-9"
                                    />
                                </div>
                            </div>
                        )}

                    </Card>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-3">
                    <Card className="p-4 border-slate-200 shadow-sm">
                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={handleSubmit}
                                loading={submitting}
                                className="btn btn-gradient text-white"
                                disabled={!isValid}
                            >
                                Create Course
                            </Button>
                            <Button
                                variant="ghost"
                                className="text-violet-800 hover:text-violet-500"
                                onClick={() => router.push("/lecturer/manager/course")}
                            >
                                Cancel
                            </Button>
                            {!isValid && (
                                <div className="text-xs text-amber-600">Please complete all required fields.</div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
