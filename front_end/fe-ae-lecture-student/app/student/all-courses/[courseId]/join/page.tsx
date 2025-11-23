// app/student/all-courses/[courseId]/join/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  KeyRound,
  ArrowLeft,
  Loader2,
  GraduationCap,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { useJoinCourse } from "@/hooks/enrollments/useJoinCourse";
import { useCourseJoinInfo } from "@/hooks/course/useCourseJoinInfo";

export default function JoinCourseWithAccessCodePage() {
  const params = useParams<{ courseId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const courseId = params.courseId;

  // --- Query params (nếu có) ---
  const rawTitleParam = searchParams.get("title") ?? "";
  const lecturerParam = searchParams.get("lecturer") ?? "";
  const classCodeParam = searchParams.get("classCode") ?? "";

  const hasQueryInfo =
    Boolean(rawTitleParam) || Boolean(lecturerParam) || Boolean(classCodeParam);

  // --- Join-info hook (fallback khi thiếu param) ---
  const {
    data: joinInfo,
    loading: joinInfoLoading,
    error: joinInfoError,
    fetchCourseJoinInfo,
  } = useCourseJoinInfo();

  useEffect(() => {
    if (!courseId) return;

    // Chỉ gọi join-info khi thiếu thông tin từ query
    if (!hasQueryInfo) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchCourseJoinInfo(courseId);
    } else if (!classCodeParam && !joinInfo) {
      // Nếu chỉ thiếu classCode thì vẫn gọi để fill unique code
      // eslint-disable-next-line react-hooks/exhaustive-deps
      fetchCourseJoinInfo(courseId);
    }
  }, [courseId, hasQueryInfo, classCodeParam]);

  // --- Tính toán title / subtitle / lecturer / classCode với fallback ---
  // Nếu có rawTitleParam thì dùng như cũ
  const [shortTitleParam, longTitleParam] = rawTitleParam
    .split("—")
    .map((s) => s?.trim());

  let courseCodePart = shortTitleParam || rawTitleParam || "Course";
  let courseSubtitle = longTitleParam || "";
  let headerTitle = lecturerParam
    ? `${courseCodePart} - ${lecturerParam}`
    : courseCodePart;
  let uniqueCodeDisplay = classCodeParam || "";

  // Nếu không có rawTitleParam => dùng joinInfo
  if (!rawTitleParam && joinInfo) {
    courseCodePart =
      joinInfo.courseCodeTitle || joinInfo.courseCode || courseCodePart;
    courseSubtitle = joinInfo.description || courseSubtitle;
    headerTitle = joinInfo.lecturerName
      ? `${courseCodePart} - ${joinInfo.lecturerName}`
      : courseCodePart;
  }

  // Nếu không có lecturerParam nhưng joinInfo có
  if (!lecturerParam && joinInfo && !rawTitleParam) {
    headerTitle = joinInfo.lecturerName
      ? `${courseCodePart} - ${joinInfo.lecturerName}`
      : courseCodePart;
  }

  // Nếu thiếu classCodeParam thì fill từ uniqueCode
  if (!classCodeParam && joinInfo) {
    uniqueCodeDisplay = joinInfo.uniqueCode || uniqueCodeDisplay;
  }

  const [accessCode, setAccessCode] = useState("");
  const { joinCourse, loading } = useJoinCourse();

  const handleSubmit = async () => {
    if (!courseId || !accessCode.trim() || loading) return;

    const res = await joinCourse(courseId, { accessCode: accessCode.trim() });
    if (!res) return;

    if (res.success === false) {
      toast.error(res.message || "Unable to join course.");
      return;
    }

    toast.success(res.message || "Joined course successfully.");
    router.push(`/student/courses/${courseId}`);
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--background-soft, #f3f4f6)" }}
    >
      <div className="max-w-5xl mx-auto px-4 py-10">
        {/* Header trên cùng */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to courses</span>
          </button>

          <h1
            className="text-2xl font-semibold text-right"
            style={{ color: "var(--foreground)" }}
          >
            {headerTitle}
          </h1>
        </div>

        {/* Khối lớn chia 2 bên */}
        <div
          className="rounded-3xl shadow-sm overflow-hidden"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* LEFT: Enrolment options + course card */}
            <div className="p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <h2
                  className="text-xl font-semibold"
                  style={{ color: "var(--foreground)" }}
                >
                  Enrolment options
                </h2>

                {joinInfoLoading && (
                  <Loader2 className="w-4 h-4 animate-spin opacity-70" />
                )}
              </div>

              {joinInfoError && !hasQueryInfo && (
                <p
                  className="text-xs"
                  style={{ color: "var(--danger, #dc2626)" }}
                >
                  Failed to load course information.
                </p>
              )}

              <div className="flex-1 flex items-center">
                <div className="w-full">
                  {/* Course card */}
                  <div
                    className="rounded-2xl overflow-hidden shadow-sm"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--accent), var(--brand))",
                    }}
                  >
                    {/* Banner */}
                    <div className="p-4 pb-20 relative">
                      {/* Label trên góc trái */}
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
                        <KeyRound className="w-3 h-3" />
                        <span>{courseCodePart}</span>
                      </div>
                    </div>

                    {/* Info dưới card */}
                    <div
                      className="px-4 py-4 bg-white"
                      style={{ color: "var(--brand-700)" }}
                    >
                      <div className="text-sm font-medium underline underline-offset-2">
                        {headerTitle}
                      </div>

                      {courseSubtitle && (
                        <div
                          className="mt-1 text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {courseSubtitle}
                        </div>
                      )}

                      {(classCodeParam || uniqueCodeDisplay) && (
                        <div
                          className="mt-1 text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          Unique code:{" "}
                          <span className="font-medium">
                            {classCodeParam || uniqueCodeDisplay}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Self enrolment (Student) */}
            <div
              className="p-6 md:p-8 md:border-l flex flex-col"
              style={{ borderColor: "var(--border-soft, #e5e7eb)" }}
            >
              {/* Title row */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{ background: "var(--accent-50, #fff7ed)" }}
                >
                  <ChevronDown
                    className="w-4 h-4"
                    style={{ color: "var(--accent-700, #c05621)" }}
                  />
                </div>
                <div>
                  <div
                    className="text-base font-semibold"
                    style={{ color: "var(--foreground)" }}
                  >
                    Self enrolment (Student)
                  </div>
                  <div
                    className="text-xs mt-0.5"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Enter the access key provided by your teacher.
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-2 mb-6">
                <label
                  htmlFor="accessCode"
                  className="text-sm font-medium"
                  style={{ color: "var(--foreground)" }}
                >
                  Enrolment key
                </label>
                <input
                  id="accessCode"
                  placeholder="Enter enrolment key"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  autoFocus
                  disabled={loading}
                  className="input h-10 text-sm"
                />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  This key is required to join this course.
                </p>
              </div>

              {/* Button */}
              <div className="mt-auto">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !accessCode.trim()}
                  className="btn"
                  style={{
                    background: "var(--accent)",
                    color: "var(--white)",
                    height: 40,
                    minWidth: 140,
                    borderRadius: 9999,
                  }}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    <>
                      <GraduationCap className="w-5 h-5 mr-2" />
                      <span>Enrol me</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
