"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { FolderPlus } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CreateGroupSheet from "./components/CreateGroupSheet";
import GroupsPanel from "./components/GroupsPanel";
import StudentList from "./components/StudentListImport";
import AssignmentsPanel from "./assignments/AssignmentsPanel"; // Giữ lại import này

import { CourseStatus } from "@/types/courses/course.response";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const action = search?.get?.("action") || null;

  const { data: course, fetchCourseById } = useGetCourseById();

  const [openGroup, setOpenGroup] = useState(false);

  const [activeTab, setActiveTab] = useState<"students" | "groups" | "assignments">("students");
  const [groupsRefresh, setGroupsRefresh] = useState(0);
  const [studentsRefresh, setStudentsRefresh] = useState(0);
  // assignmentsRefresh bị xoá

  // 🚀 Fetch course info once
  useEffect(() => {
    if (id) fetchCourseById(id);
  }, [id, fetchCourseById]);

  // Sync modals với ?action (chỉ còn lại logic Groups)
  useEffect(() => {
    setOpenGroup(action === "createGroup");
  }, [action]);

  function clearAction() {
    const url = new URL(window.location.href);
    url.searchParams.delete("action");
    router.replace(url.pathname + url.search);
  }

  const isActive = course?.status === CourseStatus.Active;

  return (
    <>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList>
          <TabsTrigger className="cursor-pointer" value="students">
            Students
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="groups">
            Groups
          </TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="assignments">
            Assignments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base">Student List</CardTitle>
              {/* Nút Import Students đã bị xoá */}
            </CardHeader>

            <CardContent>
              <StudentList courseId={id} refreshSignal={studentsRefresh} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-2">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <CardTitle className="text-base">Groups List</CardTitle>

              {isActive && (
                <Button
                  className="h-9 text-xs cursor-pointer bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                  onClick={() => setOpenGroup(true)}
                >
                  <FolderPlus className="size-4 mr-1" />
                  Create Group
                </Button>
              )}
            </CardHeader>

            <CardContent>
              <GroupsPanel courseId={id} refreshSignal={groupsRefresh} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-2">
          <AssignmentsPanel
            courseId={id}
            isActive={isActive ?? false}
            refreshSignal={0} // Giá trị hardcode 0 vì assignmentsRefresh đã bị xoá
            // onNew property bị xoá vì logic tạo mới Assignment đã bị xoá
          />
        </TabsContent>
      </Tabs>

      <CreateGroupSheet
        open={openGroup}
        onOpenChange={(v) => {
          setOpenGroup(v);
          if (!v) clearAction();
        }}
        courseId={id}
        onCreated={() => setGroupsRefresh((v) => v + 1)}
      />
      {/* Các component ImportStudentsDialog và CreateAssignmentSheet đã bị xoá */}
    </>
  );
}