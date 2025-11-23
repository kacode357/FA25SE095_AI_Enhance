"use client";

import Select from "@/components/ui/select/Select";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useCreateSupportRequest } from "@/hooks/support-requests/useCreateSupportRequest";
import type { CreateSupportRequestPayload } from "@/types/support/support-request.payload";
import type { SupportRequestCategory, SupportRequestPriority } from "@/types/support/support-request.response";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { categoryColor, categoryLabel, priorityColor, priorityLabel } from "./support-labels";

type Props = {
    courseId?: string;
    onSuccess?: () => void;
};

export default function CreateSupportRequestForm({ courseId: initialCourseId, onSuccess }: Props) {
    const [courseId, setCourseId] = useState(initialCourseId ?? "");
    const [priority, setPriority] = useState<SupportRequestPriority>(1);
    const [category, setCategory] = useState<SupportRequestCategory>(0);
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const { createSupportRequest, loading } = useCreateSupportRequest();
    const { listData: courses, loading: loadingCourses, fetchMyCourses } = useMyCourses();

    // using shared Select component (imported above)

    useEffect(() => {
        // load courses for lecturer; pageSize large to fetch all
        fetchMyCourses({ asLecturer: true, page: 1, pageSize: 200 });
    }, [fetchMyCourses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!courseId) {
            const msg = "Please select a course";
            setError(msg);
            toast.error(msg);
            return;
        }
        if (!subject.trim()) {
            const msg = "Please enter a title";
            setError(msg);
            toast.error(msg);
            return;
        }

        const payload: CreateSupportRequestPayload = {
            courseId,
            priority: Number(priority),
            category: Number(category),
            subject: subject.trim(),
            description: description.trim(),
        };

        try {
            const res = await createSupportRequest(payload);
            const msg = res?.message ?? "Create support request.";
            if (res?.success) {
                toast.success(msg);
                if (onSuccess) onSuccess();
                try {
                    router.push(`/lecturer/course/support-requests`);
                } catch (e) {
                    // ignore navigation errors
                }
                // reset form (giữ courseId)
                setPriority(1);
                setCategory(0);
                setSubject("");
                setDescription("");
            } else {
                setError(msg);
                toast.error(msg);
            }
        } catch (err: any) {
            const msg = err?.message ?? "An error occurred.";
            setError(msg);
            toast.error(msg);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="">
            <Card className="p-4 py-4 border-slate-200  shadow-sm">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm text-slate-500">Send a request for help to system Staff.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-x-32">
                    <div className="md:col-span-3">
                        <Label className="text-sm">Course</Label>
                        {!loadingCourses && courses && courses.length > 0 ? (
                            <Select<string>
                                value={courseId}
                                options={[{ value: "", label: "-- Select course --" }, ...(courses || []).map((c: any) => ({ value: c.id, label: c.name || c.title || c.id }))]}
                                placeholder="-- Select course --"
                                onChange={(v) => setCourseId(String(v))}
                                className="mt-1"
                            />
                        ) : (
                            <input
                                title="Course (manual)"
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                                className="mt-1 block w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                                placeholder="Nhập courseId (ví dụ: course-123)"
                            />
                        )}
                    </div>

                    <div>
                        <Label className="text-sm">Priority</Label>
                        <div className="flex items-center gap-2">
                            <Select<SupportRequestPriority>
                                value={priority}
                                options={[
                                    { value: 0, label: "Low" },
                                    { value: 1, label: "Medium" },
                                    { value: 2, label: "High" },
                                    { value: 3, label: "Urgent" },
                                ]}
                                onChange={(v) => setPriority(v)}
                                className="mt-1  w-40"
                            />
                            <span className={`${priorityColor(priority)} mt-1 text-xs font-semibold px-2 py-1 rounded-full`}>
                                {priorityLabel(priority)}
                            </span>
                        </div>
                    </div>

                    <div>
                        <Label className="text-sm">Category</Label>
                        <div className="flex items-center gap-2">
                            <Select<SupportRequestCategory>
                                value={category}
                                options={[
                                    { value: 0, label: "Technical" },
                                    { value: 1, label: "Academic" },
                                    { value: 2, label: "Administrative" },
                                    { value: 3, label: "Other" },
                                ]}
                                onChange={(v) => setCategory(v)}
                                className="mt-1  w-40"
                            />
                            <span className={`${categoryColor(category)} mt-1 text-xs font-semibold px-2 py-1 rounded-full`}>
                                {categoryLabel(category)}
                            </span>
                        </div>
                    </div>

                    <div className="md:col-span-3">
                        <Label className="text-sm">Subject</Label>
                        <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 block w-full rounded-md border bg-white border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-slate-300"
                            placeholder="Enter your Subject.."
                        />
                    </div>

                    <div className="md:col-span-3">
                        <Label className="text-sm">Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 w-full min-h-[160px] bg-white border-slate-200"
                            placeholder="Describe the problem in detail.."
                        />
                    </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        className="text-sm text-violet-800 hover:text-violet-500"
                        onClick={() => {
                            // reset but keep selected course
                            setPriority(1);
                            setCategory(0);
                            setSubject("");
                            setDescription("");
                        }}
                    >
                        Reset
                    </Button>

                    <Button type="submit" className="btn btn-gradient-slow text-sm" disabled={loading}>
                        {loading ? "Sending..." : "Create"}
                    </Button>
                </div>
            </Card>
        </form>
    );
}
