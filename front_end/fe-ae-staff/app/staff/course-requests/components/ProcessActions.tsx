"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CourseRequestStatus } from "@/config/course-request-status";
import { useProcessCourseRequest } from "@/hooks/course-request/useProcessCourseRequest";
import { useState } from "react";

interface ProcessActionsProps {
  id: string;
  currentStatus: number;
  onProcessed?: () => void;
}

export default function ProcessActions({
  id,
  currentStatus,
  onProcessed,
}: ProcessActionsProps) {
  const { processCourseRequest, loading } = useProcessCourseRequest();
  const [open, setOpen] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");

  const openWith = (a: "approve" | "reject") => {
    setAction(a);
    setComment("");
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!action) return;
    const status =
      action === "approve"
        ? CourseRequestStatus.Approved
        : CourseRequestStatus.Rejected;

    const res = await processCourseRequest(id, {
      status,
      processingComments: comment,
    });

    if (res?.success) {
      setOpen(false);
      setAction(null);
      setComment("");
      onProcessed?.();
    }
  };

  if (currentStatus !== CourseRequestStatus.Pending) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Approve */}
      <Button
        variant="primary"
        className="px-5 btn btn-green-slow whitespace-nowrap rounded-xl"
        onClick={() => openWith("approve")}
        disabled={loading}
      >
        Approve
      </Button>

      {/* Reject — outline để không bị “ô trắng không chữ” */}
      <Button
        variant="outline"
        className="px-5 whitespace-nowrap shadow-lg rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border-slate-300"
        onClick={() => openWith("reject")}
        disabled={loading}
      >
        Reject
      </Button>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl sm:max-w-lg rounded-2xl p-6 border border-slate-200 shadow-lg">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-semibold">
              {action === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-slate-500 mb-3">
            {action === "approve"
              ? "Please provide an optional approval comment."
              : "Please provide a rejection reason (optional)."}
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
            <Button
              variant="outline"
              className="h-10 px-5 cursor-pointer rounded-xl"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>

            <Button
              variant={action === "reject" ? "danger" : "primary"}
              className="h-10 px-5 btn btn-green-slow rounded-xl"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading
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
