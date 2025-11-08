"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import {
  Bookmark,
  BookOpen,
  ChevronRight,
  FileSpreadsheet,
  FolderPlus,
  Shuffle,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CourseStatus } from "@/types/courses/course.response";
import AssignmentsPanel from "./assignments/AssignmentsPanel";
import GroupsPanel from "./components/GroupsPanel";
import ImportStudentsSpecificCoursePage from "./components/ImportStudentsSpecificCoursePage";
import StudentList from "./components/StudentListImport";
import RandomizeGroupDialog from "./group/[groupId]/components/RandomizeGroupDialog";
import GroupDetailPage from "./group/[groupId]/page";

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
  const [openImport, setOpenImport] = useState(false); // legacy dialog state
  const [showInlineImport, setShowInlineImport] = useState(false); // inline page state
  const [openAssign, setOpenAssign] = useState(false);
  const [activeTab, setActiveTab] =
    useState<"students" | "groups" | "assignments">("students");
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    if (id) fetchCourseById(id);
  }, [id, fetchCourseById]);

  useEffect(() => {
  setOpenImport(action === "import");
  setShowInlineImport(action === "importCourse");
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
    <div className="space-y-3 px-3">
      <nav
        className="flex items-center text-sm mt-1.5 text-slate-500"
        aria-label="Breadcrumb"
      >
        <BookOpen className="size-4 mr-2 cursor-pointer" color="#c490d1" />
        <a
          href="/lecturer/manager/course"
          className="text-emerald-600 hover:underline font-medium"
        >
          Courses
        </a>
        <ChevronRight className="h-4 w-4 mx-2 text-slate-400" />
        <span className="text-violet-800 flex flex-row gap-1 items-center font-semibold">
          <Bookmark className="size-4 cursor-pointer" color="#8b5cf6" />
          {course?.courseCode
            ? `${course.courseCode} — ${course.courseCodeTitle}`
            : "Course Detail"}
        </span>

      </nav>

      {/* Gradient header removed as requested */}

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as any)}
        className="w-full"
      >
        {/* Underline style tabs */}
        <TabsList className="mt-2 mb-1 inline-flex items-center gap-5 bg-transparent px-0 self-start">
          <TabsTrigger
            className="relative -mb-px pb-2 text-sm font-medium tracking-wide text-slate-600 hover:text-indigo-600 transition-colors focus-visible:outline-none focus:ring-0 data-[state=active]:text-indigo-600 data-[state=active]:font-semibold data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:-bottom-[1px] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-indigo-600 data-[state=active]:after:rounded-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0"
            value="students"
          >
            Students
          </TabsTrigger>
          <TabsTrigger
            className="relative -mb-px pb-2 text-sm font-medium tracking-wide text-slate-600 hover:text-indigo-600 transition-colors focus-visible:outline-none focus:ring-0 data-[state=active]:text-indigo-600 data-[state=active]:font-semibold data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:-bottom-[1px] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-indigo-600 data-[state=active]:after:rounded-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0"
            value="groups"
          >
            Groups
          </TabsTrigger>
          <TabsTrigger
            className="relative -mb-px pb-2 text-sm font-medium tracking-wide text-slate-600 hover:text-indigo-600 transition-colors focus-visible:outline-none focus:ring-0 data-[state=active]:text-indigo-600 data-[state=active]:font-semibold data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:-bottom-[1px] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-indigo-600 data-[state=active]:after:rounded-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0"
            value="assignments"
          >
            Assignments
          </TabsTrigger>
        </TabsList>

        {/* STUDENTS TAB */}
        <TabsContent value="students">
          {showInlineImport ? (
            <ImportStudentsSpecificCoursePage
              courseId={id}
              onDone={() => {
                setShowInlineImport(false);
                setStudentsRefresh((v) => v + 1);
              }}
            />
          ) : (
            <Card className="border-slate-200 p-0 mr-3.5">
              <CardHeader className="flex items-center px-4 pt-4 justify-between">
                <CardTitle className="text-base flex flex-col text-[#000D83] font-semibold">
                  Student List
                  <p className="text-xs mt-1 text-slate-500 italic font-normal">Manage Current Students in this Course.</p>
                </CardTitle>
                {isActive && (
                  <Button
                    className="btn btn-gradient-slow text-xs text-white"
                    onClick={() => setShowInlineImport(true)}
                  >
                    <FileSpreadsheet className="size-4" /> Import Students
                  </Button>
                )}
              </CardHeader>
              <CardContent className="p-4">
                <StudentList courseId={id} refreshSignal={studentsRefresh} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="groups">
          <Card className="border-slate-200 p-0 mr-3.5">
            {/* Hide the header and action buttons when showing a selected group's details inline */}
            {!selectedGroupId && (
              <CardHeader className="flex items-center justify-between px-4 pt-4">
                <CardTitle className="text-base flex flex-col self-start text-[#000D83] font-semibold">
                  Groups
                  <p className="text-xs mt-1 text-slate-500 italic font-normal">Manage Current Groups in this Course.</p>
                </CardTitle>
                {isActive && (
                  <div className="flex items-center gap-4">
                    <Button
                      className="btn btn-gradient-slow text-xs text-white"
                      onClick={() => setOpenRandomize(true)}
                    >
                      <Shuffle className="size-4 mr-2" /> Randomize
                    </Button>
                    <Button
                      className="btn btn-gradient-slow text-xs text-white"
                      onClick={() => setOpenGroup(true)}
                    >
                      <FolderPlus className="size-4 mr-2" /> Create Group
                    </Button>
                  </div>
                )}
              </CardHeader>
            )}

            <CardContent className="pb-4">
              {selectedGroupId ? (
                <div className="pb-4 max-h-[calc(100vh-200px)]">
                  <GroupDetailPage
                    groupId={selectedGroupId}
                    courseId={id}
                    onDone={() => setSelectedGroupId(null)}
                  />
                </div>
              ) : (
                <GroupsPanel
                  courseId={id}
                  refreshSignal={groupsRefresh}
                  onViewDetails={(gid) => setSelectedGroupId(gid)}
                />
              )}
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
