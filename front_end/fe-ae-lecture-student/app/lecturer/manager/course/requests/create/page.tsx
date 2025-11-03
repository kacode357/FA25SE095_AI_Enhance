"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

import { CourseCodeService } from "@/services/course-codes.services";
import { CourseRequestService } from "@/services/course-requests.services";
import { TermService } from "@/services/term.services";
import { CourseCodeOption } from "@/types/course-codes/course-codes.response";
import { CourseRequestPayload } from "@/types/course-requests/course-request.payload";
import { TermResponse } from "@/types/term/term.response";

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
                router.push("/lecturer/manager/course");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-4">
            {/* Hero */}
            <div className="relative overflow-hidden mb-3 rounded-2xl border border-slate-200 shadow-[0_8px_28px_rgba(2,6,23,0.08)]">
                <div className="absolute inset-0 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b] opacity-90" />
                <div className="relative px-4 sm:px-6 py-5 text-white flex items-center justify-between gap-3">
                    <div>
                        <h1 className="text-lg sm:text-xl font-semibold tracking-tight">New Course Request</h1>
                        <p className="text-xs sm:text-sm text-white/90">Request a private course opening, optionally attach students.</p>
                    </div>
                    <Button
                        variant="ghost"
                        className="text-white/90 hover:text-white"
                        onClick={() => router.push("/lecturer/manager/course")}
                    >
                        <ArrowLeft className="size-4 mr-1" /> Back
                    </Button>
                </div>
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
                                        <SelectTrigger className="w-full border-slate-200">
                                            <SelectValue placeholder={loadingOptions ? "Loading..." : "Select course code"} />
                                        </SelectTrigger>
                                        <SelectContent>
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

                            {/* Term */}
                            <div>
                                <Label className="text-lg mb-2">Term</Label>
                                <div className="mt-1">
                                    <Select value={form.termId} onValueChange={(v) => setForm((f) => ({ ...f, termId: v }))}>
                                        <SelectTrigger className="w-full border-slate-200">
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
                                <Input
                                    type="number"
                                    value={form.year}
                                    onChange={(e) => setForm((f) => ({ ...f, year: Number(e.target.value) }))}
                                    className="mt-1 h-9"
                                    placeholder="e.g., 2025"
                                />
                            </div>

                            {/* Description */}
                            <div className="sm:col-span-2">
                                <Label className="text-lg mb-2">Description</Label>
                                <Textarea
                                    value={form.description}
                                    onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                                    className="mt-1 min-h-24 border-slate-200"
                                    placeholder="Describe the request.."
                                />
                            </div>

                            {/* Reason (optional) */}
                            <div className="sm:col-span-2">
                                <Label className="text-lg mb-2">Reason (optional)</Label>
                                <Input
                                    value={form.requestReason ?? ""}
                                    onChange={(e) => setForm((f) => ({ ...f, requestReason: e.target.value }))}
                                    className="mt-1 h-9"
                                    placeholder="e.g., private class for department"
                                />
                            </div>

                            {/* Students file (optional) */}
                            <div className="sm:col-span-2">
                                <Label className="text-lg mb-2">Student Enrollment File (optional)</Label>
                                <div className="mt-1 flex items-center gap-2">
                                    <Input
                                        type="file"
                                        accept=".csv, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                                        onChange={(e) => setForm((f) => ({ ...f, studentEnrollmentFile: e.target.files?.[0] ?? null }))}
                                        className="h-9"
                                    />
                                    {form.studentEnrollmentFile && (
                                        <span className="text-xs text-slate-600 truncate max-w-[240px]">
                                            {form.studentEnrollmentFile.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
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
                                Submit Request
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
