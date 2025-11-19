"use client";

import { Button } from "@/components/ui/button";
import { DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect } from "react";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    subject?: string | null;
    loading?: boolean;
    onConfirm: () => Promise<void> | void;
    courseName?: string | null;
    requesterName?: string | null;
    requestedAt?: string | null;
    description?: string | null;
};

export default function CancelSupportRequestDialog({ open, onOpenChange, subject, loading, onConfirm, courseName, requesterName, requestedAt, description }: Props) {
    // close when not open - no-op here but keeps API consistent
    useEffect(() => {
        if (!open) return;
    }, [open]);

    return (
        <div className=" -mb-6">
            {/* Dialog wrapper is provided by parent; this component only renders content parts */}
            <DialogHeader className="border-slate-200 mb-2">
                <DialogTitle>Cancel Support Request</DialogTitle>
            </DialogHeader>

            <div className="">
                <DialogDescription>
                    Are you sure you want to cancel this support request{subject ? <span className="font-bold">:  "${subject}"</span> : ""} ?
                </DialogDescription>

                {/* Additional info */}
                <div className="mt-7 text-sm text-slate-700 space-y-4">
                    {courseName && (
                        <div>
                            <span className="font-medium">Course:</span> {courseName}
                        </div>
                    )}
                    {requesterName && (
                        <div>
                            <span className="font-medium">Requester:</span> {requesterName}
                        </div>
                    )}
                    {requestedAt && (
                        <div>
                            <span className="font-medium">Requested:</span> {requestedAt}
                        </div>
                    )}

                    {description && (
                        <div>
                            <div className="mb-2">
                                <span className="font-medium text-sm uppercase text-slate-500">Description</span>
                            </div>

                            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 whitespace-pre-line">
                                {description}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <DialogFooter>
                <div className="">
                    {/* <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
            Close
          </Button> */}

                    <Button variant="destructive" className="text-red-600 shadow-lg mt-3" onClick={onConfirm} disabled={loading}>
                        {loading ? "Cancelling..." : "Cancel"}
                    </Button>
                </div>
            </DialogFooter>
        </div>
    );
}
