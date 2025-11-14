"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ConversationItemResponse } from "@/types/chat/chat.response";
import { useState } from "react";
import ConversationList from "./ConversationList";
import CourseUsersList from "./CourseUsersList";
import MessageThread from "./MessageThread";

export default function MessagesScreen() {
  const [selectedConv, setSelectedConv] = useState<ConversationItemResponse | null>(null);
  const [courseId, setCourseId] = useState<string>("");

  return (
    <div className="h-[calc(100vh-140px)] grid grid-cols-12 gap-4">
      {/* Left column */}
      <div className="col-span-12 md:col-span-4 xl:col-span-3 flex flex-col gap-3">
        <div className="p-3 border rounded-lg">
          <Label htmlFor="courseId" className="text-sm">Filter by Course</Label>
          <Input
            id="courseId"
            placeholder="Nhập CourseId (GUID)"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          />
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
      <div className="col-span-12 md:col-span-8 xl:col-span-9 min-h-0">
        <MessageThread conversation={selectedConv} />
      </div>
    </div>
  );
}
