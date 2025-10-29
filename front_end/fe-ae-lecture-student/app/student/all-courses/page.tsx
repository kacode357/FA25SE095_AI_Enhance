// app/student/all-courses/page.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  KeyRound,
  Loader2,
  CalendarDays,
  PlayCircle,
  PlusCircle,
  Clock,
} from "lucide-react";
import { useAvailableCourses } from "@/hooks/course/useAvailableCourses";
import { useJoinCourse } from "@/hooks/enrollments/useJoinCourse";
import FilterBar from "./components/FilterBar";
import AccessCodeJoinSheet from "./components/AccessCodeJoinSheet";
import { AvailableCourseItem } from "@/types/courses/course.response";

/* ======= Config ======= */
const DEFAULT_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT15_Krn-RVlYgHN53kc-FUhY9a4xx179lqkQ&s";

/* ======= Utils ======= */
const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

/** Chỉ hiển thị chip nếu là PENDING (không show Open/Active). */
const StatusChip = ({ status }: { status?: string | null }) => {
  const v = (status || "").toLowerCase();
  if (!v || v === "active") return null;
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium"
      style={{
        background: "rgba(255,255,255,0.9)",
        color: "var(--accent)",
        border: "1px solid var(--accent)",
      }}
    >
      {status}
    </span>
  );
};

/** Lấy ảnh từ nhiều field; thiếu thì dùng fallback */
const getImageUrl = (c: any): string => {
  const url =
    c?.imageUrl ||
    c?.thumbnailUrl ||
    c?.coverImageUrl ||
    c?.bannerUrl ||
    c?.image ||
    "";
  return typeof url === "string" && url.trim() ? url : DEFAULT_IMAGE_URL;
};

/** CTA logic (1 nút duy nhất) */
const getCTA = (course: AvailableCourseItem) => {
  const status = (course.enrollmentStatus?.status || "").toLowerCase();
  const isEnrolled = !!course.enrollmentStatus?.isEnrolled;

  if (isEnrolled) return { label: "Go to Course", intent: "go" as const, disabled: false };
  if (status === "pending" || status === "pendingapproval")
    return { label: "Pending Approval", intent: "pending" as const, disabled: true };

  if (course.canJoin) {
    if (course.requiresAccessCode)
      return { label: "Join with Code", intent: "join-code" as const, disabled: !!course.isAccessCodeExpired };
    return { label: "Join", intent: "join" as const, disabled: false };
  }

  return { label: "Not Available", intent: "disabled" as const, disabled: true };
};

