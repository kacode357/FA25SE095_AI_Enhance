// app/student/courses/[id]/support/components/SupportRequestList.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SupportRequestItem } from "@/types/support/support-request.response";

import { useMySupportRequests } from "@/hooks/support-requests/useMySupportRequests";
import {
  categoryLabel,
  formatDateTime,
  priorityLabel,
  statusLabel,
} from "./support-labels";

type Props = {
  courseId: string;
};

export function SupportRequestList({ courseId }: Props) {
  const {
    fetchMySupportRequests,
    loading: loadingList,
    items,
  } = useMySupportRequests();

  // Load user's support requests for this course
  useEffect(() => {
    if (!courseId) return;
    fetchMySupportRequests({
      courseId,
      pageNumber: 1,
      pageSize: 20,
    });
  }, [courseId, fetchMySupportRequests]);

  return (
    <Card className="card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span>My Support Requests</span>
          {loadingList && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
        {items.length === 0 && !loadingList && (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>You have not submitted any support requests for this course yet.</span>
          </div>
        )}

        {items.map((item: SupportRequestItem) => (
          <div
            key={item.id}
            className="border border-slate-200 rounded-lg p-3 bg-white flex flex-col gap-1.5 text-xs"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-semibold text-slate-900 line-clamp-1">
                {item.subject}
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                  {priorityLabel(item.priority)}
                </span>
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-700">
                  {statusLabel(item.status)}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 line-clamp-2">
              {item.description || "No description provided."}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap gap-2 text-[10px] text-slate-500">
                <span>Category: {categoryLabel(item.category)}</span>
                {item.requestedAt && (
                  <span>Requested: {formatDateTime(item.requestedAt)}</span>
                )}
                {item.resolvedAt && (
                  <span>Resolved: {formatDateTime(item.resolvedAt)}</span>
                )}
              </div>
              {item.requesterName && (
                <span className="text-[10px] text-slate-400">
                  By {item.requesterName} ({item.requesterRole})
                </span>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
