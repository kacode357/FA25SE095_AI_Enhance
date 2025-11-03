// app/lecture/manager/course/[id]/assignments/components/AssignmentActionsBar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AssignmentStatus } from "@/types/assignments/assignment.response";
import { useMemo, useState } from "react";

type Props = {
  assignmentId: string;
  status: AssignmentStatus;
  currentDue?: string | null; // ISO
  currentExtendedDue?: string | null; // ISO
  onExtend: (isoString: string) => Promise<void>;
  onClose: () => Promise<void>;
};

export default function AssignmentActionsBar({
  assignmentId,
  status,
  currentDue,
  currentExtendedDue,
  onExtend,
  onClose,
}: Props) {
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

  const handleExtend = async () => {
    if (!extendedAt) return;
    const iso = new Date(extendedAt).toISOString();
    setSubmitting(true);
    try {
      await onExtend(iso);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (!canClose) return;
    setSubmitting(true);
    try {
      await onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Header / context */}
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="font-medium">Extend due date</span>
        {currentDue && (
          <span className="rounded-full border border-slate-300 bg-white px-2 py-1">
            Current: {new Date(currentDue).toLocaleString()}
          </span>
        )}
        {currentExtendedDue && (
          <span className="rounded-full border border-slate-300 bg-white px-2 py-1">
            Extended: {new Date(currentExtendedDue).toLocaleString()}
          </span>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-3">
        <div className="md:col-span-2">
          <div className="text-sm text-slate-600 mb-1 mt-3">New extended due</div>
          <Input
            type="datetime-local"
            value={extendedAt}
            onChange={(e) => setExtendedAt(e.target.value)}
          />
          <div className="mt-1 mb-3 text-[11px] text-slate-500">Time is in your local timezone</div>
        </div>
        <div className="flex gap-2 md:justify-center">
          <Button className="btn btn-gradient-slow" onClick={handleExtend} disabled={submitting || !extendedAt}>
            Extend Due Date
          </Button>
          <Button
          className="text-red-400"
            variant="destructive"
            onClick={handleClose}
            disabled={submitting || !canClose}
            title={canClose ? "" : "Cannot close Draft"}
          >
            Close Assignment
          </Button>
        </div>
      </div>

      <Separator />
      <p className="text-xs text-slate-500">
        • You can extend due date for any non-Closed assignment. • Closing is disabled for Draft status.
      </p>
    </div>
  );
}
