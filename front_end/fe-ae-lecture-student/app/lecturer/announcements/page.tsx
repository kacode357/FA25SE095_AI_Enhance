"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import PaginationBar from "@/components/common/pagination-all";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useLecturerAnnouncements } from "@/hooks/announcements/useLecturerAnnouncements";
import type { AnnouncementItem } from "@/types/announcements/announcement.response";
import { dayLabel, parseServerDate, timeHHmm } from "@/utils/chat/time";
import { normalizeAndSanitizeHtml } from "@/utils/sanitize-html";

function formatAudience(audience: AnnouncementItem["audience"]) {
    switch (audience) {
        case 0:
            return "All users";
        case 1:
            return "Students";
        case 2:
            return "Lecturers";
        default:
            return "Unknown";
    }
}

function formatTime(ts?: string) {
    if (!ts) return "";
    const d = parseServerDate(ts);
    if (Number.isNaN(d.getTime())) return "";
    return `${dayLabel(d)} • ${timeHHmm(d)}`;
}

export default function LecturerAnnouncementsPage() {
    const { loading, items, pagination, fetchLecturerAnnouncements } =
        useLecturerAnnouncements();

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

    useEffect(() => {
        fetchLecturerAnnouncements({
            page: currentQuery.page,
            pageSize: currentQuery.pageSize,
            searchTerm: currentQuery.searchTerm || undefined,
        });
    }, [fetchLecturerAnnouncements, currentQuery.page, currentQuery.pageSize, currentQuery.searchTerm]);

    const handleSearch = () => {
        const next = { ...currentQuery, page: 1, searchTerm: searchInput.trim() || undefined };
        setCurrentQuery(next);
        fetchLecturerAnnouncements(next);
    };

    const handleClear = () => {
        setSearchInput("");
        const next = { ...currentQuery, page: 1, searchTerm: undefined };
        setCurrentQuery(next);
        fetchLecturerAnnouncements(next);
    };

    const changePage = (dir: "prev" | "next") => {
        if (dir === "prev" && !pagination.hasPreviousPage) return;
        if (dir === "next" && !pagination.hasNextPage) return;
        const nextPage = dir === "prev" ? pagination.page - 1 : pagination.page + 1;
        const next = { ...currentQuery, page: nextPage };
        setCurrentQuery(next);
        fetchLecturerAnnouncements(next);
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <section className="card flex flex-col gap-4 px-6 py-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight text-nav">Lecturer announcements</h1>
                        <p className="mt-1 text-sm text-[color:var(--text-muted)]">Announcements relevant to lecturers.</p>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <div className="flex-1 sm:w-72">
                            <Input
                                placeholder="Search announcements..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
                                className="input !px-3 !py-2 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button type="button" size="sm" className="btn btn-yellow-slow text-xs sm:text-sm px-3 py-2" onClick={handleSearch} disabled={loading}>
                                Search
                            </Button>
                            <Button type="button" variant="outline" size="sm" className="text-xs sm:text-sm border-brand/60 text-brand px-3 py-2" onClick={handleClear} disabled={loading && !searchInput}>
                                Clear
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-2 rounded-2xl border border-[color:var(--border)] bg-white">
                    <div className="flex items-center justify-between rounded-t-2xl border-b border-[color:var(--border)] px-4 py-3">
                        <h2 className="text-sm font-medium text-nav">All announcements</h2>
                        <p className="text-xs text-[color:var(--text-muted)]">{pagination.totalItems > 0 ? `${pagination.totalItems} items` : "No items"}</p>
                    </div>

                    <div className="scrollbar-stable max-h-[480px] overflow-y-auto">
                        {loading && !items.length ? (
                            <div className="flex h-40 items-center justify-center text-xs text-[color:var(--text-muted)]">Loading announcements...</div>
                        ) : !items.length ? (
                            <div className="flex h-40 flex-col items-center justify-center px-4 text-center text-sm text-[color:var(--text-muted)]">
                                <p>No announcements yet.</p>
                                <p className="mt-1 text-xs opacity-80">When an announcement is posted, it will appear here.</p>
                            </div>
                        ) : (
                            <ul className="divide-y divide-[color:var(--border)]">
                                {items.map((it) => (
                                    <li key={it.id}>
                                        <Link href={`/lecturer/announcements/${it.id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition">
                                            <div className="min-w-0 flex-1 flex items-start gap-3">
                                                {/* avatar */}
                                                <div className="shrink-0">
                                                    {it.creatorProfilePictureUrl ? (
                                                        <Image src={it.creatorProfilePictureUrl} alt={it.createdByName || "avatar"} width={40} height={40} className="rounded-full" />
                                                    ) : (
                                                        <div className="h-10 w-10 overflow-hidden rounded-full bg-slate-100" />
                                                    )}
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-slate-900">{it.title}</p>

                                                    <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                                                        {it.createdByName && <span className="font-medium">{it.createdByName}</span>}
                                                        {it.createdByName && it.publishedAt && " • "}
                                                        {it.publishedAt && <span>{formatTime(it.publishedAt)}</span>}
                                                    </p>

                                                    <div className="mt-2 text-xs text-[color:var(--text-muted)]">
                                                        <span className="inline-flex rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-brand">{formatAudience(it.audience)}</span>
                                                        {it.content ? (
                                                            <div
                                                                className="ml-3 line-clamp-2"
                                                                dangerouslySetInnerHTML={{ __html: normalizeAndSanitizeHtml(it.content) }}
                                                            />
                                                        ) : (
                                                            <span className="ml-3 opacity-80">No content</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <ChevronRight className="h-4 w-4 shrink-0 text-nav-active" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {items.length > 0 && (
                        <PaginationBar
                            page={pagination.page || 1}
                            totalPages={pagination.totalPages || 1}
                            totalCount={pagination.totalItems}
                            loading={loading}
                            onPageChange={(p: number) => {
                                const next = { ...currentQuery, page: p };
                                setCurrentQuery(next);
                                fetchLecturerAnnouncements(next);
                            }}
                        />
                    )}
                </div>
            </section>
        </div>
    );
}
