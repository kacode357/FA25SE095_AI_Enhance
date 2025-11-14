// app/lecturer/course/[id]/assignments/components/AssignmentActionsBar.tsx
"use client";

import { CalendarClock, ChevronDown, ChevronRight, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AssignmentStatus } from "@/types/assignments/assignment.response";

import ConfirmCloseAssignmentDialog from "./ConfirmCloseAssignmentDialog";
import ConfirmExtendDueDateDialog from "./ConfirmExtendDueDateDialog";

type Props = {
  assignmentId: string;
  status: AssignmentStatus;
  currentDue?: string | null; // ISO
  currentExtendedDue?: string | null; // ISO
  onExtend: (isoString: string) => Promise<void>;
  onClose: () => Promise<void>;
  /** If true, expand the internal actions panel by default */
  defaultOpen?: boolean;

  /** ✅ Thêm để khớp chỗ gọi */
  loadingExtend?: boolean; // external loading from hook
  loadingClose?: boolean;  // external loading from hook
};

export default function AssignmentActionsBar({
  assignmentId,
  status,
  currentDue,
  currentExtendedDue,
  onExtend,
  onClose,
  defaultOpen,
  loadingExtend = false,
  loadingClose = false,
}: Props) {
  // collapsed/expanded
  const [open, setOpen] = useState(!!defaultOpen);

  // datetime-local state
  const [extendedAt, setExtendedAt] = useState<string>(() => {
    const base = currentExtendedDue || currentDue || "";
    if (!base) return "";
    const d = new Date(base);
    const pad = (n: number) => String(n).padStart(2, "0");
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return `${local.getFullYear()}-${pad(local.getMonth() + 1)}-${pad(local.getDate())}T${pad(local.getHours())}:${pad(local.getMinutes())}`;
  });

  const [submitting, setSubmitting] = useState(false);

  const canClose = useMemo(() => status !== 1 /* Draft */, [status]);

  // ✅ gom trạng thái bận cho UI
  const isBusy = submitting || loadingExtend || loadingClose;

  // Dialog state
  const [openExtendDialog, setOpenExtendDialog] = useState(false);
  const [openCloseDialog, setOpenCloseDialog] = useState(false);

  // Confirm handlers invoked from dialogs
  const confirmExtend = async (iso: string) => {
    setSubmitting(true);
    try {
      await onExtend(iso);
      setOpenExtendDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmClose = async () => {
    if (!canClose) return;
    setSubmitting(true);
    try {
      await onClose();
      setOpenCloseDialog(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Collapsed summary header */}
      <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-1 py-2">
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <CalendarClock className="size-4 text-[#000D83]" />
          <span className="font-medium">Due date</span>
          {currentDue && (
            <span className="rounded-full border border-slate-300 bg-white px-2 py-0.5">
              Current: {new Date(currentDue).toLocaleString()}
            </span>
          )}
          {currentExtendedDue && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5">
              Extended: {new Date(currentExtendedDue).toLocaleString()}
            </span>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          className="text-[11px] h-8 px-0"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="flex items-center gap-1 text-[#000D83]">
            {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
            {open ? "Hide" : "Extend"}
          </span>
        </Button>
      </div>

      {/* Expanded controls */}
      {open && (
        <div className="rounded-md border border-slate-200 bg-white p-3">
          <div className="flex flex-col gap-3">
            <div className="md:col-span-2">
              <div className="text-sm text-slate-600 mb-1">New extended due</div>
              <Input
                type="datetime-local"
                value={extendedAt}
                onChange={(e) => setExtendedAt(e.target.value)}
                disabled={isBusy}
              />
              <div className="mt-1 mb-2 text-[11px] text-slate-500">
                Time is in your local timezone
              </div>
            </div>
            <div className="flex gap-2 md:justify-between">
              <Button
                className="btn text-sm btn-gradient-slow"
                onClick={() => extendedAt && setOpenExtendDialog(true)}
                disabled={isBusy || !extendedAt}
                aria-busy={isBusy}
              >
                {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Extend Due Date
              </Button>
              <Button
                className="text-red-400 text-sm"
                variant="destructive"
                onClick={() => canClose && setOpenCloseDialog(true)}
                disabled={isBusy || !canClose}
                title={canClose ? "" : "Cannot close Draft"}
                aria-busy={isBusy}
              >
                {isBusy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Close Assignment
              </Button>
            </div>
          </div>

          <Separator className="my-3" />
          <p className="text-xs text-slate-500">
            • You can extend due date for any non-Closed assignment. • Closing is disabled for Draft status.
          </p>
        </div>
      )}

      {/* Confirmation Dialogs */}
      <ConfirmExtendDueDateDialog
        open={openExtendDialog}
        onOpenChange={setOpenExtendDialog}
        currentDue={currentDue}
        currentExtendedDue={currentExtendedDue}
        newExtendedISO={extendedAt ? new Date(extendedAt).toISOString() : ""}
        submitting={isBusy}
        onConfirm={(iso) => confirmExtend(iso)}
      />
      <ConfirmCloseAssignmentDialog
        open={openCloseDialog}
        onOpenChange={setOpenCloseDialog}
        submitting={isBusy}
        info={{
          title: undefined,
          due: currentDue || null,
          extendedDue: currentExtendedDue || null,
          statusDisplay: undefined,
        }}
        onConfirm={confirmClose}
      />
    </div>
  );
}
