// app/lecture/manager/course/[id]/assignments/components/EditAssignmentForm.tsx
"use client";

import LiteRichTextEditor from "@/components/common/TinyMCE";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { useUpdateAssignment } from "@/hooks/assignment/useUpdateAssignment";
import type { UpdateAssignmentPayload } from "@/types/assignments/assignment.payload";
import { AssignmentStatus } from "@/types/assignments/assignment.response";
import { CircleAlert, Info } from "lucide-react";
import { useEffect, useState } from "react";

function normalizeHtmlForSave(input?: string | null): string {
    if (!input) return "";
    let html = input;
    html = html.replace(/<p>\s*(<(?:ol|ul)[\s\S]*?<\/(?:ol|ul)>)\s*<\/p>/gi, "$1");
    html = html.replace(/<li>\s*<p>([\s\S]*?)<\/p>\s*<\/li>/gi, "<li>$1</li>");
    html = html.replace(/<p>\s*(?:<br\s*\/?>)?\s*<\/p>/gi, "");
    html = html.replace(/(?:<br\s*\/?>\s*){3,}/gi, "<br>");
    html = html.replace(/^\s*<div[^>]*>([\s\S]*?)<\/div>\s*$/i, "$1");
    return html.trim();
}

type Props = {
    id: string;
    onUpdated?: () => void;
    onCancel?: () => void;
};

