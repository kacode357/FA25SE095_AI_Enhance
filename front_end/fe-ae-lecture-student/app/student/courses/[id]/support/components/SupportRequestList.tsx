"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Loader2, MessageCircle } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SupportRequestItem } from "@/types/support/support-request.response";

import { useMySupportRequests } from "@/hooks/support-requests/useMySupportRequests";
import {
  categoryBadgeClass,
  categoryLabel,
  formatDateTime,
  priorityBadgeClass,
  priorityLabel,
  statusBadgeClass,
  statusLabel,
} from "./support-labels";
import { SupportRequestStatus } from "@/config/classroom-service/support-request-status.enum";

type Props = {
  courseId: string;
  /** Dùng để trigger reload từ bên ngoài (tăng số là fetch lại) */
  refreshKey?: number;
};

export function SupportRequestList({ courseId, refreshKey }: Props) {
  const router = useRouter();

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
  }, [courseId, fetchMySupportRequests, refreshKey]);

  const handleOpenChat = useCallback(
    (item: SupportRequestItem) => {
      if (!item.conversationId) return;

      // peerId / peerName dùng cho page chat để biết đang nói chuyện với ai
      const peerId = item.assignedStaffId ?? "";
      const peerName = item.assignedStaffName ?? "Support Staff";

      const url = `/student/courses/${courseId}/support/${item.conversationId}?peerId=${encodeURIComponent(
        peerId,
      )}&peerName=${encodeURIComponent(peerName)}&requestId=${encodeURIComponent(item.id)}`;

      router.push(url);
    },
    [router, courseId],
  );

  return (
    <Card className="card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <span>My Support Requests</span>
          {loadingList && (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 max-h-[420px] overflow-y-auto">
        {items.length === 0 && !loadingList && (
          <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <span>
              You have not submitted any support requests for this course yet.
            </span>
          </div>
        )}

        {items.map((item: SupportRequestItem) => (
          <div
            key={item.id}
            className="border border-slate-200 rounded-lg p-3 bg-white text-xs"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              {/* LEFT SIDE: subject, category, priority, description, requested */}
              <div className="flex-1 min-w-0 space-y-1.5">
                {/* Subject */}
                <div className="text-slate-900">
                  <span className="text-[11px] font-medium text-slate-500 mr-1.5">
                    Subject:
                  </span>
                  <span className="font-semibold">{item.subject}</span>
                </div>

                {/* Category ngay dưới Subject */}
                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="font-medium text-slate-500">Category:</span>
                  <span className={categoryBadgeClass(item.category)}>
                    {categoryLabel(item.category)}
                  </span>
                </div>

                {/* Priority */}
                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="font-medium text-slate-500">Priority:</span>
                  <span className={priorityBadgeClass(item.priority)}>
                    {priorityLabel(item.priority)}
                  </span>
                </div>

                {/* Description */}
                <div className="text-[11px] text-slate-600">
                  <span className="font-medium text-slate-500 mr-1">
                    Description:
                  </span>
                  <span className="line-clamp-2">
                    {item.description || "No description provided."}
                  </span>
                </div>

                {/* Requested: góc phải dưới */}
                {item.requestedAt && (
                  <div className="flex justify-end pt-1 text-[10px] text-slate-500">
                    <span>Requested: {formatDateTime(item.requestedAt)}</span>
                  </div>
                )}
              </div>

              {/* RIGHT SIDE: status + open chat */}
              <div className="flex flex-col items-end gap-2 sm:pl-4">
                {/* Status ở góc phải trên */}
                <div className="flex items-center gap-1 text-[11px] text-slate-600">
                  <span className="font-medium text-slate-500">Status:</span>
                  <span className={statusBadgeClass(item.status)}>
                    {statusLabel(item.status)}
                  </span>
                </div>

                {/* Open chat dưới status – chỉ khi In Progress */}
                {item.status === SupportRequestStatus.InProgress && (
                  <button
                    type="button"
                    onClick={() => handleOpenChat(item)}
                    disabled={!item.conversationId || !item.assignedStaffId}
                    className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-medium shadow-sm
                               bg-[var(--brand)] text-white hover:brightness-105 disabled:opacity-60 disabled:cursor-not-allowed
                               focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-[var(--brand)]"
                    aria-label="Open support chat"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span>Open chat</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
