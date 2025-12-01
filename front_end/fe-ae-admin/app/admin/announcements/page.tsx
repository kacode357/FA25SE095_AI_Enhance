// app/admin/announcements/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Loader2, ChevronRight } from "lucide-react";
import clsx from "clsx";

import { Button } from "@/components/ui/button";
import { useAdminAnnouncements } from "@/hooks/announcements/useAdminAnnouncements";
import { AnnouncementAudience } from "@/types/announcements/announcement.response";
import PaginationBar from "@/components/common/pagination-all";
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

// badge dùng màu theo brand / accent
function getAudienceBadgeClass(audience: AnnouncementAudience) {
  switch (audience) {
    case AnnouncementAudience.Students:
      return "bg-[color-mix(in_oklab,var(--brand)_6%,#eff6ff)] text-[var(--brand)] border-[color-mix(in_oklab,var(--brand)_16%,#dbeafe)]";
    case AnnouncementAudience.Lecturers:
      return "bg-[color-mix(in_oklab,var(--accent)_8%,#ecfdf3)] text-[var(--accent-700)] border-[color-mix(in_oklab,var(--accent)_24%,#bbf7d0)]";
    case AnnouncementAudience.All:
    default:
      return "bg-[color-mix(in_oklab,var(--brand)_10%,#f5f3ff)] text-[var(--brand-700)] border-[color-mix(in_oklab,var(--brand)_26%,#ddd6fe)]";
  }
}

export default function AdminAnnouncementsPage() {
  const { loading, items, pagination, fetchAdminAnnouncements } =
    useAdminAnnouncements();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [filters, setFilters] = useState<AnnouncementFilterValue>({
    searchTerm: "",
    audience: "any",
  });

  // fetch data
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <h1 className="text-lg font-semibold text-nav">Announcements</h1>
          <p className="text-xs text-[color:var(--text-muted)]">
            {totalLabel}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/announcements/create">
            <Button className="btn btn-green-slow flex items-center gap-2 rounded-xl px-4 py-2 text-sm shadow-md">
              <Plus className="h-4 w-4" />
              <span>Create Announcement</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <AnnouncementFilterBar value={filters} onChange={handleFilterChange} />

      {/* List */}
      <div className="rounded-2xl border border-[var(--border)] bg-white shadow-sm">
        {loading && !items.length ? (
          <div className="flex h-40 items-center justify-center gap-2 text-sm text-[color:var(--text-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading announcements...
          </div>
        ) : null}

        {!loading && !items.length ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-10 text-center">
            <p className="text-sm font-medium text-[color:var(--foreground)]">
              No announcements found
            </p>
            <p className="text-xs text-[color:var(--text-muted)]">
              Try adjusting your filters or create a new announcement.
            </p>
          </div>
        ) : null}

        {items.length > 0 && (
          <>
            <div className="divide-y divide-[color-mix(in_oklab,var(--brand)_6%,#e5e7eb)]">
              {items.map((item) => {
                const audienceLabel = getAudienceLabel(item.audience);
                const creatorName = item.createdByName || "System";

                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 px-4 py-4 hover:bg-[color-mix(in_oklab,var(--brand)_4%,#f8fafc)] sm:px-5"
                  >
                    {/* main row */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      {/* left: title + audience + created by */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-nav">
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
                        <p className="text-xs text-[color:var(--text-muted)]">
                          Created by{" "}
                          <span className="font-medium text-nav">
                            {creatorName}
                          </span>
                        </p>
                      </div>

                      {/* right: published at */}
                      <div className="text-right text-xs text-[color:var(--text-muted)]">
                        <span>Published at </span>
                        <span className="font-medium text-nav">
                          {formatDateTimeVN(item.publishedAt)}
                        </span>
                      </div>
                    </div>

                    {/* action: view detail chevron */}
                    <div className="flex items-center justify-end">
                      <Link
                        href={`/admin/announcements/${item.id}`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--brand)_20%,#e9d5ff)] text-[var(--brand-700)] hover:bg-[color-mix(in_oklab,var(--brand)_10%,#f3e8ff)] hover:border-[color-mix(in_oklab,var(--brand)_40%,#c4b5fd)] transition-colors"
                        aria-label="View announcement detail"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
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
