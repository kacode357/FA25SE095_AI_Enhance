// app/student/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useStudentAnnouncements } from "@/hooks/announcements/useStudentAnnouncements";
import { parseServerDate, dayLabel, timeHHmm } from "@/utils/chat/time";

export default function StudentHomePage() {
  const {
    loading,
    items,
    pagination,
    fetchStudentAnnouncements,
  } = useStudentAnnouncements();

  const [searchInput, setSearchInput] = useState("");
  const [currentQuery, setCurrentQuery] = useState<{
    page: number;
    pageSize: number;
    searchTerm?: string;
  }>({
    page: 1,
    pageSize: 10,
    searchTerm: "",
  });

  // load list
  useEffect(() => {
    fetchStudentAnnouncements({
      page: currentQuery.page,
      pageSize: currentQuery.pageSize,
      searchTerm: currentQuery.searchTerm,
    });
  }, [
    fetchStudentAnnouncements,
    currentQuery.page,
    currentQuery.pageSize,
    currentQuery.searchTerm,
  ]);

  const handleSearch = () => {
    const next = {
      ...currentQuery,
      page: 1,
      searchTerm: searchInput.trim() || undefined,
    };
    setCurrentQuery(next);
    fetchStudentAnnouncements(next);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    const next = { ...currentQuery, page: 1, searchTerm: undefined };
    setCurrentQuery(next);
    fetchStudentAnnouncements(next);
  };

  const handleChangePage = (direction: "prev" | "next") => {
    if (direction === "prev" && !pagination.hasPreviousPage) return;
    if (direction === "next" && !pagination.hasNextPage) return;

    const nextPage =
      direction === "prev" ? pagination.page - 1 : pagination.page + 1;

    const next = { ...currentQuery, page: nextPage };
    setCurrentQuery(next);
    fetchStudentAnnouncements(next);
  };

  const formatTime = (ts: string) => {
    const d = parseServerDate(ts);
    if (Number.isNaN(d.getTime())) return "";
    return `${dayLabel(d)} • ${timeHHmm(d)}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Gộp header + search + list trong 1 card cho đồng màu nền */}
      <section className="card flex flex-col gap-4 px-6 py-5">
        {/* Header + search row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-nav">
              Announcements
            </h1>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              Latest notices from the admin team.
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <div className="flex-1 sm:w-72">
              <Input
                placeholder="Search announcements..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                // dùng style input của globals cho đồng brand
                className="input !px-3 !py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                className="btn btn-yellow-slow text-xs sm:text-sm px-3 py-2"
                onClick={handleSearch}
                disabled={loading}
              >
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs sm:text-sm border-brand/60 text-brand px-3 py-2"
                onClick={handleClearSearch}
                disabled={loading && !searchInput}
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* List */}
        <div className="mt-2 rounded-2xl border border-[color:var(--border)] bg-white">
          <div className="flex items-center justify-between rounded-t-2xl border-b border-[color:var(--border)] px-4 py-3">
            <h2 className="text-sm font-medium text-nav">All announcements</h2>
            <p className="text-xs text-[color:var(--text-muted)]">
              {pagination.totalItems > 0
                ? `${pagination.totalItems} items`
                : "No items"}
            </p>
          </div>

          <div className="scrollbar-stable max-h-[480px] overflow-y-auto">
            {loading && !items.length ? (
              <div className="flex h-40 items-center justify-center text-xs text-[color:var(--text-muted)]">
                Loading announcements...
              </div>
            ) : !items.length ? (
              <div className="flex h-40 flex-col items-center justify-center px-4 text-center text-sm text-[color:var(--text-muted)]">
                <p>No announcements yet.</p>
                <p className="mt-1 text-xs opacity-80">
                  When the admin posts something, it will appear here.
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-[color:var(--border)]">
                {items.map((item) => (
                  <li key={item.id}>
                    {/* Click => sang trang detail (tạo route /student/announcements/[id]) */}
                    <Link
                      href={`/student/announcements/${item.id}`}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition"
                    >
                      <div className="min-w-0 flex-1">
                        {/* title */}
                        <p className="truncate text-sm font-medium text-slate-900">
                          {item.title}
                        </p>
                        {/* meta: người thông báo + thời gian */}
                        <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                          {item.createdByName && (
                            <span className="font-medium">
                              {item.createdByName}
                            </span>
                          )}
                          {item.createdByName && item.publishedAt && " • "}
                          {item.publishedAt && formatTime(item.publishedAt)}
                        </p>
                      </div>

                      {/* icon next */}
                      <ChevronRight className="h-4 w-4 shrink-0 text-nav-active" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Pagination */}
          {items.length > 0 && (
            <div className="flex items-center justify-between rounded-b-2xl border-t border-[color:var(--border)] px-4 py-2.5 text-xs text-[color:var(--text-muted)]">
              <div>
                Page{" "}
                <span className="font-medium text-slate-900">
                  {pagination.page || 1}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-900">
                  {pagination.totalPages || 1}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="px-3 py-1 text-xs border-[color:var(--border)] text-[color:var(--text-muted)]"
                  onClick={() => handleChangePage("prev")}
                  disabled={loading || !pagination.hasPreviousPage}
                >
                  Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  className="px-3 py-1 text-xs border-[color:var(--border)] text-[color:var(--text-muted)]"
                  onClick={() => handleChangePage("next")}
                  disabled={loading || !pagination.hasNextPage}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
