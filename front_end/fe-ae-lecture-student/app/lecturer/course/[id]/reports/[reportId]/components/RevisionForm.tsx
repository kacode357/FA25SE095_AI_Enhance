"use client";

import { Button } from "@/components/ui/button";
import { useRequestReportRevision } from "@/hooks/reports/useRequestReportRevision";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
    reportId: string;
    onSuccess: (patch: any) => void;
    onCancel: () => void;
};

export default function RevisionForm({ reportId, onSuccess, onCancel }: Props) {
    const [revisionFeedback, setRevisionFeedback] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const { requestReportRevision, loading: requestingRevision } = useRequestReportRevision();

    const handleSend = async () => {
        if (!reportId) return;
        if (!revisionFeedback || revisionFeedback.trim() === "") {
            setError("Please enter feedback for the revision request.");
            return;
        }

        try {
            const payload = {
                reportId,
                feedback: revisionFeedback || "",
            };

            const res = await requestReportRevision(payload as any);
            if (res && res.success) {
                onSuccess({ status: 4, feedback: payload.feedback });
            } else {
                setError(res?.message || "Failed to request revision");
            }
        } catch (e: any) {
            setError(e?.message || "Failed to request revision");
        }
    };

    return (
        <div className="p-4 mt-5 bg-white border border-slate-200 rounded">
            <div className="text-sm text-yellow-600 uppercase mb-3">Request revision for this report.</div>

            <div>
                <label className="text-xs cursor-text text-slate-800">Feedback (instructions for revision)</label>
                <textarea
                    value={revisionFeedback}
                    onChange={(e) => setRevisionFeedback(e.target.value)}
                    rows={4}
                    className="mt-1 border-slate-200 w-full px-3 py-2 text-sm border rounded text-slate-800 focus:outline-none focus:ring-0 focus:border-slate-300"
                    placeholder="Tell the student what to fix or improve"
                />
            </div>

            {error && <div className="text-xs text-red-600 mt-2">* {error}</div>}

            <div className="mt-4 flex items-center justify-end gap-2">
                <Button size="sm" className="text-blue-500 shadow-lg" onClick={handleSend} disabled={requestingRevision}>
                    {requestingRevision ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Sending
                        </>
                    ) : (
                        "Send Revision Request"
                    )}
                </Button>

                <Button size="sm" variant="ghost" className="text-violet-800 hover:text-violet-500" onClick={() => { setError(null); onCancel(); }}>Cancel</Button>
            </div>
        </div>
    );
}
