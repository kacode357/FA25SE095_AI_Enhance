"use client";

import { Button } from "@/components/ui/button";
import { useRejectReport } from "@/hooks/reports/useRejectReport";
import { Loader2, OctagonAlert } from "lucide-react";
import { useState } from "react";

type Props = {
    reportId: string;
    onSuccess: (patch: any) => void;
    onCancel: () => void;
};

export default function RejectForm({ reportId, onSuccess, onCancel }: Props) {
    const [rejectFeedback, setRejectFeedback] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const { rejectReport, loading: rejecting } = useRejectReport();

    const handleReject = async () => {
        if (!reportId) return;
        if (!rejectFeedback || rejectFeedback.trim() === "") {
            setError("Please enter a reason for rejection.");
            return;
        }

        try {
            const payload = {
                reportId,
                feedback: rejectFeedback || "",
            };

            const res = await rejectReport(payload as any);
            if (res && res.success) {
                onSuccess({ status: 8, feedback: payload.feedback });
            } else {
                setError(res?.message || "Failed to reject report");
            }
        } catch (e: any) {
            setError(e?.message || "Failed to reject report");
        }
    };

    return (
        <div className="p-4 mt-5 bg-white border border-slate-200 rounded">
            <div className="text-sm flex gap-2 text-red-600 uppercase mb-3"><OctagonAlert className="size-4" />Reject this report.</div>

            <div>
                <label className="text-xs text-slate-800">Reason for rejection</label>
                <textarea
                    value={rejectFeedback}
                    onChange={(e) => setRejectFeedback(e.target.value)}
                    rows={3}
                    className="mt-1 text-sm border-slate-200 w-full px-3 py-2 border rounded text-slate-800 focus:outline-none focus:ring-0 focus:border-slate-300"
                    placeholder="Explain why this report is rejected"
                />
            </div>

            {error && <div className="text-xs text-red-600 mt-2">* {error}</div>}

            <div className="mt-4 flex items-center justify-end gap-2">
                <Button size="sm" className="text-red-500 shadow-lg" onClick={handleReject} disabled={rejecting}>
                    {rejecting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rejecting
                        </>
                    ) : (
                        "Send Reject Report"
                    )}
                </Button>

                <Button size="sm" variant="ghost" className="text-violet-800 hover:text-violet-500" onClick={() => { setError(null); onCancel(); }}>Cancel</Button>
            </div>
        </div>
    );
}
