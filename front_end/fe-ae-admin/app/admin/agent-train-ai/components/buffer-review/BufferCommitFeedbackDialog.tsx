"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface BufferCommitFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const BufferCommitFeedbackDialog: React.FC<
  BufferCommitFeedbackDialogProps
> = ({
  open,
  onOpenChange,
  feedback,
  onFeedbackChange,
  onSubmit,
  isLoading = false,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Commit with feedback</DialogTitle>
          <DialogDescription>
            Provide context to store with this version candidate.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Textarea
            value={feedback}
            onChange={(e) => onFeedbackChange(e.target.value)}
            rows={6}
            placeholder="Describe quality, issues, or rollout guidance..."
          />
        </div>
        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!feedback.trim() || isLoading}
            className="inline-flex items-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Submitting..." : "Commit with feedback"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BufferCommitFeedbackDialog;
