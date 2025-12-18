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

interface BufferConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "commit" | "discard";
  onConfirm: () => void;
  isLoading?: boolean;
}

export const BufferConfirmationDialog: React.FC<
  BufferConfirmationDialogProps
> = ({ open, onOpenChange, type, onConfirm, isLoading = false }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "discard"
              ? "Discard training buffer"
              : "Commit training buffer"}
          </DialogTitle>
          <DialogDescription>
            {type === "discard"
              ? "Discarding removes this buffer from the review queue and cannot be undone."
              : "Committing promotes this buffer toward version creation. Continue?"}
          </DialogDescription>
        </DialogHeader>
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
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center rounded-xl px-4 py-2 text-sm font-medium text-white ${
              type === "discard"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-indigo-500 hover:bg-indigo-600"
            } disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {isLoading ? "Processing..." : "Continue"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BufferConfirmationDialog;