export default function EditAssignmentForm({ id, onUpdated, onCancel }: Props) {
    const { data, loading: loadingData, fetchAssignment } = useAssignmentById();
    const { updateAssignment, loading: updating } = useUpdateAssignment();

    const [form, setForm] = useState({
        title: "",
        description: "",
        startDate: "",
        dueDate: "",
        maxPoints: "",
        format: "",
        gradingCriteria: "",
    });

    // Fetch assignment on mount
    useEffect(() => {
        fetchAssignment(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Populate form when data arrives
    useEffect(() => {
        if (!data?.assignment) return;
        const a = data.assignment;
        setForm({
            title: a.title ?? "",
            description: a.description ?? "",
            startDate: a.startDate ? new Date(a.startDate).toISOString().slice(0, 16) : "",
            dueDate: a.dueDate ? new Date(a.dueDate).toISOString().slice(0, 16) : "",
            maxPoints: a.maxPoints ? String(a.maxPoints) : "",
            format: a.format ?? "",
            gradingCriteria: a.gradingCriteria ?? "",
        });
    }, [data]);

    const status = data?.assignment.status;
    const isDraft = status === AssignmentStatus.Draft;
    const isClosed = status === AssignmentStatus.Closed;

    const onSubmit = async () => {
        if (!data?.assignment || isClosed) return;
        const a = data.assignment;

        const descriptionClean = normalizeHtmlForSave(form.description);


            const payload: UpdateAssignmentPayload = {
                title: form.title !== undefined ? form.title.trim() : a.title ?? "",
                description: descriptionClean !== undefined ? descriptionClean : a.description ?? "",
                format: form.format !== undefined ? form.format.trim() : a.format ?? undefined,
                gradingCriteria: form.gradingCriteria !== undefined ? form.gradingCriteria.trim() : a.gradingCriteria ?? undefined,
                maxPoints: form.maxPoints !== undefined && form.maxPoints !== "" ? Number(form.maxPoints) : a.maxPoints ?? undefined,
            };

            if (isDraft) {
                payload.startDate = form.startDate ? new Date(form.startDate).toISOString() : a.startDate ?? undefined;
                payload.dueDate = form.dueDate ? new Date(form.dueDate).toISOString() : a.dueDate ?? undefined;
            }

            const res = await updateAssignment(a.id, payload);
        if (res?.success) {
            onUpdated?.();
        }
    };

    if (loadingData) {
        return <div className="p-4 text-sm text-slate-500">Loading assignment...</div>;
    }

    if (!data?.assignment) {
        return <div className="p-4 text-sm text-red-600">Assignment not found.</div>;
    }

    if (isClosed) {
        return (
            <Card className="border-slate-200 py-10 text-center">
                <div className="text-sm text-slate-600">Closed assignments cannot be edited.</div>
                {onCancel && (
                    <Button className="mt-4" variant="outline" onClick={onCancel}>
                        Back
                    </Button>
                )}
            </Card>
        );
    }

    return (
        <Card className="border-slate-200 py-0 pt-4 shadow-sm">
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm mb-1">Title *</Label>
                        <Input
                            value={form.title}
                            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                            className="text-xs"
                        />
                    </div>

                    <div>
                        <Label className="text-sm mb-1">Max Points</Label>
                        <Input
                            type="number"
                            inputMode="numeric"
                            value={form.maxPoints}
                            className="text-xs"
                            onChange={(e) => setForm((p) => ({ ...p, maxPoints: e.target.value }))}
                        />
                    </div>

                    {/* Topic shown read-only since Update payload doesn't include topicId */}
                    <div className="md:col-span-2">
                        <Label className="text-sm mb-1">Topic</Label>
                        <Input
                            readOnly
                            value={data.assignment.topicName}
                            className="text-xs bg-slate-100"
                        />
                    </div>

                    <div className="flex gap-3 w-full md:col-span-2">
                        <div className="flex-1">
                            <Label className="text-sm mb-1">Start Date {isDraft ? "*" : "(locked)"}</Label>
                            <Input
                                type="datetime-local"
                                disabled={!isDraft}
                                value={form.startDate}
                                className="text-xs"
                                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                            />
                        </div>
                        <div className="flex-1">
                            <Label className="text-sm mb-1">Due Date {isDraft ? "*" : "(locked)"}</Label>
                            <Input
                                type="datetime-local"
                                disabled={!isDraft}
                                value={form.dueDate}
                                className="text-xs"
                                onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                            />
                        </div>
                    </div>
                </div>
                <Separator />
                {!isDraft && (
                    <div className="text-xs flex gap-2 text-amber-600 bg-amber-50 rounded-md -mt-4 p-2">
                        <Info className="size-4 ml-1" />Dates cannot be edited unless the assignment is still in Draft. Use Extend Due Date for timeline changes.
                    </div>
                )}
                <div>
                    <Label className="text-sm block mb-1">Description</Label>
                    <LiteRichTextEditor
                        className="w-full"
                        value={form.description}
                        onChange={(html) => setForm((p) => ({ ...p, description: html }))}
                        placeholder="Update description…"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label className="text-sm mb-1">Format</Label>
                        <Input
                            value={form.format}
                            className="text-xs"
                            onChange={(e) => setForm((p) => ({ ...p, format: e.target.value }))}
                        />
                    </div>
                    <div>
                        <Label className="text-sm flex items-center gap-1 mb-1">
                            Grading Criteria
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button
                                        type="button"
                                        aria-label="Grading criteria help"
                                        className="inline-flex h-5 w-5 items-center justify-center rounded-full cursor-pointer bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
                                    >
                                        <CircleAlert className="size-3.5" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-xs bg-white text-slate-500">
                                    The assessment criteria used to determine the score.
                                </TooltipContent>
                            </Tooltip>
                        </Label>
                        <Input
                            placeholder="Rubric note (optional)"
                            value={form.gradingCriteria}
                            className="text-xs"
                            onChange={(e) => setForm((p) => ({ ...p, gradingCriteria: e.target.value }))}
                        />
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex items-center rounded-xl justify-end gap-2 bg-white py-3">
                {onCancel && (
                    <Button variant="outline" className="text-violet-800 hover:text-violet-500" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
                <Button className="btn text-sm btn-gradient-slow" onClick={onSubmit} disabled={updating}>
                    Save Changes
                </Button>
            </CardFooter>
        </Card>
    );
}
