// hooks/course/useUploadSyllabus.ts
"use client";

import { CourseService } from "@/services/course.services";
import type { UploadSyllabusPayload } from "@/types/courses/course.payload";
import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useUploadSyllabus() {
    const [loading, setLoading] = useState(false);

    const uploadSyllabus = useCallback(
        async (courseId: string, payload: UploadSyllabusPayload): Promise<string | null> => {
        setLoading(true);
        try {
            const res = await CourseService.uploadSyllabus(courseId, payload);

            if (res.success) {
            toast.success(res.message || "Upload syllabus thành công");
            return res.fileUrl;
            } else {
            toast.error(res.message || "Upload syllabus thất bại");
            return null;
            }
        } catch (error) {
            toast.error("Upload syllabus thất bại");
            return null;
        } finally {
            setLoading(false);
        }
        },
        []
    );

    return { uploadSyllabus, loading };
}
