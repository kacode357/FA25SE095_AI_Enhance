// app/admin/announcements/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Megaphone, Plus, Loader2, ChevronRight } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { useAdminAnnouncements } from "@/hooks/announcements/useAdminAnnouncements";
import {
  AnnouncementAudience,
} from "@/types/announcements/announcement.response";
import PaginationBar from "@/components/common/PaginationBar";
import { formatDateTimeVN } from "@/utils/datetime/format-datetime";
import AnnouncementFilterBar, {
  AnnouncementFilterValue,
} from "./components/AnnouncementFilterBar";

function getAudienceLabel(audience: AnnouncementAudience) {
  switch (audience) {
    case AnnouncementAudience.Students:
      return "Students";
    case AnnouncementAudience.Lecturers:
      return "Lecturers";
    case AnnouncementAudience.All:
    default:
      return "All Users";
  }
}

function getAudienceBadgeClass(audience: AnnouncementAudience) {
  switch (audience) {
    case AnnouncementAudience.Students:
      return "bg-blue-50 text-blue-700 border-blue-100";
    case AnnouncementAudience.Lecturers:
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case AnnouncementAudience.All:
    default:
      return "bg-purple-50 text-purple-700 border-purple-100";
  }
}

export default function AdminAnnouncementsPage() {
  const { loading, items, pagination, fetchAdminAnnouncements } =
    useAdminAnnouncements();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Filter: search title + audience
  // audience = "any" => không truyền Audience => lấy 3 status
  const [filters, setFilters] = useState<AnnouncementFilterValue>({
    searchTerm: "",
    audience: "any",
  });

  // gọi API khi page / filters đổi
  useEffect(() => {
    const audienceParam =
      filters.audience === "any" ? undefined : filters.audience;

    fetchAdminAnnouncements({
      page,
      pageSize,
      searchTerm: filters.searchTerm || undefined,
      audience: audienceParam,
    });
  }, [page, pageSize, filters, fetchAdminAnnouncements]);

  const totalLabel = useMemo(() => {
    if (!pagination.totalItems) return "No announcements yet";
    return `${pagination.totalItems} announcement${
      pagination.totalItems > 1 ? "s" : ""
    }`;
  }, [pagination.totalItems]);

  const handleFilterChange = (next: AnnouncementFilterValue) => {
    setFilters(next);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md">
            <Megaphone className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Announcements
            </h1>
            <p className="text-xs text-slate-500">{totalLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/announcements/create">
            <Button className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md hover:opacity-90">
              <Plus className="h-4 w-4" />
              <span className="text-sm">Create Announcement</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter + search chung (title + audience) */}
      <AnnouncementFilterBar value={filters} onChange={handleFilterChange} />

      {/* List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading && !items.length ? (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading announcements...
          </div>
        ) : null}

        {!loading && !items.length ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <Megaphone className="h-5 w-5 text-slate-400" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">
                No announcements found
              </p>
              <p className="text-xs text-slate-500">
                Try adjusting your filters or create a new announcement.
              </p>
            </div>
            <Link href="/admin/announcements/create">
              <Button
                variant="outline"
                className="mt-1 rounded-xl border-dashed border-slate-300 text-xs"
              >
                <Plus className="mr-1 h-3 w-3" />
                New Announcement
              </Button>
            </Link>
          </div>
        ) : null}

        {items.length > 0 && (
          <>
            <div className="divide-y divide-slate-100">
              {items.map((item) => {
                const audienceLabel = getAudienceLabel(item.audience);
                const creatorName = item.createdByName || "System";

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 px-4 py-4 hover:bg-slate-50/70 sm:px-5"
                  >
                    {/* dòng chính */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      {/* Trái: title + audience + created by */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">
                            {item.title || "(No title)"}
                          </p>
                          <span
                            className={clsx(
                              "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
                              getAudienceBadgeClass(item.audience)
                            )}
                          >
                            {audienceLabel}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500">
                          Created by{" "}
                          <span className="font-medium text-slate-700">
                            {creatorName}
                          </span>
                        </p>
                      </div>

                      {/* Phải: Published at ... (1 dòng) */}
                      <div className="text-right text-xs text-slate-500">
                        <span>Published at </span>
                        <span className="font-medium text-slate-700">
                          {formatDateTimeVN(item.publishedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Action: icon next */}
                    <div className="flex items-center justify-end">
                      <Link
                        href={`/admin/announcements/${item.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-purple-200 text-purple-600 hover:bg-purple-50 hover:border-purple-300 transition-colors"
                        aria-label="View announcement detail"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination dùng component chung */}
            <PaginationBar
              page={pagination.page}
              totalPages={pagination.totalPages || 1}
              totalCount={pagination.totalItems}
              loading={loading}
              onPageChange={(newPage) => setPage(newPage)}
            />
          </>
        )}
      </div>
    </div>
  );
}
