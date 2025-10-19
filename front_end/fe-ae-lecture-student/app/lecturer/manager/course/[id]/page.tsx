"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { FileSpreadsheet, FolderPlus, Shuffle } from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CourseStatus } from "@/types/courses/course.response";
import AssignmentsPanel from "./assignments/AssignmentsPanel";
import CreateGroupSheet from "./components/CreateGroupSheet";
import GroupsPanel from "./components/GroupsPanel";
import ImportStudentsDialog from "./components/ImportStudentsDialog";
import StudentList from "./components/StudentListImport";
import RandomizeGroupDialog from "./group/[groupId]/components/RandomizeGroupDialog";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const action = search?.get?.("action") || null;

  const { data: course, fetchCourseById } = useGetCourseById();

  const [openGroup, setOpenGroup] = useState(false);
  const [openRandomize, setOpenRandomize] = useState(false);
  const [groupsRefresh, setGroupsRefresh] = useState(0);
  const [studentsRefresh, setStudentsRefresh] = useState(0);
  const [openImport, setOpenImport] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [activeTab, setActiveTab] = useState<"students" | "groups" | "assignments">("students");

  useEffect(() => {
    if (id) fetchCourseById(id);
  }, [id, fetchCourseById]);

  useEffect(() => {
    setOpenImport(action === "import");
    setOpenGroup(action === "createGroup");
    setOpenAssign(action === "createAssign");
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
              {isActive && (
                <Button
                  className="h-9 text-xs cursor-pointer bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                  onClick={() => setOpenImport(true)}
                >
                  <FileSpreadsheet className="size-4 mr-1" />
                  Import Students
                </Button>
              )}
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
                <div className="flex items-center gap-2">
                  <Button
                    className="h-9 text-xs cursor-pointer bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-1"
                    onClick={() => setOpenRandomize(true)}
                  >
                    <Shuffle className="size-4 mr-1" />
                    Randomize
                  </Button>

                  <Button
                    className="h-9 text-xs cursor-pointer bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
                    onClick={() => setOpenGroup(true)}
                  >
                    <FolderPlus className="size-4 mr-1" />
                    Create Group
                  </Button>
                </div>
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
            refreshSignal={0}
          />
        </TabsContent>
      </Tabs>

      <ImportStudentsDialog
        open={openImport}
        onOpenChange={(v) => {
          setOpenImport(v);
          if (!v) clearAction();
        }}
        courseId={id}
        onImported={() => setStudentsRefresh((v) => v + 1)}
      />

      <CreateGroupSheet
        open={openGroup}
        onOpenChange={(v) => {
          setOpenGroup(v);
          if (!v) clearAction();
        }}
        courseId={id}
        onCreated={() => setGroupsRefresh((v) => v + 1)}
      />

      <Dialog open={openRandomize} onOpenChange={setOpenRandomize}>
        <DialogContent className="sm:max-w-lg">
          <RandomizeGroupDialog
            courseId={id}
            onClose={() => setOpenRandomize(false)}
            onRandomized={() => setGroupsRefresh((v) => v + 1)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
