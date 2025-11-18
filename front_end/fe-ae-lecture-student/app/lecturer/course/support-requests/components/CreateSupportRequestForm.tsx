"use client";

import React, { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useCreateSupportRequest } from "@/hooks/support-requests/useCreateSupportRequest";
import type { CreateSupportRequestPayload } from "@/types/support/support-request.payload";

type Props = {
    courseId?: string;
    onSuccess?: () => void;
};

export default function CreateSupportRequestForm({ courseId: initialCourseId, onSuccess }: Props) {
    const [courseId, setCourseId] = useState(initialCourseId ?? "");
    const [priority, setPriority] = useState<number>(1);
    const [category, setCategory] = useState<number>(0);
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState<string | null>(null);

    const { createSupportRequest, loading } = useCreateSupportRequest();
    const { listData: courses, loading: loadingCourses, fetchMyCourses } = useMyCourses();

    useEffect(() => {
        // load courses for lecturer; pageSize large to fetch all
        fetchMyCourses({ asLecturer: true, page: 1, pageSize: 200 });
    }, [fetchMyCourses]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!courseId) {
            setError("No course found!");
            return;
        }
        if (!subject.trim()) {
            setError("Please enter a title (subject)");
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
            await createSupportRequest(payload);
            // đơn giản: thông báo và gọi onSuccess nếu có
            if (onSuccess) onSuccess();
            else alert("Tạo support request thành công");
            // reset form (giữ courseId)
            setPriority(1);
            setCategory(0);
            setSubject("");
            setDescription("");
        } catch (err: any) {
            setError(err?.message ?? "Đã có lỗi xảy ra");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium">Course Id</label>
                <div>
                    <label className="block text-sm font-medium">Course</label>
                    {!loadingCourses && courses && courses.length > 0 ? (
                        <select
                            title="Course"
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            className="mt-1 block w-full rounded border px-2 py-1"
                        >
                            <option value="">-- Select course --</option>
                            {courses.map((c: any) => (
                                <option key={c.id} value={c.id}>
                                    {c.name || c.title || c.id}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            title="Course (manual)"
                            value={courseId}
                            onChange={(e) => setCourseId(e.target.value)}
                            className="mt-1 block w-full rounded border px-2 py-1"
                            placeholder="Nhập courseId (ví dụ: course-123)"
                        />
                    )}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Priority</label>
                    <Input
                        title="Priority"
                        type="number"
                        value={priority}
                        onChange={(e) => setPriority(Number(e.target.value))}
                        className="mt-1 block w-full rounded border px-2 py-1"
                        min={0}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium">Category</label>
                    <Input
                        title="Category"
                        type="number"
                        value={category}
                        onChange={(e) => setCategory(Number(e.target.value))}
                        className="mt-1 block w-full rounded border px-2 py-1"
                        min={0}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium">Subject</label>
                <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 block w-full rounded border px-2 py-1"
                    placeholder="Tiêu đề ngắn gọn"
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded border px-2 py-1"
                    rows={6}
                    placeholder="Mô tả chi tiết vấn đề"
                />
            </div>

            {error && <div className="text-sm text-red-600">{error}</div>}

            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
                >
                    {loading ? "Đang gửi..." : "Tạo Support Request"}
                </button>
            </div>
        </form>
    );
}
