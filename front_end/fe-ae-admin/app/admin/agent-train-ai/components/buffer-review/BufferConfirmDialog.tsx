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

interface BufferNegativeExampleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: string;
  onFeedbackChange: (feedback: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export const BufferNegativeExampleDialog: React.FC<
  BufferNegativeExampleDialogProps
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
          <DialogTitle>Mark as negative example</DialogTitle>
          <DialogDescription>
            Explain why this buffer should be treated as a negative signal.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          rows={5}
          placeholder="Describe issues or gaps observed in this buffer..."
        />
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
            className="inline-flex items-center rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Submitting..." : "Submit negative feedback"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BufferNegativeExampleDialog;
