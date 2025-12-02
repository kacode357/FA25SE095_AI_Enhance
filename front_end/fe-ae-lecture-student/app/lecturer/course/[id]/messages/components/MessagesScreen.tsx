"use client";

import { useGetConversations } from "@/hooks/chat/useGetConversations";
import type { ConversationItemResponse } from "@/types/chat/chat.response";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import CourseUsersList from "./CourseUsersList";
import MessageThread from "./MessageThread";

type Props = { courseId: string; courseName?: string };

export default function MessagesScreen({ courseId, courseName }: Props) {
    const router = useRouter();
    const { getConversations } = useGetConversations();
    const [conversations, setConversations] = useState<ConversationItemResponse[]>([]);
    const [selectedConv, setSelectedConv] = useState<ConversationItemResponse | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const loadingRef = useRef(false);
    const lastLoadedCourseIdRef = useRef<string | null>(null);

    // Load conversations once per courseId; avoid infinite loops from function identity changes
    useEffect(() => {
        let cancelled = false;
        if (!courseId) return;
        if (loadingRef.current) return;
        if (lastLoadedCourseIdRef.current === courseId && conversations.length > 0) return;

        loadingRef.current = true;
        (async () => {
            try {
                const res = await getConversations({ courseId });
                const list = Array.isArray(res)
                    ? res
                    : Array.isArray((res as any)?.conversations)
                        ? (res as any).conversations
                        : [];
                const arr = (list as ConversationItemResponse[]) || [];
                if (cancelled) return;
                setConversations(arr);
                if (arr.length > 0) {
                    const first = arr[0];
                    // Only update selection if different to avoid extra renders
                    if (selectedConv?.id !== first.id) setSelectedConv(first);
                    const firstUserId = String(first.otherUserId);
                    if (selectedId !== firstUserId) setSelectedId(firstUserId);
                }
                lastLoadedCourseIdRef.current = courseId;
            } finally {
                loadingRef.current = false;
            }
        })();

        return () => {
            cancelled = true;
        };
        // Intentionally exclude getConversations from deps to avoid re-fetch loops
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [courseId]);

    const onSelectUser = useCallback((u: { id: string; fullName: string }) => {
        setSelectedId(String(u.id));
        const found = conversations.find((c) => String(c.otherUserId) === String(u.id));
        if (found) {
            setSelectedConv(found);
            return;
        }
        const placeholder: ConversationItemResponse = {
            id: "", // placeholder until server provides a conversation id
            courseId: courseId,
            courseName: null,
            otherUserId: String(u.id),
            otherUserName: u.fullName,
            otherUserRole: "",
            lastMessagePreview: null,
            lastMessageAt: null,
            unreadCount: 0,
        };
        setSelectedConv(placeholder);
    }, [conversations, courseId]);

    return (
        <div className="h-[calc(100vh-140px)] flex gap-4">
            {/* Left column */}
            <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col gap-3 min-w-0">
                <div className="p-3 border rounded-lg border-slate-300 bg-white">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            aria-label="Back"
                            onClick={() => router.back()}
                            className="inline-flex items-center bg-slate-200 px-2 py-1 cursor-pointer text-lg rounded-full text-slate-600 hover:bg-slate-300"
                        >
                            ←
                        </button>
                        <div className="flex flex-col gap-1">
                            <div className="text-sm font-medium text-slate-600">Chat In Course</div>
                            <div className="text-xs text-slate-500">{courseName || conversations[0]?.courseName || `Course ID: ${courseId}`}</div>
                        </div>
                    </div>
                </div>
                <div className="flex-1 min-h-0">
                    <CourseUsersList
                        courseId={courseId}
                        selectedId={selectedId}
                        onSelectUser={(u) => onSelectUser({ id: u.id, fullName: u.fullName })}
                    />
                </div>
            </div>

            {/* Right column: message thread */}
            <div className="flex-1 min-h-0">
                <MessageThread conversation={selectedConv ?? undefined} userId={selectedId ?? undefined} />
            </div>
        </div>
    );
}
