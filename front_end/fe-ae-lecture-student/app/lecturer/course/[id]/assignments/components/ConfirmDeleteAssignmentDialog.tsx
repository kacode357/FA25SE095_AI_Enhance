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
import { AssignmentItem } from "@/types/assignments/assignment.response";
import { TriangleAlert } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // list API returns a trimmed Assignment shape; accept partials so both full and list items work
  assignment: Partial<AssignmentItem> | null;
  loading?: boolean;
  onConfirm: () => Promise<void> | void;
};

export default function ConfirmDeleteAssignmentDialog({
  open,
  onOpenChange,
  assignment,
  loading = false,
  onConfirm,
}: Props) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="border-slate-200">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete assignment?</AlertDialogTitle>
          <AlertDialogDescription className="text-xs flex gap-2 text-yellow-600">
            <TriangleAlert className="size-4" />This will permanently delete the assignment and unassign any groups. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {assignment && (
          <div className="px-1 py-2 space-y-2 text-sm text-slate-700">
            <div className="font-medium text-sm text-slate-900 truncate">{assignment.title ?? "Untitled"}</div>
            <div className="text-sm text-slate-500 mt-1">Topic: {assignment.topicName ?? "-"}</div>
            <div className="text-sm text-slate-500">Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleString() : "-"}</div>
          </div>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" className="text-violet-800 hover:text-violet-500">Cancel</Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={async () => {
                await onConfirm();
              }}
              disabled={loading}
              className="btn btn-gradient-slow"
            >
              Delete
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
