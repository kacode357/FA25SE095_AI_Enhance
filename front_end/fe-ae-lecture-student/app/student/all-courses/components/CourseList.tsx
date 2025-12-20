"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Clock,
  KeyRound,
  PlayCircle,
  PlusCircle,
  Users,
} from "lucide-react";
import { formatDateOnlyVN } from "@/utils/datetime/format-datetime";

import type { AvailableCourseItem } from "@/types/courses/course.response";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const DEFAULT_IMAGE_URL =
  "https://i.postimg.cc/VL3PwwpK/Gemini-Generated-Image-pu4lm6pu4lm6pu4l.png";


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
  const canJoin = course.canJoin ?? true;

  if (isEnrolled)
    return { label: "Go to Course", intent: "go" as const, disabled: false };
  if (status === "pending" || status === "pendingapproval")
    return {
      label: "Pending Approval",
      intent: "pending" as const,
      disabled: true,
    };

  if (course.requiresAccessCode)
    return {
      label: "Join with Code",
      intent: "join-code" as const,
      disabled: !!course.isAccessCodeExpired || !canJoin,
    };
  if (!canJoin) return { label: "Join", intent: "join" as const, disabled: true };

  return { label: "Join", intent: "join" as const, disabled: false };
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

type CourseCardProps = {
  course: AvailableCourseItem;
  index: number;
  loadingCourseId: string | null;
  onGoToCourse: (id: string) => void;
  onJoinClick: (course: AvailableCourseItem) => void;
};

function CourseCard({
  course,
  index,
  loadingCourseId,
  onGoToCourse,
  onJoinClick,
}: CourseCardProps) {
  const imgUrl =
    course.img && typeof course.img === "string" ? course.img : DEFAULT_IMAGE_URL;

  const [bgUrl, setBgUrl] = useState<string>(imgUrl);
  const bgRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    const loader = new Image();
    loader.src = imgUrl;
    loader.onload = () => {
      if (mounted) setBgUrl(imgUrl);
    };
    loader.onerror = () => {
      if (mounted) setBgUrl(DEFAULT_IMAGE_URL);
    };
    return () => {
      mounted = false;
    };
  }, [imgUrl]);

  useEffect(() => {
    if (bgRef.current) {
      bgRef.current.style.backgroundImage = `url(${bgUrl})`;
    }
  }, [bgUrl]);

  const createdAt = formatDateOnlyVN(course.createdAt);
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

  const desc = course.description || "";
  const needsTooltip = desc.length > 0;

  const ariaLabel =
    course.uniqueCode && course.uniqueCode.length > 0
      ? `${course.courseCode} (Unique code: ${course.uniqueCode})`
      : course.courseCode;

  return (
    <motion.div
      key={course.id}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
    >
      <Card className="overflow-hidden py-0 rounded-lg border-[var(--border)] bg-[var(--card)] shadow-md md:h-[220px]">
        <CardContent className="h-full p-0 flex flex-col md:flex-row md:items-stretch">
          {/* LEFT IMAGE */}
          <div className="relative w-full md:w-[45%] lg:w-[38%] h-[180px] md:h-[220px] overflow-hidden rounded-l-lg">
            <div
              ref={bgRef}
              role="img"
              aria-label={ariaLabel}
              className="absolute inset-0 bg-cover bg-center bg-no-repeat rounded-l-lg"
            />

            <div className="absolute left-3 bottom-3 z-[1]">
              <StatusChip status={course.enrollmentStatus?.status} />
            </div>
          </div>

          {/* RIGHT CONTENT */}
          <div className="flex-1 h-full px-6 py-4 flex flex-col justify-between gap-1">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3
                    className="text-base font-bold"
                    style={{ color: "var(--foreground)" }}
                  >
                    {course.courseCode}

                    {course.uniqueCode && (
                      <span className="ml-1 align-middle text-[11px] text-[var(--text-muted)]">
                        (
                        <span className="mr-1">Unique code:</span>
                        <span className="font-semibold">
                          {course.uniqueCode}
                        </span>
                        )
                      </span>
                    )}
                  </h3>

                  {desc && (
                    <>
                      {needsTooltip ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="mt-1 text-sm text-[var(--text-muted)] line-clamp-2 cursor-help">
                              {desc}
                            </p>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            {desc}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <p className="mt-1 text-sm text-[var(--text-muted)]">
                          {desc}
                        </p>
                      )}
                    </>
                  )}
                </div>

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
            </div>

            <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-2">
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

                {/* Avatar shadcn */}
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 border border-[var(--border)] shadow-sm">
                    {lecturerAvatarUrl && (
                      <AvatarImage src={lecturerAvatarUrl} alt={lecturerName} />
                    )}
                    <AvatarFallback className="bg-[var(--brand)] text-white text-xs font-semibold">
                      {lecturerInitials}
                    </AvatarFallback>
                  </Avatar>

                  <span
                    className="text-sm font-medium"
                    style={{ color: "var(--brand)" }}
                  >
                    {lecturerName}
                  </span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex justify-end md:justify-start">
                {cta.intent === "go" && (
                  <button
                    className="btn btn-gradient-slow"
                    style={styleBase}
                    onClick={() => onGoToCourse(course.id)}
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>{cta.label}</span>
                  </button>
                )}

                {cta.intent === "join" && (
                  <button
                    className="btn btn-gradient-slow"
                    style={styleBase}
                    disabled={isBusy || cta.disabled}
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
                        <span>{cta.label}</span>
                      </>
                    )}
                  </button>
                )}

                {cta.intent === "join-code" && (
                  <button
                    className="btn btn-gradient-slow"
                    style={styleBase}
                    disabled={isBusy || cta.disabled}
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
                        <span>{cta.label}</span>
                      </>
                    )}
                  </button>
                )}

                {cta.intent === "pending" && (
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
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function CourseList({
  courses,
  loadingCourseId,
  onGoToCourse,
  onJoinClick,
}: Props) {
  if (courses.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-4">
        {courses.map((course, index) => (
          <CourseCard
            key={course.id}
            course={course}
            index={index}
            loadingCourseId={loadingCourseId}
            onGoToCourse={onGoToCourse}
            onJoinClick={onJoinClick}
          />
        ))}
      </div>
    </TooltipProvider>
  );
}
