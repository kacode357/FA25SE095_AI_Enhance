// app/staff/support-requests/components/SupportRequestsTabs.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { usePendingSupportRequests } from "@/hooks/support-requests/usePendingSupportRequests";
import { useAssignedSupportRequests } from "@/hooks/support-requests/useAssignedSupportRequests";
import { useAcceptSupportRequest } from "@/hooks/support-requests/useAcceptSupportRequest";
import { useResolveSupportRequest } from "@/hooks/support-requests/useResolveSupportRequest";

import SupportRequestList from "./SupportRequestList";

const DEFAULT_PAGE_SIZE = 20;

export default function SupportRequestsTabs() {
  const [tab, setTab] = useState<"pending" | "assigned">("pending");

  const {
    loading: loadingPending,
    items: pendingItems,
    pagination: pendingPagination,
    fetchPendingSupportRequests,
  } = usePendingSupportRequests();

  const {
    loading: loadingAssigned,
    items: assignedItems,
    pagination: assignedPagination,
    fetchAssignedSupportRequests,
  } = useAssignedSupportRequests();

  const { acceptSupportRequest, loading: acceptLoading } =
    useAcceptSupportRequest();

  const { resolveSupportRequest, loading: resolveLoading } =
    useResolveSupportRequest();

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
  <Tabs
    value={tab}
    onValueChange={(v) => setTab(v as "pending" | "assigned")}
    className="flex flex-col h-full min-h-0"
  >
    <TabsList className="mb-4 w-fit">
      <TabsTrigger value="pending" className="px-4 py-1.5 text-sm">
        Pending requests
      </TabsTrigger>
      <TabsTrigger value="assigned" className="px-4 py-1.5 text-sm">
        My assigned
      </TabsTrigger>
    </TabsList>

    <div className="flex-1 min-h-0">
      <TabsContent value="pending" className="h-full m-0">
        <SupportRequestList
          title="Pending support requests"
          subtitle="New tickets waiting for staff to accept."
          type="pending"
          items={pendingItems}
          loading={loadingPending}
          actionLoading={acceptLoading}
          pagination={pendingPagination}
          onPreviousPage={handlePendingPrev}
          onNextPage={handlePendingNext}
          onAccept={handleAccept}
          onReload={reloadLists}
        />
      </TabsContent>

      <TabsContent value="assigned" className="h-full m-0">
        <SupportRequestList
          title="My assigned requests"
          subtitle="Tickets that are currently assigned to you."
          type="assigned"
          items={assignedItems}
          loading={loadingAssigned}
          actionLoading={resolveLoading}
          pagination={assignedPagination}
          onPreviousPage={handleAssignedPrev}
          onNextPage={handleAssignedNext}
          onResolve={handleResolve}
          onReload={reloadLists}
        />
      </TabsContent>
    </div>
  </Tabs>
);

}
