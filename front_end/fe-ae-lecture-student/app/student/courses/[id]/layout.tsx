// app/student/courses/[id]/layout.tsx
"use client";

import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertTriangle, ArrowLeft, BookOpen } from "lucide-react";

import { useGetCourseById } from "@/hooks/course/useGetCourseById";

type Props = {
  children: ReactNode;
};

export default function CourseLayout({ children }: Props) {
  const { id } = useParams();
  const router = useRouter();
  const courseId = typeof id === "string" ? id : "";

  const { loading, error, isEnrolled, fetchCourseById } = useGetCourseById();
  const didFetchRef = useRef(false);

  useEffect(() => {
    if (!courseId) return;
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    // Gọi API để biết isEnrolled
    fetchCourseById(courseId);
  }, [courseId, fetchCourseById]);

  // Không có id -> sai URL
  if (!courseId) {
    return (
      <div className="py-16 text-center" style={{ color: "var(--text-muted)" }}>
        <p>
          Không tìm thấy <b>courseId</b> trong URL.
        </p>
        <button
          className="btn mt-4"
          style={{
            background: "var(--card)",
            color: "var(--brand)",
            border: "1px solid var(--brand)",
          }}
          onClick={() => router.push("/student/my-courses")}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to My Courses
        </button>
      </div>
    );
  }

  // Đang load lần đầu
  if (loading && isEnrolled === null && !error) {
    return (
      <div
        className="flex items-center justify-center h-[60vh]"
        style={{ color: "var(--brand)" }}
      >
        <BookOpen className="w-6 h-6 mr-2 animate-pulse" />
        <span className="text-sm">Loading course…</span>
      </div>
    );
  }

  // ❌ Chưa enroll mà cố vào URL thẳng -> chặn
  if (!loading && isEnrolled === false) {
    return (
      <div className="py-16 text-center" style={{ color: "var(--text-muted)" }}>
        <AlertTriangle className="w-10 h-10 mx-auto mb-4 text-red-500" />
        <p className="mb-2 font-semibold">
          You are not enrolled in this course.
        </p>
        <p className="text-sm mb-4">
          Please join the course first before accessing its content.
        </p>
        <button
          onClick={() => router.push("/student/my-courses")}
          className="btn mt-2"
          style={{
            background: "var(--card)",
            color: "var(--brand)",
            border: "1px solid var(--brand)",
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Courses
        </button>
      </div>
    );
  }

  // Lỗi khác (API fail, course không tồn tại, ...)
  if (error) {
    return (
      <div className="text-center py-16" style={{ color: "var(--text-muted)" }}>
        <BookOpen
          className="w-10 h-10 mx-auto mb-2"
          style={{ color: "var(--muted)" }}
        />
        <p>{error}</p>
        <button
          onClick={() => router.push("/student/my-courses")}
          className="btn mt-4"
          style={{
            background: "var(--card)",
            color: "var(--brand)",
            border: "1px solid var(--brand)",
          }}
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to My Courses
        </button>
      </div>
    );
  }

  // ✅ Đã enroll -> render tất cả route con: /, /groups, /my-groups, /assignments/...
  return <>{children}</>;
}
