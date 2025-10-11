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
import { CourseItem } from "@/types/courses/course.response";
import {
  ClipboardCopy,
  Eye,
  EyeOff,
  Pencil,
  RefreshCw,
  Trash2,
  Users,
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

  const revealDisabled = !hasCodeFeature || !code;
  const copyDisabled = !hasCodeFeature || !code;


  // ===== Điều hướng khi click card =====
  const goDetail = () => router.push(`/manager/course/${course.id}`);
  const onKeyEnter = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goDetail();
    }
  };

  // ===== Helpers chặn bubble để không điều hướng khi bấm nút =====
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
    } catch {}
  };

  const openUpdateClick = (e: React.MouseEvent) => {
    stop(e);
    setOpenUpdate(true);
  };

  const onEditClick = (e: React.MouseEvent) => {
    stop(e);
    onEdit();
  };

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
        <CardTitle className="text-sm text-slate-800">
          <span className="font-semibold">{course.courseCode}</span>
          <span className="text-slate-500"> — {course.courseCodeTitle}</span>
        </CardTitle>

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
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-between gap-3">
            {course.description && (
              <p className="text-sm text-slate-600">{course.description}</p>
            )}

            {/* Access Code block — luôn render để đồng bộ chiều cao */}
            <div className="flex items-start justify-between gap-2 text-sm">
              <div className="text-slate-500">
                <div className="flex items-center gap-2">
                  <span>Code:</span>
                  <span className="font-semibold text-slate-700 select-all">
                    {hasCodeFeature
                      ? showCode
                        ? code || "—"
                        : masked
                      : "No access code"}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {hasCodeFeature ? (
                    <>
                      Issued: {fmtDate(course.accessCodeCreatedAt)}
                      {course.accessCodeExpiresAt && (
                        <> • Expires: {fmtDate(course.accessCodeExpiresAt)}</>
                      )}
                    </>
                  ) : (
                    <>—</>
                  )}
                </div>
              </div>

              {/* Controls (Reveal / Copy / Update) */}
              <div className="flex items-center gap-1 pt-1">
                <Button
                  variant="ghost"
                  className="h-8 px-2"
                  onClick={toggleReveal}
                  disabled={revealDisabled}
                  aria-label={showCode ? "Hide code" : "Show code"}
                  title={showCode ? "Hide code" : "Show code"}
                >
                  {showCode ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </Button>

                <TooltipProvider>
                  <Tooltip open={copied || undefined}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="h-8 px-2"
                        onClick={copy}
                        disabled={copyDisabled}
                        aria-label="Copy code"
                        title="Copy code"
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
                        className="h-8 px-2 text-slate-700 hover:bg-slate-50"
                        onClick={openUpdateClick}
                        aria-label="Update access code"
                        title="Update access code"
                      >
                        <RefreshCw className="size-4" />
                      </Button>
                    </DialogTrigger>

                    <AccessCodeDialog
                      courseId={course.id}
                      defaultType={undefined} // map accessCodeType từ BE nếu có
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

            {/* Meta + CRUD */}
            <div className="mt-auto flex items-end justify-between pt-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Users className="size-4" />
                <span>{course.enrollmentCount} enrollments</span>
              </div>
              <div className="text-xs text-slate-500">
                Created: {fmtDate(course.createdAt)}
              </div>
            </div>

            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                className="h-8 px-2 text-emerald-600 hover:bg-emerald-50"
                onClick={onEditClick}
                aria-label="Edit"
                title="Edit"
              >
                <Pencil className="size-4" />
              </Button>
              <Button
                variant="ghost"
                className="h-8 px-2 text-red-600 hover:bg-red-50"
                onClick={onDeleteClick}
                aria-label="Delete"
                title="Delete"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
      </CardContent>
    </Card>
  );
}
