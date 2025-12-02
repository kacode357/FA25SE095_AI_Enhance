"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetUsersInCourse } from "@/hooks/chat/useGetUsersInCourse";
import { useChatHub } from "@/hooks/hubchat/useChatHub";
import { cn } from "@/lib/utils";
import type { CourseChatUserItemResponse } from "@/types/chat/chat.response";
import { getSavedAccessToken } from "@/utils/auth/access-token";
import { Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
    courseId?: string;
    /** When undefined courseId means "All", supply all course ids here */
    allCourseIds?: string[];
    selectedId?: string | null;
    onSelectUser?: (user: CourseChatUserItemResponse) => void;
};

export default function CourseUsersList({ courseId, allCourseIds, selectedId, onSelectUser }: Props) {
    const { getUsersInCourse, loading } = useGetUsersInCourse();
    const [users, setUsers] = useState<CourseChatUserItemResponse[]>([]);
    const [keyword, setKeyword] = useState("");
    const [bulkLoading, setBulkLoading] = useState(false);
    const autoSelectedRef = useRef(false);
    const onSelectRef = useRef(onSelectUser);
    const selectedIdRef = useRef(selectedId);

    useEffect(() => {
        onSelectRef.current = onSelectUser;
    }, [onSelectUser]);

    useEffect(() => {
        selectedIdRef.current = selectedId;
    }, [selectedId]);

    // Normalize to stable string id, guard against mixed number/string ids
    function normalizeUser(it: any): CourseChatUserItemResponse {
        const id = String(it?.id ?? it?.userId ?? it?.email ?? "");
        const fullName = String(it?.fullName ?? it?.name ?? "");
        const email = String(it?.email ?? "");
        const role = String(it?.role ?? "");
        // Clamp unreadCount: negative values are treated as 0 and hidden
        const rawUnread = Number(it?.unreadCount ?? it?.unread ?? 0);
        const unreadCount = rawUnread < 0 ? 0 : rawUnread;
        return {
            ...it,
            id,
            fullName,
            email,
            role,
            unreadCount,
        } as CourseChatUserItemResponse;
    }

    useEffect(() => {
        let mounted = true;
        autoSelectedRef.current = false;
        (async () => {
            // If a specific course is chosen
            if (courseId) {
                const res = await getUsersInCourse(courseId);
                if (!mounted) return;
                const incoming = Array.isArray(res)
                    ? res
                    : Array.isArray((res as any)?.users)
                        ? (res as any).users
                        : [];
                const normalized = (incoming as CourseChatUserItemResponse[]).map(normalizeUser);
                setUsers(normalized);
                if (!selectedIdRef.current && normalized.length > 0 && !autoSelectedRef.current) {
                    autoSelectedRef.current = true;
                    const first = normalized[0];
                    Promise.resolve().then(() => {
                        try {
                            onSelectRef.current?.(first);
                        } catch { }
                    });
                }
                return;
            }

            // If "All" is chosen and we have course ids to aggregate
            const ids = (allCourseIds ?? []).filter(Boolean);
            if (ids.length === 0) {
                setUsers([]);
                return;
            }

            setBulkLoading(true);
            try {
                const results = await Promise.allSettled(ids.map((id) => getUsersInCourse(id)));
                if (!mounted) return;
                const all: CourseChatUserItemResponse[] = [];
                for (const r of results) {
                    if (r.status === "fulfilled" && Array.isArray(r.value)) {
                        all.push(...r.value.map(normalizeUser));
                    } else if (r.status === "fulfilled" && Array.isArray((r.value as any)?.users)) {
                        all.push(...(r.value as any).users.map(normalizeUser));
                    }
                }
                // Deduplicate by user id
                const byId = new Map<string, CourseChatUserItemResponse>();
                for (const u of all) byId.set(String(u.id), u);
                const merged = Array.from(byId.values());
                setUsers(merged);
            } finally {
                setBulkLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, [courseId, allCourseIds]);

    // Live unread updates via hub events
    const { connect, disconnect } = useChatHub({
        getAccessToken: () => getSavedAccessToken() ?? "",
        onUnreadCountChanged: (p) => {
            if (!p?.userId) return;
            setUsers((prev) => prev.map((u) => (String(u.id) === String(p.userId) ? { ...u, unreadCount: Number(p.unreadCount || 0) } : u)));
        },
        onUnreadCountsBatch: (items) => {
            if (!items?.length) return;
            setUsers((prev) => {
                const map = new Map(prev.map((u) => [String(u.id), u]));
                for (const it of items) {
                    const id = String(it.userId);
                    const exist = map.get(id);
                    if (exist) map.set(id, { ...exist, unreadCount: Number(it.unreadCount || 0) });
                }
                return Array.from(map.values());
            });
        },
    });

    const disconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const hasContext = !!courseId || !!(allCourseIds && allCourseIds.length > 0);
        if (!hasContext) {
            // schedule a delayed disconnect when no context
            if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
            disconnectTimerRef.current = setTimeout(() => {
                void disconnect();
                disconnectTimerRef.current = null;
            }, 1500);
            return;
        }

        // cancel any pending disconnect and connect
        if (disconnectTimerRef.current) {
            clearTimeout(disconnectTimerRef.current);
            disconnectTimerRef.current = null;
        }
        connect().catch(() => { /* ignore */ });

        return () => {
            // delayed disconnect to avoid racing with other components
            if (disconnectTimerRef.current) clearTimeout(disconnectTimerRef.current);
            disconnectTimerRef.current = setTimeout(() => {
                void disconnect();
                disconnectTimerRef.current = null;
            }, 1500);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId, allCourseIds, connect, disconnect]);

    const filtered = useMemo(() => {
        const kw = keyword.trim().toLowerCase();
        // Make sure users is an array at runtime
        const all = Array.isArray(users) ? users : [];
        if (!kw) return all;
        return all.filter((u) =>
            [u.fullName, u.email, u.role]
                .filter(Boolean)
                .some((v) => String(v).toLowerCase().includes(kw))
        );
    }, [users, keyword]);

    return (
        <Card className="h-full gap-0 w-full flex flex-col border-slate-200 p-3 rounded-xl shadow-sm">
            {/* Search Box */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search users..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="pl-10 text-sm rounded-lg bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:ring-violet-500"
                    disabled={!courseId && !(allCourseIds && allCourseIds.length > 0)}
                />
            </div>

            {/* Users List */}
            {(!courseId && !(allCourseIds && allCourseIds.length > 0)) ? (
                <div className="text-sm text-slate-400 p-2">Select a course or choose All to view users.</div>
            ) : (
                <ScrollArea className="flex-1 min-h-0">
                    <ul className="space-y-2 ">
                        {(loading || bulkLoading) && users.length === 0 ? (
                            <li className="text-sm text-slate-400 p-2">Loading...</li>
                        ) : filtered.length === 0 ? (
                            <li className="text-sm text-slate-400 p-2">No users.</li>
                        ) : (
                            filtered.map((u) => (
                                <li key={u.id}>
                                    <button
                                        onClick={() => onSelectRef.current?.(u)}
                                        className={cn(
                                            "w-full text-left p-3 mt-1 rounded-xl cursor-pointer transition flex items-center gap-3 group border border-transparent",
                                            "hover:bg-violet-50 hover:border-violet-100",
                                            selectedId === u.id &&
                                            "bg-violet-100 border-violet-300 shadow-sm"
                                        )}
                                    >
                                        {/* Avatar */}
                                        <div className="w-14 h-11 rounded-full bg-violet-200 text-violet-700 flex items-center justify-center font-semibold">
                                            {(u.fullName || "?").trim().charAt(0).toUpperCase()}
                                        </div>

                                        {/* Text */}
                                        <div className="flex items-center w-full">
                                            <div className="flex-1 min-w-0">
                                                <span className="font-medium text-sm line-clamp-1">
                                                    {u.fullName}
                                                </span>
                                                <span className={cn("text-xs mt-1 block line-clamp-1", u.unreadCount > 0 ? "text-violet-600" : "text-slate-500")}>
                                                    {u.unreadCount > 0 ? `${u.unreadCount} new messages` : (u.email || "No email")}
                                                </span>
                                            </div>
                                            <div className="ml-auto flex items-center">
                                                {Number(u.unreadCount) > 0 ? (
                                                    <Badge className="bg-violet-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                                                        {Number(u.unreadCount) > 99 ? `99+` : String(u.unreadCount)}
                                                    </Badge>
                                                ) : null}
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))
                        )}
                    </ul>
                </ScrollArea>
            )}
        </Card>
    );
}
