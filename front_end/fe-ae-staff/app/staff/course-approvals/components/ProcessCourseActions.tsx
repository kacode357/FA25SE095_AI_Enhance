"use client";

import Button from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CourseStatus } from "@/config/course-status";
import { useApproveCourse } from "@/hooks/course/useApproveCourse";
import { useRejectCourse } from "@/hooks/course/useRejectCourse";
import { useState } from "react";

interface Props {
  id: string;
  currentStatus: number;
  onProcessed?: () => void;
}

export default function ProcessCourseActions({
  id,
  currentStatus,
  onProcessed,
}: Props) {
  const { approveCourse, loading: approving } = useApproveCourse();
  const { rejectCourse, loading: rejecting } = useRejectCourse();

  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  // Chỉ hiển thị khi PendingApproval
  if (currentStatus !== CourseStatus.PendingApproval) return null;

  const openWith = (a: "approve" | "reject") => {
    setAction(a);
    setComment("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!action) return;

    if (action === "approve") {
      await approveCourse(id, { comments: comment });
    } else {
      await rejectCourse(id, { rejectionReason: comment });
    }

    setOpen(false);
    setAction(null);
    setComment("");
    onProcessed?.();
  };

  const busy = approving || rejecting;

  return (
    <div className="flex items-center gap-5">
      {/* Approve */}
      <Button
        variant="primary"
        className="px-5 btn btn-green-slow whitespace-nowrap rounded-xl"
        onClick={() => openWith("approve")}
        disabled={busy}
      >
        Approve
      </Button>

      {/* Reject */}
      <Button
        variant="outline"
        className="px-5 whitespace-nowrap shadow-lg rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-none"
        onClick={() => openWith("reject")}
        disabled={busy}
      >
        Reject
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl sm:max-w-lg rounded-2xl p-6 border border-slate-200 shadow-lg">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-semibold">
              {action === "approve" ? "Approve Course" : "Reject Course"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-500 mb-3">
            {action === "approve"
              ? "Optional approval comments:"
              : "Optional rejection reason:"}
          </p>

          <Textarea
            placeholder={
              action === "approve" ? "Approval comments..." : "Rejection reason..."
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[120px] rounded-xl border border-slate-300 bg-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 shadow-sm"
          />

          <DialogFooter className="mt-5 flex gap-2 sm:justify-end">
            {/* <Button
              variant="outline"
              className="h-10 px-5 rounded-xl"
              onClick={() => setOpen(false)}
              disabled={busy}
            >
              Cancel
            </Button> */}
            <Button
              variant={action === "reject" ? "danger" : "primary"}
              className="h-10 px-5 btn btn-green-slow rounded-xl"
              onClick={handleSubmit}
              disabled={busy}
            >
              {busy
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
