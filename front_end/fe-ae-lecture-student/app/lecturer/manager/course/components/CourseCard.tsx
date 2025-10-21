"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CourseItem, CourseStatus } from "@/types/courses/course.response";
import {
  ClipboardCopy,
  Eye,
  EyeOff,
  RefreshCw,
  Users
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import AccessCodeDialog from "./AccessCodeDialog";

const fmtDate = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("en-GB") : "-";

type Props = {
  course: CourseItem;
  onEdit: () => void;
  onDelete: () => void;
  onUpdated: () => void;
};

export default function CourseCard({
  course,
  onEdit,
  onDelete,
  onUpdated,
}: Props) {
  const router = useRouter();

  const [showCode, setShowCode] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [copied, setCopied] = useState(false);

  const hasCodeFeature = !!course.requiresAccessCode;
  const accessActive = hasCodeFeature && !course.isAccessCodeExpired;
  const code = course.accessCode ?? "";
  const masked = useMemo(() => (code ? "•".repeat(code.length) : "—"), [code]);

  const statusInfo = useMemo(() => {
    const s = course.status;
    if (s === undefined || s === null) return { label: undefined, className: "" };
    switch (s) {
      case CourseStatus.PendingApproval:
        return { label: "Pending Approval", className: "bg-amber-50 text-amber-700 border-amber-200" };
      case CourseStatus.Active:
        return { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      case CourseStatus.Inactive:
        return { label: "Inactive", className: "bg-slate-100 text-slate-600 border-slate-200" };
      case CourseStatus.Rejected:
        return { label: "Rejected", className: "bg-rose-50 text-rose-700 border-rose-200" };
      default:
        return { label: String(s), className: "bg-slate-50 text-slate-600 border-slate-200" };
    }
  }, [course.status]);

  const revealDisabled = !hasCodeFeature || !code;
  const copyDisabled = !hasCodeFeature || !code;

  const goDetail = () => router.push(`/lecturer/manager/course/${course.id}`);
  const onKeyEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goDetail();
    }
  };

  const stop = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const toggleReveal = (e: React.MouseEvent) => {
    stop(e);
    setShowCode((v) => !v);
  };

  const copy = async (e: React.MouseEvent) => {
    stop(e);
    if (copyDisabled) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch { }
  };

  const openUpdateClick = (e: React.MouseEvent) => {
    stop(e);
    setOpenUpdate(true);
  };

  const onEditClick = (e: React.MouseEvent) => {
    stop(e);
    router.push(`/lecturer/manager/course/${course.id}/course`); // Chuyển hướng đến trang EditCourse
  }

  const onDeleteClick = (e: React.MouseEvent) => {
    stop(e);
    onDelete();
  };

  return (
    <Card
      className="h-full flex flex-col border-slate-200 hover:shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500"
      onClick={goDetail}
      tabIndex={0}
      role="button"
      onKeyDown={onKeyEnter}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-sm text-slate-800">
            <span className="font-semibold">{course.courseCode}</span>
            <span className="text-slate-500"> — {course.courseCodeTitle}</span>
          </CardTitle>
          {statusInfo.label && (
            <Badge variant="outline" className={`text-[11px] ${statusInfo.className}`}>
              {statusInfo.label}
            </Badge>
          )}
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2">
          {(course.term || course.year) && (
            <Badge className="text-xs">
              {course.term || ""}
              {course.term && course.year ? " • " : ""}
              {course.year ?? ""}
            </Badge>
          )}
          {course.department && (
            <Badge variant="outline" className="text-xs">
              {course.department}
            </Badge>
          )}
          {hasCodeFeature && (
            <Badge
              className={
                accessActive ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""
              }
            >
              {accessActive ? "Access Code Active" : "Access Code Expired"}
            </Badge>
          )}
        </div>
        {/* Description */}
        <div className="flex-1 mt-3 text-sm text-slate-600">{course.description || "-"}</div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between gap-3">
        <div className="flex items-center gap-4">


          {/* Enrollments */}
          <div className="flex-1 text-xs text-slate-500 flex items-center gap-1">
            <Users className="size-4" />
            <span>{course.enrollmentCount} enrollments</span>
          </div>

          {/* Access Code + Controls */}
          <div className="flex items-center gap-1 text-xs text-black">
            <span
              className={`select-all ${!code ? "text-slate-400 italic" : ""
                }`}
            >
              {showCode
                ? code || "No Access Code"
                : code
                  ? masked
                  : "No Access Code"}
            </span>

            <Button
              variant="ghost"
              className="h-7 px-2 cursor-pointer"
              onClick={toggleReveal}
              disabled={revealDisabled}
              aria-label={showCode ? "Hide code" : "Show code"}
            >
              {showCode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>

            <TooltipProvider>
              <Tooltip open={copied || undefined}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-7 px-2 cursor-pointer"
                    onClick={copy}
                    disabled={copyDisabled}
                    aria-label="Copy code"
                  >
                    <ClipboardCopy className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="py-1 px-2 text-xs">Copied!</TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {hasCodeFeature && (
              <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-7 px-2 cursor-pointer text-slate-700 hover:bg-slate-50"
                    onClick={openUpdateClick}
                    aria-label="Update access code"
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                </DialogTrigger>

                <AccessCodeDialog
                  courseId={course.id}
                  defaultType={undefined}
                  defaultCustom={course.accessCode ?? undefined}
                  defaultExpiresAt={course.accessCodeExpiresAt}
                  open={openUpdate}
                  onOpenChange={setOpenUpdate}
                  onUpdated={onUpdated}
                />
              </Dialog>
            )}
          </div>

        </div>

        {/* Actions row */}
        <div className="flex items-center justify-between gap-1 mt-2">
          {/* Created */}
          <div className="flex-1 text-xs text-slate-500">Created: {fmtDate(course.createdAt)}</div>

          <div
            className="border border-emerald-500 rounded-md text-white px-3 py-1 bg-emerald-500 
              shadow-2xl text-sm cursor-pointer 
              hover:bg-emerald-600 hover:shadow-lg transition-all duration-200"
            onClick={onEditClick}
            aria-label="Edit"
          >
            Details
          </div>
        </div>
      </CardContent>
    </Card>
  );
}