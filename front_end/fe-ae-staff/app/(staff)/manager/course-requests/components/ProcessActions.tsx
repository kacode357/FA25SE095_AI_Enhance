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
import { useProcessCourseRequest } from "@/hooks/course-request/useProcessCourseRequest";
import { CourseRequestStatus } from "@/config/course-request-status";

interface ProcessActionsProps {
  id: string;
  currentStatus: number;
  onProcessed?: () => void; // callback reload sau khi xử lý xong
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

  // ✅ Gửi request xử lý
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
      setComment("");
      setAction(null);
      onProcessed?.();
    }
  };

  // Nếu đã processed rồi thì ẩn nút
  if (currentStatus !== CourseRequestStatus.Pending) return null;

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
            disabled={loading}
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
            disabled={loading}
          >
            Reject
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {action === "approve" ? "Approve Request" : "Reject Request"}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2 space-y-2">
            <p className="text-sm text-slate-600">
              {action === "approve"
                ? "Please provide an optional approval comment."
                : "Please provide a rejection reason (optional)."}
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
            <Button onClick={handleSubmit} disabled={loading}>
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
