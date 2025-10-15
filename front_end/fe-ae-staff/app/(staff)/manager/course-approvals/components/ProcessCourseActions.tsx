// app/(staff)/manager/courses/components/ProcessCourseActions.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useApproveCourse } from "@/hooks/course/useApproveCourse";
import { useRejectCourse } from "@/hooks/course/useRejectCourse";
import { CourseStatus } from "@/config/course-status"; // ✅ dùng CourseStatus riêng

interface Props {
  id: string;
  currentStatus: number;
  onProcessed?: () => void;
}

export default function ProcessCourseActions({ id, currentStatus, onProcessed }: Props) {
  const { approveCourse, loading: approving } = useApproveCourse();
  const { rejectCourse, loading: rejecting } = useRejectCourse();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  // ❌ Ẩn nếu KHÔNG phải PendingApproval
  if (currentStatus !== CourseStatus.PendingApproval) return null;

  const handleSubmit = async () => {
    if (!action) return;
    if (action === "approve") {
      await approveCourse(id, { comments: comment });
    } else {
      await rejectCourse(id, { rejectionReason: comment });
    }
    setOpen(false);
    setComment("");
    setAction(null);
    onProcessed?.();
  };

  return (
    <div className="mt-4 flex items-center gap-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              setAction("approve");
              setOpen(true);
            }}
            disabled={approving || rejecting}
          >
            Approve
          </Button>
        </DialogTrigger>

        <DialogTrigger asChild>
          <Button
          
            onClick={() => {
              setAction("reject");
              setOpen(true);
            }}
            disabled={approving || rejecting}
          >
            Reject
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Course" : "Reject Course"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            <p className="text-sm text-slate-600">
              {action === "approve"
                ? "Optional approval comments:"
                : "Optional rejection reason:"}
            </p>
            <Textarea
              placeholder={
                action === "approve"
                  ? "Approval comments..."
                  : "Rejection reason..."
              }
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={approving || rejecting}>
              {approving || rejecting
                ? "Processing..."
                : action === "approve"
                ? "Confirm Approve"
                : "Confirm Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
