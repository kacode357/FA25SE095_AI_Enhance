// app/student/courses/[id]/crawler/components/CrawlerAssignmentDescription.tsx
"use client";

import { useState } from "react";
import { ChevronDown, FileText } from "lucide-react";
import type { AssignmentItem } from "@/types/assignments/assignment.response";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-white/95 px-4 py-4 shadow-sm">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--foreground)]">
                Assignment details
              </div>
              <p className="text-[12px] text-[var(--text-muted)]">
                Content & instructions for this assignment
              </p>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-all ${
                !open
                  ? "border-[var(--border)] bg-slate-50 text-[var(--foreground)]"
                  : "border-[var(--border)] bg-white text-[var(--text-muted)]"
              }`}
            >
              <span>{open ? "Collapse" : "Expand"}</span>
              <ChevronDown
                className={`h-3 w-3 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
        </div>

        <CollapsibleContent className="mt-3 space-y-2">
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
            <div className="mt-2">
              <LiteRichTextEditor
                value={html}
                onChange={() => {}}
                readOnly
                className="min-h-[200px]"
                placeholder=""
              />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
