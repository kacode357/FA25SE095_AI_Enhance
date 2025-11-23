"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select/Select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ConversationItemResponse } from "@/types/chat/chat.response";
import type { CourseItem } from "@/types/courses/course.response";
import { useState } from "react";
import ConversationList from "./ConversationList";
import CourseUsersList from "./CourseUsersList";
import MessageThread from "./MessageThread";

type Props = {
  courses?: CourseItem[];
  loadingCourses?: boolean;
  selectedCourseId?: string | undefined;
  onChangeCourseId?: (id?: string) => void;
};

export default function MessagesScreen({ courses, loadingCourses, selectedCourseId, onChangeCourseId }: Props) {
  const [selectedConv, setSelectedConv] = useState<ConversationItemResponse | null>(null);
  const [courseIdFallback, setCourseIdFallback] = useState<string>("");

  const courseId = selectedCourseId ?? courseIdFallback;
  const setCourseId = (val: string | undefined) => {
    if (onChangeCourseId) onChangeCourseId(val);
    else setCourseIdFallback(val ?? "");
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-4">
      {/* Left column */}
      <div className="w-full md:w-[320px] flex-shrink-0 flex flex-col gap-3 min-w-0">
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

        <Tabs defaultValue="conversations" className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="conversations">Conversation</TabsTrigger>
            <TabsTrigger value="courseUsers">People in class</TabsTrigger>
          </TabsList>
          <div className="flex-1 min-h-0">
            <TabsContent value="conversations" className="h-full mt-2">
              <ConversationList
                selectedId={selectedConv?.id}
                onSelect={(c) => setSelectedConv(c)}
                courseIdFilter={courseId || undefined}
              />
            </TabsContent>
            <TabsContent value="courseUsers" className="h-full mt-2">
              <CourseUsersList
                courseId={courseId || undefined}
                onSelectUser={() => {}}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Right column */}
      <div className="flex-1 min-h-0">
        <MessageThread conversation={selectedConv} />
      </div>
    </div>
  );
}
