"use client";

import React from "react";

import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogContent,
} from "@/components/ui/dialog";
import type { BufferData } from "@/types/agent-training/training.types";

import { BufferExtractedDataTable } from "./BufferExtractedDataTable";
import { InfoRow, MetricCard } from "./BufferInfoElements";
import { Skeleton } from "@/components/ui/skeleton";

interface BufferDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buffer: BufferData | null;
  loading: boolean;
  error: string | null;
  formatTimestamp: (timestamp: string) => string;
}

export const BufferDetailsDialog: React.FC<BufferDetailsDialogProps> = ({
  open,
  onOpenChange,
  buffer,
  loading,
  error,
  formatTimestamp,
}) => {
  const parseRows = (payload: any): Record<string, any>[] | null => {
    if (Array.isArray(payload) && payload.length > 0) {
      return payload as Record<string, any>[];
    }
    if (
      payload &&
      typeof payload === "object" &&
      Array.isArray(payload.data) &&
      payload.data.length > 0
    ) {
      return payload.data as Record<string, any>[];
    }
    return null;
  };

  const extractedRows = buffer?.result
    ? parseRows(buffer.result.data)
    : null;

  const formatExecutionTime = (ms?: number) => {
    if (ms === undefined || ms === null) {
      return "—";
    }
    const seconds = ms / 1000;
    const minutes = seconds / 60;
    return `${seconds.toFixed(2)} s (${minutes.toFixed(2)} min)`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full !max-w-[calc(100vw-1.5rem)] sm:!max-w-[min(1200px,calc(100vw-2rem))] max-h-[90dvh] overflow-hidden p-0">
        <div className="flex max-h-[90dvh] flex-col">
          <DialogHeader className="px-6 pt-6 pb-3 text-left">
            <DialogTitle>Buffer details</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Inspect metadata and extracted data before committing.
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 pb-6">
            <div className="space-y-4 rounded-2xl bg-white p-5 text-xs text-slate-600 shadow-sm">
          {loading && <DetailSkeleton />}
          {!loading && error && (
            <p className="text-sm text-rose-600">{error}</p>
          )}
          {!loading && !error && buffer && (
            <>
              <section className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                  <InfoRow
                    label="URL"
                    value={
                      <a
                        href={buffer.url}
                        target="_blank"
                        rel="noreferrer"
                        className="break-all text-indigo-600 hover:underline"
                      >
                        {buffer.url}
                      </a>
                    }
                  />
                  <InfoRow
                    label="Description"
                    value={buffer.description || "—"}
                  />
                </div>
                <InfoRow
                  label="Timestamp"
                  value={formatTimestamp(buffer.timestamp)}
                />
              </section>

              {buffer.metrics && (
                <section className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    <MetricCard
                      label="Items Extracted"
                      value={buffer.metrics.items_extracted}
                    />
                    <MetricCard
                      label="Execution Time"
                      value={formatExecutionTime(
                        buffer.metrics.execution_time_ms
                      )}
                    />
                    <MetricCard
                      label="Reward"
                      value={buffer.metrics.base_reward.toFixed(2)}
                    />
                  </div>
                </section>
              )}

              {extractedRows && (
                <BufferExtractedDataTable
                  rows={extractedRows}
                  maxHeight="28rem"
                />
              )}
            </>
          )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const DetailSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[0, 1, 2].map((section) => (
      <div key={section} className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    ))}
  </div>
);
