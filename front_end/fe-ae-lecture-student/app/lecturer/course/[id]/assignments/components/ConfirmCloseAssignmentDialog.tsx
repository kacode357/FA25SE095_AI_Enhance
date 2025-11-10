"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Lock, TriangleAlert } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  submitting?: boolean;
  info?: {
    title?: string;
    due?: string | null;
    extendedDue?: string | null;
    statusDisplay?: string;
  } | null;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmCloseAssignmentDialog({
  open,
  onOpenChange,
  submitting,
  info,
  onConfirm,
}: Props) {
  const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString() : "—");
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Lock className="size-5 text-red-500" /> Close this assignment?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs flex gap-2 text-slate-600">
            <TriangleAlert className="size-4 text-amber-500" />Closing will stop further submissions and mark the assignment as Closed. You can not revert this action.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {info && (
          <div className="text-sm space-y-2 px-1">
            <div className="truncate font-medium text-slate-900">{info.title ?? "Untitled"}</div>
            <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-medium">{info.statusDisplay ?? "-"}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Due</span><span className="font-medium">{fmt(info.due)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Extended Due</span><span className="font-medium">{fmt(info.extendedDue)}</span></div>
          </div>
        )}
        <AlertDialogFooter className="mt-5">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="text-violet-800 hover:text-violet-500">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              className="btn btn-gradient-slow"
              disabled={submitting}
              onClick={async () => {
                await onConfirm();
              }}
            >
              Close
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
