"use client";

import { Book, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { CourseCodeService } from "@/services/course-codes.services";
import { CourseRequestService } from "@/services/course-requests.services";
import { TermService } from "@/services/term.services";
import { CourseCodeOption } from "@/types/course-codes/course-codes.response";
import { CourseRequestPayload } from "@/types/course-requests/course-request.payload";
import { TermResponse } from "@/types/term/term.response";

function BreadcrumbRequest({ router }: { router: ReturnType<typeof useRouter> }) {
    return (
        <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden">
            <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
                <li className="flex flex-row gap-0 hover:text-violet-800 items-center">
                    <Book className="size-4" />
                    <button
                        onClick={() => router.push("/lecturer/course/requests")}
                        className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition max-w-[130px] truncate"
                    >
                        Courses Requests
                    </button>
                </li>
                <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                <li className="font-medium cursor-text text-slate-900 max-w-[150px] truncate">New Course Request</li>
            </ol>
        </nav>
    );
}

export default function CreateCourseRequestPage() {
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
        requestReason?: string;
        studentEnrollmentFile?: File | null;
    }>({
        courseCodeId: "",
        termId: "",
        year: now.getFullYear(),
        description: "",
        requestReason: "",
        studentEnrollmentFile: null,
    });

    const [submitting, setSubmitting] = useState(false);
    const [showCourseTooltip, setShowCourseTooltip] = useState(false);
    const isValid = useMemo(() => {
        return !!(form.courseCodeId && form.termId && form.year && form.description);
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
            const payload: CourseRequestPayload = {
                courseCodeId: form.courseCodeId,
                description: form.description,
                termId: form.termId,
                year: Number(form.year),
                requestReason: form.requestReason || undefined,
                studentEnrollmentFile: form.studentEnrollmentFile ?? undefined,
            };
            const res = await CourseRequestService.create(payload);
            if (res?.success) {
                router.push("/lecturer/manage-courses");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            {/* Top bar header to match CreateCoursePage */}
            <div className="sticky top-0 z-30 backdrop-blur w-full pb-3 pt-1 flex items-center justify-between">
                <h1 className="text-sm font-semibold uppercase tracking-wide whitespace-nowrap mr-4">New Course Request</h1>
                <BreadcrumbRequest router={router} />
            </div>

            <div className="grid grid-cols-1 gap-3">
                <div className="flex flex-col gap-3">
                    <Card className="p-6 border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b]" />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-7 h-[calc(100vh-300)]">
                            {/* Left: form fields (Course Code, Term, Reason) */}
                            <div className="flex flex-col gap-6" onMouseEnter={() => setShowCourseTooltip(true)} onMouseLeave={() => setShowCourseTooltip(false)}>
                                <div>
                                    <Tooltip open={showCourseTooltip} onOpenChange={(v) => setShowCourseTooltip(Boolean(v))}>
                                        <TooltipTrigger asChild>
                                            <Label className="text-sm mb-2">Course Code <span className="text-slate-500">(*)</span></Label>
                                        </TooltipTrigger>
                                        <TooltipContent side="left" className="max-w-xs text-xs">
                                            This is the course code (e.g. CS101). Used to identify the course in the system.
                                        </TooltipContent>
                                    </Tooltip>
                                    <div className="mt-1">
                                        <Select value={form.courseCodeId} onValueChange={(v) => setForm((f) => ({ ...f, courseCodeId: v }))}>
                                            <SelectTrigger className="w-full border-slate-200">
                                                <SelectValue placeholder={loadingOptions ? "Loading..." : "Select course code"} />
                                            </SelectTrigger>
                                            <SelectContent className="border-slate-300">
                                                {codes.map((c) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        <div className="flex flex-col text-start">
                                                            <span className="text-sm font-medium">{c.code} — {c.title}</span>
                                                            <span className="text-[11px] text-slate-500">{c.department}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div>
                                    <Label className="text-sm mb-2">Term</Label>
                                    <div className="mt-1">
                                        <Select value={form.termId} onValueChange={(v) => setForm((f) => ({ ...f, termId: v }))}>
                                            <SelectTrigger className="w-full border-slate-200">
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

                                <div>
                                    <Label className="text-sm mb-2">Reason (optional)</Label>
                                    <Textarea
                                        value={form.requestReason ?? ""}
                                        onChange={(e) => setForm((f) => ({ ...f, requestReason: e.target.value }))}
                                        className="mt-1 min-h-[96px] placeholder:text-slate-400 border-slate-200"
                                        placeholder="e.g., private class for department"
                                    />
                                </div>
                            </div>

                            {/* Right: Description */}
                            <div className="flex flex-col h-full">
                                <Label className="text-sm mb-2">Description</Label>
                                <div className="mt-1 w-full flex-1 min-h-0">
                                    <Textarea
                                        value={form.description}
                                        onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                        className="w-full h-full min-h-0 placeholder:text-slate-400 border-slate-200"
                                        placeholder="Describe the request.."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 pt-4 border-t border-slate-300">
                            <Button
                                onClick={() => router.push("/lecturer/course")}
                                variant="ghost"
                                className="text-violet-800 hover:text-violet-500"
                            >
                                Cancel
                            </Button>

                            <Button
                                onClick={handleSubmit}
                                loading={submitting}
                                className="btn text-sm btn-gradient text-white"
                                disabled={!isValid}
                            >
                                Submit Request
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