export default function AllCoursesPage() {
  const router = useRouter();
  const { listData, loading, fetchAvailableCourses } = useAvailableCourses();
  const { joinCourse } = useJoinCourse();

  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);
  const [accessOpen, setAccessOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(null);

  const lastQueryRef = useRef({
    page: 1,
    pageSize: 12,
    sortBy: "CreatedAt" as const,
    sortDirection: "desc" as const,
  });

  useEffect(() => {
    fetchAvailableCourses(lastQueryRef.current);
  }, [fetchAvailableCourses]);

  const refetchAfterAction = () => fetchAvailableCourses(lastQueryRef.current);

  const handleFilter = (filters: {
    name?: string;
    lecturerName?: string;
    sortBy?: "CreatedAt" | "Name" | "EnrollmentCount";
  }) => {
    const query = {
      ...filters,
      page: 1,
      pageSize: 12,
      sortDirection: !filters.sortBy || filters.sortBy === "CreatedAt" ? "desc" : "asc",
    } as const;
    lastQueryRef.current = query as any;
    fetchAvailableCourses(query);
  };

  const handleReset = () => {
    const query = {
      page: 1,
      pageSize: 12,
      sortBy: "CreatedAt" as const,
      sortDirection: "desc" as const,
    };
    lastQueryRef.current = query;
    fetchAvailableCourses(query);
  };

  const handleJoinClick = async (course: AvailableCourseItem) => {
    if (course.requiresAccessCode) {
      setSelectedCourse({
        id: course.id,
        title: `${course.courseCode}${course.description ? ` — ${course.description}` : ""}`,
      });
      setAccessOpen(true);
      return;
    }
    setLoadingCourseId(course.id);
    await joinCourse(course.id);
    refetchAfterAction();
    setLoadingCourseId(null);
  };

  const courses = useMemo(() => (listData as AvailableCourseItem[]) ?? [], [listData]);

  /* ===== CTA Button (dùng btn-gradient-slow + icon; nút ở góc phải, bo nhẹ) ===== */
  const CTAButton = ({ course }: { course: AvailableCourseItem }) => {
    const cta = getCTA(course);
    const isBusy = loadingCourseId === course.id;

    // bo góc nhẹ và kích thước nút; không full width
    const styleBase: React.CSSProperties = {
      height: 38,
      borderRadius: 10, // override pill -> bo nhẹ
      paddingInline: 14,
    };

    if (cta.intent === "go")
      return (
        <button
          className="btn btn-gradient-slow"
          style={styleBase}
          onClick={() => router.push(`/student/courses/${course.id}`)}
        >
          <PlayCircle className="w-5 h-5" />
          <span>Go to Course</span>
        </button>
      );

    if (cta.intent === "join")
      return (
        <button
          className="btn btn-gradient-slow"
          style={styleBase}
          disabled={isBusy}
          onClick={() => handleJoinClick(course)}
        >
          {isBusy ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            <>
              <PlusCircle className="w-5 h-5" />
              <span>Join</span>
            </>
          )}
        </button>
      );

    if (cta.intent === "join-code")
      return (
        <button
          className="btn btn-gradient-slow"
          style={styleBase}
          disabled={isBusy || !!course.isAccessCodeExpired}
          onClick={() => handleJoinClick(course)}
        >
          {isBusy ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Joining...</span>
            </>
          ) : (
            <>
              <KeyRound className="w-5 h-5" />
              <span>Join with Code</span>
            </>
          )}
        </button>
      );

    // Pending / fallback disabled
    return (
      <button
        className="btn btn-gradient-slow"
        style={{ ...styleBase, opacity: 0.65, cursor: "not-allowed", filter: "grayscale(10%)" }}
        disabled
      >
        <Clock className="w-5 h-5" />
        <span>{cta.label}</span>
      </button>
    );
  };

  return (
    <div className="py-6">
      {/* padding 2 bên ++ + max-width */}
      <div
        className="mx-auto space-y-5"
        style={{ maxWidth: 1280, paddingLeft: "3.5rem", paddingRight: "3.5rem" }}
      >
        {/* Header */}
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold flex items-center gap-2" style={{ color: "var(--nav)" }}>
            <BookOpen className="w-7 h-7" style={{ color: "var(--brand)" }} />
            All Courses
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Browse and discover all available courses you can join.
          </p>
        </div>

        {/* Filter */}
        <FilterBar onFilter={handleFilter} onReset={handleReset} />

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-10" style={{ color: "var(--brand)" }}>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="ml-2 text-sm">Loading courses...</span>
          </div>
        )}

        {/* Empty */}
        {!loading && courses.length === 0 && (
          <div className="text-center py-14">
            <BookOpen className="w-10 h-10 mx-auto mb-2" style={{ color: "var(--muted)" }} />
            <p style={{ color: "var(--text-muted)" }}>No available courses found.</p>
          </div>
        )}

        {/* Grid dọc 2–3 cột */}
        {!loading && courses.length > 0 && (
          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {courses.map((course, i) => {
              const imgUrl = getImageUrl(course as any);
              const createdAt = formatDate(course.createdAt);

              return (
                <motion.article
                  key={course.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="card overflow-hidden flex flex-col"
                >
                  {/* Banner */}
                  <div className="relative w-full aspect-[16/9] overflow-hidden">
                    <img
                      src={imgUrl}
                      alt={course.courseCode}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        const t = e.currentTarget as HTMLImageElement;
                        if (t.src !== DEFAULT_IMAGE_URL) t.src = DEFAULT_IMAGE_URL;
                      }}
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Date (top-right) */}
                    {createdAt && (
                      <span
                        className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium"
                        style={{
                          background: "rgba(255,255,255,0.95)",
                          color: "var(--foreground)",
                          border: "1px solid var(--border)",
                        }}
                      >
                        <CalendarDays className="h-3.5 w-3.5" /> {createdAt}
                      </span>
                    )}

                    {/* Status (bottom-left) — chỉ hiển thị nếu pending */}
                    <div className="absolute left-3 bottom-3">
                      <StatusChip status={course.enrollmentStatus?.status} />
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col gap-2">
                    <h3 className="text-base font-bold" style={{ color: "var(--foreground)" }}>
                      {course.courseCode}
                      {course.description ? ` — ${course.description}` : ""}
                    </h3>
                    <p className="text-sm font-medium text-brand">{course.lecturerName}</p>

                    <div className="mt-1 text-sm flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                      <Users className="h-4 w-4" style={{ color: "var(--brand)" }} />
                      <span>{course.enrollmentCount} enrolled</span>
                    </div>

                    {/* CTA ở góc phải của card */}
                    <div className="mt-3 flex justify-end">
                      <CTAButton course={course} />
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </section>
        )}

        {/* Access Code Sheet */}
        <AccessCodeJoinSheet
          open={accessOpen}
          onOpenChange={setAccessOpen}
          courseId={selectedCourse?.id ?? null}
          courseTitle={selectedCourse?.title}
          onJoined={refetchAfterAction}
        />
      </div>
    </div>
  );
}
