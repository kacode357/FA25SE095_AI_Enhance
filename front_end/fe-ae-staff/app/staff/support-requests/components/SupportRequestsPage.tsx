// app/staff/support-requests/components/SupportRequestsPage.tsx
"use client";

import { ClipboardList } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { SupportRequestItem } from "@/types/support/support-request.response";
import SupportRequestList from "./SupportRequestList";

type PaginationState = {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type ListProps = {
  items: SupportRequestItem[];
  loading: boolean;
  pagination: PaginationState;
  actionLoading: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
};

type PendingProps = ListProps & {
  onAccept: (id: string) => Promise<void>;
};

type AssignedProps = ListProps & {
  onResolve: (id: string) => Promise<void>;
};

type Props = {
  pending: PendingProps;
  assigned: AssignedProps;
  /** Reload cả 2 list (pending + assigned) */
  onReloadAll: () => Promise<void> | void;
};

export default function SupportRequestsPage({
  pending,
  assigned,
  onReloadAll,
}: Props) {
  const [tab, setTab] = useState<"pending" | "assigned">("pending");

  const handleRefreshClick = () => {
    window?.location?.reload();
  };

  return (
    <div className="h-full p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-[rgba(127,113,244,0.12)] p-2.5">
            <ClipboardList className="w-6 h-6 text-[var(--brand)]" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-nav flex items-center gap-2">
              Support Requests
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Review pending tickets and manage your assigned support requests.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="text-sm btn btn-gradient-slow border-[var(--border)]"
            onClick={handleRefreshClick}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Content */}
      <Card className="card rounded-2xl gap-0 flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-nav">
            Support Center
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex-1 flex flex-col min-h-0">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as "pending" | "assigned")}
            className="flex flex-col h-full min-h-0"
          >
            <TabsList className="mb-4 w-fit border border-[var(--border)] bg-white/70 shadow-sm">
              <TabsTrigger value="pending" className="px-4 py-1.5 cursor-pointer text-sm">
                Pending requests
              </TabsTrigger>
              <TabsTrigger value="assigned" className="px-4 py-1.5 cursor-pointer text-sm">
                My assigned
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 min-h-0">
              <TabsContent value="pending" className="h-full m-0">
                <SupportRequestList
                  title="Pending support requests"
                  subtitle="New tickets waiting for staff to accept."
                  type="pending"
                  items={pending.items}
                  loading={pending.loading}
                  actionLoading={pending.actionLoading}
                  pagination={pending.pagination}
                  onPreviousPage={pending.onPreviousPage}
                  onNextPage={pending.onNextPage}
                  onAccept={pending.onAccept}
                  onReload={onReloadAll}
                />
              </TabsContent>

              <TabsContent value="assigned" className="h-full m-0">
                <SupportRequestList
                  title="My assigned requests"
                  subtitle="Tickets that are currently assigned to you."
                  type="assigned"
                  items={assigned.items}
                  loading={assigned.loading}
                  actionLoading={assigned.actionLoading}
                  pagination={assigned.pagination}
                  onPreviousPage={assigned.onPreviousPage}
                  onNextPage={assigned.onNextPage}
                  onResolve={assigned.onResolve}
                  onReload={onReloadAll}
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
