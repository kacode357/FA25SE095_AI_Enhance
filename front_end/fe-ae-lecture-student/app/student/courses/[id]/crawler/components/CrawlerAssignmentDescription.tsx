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
    <div className="card px-4 py-3">
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50">
              <FileText className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--foreground)]">
                Assignment details
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Content & instructions for this assignment
              </p>
            </div>
          </div>

          <CollapsibleTrigger asChild>
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-medium transition-all ${
                // [ĐÃ ĐỔI MÀU] Sang tone Amber (Vàng cam)
                !open
                  ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
                  : "border-[var(--border)] bg-white text-[var(--text-muted)] hover:bg-slate-50"
              }`}
            >
              {/* Hiệu ứng nháy nháy (Ping) màu vàng */}
              {!open && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}

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