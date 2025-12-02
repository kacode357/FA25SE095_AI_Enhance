"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select/Select";
import { useGetConversations } from "@/hooks/chat/useGetConversations";
import type { ConversationItemResponse } from "@/types/chat/chat.response";
import type { CourseItem } from "@/types/courses/course.response";
import { useState } from "react";
import CourseUsersList from "./CourseUsersList";
import MessageThread from "./MessageThread";

type Props = {
  courses?: CourseItem[];
  loadingCourses?: boolean;
  selectedCourseId?: string | undefined;
  onChangeCourseId?: (id?: string) => void;
};

export default function MessagesScreen({ courses, loadingCourses, selectedCourseId, onChangeCourseId }: Props) {
  const { getConversations } = useGetConversations();
  const [selectedConv, setSelectedConv] = useState<ConversationItemResponse | null>(null);
  const [courseIdFallback, setCourseIdFallback] = useState<string>("");

  const courseId = selectedCourseId ?? courseIdFallback;
  const setCourseId = (val: string | undefined) => {
    if (onChangeCourseId) onChangeCourseId(val);
    else setCourseIdFallback(val ?? "");
  };

  // When selecting a user, find an existing conversation or prepare a lightweight one
  async function handleSelectUser(user: { id: string; fullName: string }) {
    // Try to find an existing conversation for this user (respect current course if chosen)
    const res = await getConversations(courseId ? { courseId } : undefined);
    const list = Array.isArray(res)
      ? res
      : Array.isArray((res as any)?.conversations)
        ? (res as any).conversations
        : [];
    const found = list.find((c: any) => String(c.otherUserId) === String(user.id));
    if (found) {
      setSelectedConv(found as ConversationItemResponse);
      return;
    }
    // No existing conversation: create a light placeholder (id="" so thread won't fetch)
    const placeholder: ConversationItemResponse = {
      id: "",
      courseId: courseId ?? null,
      courseName: null,
      otherUserId: String(user.id),
      otherUserName: user.fullName,
      otherUserRole: "",
      lastMessagePreview: null,
      lastMessageAt: null,
      unreadCount: 0,
    };
    setSelectedConv(placeholder);
  }

  return (
    <div className="h-[calc(100vh-140px)] flex gap-4">
      {/* Left column */}
      <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col gap-3 min-w-0">
        {/* Filter */}
        <div className="p-3 border rounded-lg border-slate-300">
          <Label htmlFor="courseId" className="text-sm text-slate-500 mb-1">Filter by Course</Label>

          {courses && courses.length > 0 ? (
            <Select<string>
              value={courseId ?? "ALL"}
              options={[
                { value: "ALL", label: "All" },
                ...courses.map((c) => ({ value: c.id, label: (c.courseCode + " - " + c.courseCodeTitle) || c.id })),
              ]}
              placeholder="All"
              onChange={(v) => setCourseId(v === "ALL" ? undefined : v)}
              className="w-full max-w-[320px]"
              disabled={!!loadingCourses}
            />
          ) : (
            <Input
              id="courseId"
              placeholder="Nhập CourseId (GUID)"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
            />
          )}
        </div>

        {/* Users list */}
        <div className="flex-1 min-h-0">
          <CourseUsersList
            courseId={courseId || undefined}
            allCourseIds={(!courseId ? (courses?.map((c) => c.id) ?? []) : undefined)}
            onSelectUser={(u) => void handleSelectUser({ id: u.id, fullName: u.fullName })}
          />
        </div>
      </div>

      {/* Right column: message thread */}
      <div className="flex-1 min-h-0">
        <MessageThread conversation={selectedConv} />
      </div>
    </div>
  );
}
