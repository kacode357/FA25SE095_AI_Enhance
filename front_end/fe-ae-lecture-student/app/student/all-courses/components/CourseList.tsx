"use client";

import { motion } from "framer-motion";
import {
  CalendarDays,
  Users,
  PlayCircle,
  PlusCircle,
  Clock,
  KeyRound,
} from "lucide-react";
import type { AvailableCourseItem } from "@/types/courses/course.response";

const DEFAULT_IMAGE_URL =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT15_Krn-RVlYgHN53kc-FUhY9a4xx179lqkQ&s";

const formatDate = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
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

const getCTA = (course: AvailableCourseItem) => {
  const status = (course.enrollmentStatus?.status || "").toLowerCase();
  const isEnrolled = !!course.enrollmentStatus?.isEnrolled;

  if (isEnrolled) return { label: "Go to Course", intent: "go" as const, disabled: false };
  if (status === "pending" || status === "pendingapproval")
    return { label: "Pending Approval", intent: "pending" as const, disabled: true };

  if (course.canJoin) {
    if (course.requiresAccessCode)
      return {
        label: "Join with Code",
        intent: "join-code" as const,
        disabled: !!course.isAccessCodeExpired,
      };
    return { label: "Join", intent: "join" as const, disabled: false };
  }

  return { label: "Not Available", intent: "disabled" as const, disabled: true };
};

const getLecturerAvatarUrl = (course: any): string | null => {
  return (
    course?.lecturerAvatarUrl ||
    course?.lecturerImageUrl ||
    course?.lecturerImage ||
    null
  );
};

const getInitials = (name?: string | null) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

type Props = {
  courses: AvailableCourseItem[];
  loadingCourseId: string | null;
  onGoToCourse: (id: string) => void;
  onJoinClick: (course: AvailableCourseItem) => void;
};

export default function CourseList({
  courses,
  loadingCourseId,
  onGoToCourse,
  onJoinClick,
}: Props) {
  if (courses.length === 0) return null;

  return (
    <div className="space-y-4">
      {courses.map((course, i) => {
        const imgUrl =
          course.img && typeof course.img === "string"
            ? course.img
            : DEFAULT_IMAGE_URL;
        const createdAt = formatDate(course.createdAt);
        const cta = getCTA(course);
        const isBusy = loadingCourseId === course.id;

        const styleBase: React.CSSProperties = {
          height: 38,
          borderRadius: 10,
          paddingInline: 14,
        };

        const lecturerName = course.lecturerName || "Unknown lecturer";
        const lecturerAvatarUrl = getLecturerAvatarUrl(course);
        const lecturerInitials = getInitials(lecturerName);

        return (
          <motion.article
            key={course.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="card overflow-hidden flex flex-col md:flex-row md:items-stretch min-h-[200px]"
          >
            {/* LEFT: Image – phủ full chiều cao card */}
            <div className="relative w-full md:w-2/5 lg:w-1/3 overflow-hidden">
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

              {/* Status (bottom-left) — chỉ hiển thị nếu pending */}
              <div className="absolute left-3 bottom-3">
                <StatusChip status={course.enrollmentStatus?.status} />
              </div>
            </div>

            {/* RIGHT: Content */}
            <div className="flex-1 p-4 flex flex-col justify-between gap-2">
              {/* Top: title + date ở góc phải */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3
                    className="text-base font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {course.courseCode}
                    {course.description ? ` — ${course.description}` : ""}
                  </h3>

                  {createdAt && (
                    <span
                      className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap"
                      style={{
                        background: "rgba(248,248,255,0.9)",
                        color: "var(--foreground)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      <CalendarDays className="h-3.5 w-3.5" />
                      {createdAt}
                    </span>
                  )}
                </div>

                {/* ❌ Không còn hiển thị course.name (subtitle) */}
              </div>

              {/* Bottom: total enrolled (trên), lecturer (dưới), CTA */}
              <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2">
                  {/* Total enrolled TRƯỚC lecturer */}
                  <div
                    className="flex items-center gap-2 text-sm"
                    style={{ color: "var(--foreground)" }}
                  >
                    <Users
                      className="h-4 w-4"
                      style={{ color: "var(--brand)" }}
                    />
                    <span>{course.enrollmentCount} enrolled</span>
                  </div>

                  {/* Lecturer avatar + name */}
                  <div className="flex items-center gap-2">
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold overflow-hidden"
                      style={{ background: "var(--brand)", color: "white" }}
                    >
                      {lecturerAvatarUrl ? (
                        <img
                          src={lecturerAvatarUrl}
                          alt={lecturerName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        lecturerInitials
                      )}
                    </div>
                    <span
                      className="text-sm font-medium"
                      style={{ color: "var(--brand)" }}
                    >
                      {lecturerName}
                    </span>
                  </div>
                </div>

                {/* CTA button bên phải */}
                <div className="flex justify-end md:justify-start">
                  {cta.intent === "go" && (
                    <button
                      className="btn btn-gradient-slow"
                      style={styleBase}
                      onClick={() => onGoToCourse(course.id)}
                    >
                      <PlayCircle className="w-5 h-5" />
                      <span>Go to Course</span>
                    </button>
                  )}

                  {cta.intent === "join" && (
                    <button
                      className="btn btn-gradient-slow"
                      style={styleBase}
                      disabled={isBusy}
                      onClick={() => onJoinClick(course)}
                    >
                      {isBusy ? (
                        <>
                          <Clock className="w-5 h-5 animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <PlusCircle className="w-5 h-5" />
                          <span>Join</span>
                        </>
                      )}
                    </button>
                  )}

                  {cta.intent === "join-code" && (
                    <button
                      className="btn btn-gradient-slow"
                      style={styleBase}
                      disabled={isBusy || !!course.isAccessCodeExpired}
                      onClick={() => onJoinClick(course)}
                    >
                      {isBusy ? (
                        <>
                          <Clock className="w-5 h-5 animate-spin" />
                          <span>Joining...</span>
                        </>
                      ) : (
                        <>
                          <KeyRound className="w-5 h-5" />
                          <span>Join</span>
                        </>
                      )}
                    </button>
                  )}

                  {(cta.intent === "pending" || cta.intent === "disabled") && (
                    <button
                      className="btn btn-gradient-slow"
                      style={{
                        ...styleBase,
                        opacity: 0.65,
                        cursor: "not-allowed",
                        filter: "grayscale(10%)",
                      }}
                      disabled
                    >
                      <Clock className="w-5 h-5" />
                      <span>{cta.label}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.article>
        );
      })}
    </div>
  );
}
