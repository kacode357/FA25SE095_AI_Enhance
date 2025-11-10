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
import { CalendarClock, TriangleAlert } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  currentDue?: string | null;
  currentExtendedDue?: string | null;
  newExtendedISO: string; // ISO string user picked
  submitting?: boolean;
  onConfirm: (iso: string) => Promise<void> | void;
};

export default function ConfirmExtendDueDateDialog({
  open,
  onOpenChange,
  currentDue,
  currentExtendedDue,
  newExtendedISO,
  submitting,
  onConfirm,
}: Props) {
  const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString() : "—");
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <CalendarClock className="size-5 text-violet-600" /> Confirm extend due date?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-xs flex gap-2 text-slate-600">
            <TriangleAlert className="size-4 text-amber-500" />Extending will update the deadline visible to students and affect overdue calculations.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="text-sm space-y-2 px-1">
          <div className="flex justify-between"><span className="text-slate-500">Current Due</span><span className="font-medium">{fmt(currentDue)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">Current Extended</span><span className="font-medium">{fmt(currentExtendedDue)}</span></div>
          <div className="flex justify-between"><span className="text-slate-500">New Extended</span><span className="font-semibold text-violet-700">{fmt(newExtendedISO)}</span></div>
        </div>
        <AlertDialogFooter className="mt-5">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="text-violet-800 hover:text-violet-500">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              className="btn btn-gradient-slow"
              disabled={submitting}
              onClick={async () => {
                await onConfirm(newExtendedISO);
              }}
            >
              Extend
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
