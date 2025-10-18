"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useJoinCourse } from "@/hooks/enrollments/useJoinCourse";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId: string | null;
  courseTitle?: string;
  onJoined?: () => void; // callback để refetch list
};

export default function AccessCodeJoinSheet({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  onJoined,
}: Props) {
  const [accessCode, setAccessCode] = useState("");
  const { joinCourse, loading } = useJoinCourse();

  useEffect(() => {
    if (!open) setAccessCode("");
  }, [open]);

  const handleSubmit = async () => {
    if (!courseId) return;
    try {
      const res = await joinCourse(courseId, { accessCode });
      toast.success(res.message || "Joined course successfully");
      onOpenChange(false);
      onJoined?.();
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "Failed to join course";
      toast.error(msg);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">Enter Access Code</DialogTitle>
          <p className="text-sm text-slate-500">
            {courseTitle ? `Course: ${courseTitle}` : "This course requires an access code."}
          </p>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="accessCode">Access Code</Label>
          <Input
            id="accessCode"
            placeholder="e.g. ABC123"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !accessCode.trim()}>
            {loading ? "Joining..." : "Join"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
