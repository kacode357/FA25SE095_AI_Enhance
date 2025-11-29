"use client";

import { Button } from "@/components/ui/button";
import { useGradeReport } from "@/hooks/reports/useGradeReport";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
    reportId: string;
    detail: any;
    onSuccess: (patch: any) => void;
    onCancel: () => void;
};

export default function GradeForm({ reportId, detail, onSuccess, onCancel }: Props) {
    const [gradeValue, setGradeValue] = useState<number | string>("");
    const [feedbackValue, setFeedbackValue] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const { gradeReport, loading: grading } = useGradeReport();

    const handleSave = async () => {
        if (!reportId) return;
        if (gradeValue === "" || typeof gradeValue !== "number" || Number.isNaN(gradeValue)) {
            setError("Please enter a valid numeric grade.");
            return;
        }

        if (Number(gradeValue) < 0) {
            setError("Grade cannot be negative.");
            return;
        }

        const maxPoints = typeof detail?.assignmentMaxPoints === "number" ? detail.assignmentMaxPoints : (detail?.assignmentMaxPoints ? Number(detail.assignmentMaxPoints) : NaN);
        if (!Number.isNaN(maxPoints) && Number(gradeValue) > maxPoints) {
            setError(`Grade cannot exceed ${maxPoints}.`);
            return;
        }

        try {
            const payload = {
                reportId,
                grade: Number(gradeValue),
                feedback: feedbackValue || "",
            };

            const res = await gradeReport(payload as any);
            if (res) {
                onSuccess({
                    grade: payload.grade,
                    feedback: payload.feedback,
                    status: 6,
                    gradedAt: new Date().toISOString(),
                });
            }
        } catch (e: any) {
            setError(e?.message || "Failed to submit grade");
        }
    };

    return (
        <div className="p-4 mt-5 bg-white border border-slate-200 rounded">
            <div className="text-sm text-green-600 uppercase mb-5">Submit grade and feedback for this report.</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="max-w-40">
                    <label className="text-xs text-slate-800">Grade</label>
                    <input
                        type="number"
                        min={0}
                        step="0.1"
                        value={gradeValue as any}
                        onChange={(e) => setGradeValue(e.target.value === "" ? "" : Number(e.target.value))}
                        className="mt-1 border-green-500 w-full px-3 py-2 border rounded text-slate-800 focus:outline-none focus:ring-0 focus:border-green-600"
                        placeholder={detail.assignmentMaxPoints ? `0 - ${detail.assignmentMaxPoints}` : undefined}
                    />
                </div>

                <div className="sm:col-span-2">
                    <label className="text-xs text-slate-800">Feedback</label>
                    <textarea
                        value={feedbackValue}
                        onChange={(e) => setFeedbackValue(e.target.value)}
                        rows={3}
                        className="mt-1 text-sm border-slate-200 w-full px-3 py-2 border rounded text-slate-800 focus:outline-none focus:ring-0 focus:border-slate-300"
                        placeholder="Optional feedback for the student"
                    />
                </div>
            </div>

            {error && <div className="text-xs text-red-600 mt-2">* {error}</div>}

            <div className="mt-4 flex items-center justify-end gap-2">
                <Button size="sm" className="btn btn-gradient-slow" onClick={handleSave} disabled={grading}>
                    {grading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving
                        </>
                    ) : (
                        "Save Grade"
                    )}
                </Button>

                <Button size="sm" variant="ghost" className="text-violet-800 hover:text-violet-500" onClick={() => { setError(null); onCancel(); }}>Cancel</Button>
            </div>
        </div>
    );
}
