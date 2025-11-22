// app/student/courses/[id]/support/components/ResolveSupportPrompt.tsx
"use client";

import { useCallback } from "react";

import { useResolveSupportRequest } from "@/hooks/support-requests/useResolveSupportRequest";

type Props = {
  visible: boolean;
  supportRequestId: string | null;
  onDone?: () => void;
  onNotDone?: () => void;
};

export default function ResolveSupportPrompt({
  visible,
  supportRequestId,
  onDone,
  onNotDone,
}: Props) {
  const { resolveSupportRequest, loading } = useResolveSupportRequest();

  const handleDone = useCallback(async () => {
    if (!supportRequestId) return;
    await resolveSupportRequest(supportRequestId);
    onDone?.();
  }, [supportRequestId, resolveSupportRequest, onDone]);

  const handleNotDone = useCallback(() => {
    onNotDone?.();
  }, [onNotDone]);

  if (!visible) return null;

  const disableDone = loading || !supportRequestId;

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/20 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-5 text-center shadow-xl">
        <p className="mb-2 text-sm font-semibold text-nav">
          Has your need been resolved?
        </p>
        <p className="mb-4 text-xs text-[var(--text-muted)]">
          Let us know if we can close this support request or if you still need help.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            className="h-9 rounded-full border border-[var(--border)] px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            onClick={handleNotDone}
          >
            Not yet
          </button>

          <button
            type="button"
            disabled={disableDone}
            className={[
              "btn btn-gradient-slow h-9 rounded-full px-4 text-xs font-semibold text-white",
              disableDone ? "cursor-not-allowed opacity-60" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onClick={handleDone}
          >
            {loading ? "Saving…" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
