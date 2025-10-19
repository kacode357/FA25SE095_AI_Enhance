// app/student/all-courses/components/AccessCodeJoinSheet.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  courseTitle?: string; // hiển thị dạng "MATH201 — Started with Math"
  onJoined?: () => void;  // callback refetch list (nếu cần)
};

export default function AccessCodeJoinSheet({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  onJoined,
}: Props) {
  const router = useRouter();
  const [accessCode, setAccessCode] = useState("");
  const { joinCourse, loading } = useJoinCourse();

  useEffect(() => {
    if (!open) setAccessCode("");
  }, [open]);

  const handleSubmit = async () => {
    if (!courseId) return;
    const res = await joinCourse(courseId, { accessCode });
    if (res) {
      toast.success(res.message || "Joined course successfully");
      onOpenChange(false);
      onJoined?.();
      // ⬇️ Điều hướng thẳng vào trang course
      router.push(`/student/courses/${courseId}`);
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
            disabled={loading}
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
