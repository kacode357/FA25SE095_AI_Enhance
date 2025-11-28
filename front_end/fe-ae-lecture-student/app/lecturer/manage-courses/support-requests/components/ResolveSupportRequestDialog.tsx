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

export default function ResolveSupportRequestDialog({ open, onOpenChange, subject, loading, onConfirm, courseName, requesterName, requestedAt, description }: Props) {
    // close when not open - keeps API consistent
    useEffect(() => {
        if (!open) return;
    }, [open]);

    return (
        <div className=" -mb-6">
            <DialogHeader className="border-slate-200 mb-2">
                <DialogTitle>Resolve Support Request</DialogTitle>
            </DialogHeader>

            <div className="">
                <DialogDescription>
                    Mark this support request{subject ? <span className="font-bold">: "{subject}"</span> : ""} as resolved?
                </DialogDescription>

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
                    <Button variant="destructive" className="text-green-700 shadow-lg mt-3" onClick={onConfirm} disabled={loading}>
                        {loading ? "Resolving..." : "Resolve"}
                    </Button>
                </div>
            </DialogFooter>
        </div>
    );
}
