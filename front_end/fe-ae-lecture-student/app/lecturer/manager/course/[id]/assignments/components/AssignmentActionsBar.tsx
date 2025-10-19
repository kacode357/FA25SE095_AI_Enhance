// app/lecture/manager/course/[id]/assignments/components/AssignmentActionsBar.tsx
"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AssignmentStatus } from "@/types/assignments/assignment.response";

type Props = {
  assignmentId: string;
  status: AssignmentStatus;
  currentDue?: string | null;          // ISO
  currentExtendedDue?: string | null;  // ISO
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

  const canClose = useMemo(() => status !== 0 /* Draft */, [status]);

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
    <div className="rounded-xl border p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-medium">Actions</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
        <div className="md:col-span-2">
          <div className="text-xs text-slate-600 mb-1">Extended due date</div>
          <Input
            type="datetime-local"
            value={extendedAt}
            onChange={(e) => setExtendedAt(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExtend} disabled={submitting || !extendedAt}>
            Extend Due Date
          </Button>
          <Button
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
        • You can extend due date for any non-Closed assignment.{" "}
        • Closing is disabled for Draft status.
      </p>
    </div>
  );
}
