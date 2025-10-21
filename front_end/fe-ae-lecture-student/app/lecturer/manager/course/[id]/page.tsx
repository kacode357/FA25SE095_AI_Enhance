"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import {
  ChevronRight,
  FileSpreadsheet,
  FolderPlus,
  Shuffle,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CourseStatus } from "@/types/courses/course.response";
import AssignmentsPanel from "./assignments/AssignmentsPanel";
import CreateGroupSheet from "./components/CreateGroupSheet";
import GroupsPanel from "./components/GroupsPanel";
import ImportStudentsDialog from "./components/ImportStudentsDialog";
import StudentList from "./components/StudentListImport";
import RandomizeGroupDialog from "./group/[groupId]/components/RandomizeGroupDialog";

function renderStatusBadge(status?: CourseStatus) {
  switch (status) {
    case CourseStatus.PendingApproval:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
          Pending Approval
        </span>
      );
    case CourseStatus.Active:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
          Active
        </span>
      );
    case CourseStatus.Inactive:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
          Inactive
        </span>
      );
    case CourseStatus.Rejected:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
          Rejected
        </span>
      );
    default:
      return (
        <span className="px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600">
          Unknown
        </span>
      );
  }
}

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
  const [activeTab, setActiveTab] =
    useState<"students" | "groups" | "assignments">("students");

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
    <div className="space-y-6 px-3">
      <nav
        className="flex items-center text-sm text-slate-500"
        aria-label="Breadcrumb"
      >
        <a
          href="/lecturer/manager/course"
          className="text-emerald-600 hover:underline font-medium"
        >
          Courses
        </a>
        <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
        <span className="text-slate-700 font-semibold">
          {course?.name || "Course Detail"}
        </span>
      </nav>

      {/* HEADER */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">
            {course?.courseCode} - {course?.courseCodeTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {course?.name || "Untitled Course"}
          </p>
        </div>

        <div className="flex items-center">{renderStatusBadge(course?.status)}</div>
      </div>

      {/* TABS */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        <TabsList className="border-b border-slate-200 bg-transparent w-full justify-start gap-6 px-1 mb-3">
          <TabsTrigger
            className="data-[state=active]:border-b-2 pt-3 cursor-pointer data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 pb-3 text-slate-600 text-sm font-medium"
            value="students"
          >
            Students
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:border-b-2 pt-3inactivate cursor-pointer data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 pb-3 text-slate-600 text-sm font-medium"
            value="groups"
          >
            Groups
          </TabsTrigger>
          <TabsTrigger
            className="data-[state=active]:border-b-2 pt-3inactivate cursor-pointer data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700 pb-3 text-slate-600 text-sm font-medium"
            value="assignments"
          >
            Assignments
          </TabsTrigger>
        </TabsList>

        {/* STUDENTS TAB */}
        <TabsContent value="students">
          <Card>
            <CardHeader className="flex items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">
                Student List
              </CardTitle>

              {isActive && (
                <Button
                  className="h-9 text-xs cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
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

        {/* GROUPS TAB */}
        <TabsContent value="groups">
          <Card>
            <CardHeader className="flex items-center justify-between pb-3">
              <CardTitle className="text-base font-semibold">Groups</CardTitle>

              {isActive && (
                <div className="flex items-center gap-2">
                  <Button
                    className="h-9 cursor-pointer text-xs bg-gray-600 hover:bg-gray-700 text-white flex items-center gap-1"
                    onClick={() => setOpenRandomize(true)}
                  >
                    <Shuffle className="size-4 mr-1" />
                    Randomize
                  </Button>
                  <Button
                    className="h-9 text-xs cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
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

        {/* ASSIGNMENTS TAB */}
        <TabsContent value="assignments">
          <AssignmentsPanel
            courseId={id}
            isActive={isActive ?? false}
            refreshSignal={0}
          />
        </TabsContent>
      </Tabs>

      {/* DIALOGS */}
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
    </div>
  );
}
