"use client";

import Select from "@/components/ui/select/Select";
import React, { useCallback, useEffect, useRef, useState } from "react";

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
    const cardRef = useRef<HTMLDivElement | null>(null);
    const footerRef = useRef<HTMLDivElement | null>(null);
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

    const getScrollParent = useCallback((el: Element | null) => {
        let parent = el?.parentElement || null;
        while (parent) {
            const style = window.getComputedStyle(parent);
            const overflowY = style.overflowY;
            if ((overflowY === "auto" || overflowY === "scroll") && parent.scrollHeight > parent.clientHeight) return parent;
            parent = parent.parentElement;
        }
        return window;
    }, []);

    const ensureFooterVisible = useCallback(() => {
        const footer = footerRef.current;
        if (!footer) return;
        const parent = getScrollParent(footer);

        const targetRect = footer.getBoundingClientRect();

        if (parent === window) {
            if (targetRect.bottom > window.innerHeight) {
                window.scrollBy({ top: targetRect.bottom - window.innerHeight + 12, behavior: 'smooth' });
            }
            if (targetRect.top < 0) {
                window.scrollBy({ top: targetRect.top - 12, behavior: 'smooth' });
            }
        } else {
            const p = parent as Element;
            const parentRect = (p as Element).getBoundingClientRect();
            const offset = targetRect.bottom - parentRect.bottom;
            if (offset > 0) {
                (p as HTMLElement).scrollBy({ top: offset + 12, behavior: 'smooth' });
            }
            if (targetRect.top < parentRect.top) {
                (p as HTMLElement).scrollBy({ top: targetRect.top - parentRect.top - 12, behavior: 'smooth' });
            }
        }
    }, [getScrollParent]);

    useEffect(() => {
        // ensure visible on mount and on resize
        ensureFooterVisible();
        window.addEventListener('resize', ensureFooterVisible);
        return () => window.removeEventListener('resize', ensureFooterVisible);
    }, [ensureFooterVisible]);

    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;
        const onFocusIn = (e: FocusEvent) => {
            // when any input inside form gains focus, make sure footer is visible
            ensureFooterVisible();
        };
        card.addEventListener('focusin', onFocusIn as EventListener);
        return () => card.removeEventListener('focusin', onFocusIn as EventListener);
    }, [ensureFooterVisible]);

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
            <Card ref={cardRef} className="p-4 border-slate-200 shadow-sm relative flex flex-col h-[calc(100vh-140px)]">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-sm text-slate-500">Send a request for help to system Staff.</p>
                    </div>
                </div>
                <div className="overflow-auto flex-1 pr-2 pb-20">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="col-span-1 md:col-span-3">
                        <Label className="text-sm">Course</Label>
                        {!loadingCourses && courses && courses.length > 0 ? (
                            <Select<string>
                                value={courseId}
                                options={[{ value: "", label: "-- Select course --" }, ...(courses || []).map((c: any) => ({ value: c.id, label: c.courseCode + " — " + c.courseCodeTitle || c.id }))]}
                                placeholder="-- Select course --"
                                onChange={(v) => setCourseId(String(v))}
                                className="mt-1 w-full"
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

                    <div className="col-span-1 md:col-span-1">
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
                                className="mt-1 w-full max-w-xs"
                            />
                            <span className={`${priorityColor(priority)} mt-1 text-xs font-semibold px-2 py-1 rounded-full`}>
                                {priorityLabel(priority)}
                            </span>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-1">
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
                                className="mt-1 w-full max-w-xs"
                            />
                            <span className={`${categoryColor(category)} mt-1 text-xs font-semibold px-2 py-1 rounded-full`}>
                                {categoryLabel(category)}
                            </span>
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-3">
                        <Label className="text-sm">Subject</Label>
                        <input
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className="mt-1 block w-full rounded-md border bg-white border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:border-slate-300"
                            placeholder="Enter your Subject.."
                        />
                    </div>

                    <div className="col-span-1 md:col-span-3">
                        <Label className="text-sm">Description</Label>
                        <Textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="mt-1 w-full min-h-[160px] bg-white border-slate-200"
                            placeholder="Describe the problem in detail.."
                        />
                    </div>
                    </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-end gap-3 flex-none sticky sm:static bottom-0 p-3 bg-white/95 border-t border-slate-200 z-10">
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
