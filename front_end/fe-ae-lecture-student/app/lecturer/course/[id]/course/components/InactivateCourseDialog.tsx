"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useInactivateCourse } from "@/hooks/course/useInactiveCourse";
import { useEffect, useState } from "react";

export default function InactivateCourseDialog({
    open,
    onOpenChange,
    courseId,
    courseName,
    lecturerId,
    onConfirmed,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    courseId: string;
    courseName?: string | null;
    lecturerId?: string | null;
    onConfirmed?: () => void;
}) {
    const [reason, setReason] = useState("");
    const { inactivateCourse, loading } = useInactivateCourse();

    useEffect(() => {
        if (!open) setReason("");
    }, [open]);

    const handleConfirm = async () => {
        if (!courseId) return;
        if (!reason.trim()) return; // required

            const res = await inactivateCourse(courseId, {
                courseId,
                lecturerId: lecturerId || "",
                reason: reason.trim(),
            });

        if (res?.success) {
            onOpenChange(false);
            onConfirmed?.();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border-slate-200 text-slate-900 max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Delete this Course!</DialogTitle>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <div>
                        <Label className="mb-2 cursor-text">Course Name</Label>
                        <Input value={courseName || "-"} disabled className="!bg-slate-100 cursor-text" />
                    </div>
{/* 
                    <div>
                        <Label className="mb-2 mt-5 cursor-text">Reason (required)</Label>
                        <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why do you want to inactivate this course?" />
                    </div> */}
                </div>

                <DialogFooter className="flex justify-end gap-2 mt-4">
                    <Button className="cursor-pointer text-violet-800 hover:text-violet-500" variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
                        Cancel
                    </Button>
                    <Button className="cursor-pointer bg-red-50 text-red-600 shadow-md hover:bg-red-100 hover:text-red-700 hover:shadow-lg" onClick={handleConfirm} disabled={loading}>
                        {loading ? "Processing..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
