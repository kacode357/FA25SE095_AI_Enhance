// app/staff/support-requests/components/SupportRequestList.tsx
"use client";

import { Loader2, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

import SupportRequestCategoryBadge from "./SupportRequestCategoryBadge";
import SupportRequestPriorityBadge from "./SupportRequestPriorityBadge";
import SupportRequestRejectButton from "./SupportRequestRejectButton";
import SupportRequestStatusBadge from "./SupportRequestStatusBadge";

import { SupportRequestStatus } from "@/config/classroom-service/support-request-status.enum";
import type { SupportRequestItem } from "@/types/support/support-request.response";

type PaginationState = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type Props = {
  title: string;
  subtitle: string;
  type: "pending" | "assigned";
  items: SupportRequestItem[];
  loading: boolean;
  actionLoading: boolean;
  pagination: PaginationState;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
  onAccept?: (id: string) => Promise<void>;
  onResolve?: (id: string) => Promise<void>;
  /** Reload cả list từ bên ngoài (sau accept / reject / resolve) */
  onReload?: () => Promise<void> | void;
};

const dt = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? s : d.toLocaleString("en-GB");
};

export default function SupportRequestList({
  title,
  subtitle,
  type,
  items,
  loading,
  actionLoading,
  pagination,
  onPreviousPage,
  onNextPage,
  onAccept,
  onResolve,
  onReload,
}: Props) {
  const showEmpty = !loading && items.length === 0;
  const { user } = useAuth();

  const router = useRouter();

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <div className="text-xs text-gray-500">
          Page {pagination.pageNumber} of {Math.max(pagination.totalPages, 1)} ·{" "}
          {pagination.totalCount} items
        </div>
      </div>
      {/* Chat opens in dedicated page */}

      <Separator className="mb-3" />

      {/* Body */}
      <div className="flex-1 min-h-0 rounded-xl border border-slate-100 bg-slate-50/60">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <p className="text-xs text-gray-500">
                Loading support requests...
              </p>
            </div>
          </div>
        ) : showEmpty ? (
          <div className="h-full flex items-center justify-center text-center px-4">
            <div>
              <p className="text-sm font-medium text-gray-700">
                No support requests found.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Once requests are created, they will appear here.
              </p>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full rounded-xl">
            <Table>
              <TableHeader>
                <TableRow className="text-xs">
                  <TableHead className="w-[22%]">Subject</TableHead>
                  <TableHead className="w-[18%]">Course</TableHead>
                  <TableHead className="w-[18%]">Requester</TableHead>
                  <TableHead className="w-[16%]">
                    Category &amp; Priority
                  </TableHead>
                  <TableHead className="w-[16%]">
                    Status &amp; Timeline
                  </TableHead>
                  <TableHead className="w-[10%]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const isClosed =
                    item.status === SupportRequestStatus.Resolved ||
                    item.status === SupportRequestStatus.Cancelled ||
                    item.status === SupportRequestStatus.Rejected;

                  return (
                    <TableRow key={item.id} className="align-top">
                      {/* Subject */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.subject}
                          </div>
                          {item.description && (
                            <p className="text-xs text-gray-500 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Course */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.courseName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Course ID: {item.courseId}
                          </p>
                        </div>
                      </TableCell>

                      {/* Requester */}
                      <TableCell>
                        <div className="flex flex-col gap-0.5">
                          <p className="text-sm font-medium text-gray-900 line-clamp-1">
                            {item.requesterName}
                          </p>
                          <p className="text-[11px] text-gray-500">
                            Role: {item.requesterRole}
                          </p>
                          {item.assignedStaffName && (
                            <p className="text-[11px] text-blue-600 line-clamp-1">
                              Assigned to: {item.assignedStaffName}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Category + Priority */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <SupportRequestCategoryBadge
                            category={item.category}
                          />
                          <SupportRequestPriorityBadge
                            priority={item.priority}
                          />
                        </div>
                      </TableCell>

                      {/* Status + Time */}
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <SupportRequestStatusBadge status={item.status} />
                          <p className="text-[11px] text-gray-500">
                            Requested: {dt(item.requestedAt)}
                          </p>
                          {item.acceptedAt && (
                            <p className="text-[11px] text-gray-500">
                              Accepted: {dt(item.acceptedAt)}
                            </p>
                          )}
                          {item.resolvedAt && (
                            <p className="text-[11px] text-gray-500">
                              Resolved: {dt(item.resolvedAt)}
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end gap-1">
                          {type === "pending" && (
                            <div className="flex gap-1">
                              {onAccept && (
                                <Button
                                  size="sm"
                                  disabled={actionLoading}
                                  className="btn btn-blue-slow px-3 py-1 text-xs"
                                  onClick={() => onAccept(item.id)}
                                >
                                  {actionLoading && (
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  )}
                                  Accept
                                </Button>
                              )}

                              <SupportRequestRejectButton
                                requestId={item.id}
                                disabled={actionLoading}
                                onRejected={onReload}
                              />
                            </div>
                          )}

                          {type === "assigned" && onResolve && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="px-3 py-1 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                              disabled={actionLoading || isClosed}
                              onClick={() => onResolve(item.id)}
                            >
                              {actionLoading && (
                                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              )}
                              {isClosed ? "Completed" : "Mark resolved"}
                            </Button>
                          )}

                          {item.conversationId && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="mt-1 h-7 w-7"
                              title="Open conversation (chat)"
                              onClick={() => {
                                // navigate to chat page with query params
                                // eslint-disable-next-line no-console
                                console.debug("Navigate to chat page", { requestId: item.id, conversationId: item.conversationId });
                                const q = new URLSearchParams();
                                q.set("courseId", item.courseId);
                                q.set("peerId", item.requesterId);
                                q.set("peerName", item.requesterName || "");
                                if (item.conversationId) q.set("conversationId", item.conversationId);
                                router.push(`/staff/support-requests/chat?${q.toString()}`);
                              }}
                            >
                              <MessageCircle className="w-4 h-4 text-blue-500" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing{" "}
          {items.length === 0
            ? 0
            : (pagination.pageNumber - 1) * pagination.pageSize + 1}{" "}
          -{" "}
          {(pagination.pageNumber - 1) * pagination.pageSize + items.length} of{" "}
          {pagination.totalCount}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!pagination.hasPreviousPage || loading}
            onClick={onPreviousPage}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!pagination.hasNextPage || loading}
            onClick={onNextPage}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

