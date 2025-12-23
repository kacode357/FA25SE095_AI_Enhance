"use client";

import { Button } from "@/components/ui/button";
import { useGradeReport } from "@/hooks/reports/useGradeReport";
import { Info, Loader2 } from "lucide-react";
import { useState } from "react";

type Props = {
    reportId: string;
    detail: any;
    onSuccess: (patch: any) => void;
    onCancel: () => void;
};

export default function GradeForm({ reportId, detail, onSuccess, onCancel }: Props) {
    const [gradeValue, setGradeValue] = useState<string>("");
    const [feedbackValue, setFeedbackValue] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    const { gradeReport, loading: grading } = useGradeReport();

    const handleSave = async () => {
        if (!reportId) return;
        if (gradeValue === "" || Number.isNaN(Number(gradeValue))) {
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

    const maxPoints = typeof detail?.assignmentMaxPoints === 'number' ? detail.assignmentMaxPoints : (detail?.assignmentMaxPoints ? Number(detail.assignmentMaxPoints) : NaN);
    const numericGrade = gradeValue === '' ? NaN : Number(gradeValue);
    const isValidGrade = !Number.isNaN(numericGrade) && numericGrade >= 0 && (Number.isNaN(maxPoints) ? true : numericGrade <= maxPoints);

    // whether input currently exceeds configured max points
    const exceedsMax = !Number.isNaN(maxPoints) && typeof numericGrade === 'number' && !Number.isNaN(numericGrade) && numericGrade > maxPoints;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const allowed = ["Backspace", "Tab", "ArrowLeft", "ArrowRight", "Delete", "Home", "End"];
        if (allowed.includes(e.key)) return;
        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
            e.preventDefault();
            return;
        }
        if (e.key === '.') {
            // allow a single dot for decimals
            if ((e.currentTarget.value || '').includes('.')) e.preventDefault();
            return;
        }
        // only allow digits at this point
        if (!/^[0-9]$/.test(e.key)) {
            e.preventDefault();
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const text = e.clipboardData.getData('text');
        // allow numbers and at most one dot
        if (!/^[0-9]*\.?[0-9]*$/.test(text)) {
            e.preventDefault();
        }
    };

    return (
        <div className="p-4 mt-5 bg-white border border-slate-200 rounded">
            <div className="text-sm text-green-600 uppercase mb-5">Submit grade and feedback for this report.</div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div className="w-full mb-4">
                    <div className="flex flex-col">
                        <label className="text-xs text-slate-800">Grade</label>
                        <input
                            type="text"
                            inputMode="decimal"
                            min={0}
                            step="0.1"
                            value={gradeValue}
                            onChange={(e) => {
                                let raw = e.target.value || '';
                                // remove non-digit/non-dot characters
                                raw = raw.replace(/[^0-9.]/g, '');
                                // allow only one dot
                                const parts = raw.split('.');
                                if (parts.length > 2) {
                                    raw = parts.shift() + '.' + parts.join('');
                                }
                                setGradeValue(raw);
                                // clear previous error when user edits
                                if (error) setError(null);
                            }}
                            onKeyDown={handleKeyDown}
                            onPaste={handlePaste}
                            className={`mt-1 w-28 px-3 py-2 border rounded text-slate-800 focus:outline-none focus:ring-0 ${exceedsMax ? 'border-red-600 focus:border-red-600' : 'border-green-500 focus:border-green-600'}`}
                            placeholder={detail.assignmentMaxPoints ? `0 - ${detail.assignmentMaxPoints}` : undefined}
                        />

                    </div>
                    <div className={`mt-3 text-xs w-full flex items-center gap-1 ${exceedsMax ? 'text-red-600' : 'text-slate-500'}`}>
                        <Info className="w-4 h-4 mt-px" />
                        <div className="flex-1">The score is the maximum score specified for the assignment.</div>
                    </div>
                </div>
                <div className="sm:col-span-2">
                    <label className="text-xs text-slate-800">Feedback (Optional)</label>
                    <textarea
                        value={feedbackValue}
                        onChange={(e) => setFeedbackValue(e.target.value)}
                        rows={3}
                        className="mt-1 text-sm border-slate-200 w-full px-3 py-2 border rounded text-slate-800 focus:outline-none focus:ring-0 focus:border-slate-300"
                        placeholder="Some feedback for the student.."
                    />
                </div>
            </div>

            {error && <div className="text-xs text-red-600 mt-2">* {error}</div>}

            <div className="mt-4 flex items-center justify-end gap-2">
                <Button size="sm" className="btn btn-gradient-slow" onClick={handleSave} disabled={grading || !isValidGrade}>
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
