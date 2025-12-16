// app/student/courses/[id]/crawler/components/CrawlerAssignmentDescription.tsx
"use client";

import { FileText } from "lucide-react";
import type { AssignmentItem } from "@/types/assignments/assignment.response";
import LiteRichTextEditor from "@/components/common/TinyMCE";

type Props = {
  assignment?: AssignmentItem;
  loading: boolean;
};

export default function CrawlerAssignmentDescription({
  assignment,
  loading,
}: Props) {
  const html = assignment?.description || "";

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
          <FileText className="h-5 w-5 text-slate-600" />
        </div>
        <div>
          <div className="text-sm font-semibold text-[var(--foreground)]">
            Content & instructions
          </div>
          <p className="text-[12px] text-[var(--text-muted)]">
            Detailed requirements provided by your lecturer
          </p>
        </div>
      </div>

      {loading && (
        <p className="text-[11px] text-[var(--text-muted)]">
          Loading assignment content...
        </p>
      )}

      {!loading && !html && (
        <p className="text-[11px] text-[var(--text-muted)]">
          This assignment does not have a detailed description yet.
        </p>
      )}

      {!loading && html && (
        <LiteRichTextEditor
          value={html}
          onChange={() => {}}
          readOnly
          className="min-h-[200px]"
          placeholder=""
        />
      )}
    </div>
  );
}
