// app/student/all-courses/components/AccessCodeJoinSheet.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useJoinCourse } from "@/hooks/enrollments/useJoinCourse";
import { KeyRound, Loader2 } from "lucide-react";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courseId: string | null;
  courseTitle?: string; // "MATH201 — Started with Math"
  onJoined?: () => void; // refetch list nếu cần
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
    if (!courseId || !accessCode.trim() || loading) return;
    const trimmedCode = accessCode.trim();
    const res = await joinCourse(courseId, { accessCode: trimmedCode });
    if (!res) {
      return;
    }
    if (res.success === false) {
      return;
    }
    toast.success(res.message);
    onOpenChange(false);
    onJoined?.();
    router.push(`/student/courses/${courseId}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md p-0"
        style={{
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: 16,
        }}
      >
        <DialogHeader className="p-4 pb-0">
          <DialogTitle
            className="text-lg flex items-center gap-2"
            style={{ color: "var(--foreground)" }}
          >
            <KeyRound className="w-5 h-5 text-brand" />
            Enter Access Code
          </DialogTitle>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {courseTitle
              ? `Course: ${courseTitle}`
              : "This course requires an access code."}
          </p>
        </DialogHeader>

        <div className="p-4 space-y-2">
          <label
            htmlFor="accessCode"
            className="text-sm font-medium"
            style={{ color: "var(--foreground)" }}
          >
            Access Code
          </label>
          <input
            id="accessCode"
            placeholder="e.g. ABC123"
            value={accessCode}
            onChange={(e) => setAccessCode(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            autoFocus
            disabled={loading}
            className="input h-10 text-sm"
          />
        </div>

        <DialogFooter className="p-4 pt-0 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="btn"
            style={{
              background: "var(--card)",
              color: "var(--brand)",
              border: "1px solid var(--brand)",
              height: 38,
              borderRadius: 10,
            }}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !accessCode.trim()}
            className="btn btn-gradient-slow"
            style={{ height: 38, borderRadius: 10, minWidth: 120 }}
            title="Join with access code"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Joining...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                <span>Join</span>
              </>
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
