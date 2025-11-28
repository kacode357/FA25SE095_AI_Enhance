"use client";

import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AccessCodeType, accessCodeTypeToString } from "@/config/access-code-type";
import type { CourseCodeOption } from "@/types/course-codes/course-codes.response";
import type { TermResponse } from "@/types/term/term.response";
import React, { useMemo, useState } from "react";

type FormState = {
    courseCodeId: string;
    termId: string;
    year: number;
    description: string;
    announcement?: string;
    syllabus?: File | null;
    requiresAccessCode: boolean;
    accessCodeType: AccessCodeType;
    customAccessCode?: string;
    accessCodeExpiresAt?: string;
};

type Props = {
    codes: CourseCodeOption[];
    terms: TermResponse[];
    loadingOptions: boolean;
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    disableMainForm: boolean;
};

export default function CreateCourseForm({ codes, terms, loadingOptions, form, setForm, disableMainForm }: Props) {
    const [showAccessTooltip, setShowAccessTooltip] = useState(false);

    const codeTypeLabel = useMemo(() => {
        try {
            const s = accessCodeTypeToString(form.accessCodeType as AccessCodeType) || "";
            return s ? s.charAt(0).toUpperCase() + s.slice(1) : "";
        } catch {
            return "";
        }
    }, [form.accessCodeType]);

    return (
        <div className="md:col-span-1 flex flex-col gap-5">
            <Card className="p-6 gap-0 border-slate-200 shadow-sm relative overflow-hidden h-full">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#7f71f4] via-[#8b7cf8] to-[#f4a23b]" />
                <h1 className="text-lg font-semibold mb-7">Create Course</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                        <Label className="text-sm mb-2">Course Code <span className="text-red-500 text-xs">(* required)</span></Label>
                        <Select
                            value={form.courseCodeId ?? ""}
                            options={codes.map((c) => ({ value: c.id, label: `${c.code} — ${c.title}` }))}
                            placeholder={loadingOptions ? "Loading..." : "Select course code"}
                            onChange={(v) => setForm((f) => ({ ...f, courseCodeId: v }))}
                            className="w-full border-slate-200 bg-white"
                            disabled={disableMainForm}
                        />
                    </div>

                    <div>
                        <Label className="text-sm mb-2">Term <span className="text-red-500 text-xs">(* required)</span></Label>
                        <Select
                            value={form.termId ?? ""}
                            options={terms.map((t) => ({ value: t.id, label: t.name }))}
                            placeholder={loadingOptions ? "Loading..." : "Select term"}
                            onChange={(v) => setForm((f) => ({ ...f, termId: v }))}
                            className="w-full bg-white border-slate-200"
                            disabled={disableMainForm}
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <Label className="text-sm mb-2">Description <span className="text-red-500 text-xs">(* required)</span></Label>
                        <Textarea
                            value={form.description}
                            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                            className="mt-1 min-h-28 bg-white border-slate-200"
                            placeholder="Short overview for this course.."
                            disabled={disableMainForm}
                        />
                    </div>

                    <Card
                        className="p-4 gap-0 w-full border-slate-200 shadow-sm sm:col-span-2"
                        onMouseEnter={() => setShowAccessTooltip(true)}
                        onMouseLeave={() => setShowAccessTooltip(false)}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-slate-900">Access Code (optional)</h3>
                            <div className="flex items-center gap-2">
                                <Tooltip open={showAccessTooltip} onOpenChange={(v) => setShowAccessTooltip(Boolean(v))}>
                                    <TooltipTrigger asChild>
                                        <span>
                                            <Checkbox
                                                className="cursor-pointer text-violet-700"
                                                id="requiresAccessCode"
                                                checked={form.requiresAccessCode}
                                                onCheckedChange={(v) => setForm((f) => ({ ...f, requiresAccessCode: Boolean(v) }))}
                                                disabled={disableMainForm}
                                            />
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-slate-900 text-white">
                                        Click here to set access code
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                            <div className="min-w-0">
                                <Label className={`text-xs mb-1 ${(!form.requiresAccessCode || disableMainForm) ? 'opacity-60' : ''}`}>Code Type</Label>
                                <div
                                    tabIndex={-1}
                                    role="textbox"
                                    aria-readonly="true"
                                    aria-label="Code Type"
                                    className={`h-9 text-sm bg-white border border-slate-200 w-full rounded-md px-3 flex items-center ${(!form.requiresAccessCode || disableMainForm) ? 'opacity-60' : ''}`}
                                >
                                    <span className="truncate">{codeTypeLabel || 'Custom'}</span>
                                </div>
                            </div>

                            <div className="min-w-0">
                                <Label className={`text-xs mb-1 ${(!form.requiresAccessCode || disableMainForm) ? 'opacity-60' : ''}`}>Custom Code</Label>
                                {form.accessCodeType === AccessCodeType.Custom ? (
                                    <Input
                                        value={form.customAccessCode ?? ""}
                                        onChange={(e) => setForm((f) => ({ ...f, customAccessCode: e.target.value }))}
                                        placeholder="Enter custom access code"
                                        className={`h-9 text-sm placeholder:text-xs w-full ${(!form.requiresAccessCode || disableMainForm) ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        disabled={!form.requiresAccessCode || disableMainForm}
                                    />
                                ) : (
                                    <div className="h-9" />
                                )}
                            </div>

                            <div className="min-w-0">
                                <Label className={`text-xs mb-1 ${(!form.requiresAccessCode || disableMainForm) ? 'opacity-60' : ''}`}>Expires At</Label>
                                <div className={`w-full min-w-0 ${(!form.requiresAccessCode || disableMainForm) ? 'opacity-60 cursor-not-allowed pointer-events-none' : ''}`}>
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

                            <div className="min-w-0 text-center justify-center items-center align-middle self-center">
                                <div className="text-sm">
                                    {form.customAccessCode ? (
                                        <div className="mt-5 gap-2 flex font-medium items-center text-slate-700 truncate"><p className="text-slate-500 text-xs">Current:</p>{form.customAccessCode} : {form.accessCodeExpiresAt ? new Date(form.accessCodeExpiresAt).toLocaleString() : '—'}</div>
                                    ) : (
                                        <div className="text-xs text-slate-400">No custom code set</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </Card>
        </div>
    );
}
