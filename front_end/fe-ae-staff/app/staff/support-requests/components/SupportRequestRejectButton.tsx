// app/staff/support-requests/components/SupportRequestRejectButton.tsx
"use client";

import { useState } from "react";
import { Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { useRejectSupportRequest } from "@/hooks/support-requests/useRejectSupportRequest";
import { SupportRequestRejectionReason } from "@/config/classroom-service/support-request-rejection-reason.enum";

type Props = {
  requestId: string;
  disabled?: boolean;
  /** Callback sau khi reject thành công (dùng để reload list) */
  onRejected?: () => Promise<void> | void;
};

const REASON_LABEL: Record<SupportRequestRejectionReason, string> = {
  [SupportRequestRejectionReason.InsufficientPermissions]:
    "Insufficient permissions",
  [SupportRequestRejectionReason.RequireHigherAuth]:
    "Requires higher authorization",
  [SupportRequestRejectionReason.OutOfScope]: "Out of scope",
  [SupportRequestRejectionReason.DuplicateRequest]: "Duplicate request",
  [SupportRequestRejectionReason.Other]: "Other",
};

export default function SupportRequestRejectButton({
  requestId,
  disabled,
  onRejected,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] =
    useState<SupportRequestRejectionReason>(
      SupportRequestRejectionReason.OutOfScope
    );
  const [comments, setComments] = useState("");

  const { rejectSupportRequest, loading } = useRejectSupportRequest();

  const handleConfirm = async () => {
    if (!requestId) return;

    await rejectSupportRequest(requestId, {
      rejectionReason: reason,
      rejectionComments: comments.trim() || undefined,
    });

    toast.success("Support request rejected.");

    setOpen(false);
    setComments("");

    if (onRejected) {
      await onRejected();
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="px-3 py-1 text-xs border-red-200 text-red-700 hover:bg-red-50"
        disabled={disabled || loading}
        type="button"
        onClick={() => setOpen(true)}
      >
        {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
        <XCircle className="w-3 h-3 mr-1" />
        Reject
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject support request</DialogTitle>
            <DialogDescription>
              Choose a rejection reason and optionally leave a note for the
              requester.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Rejection reason
              </label>
              <Select
                value={String(reason)}
                onValueChange={(v) =>
                  setReason(Number(v) as SupportRequestRejectionReason)
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    value={String(
                      SupportRequestRejectionReason.InsufficientPermissions
                    )}
                  >
                    {REASON_LABEL[SupportRequestRejectionReason.InsufficientPermissions]}
                  </SelectItem>
                  <SelectItem
                    value={String(
                      SupportRequestRejectionReason.RequireHigherAuth
                    )}
                  >
                    {REASON_LABEL[SupportRequestRejectionReason.RequireHigherAuth]}
                  </SelectItem>
                  <SelectItem
                    value={String(SupportRequestRejectionReason.OutOfScope)}
                  >
                    {REASON_LABEL[SupportRequestRejectionReason.OutOfScope]}
                  </SelectItem>
                  <SelectItem
                    value={String(
                      SupportRequestRejectionReason.DuplicateRequest
                    )}
                  >
                    {REASON_LABEL[SupportRequestRejectionReason.DuplicateRequest]}
                  </SelectItem>
                  <SelectItem value={String(SupportRequestRejectionReason.Other)}>
                    {REASON_LABEL[SupportRequestRejectionReason.Other]}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Note to requester (optional)
              </label>
              <Textarea
                className="min-h-[100px] text-sm"
                placeholder="Explain briefly why this request is rejected..."
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-8 px-3 text-xs"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="h-8 px-3 text-xs bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
              Confirm reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
