// app/staff/support-requests/page.tsx
"use client";

import { useEffect, useCallback } from "react";

import { usePendingSupportRequests } from "@/hooks/support-requests/usePendingSupportRequests";
import { useAssignedSupportRequests } from "@/hooks/support-requests/useAssignedSupportRequests";
import { useAcceptSupportRequest } from "@/hooks/support-requests/useAcceptSupportRequest";
import { useResolveSupportRequest } from "@/hooks/support-requests/useResolveSupportRequest";

import SupportRequestsPage from "./components/SupportRequestsPage";

const DEFAULT_PAGE_SIZE = 20;

export default function SupportRequestsPageRoute() {
  // Pending list
  const {
    loading: loadingPending,
    items: pendingItems,
    pagination: pendingPagination,
    fetchPendingSupportRequests,
  } = usePendingSupportRequests();

  // Assigned list
  const {
    loading: loadingAssigned,
    items: assignedItems,
    pagination: assignedPagination,
    fetchAssignedSupportRequests,
  } = useAssignedSupportRequests();

  // Actions
  const {
    acceptSupportRequest,
    loading: acceptLoading,
  } = useAcceptSupportRequest();

  const {
    resolveSupportRequest,
    loading: resolveLoading,
  } = useResolveSupportRequest();

  // Initial load
  useEffect(() => {
    fetchPendingSupportRequests({
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });
    fetchAssignedSupportRequests({
      pageNumber: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });
  }, [fetchPendingSupportRequests, fetchAssignedSupportRequests]);

  // Reload both lists (after accept/resolve)
  const reloadLists = useCallback(async () => {
    await Promise.all([
      fetchPendingSupportRequests({
        pageNumber: pendingPagination.pageNumber || 1,
        pageSize: pendingPagination.pageSize || DEFAULT_PAGE_SIZE,
      }),
      fetchAssignedSupportRequests({
        pageNumber: assignedPagination.pageNumber || 1,
        pageSize: assignedPagination.pageSize || DEFAULT_PAGE_SIZE,
      }),
    ]);
  }, [
    fetchPendingSupportRequests,
    fetchAssignedSupportRequests,
    pendingPagination.pageNumber,
    pendingPagination.pageSize,
    assignedPagination.pageNumber,
    assignedPagination.pageSize,
  ]);

  // Handlers
  const handleAccept = async (id: string) => {
    await acceptSupportRequest(id);
    await reloadLists();
  };

  const handleResolve = async (id: string) => {
    await resolveSupportRequest(id);
    await reloadLists();
  };

  const handlePendingPrev = () => {
    if (!pendingPagination.hasPreviousPage) return;
    fetchPendingSupportRequests({
      pageNumber: pendingPagination.pageNumber - 1,
      pageSize: pendingPagination.pageSize,
    });
  };

  const handlePendingNext = () => {
    if (!pendingPagination.hasNextPage) return;
    fetchPendingSupportRequests({
      pageNumber: pendingPagination.pageNumber + 1,
      pageSize: pendingPagination.pageSize,
    });
  };

  const handleAssignedPrev = () => {
    if (!assignedPagination.hasPreviousPage) return;
    fetchAssignedSupportRequests({
      pageNumber: assignedPagination.pageNumber - 1,
      pageSize: assignedPagination.pageSize,
    });
  };

  const handleAssignedNext = () => {
    if (!assignedPagination.hasNextPage) return;
    fetchAssignedSupportRequests({
      pageNumber: assignedPagination.pageNumber + 1,
      pageSize: assignedPagination.pageSize,
    });
  };

  return (
    <SupportRequestsPage
      pending={{
        items: pendingItems,
        loading: loadingPending,
        pagination: pendingPagination,
        actionLoading: acceptLoading,
        onPreviousPage: handlePendingPrev,
        onNextPage: handlePendingNext,
        onAccept: handleAccept,
      }}
      assigned={{
        items: assignedItems,
        loading: loadingAssigned,
        pagination: assignedPagination,
        actionLoading: resolveLoading,
        onPreviousPage: handleAssignedPrev,
        onNextPage: handleAssignedNext,
        onResolve: handleResolve,
      }}
    />
  );
}
