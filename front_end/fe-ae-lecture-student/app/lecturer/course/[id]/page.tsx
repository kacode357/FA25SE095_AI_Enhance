"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { Book, ChevronRight, FileSpreadsheet, FolderPlus, Shuffle } from "lucide-react";
import { useParams, usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import CreateGroupSheet from "./components/CreateGroupSheet";

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

    const tabParam = search?.get?.("tab");
    if (tabParam && (tabParam === "students" || tabParam === "groups" || tabParam === "assignments")) {
      setActiveTab(tabParam as any);
    }
  }, [action]);

  function clearAction() {
    const url = new URL(window.location.href);
    url.searchParams.delete("action");
    router.replace(url.pathname + url.search);
  }

  const isActive = course?.status === CourseStatus.Active;

  const pathname = usePathname();

  const isEditRoute = pathname?.includes(`/lecturer/course/${id}/course`);
  const isDetailRoute = !isEditRoute && pathname?.includes(`/lecturer/course/${id}`);

  return (
    <div className="space-y-0 px-3">
      <nav aria-label="Breadcrumb" className="text-[12px] select-none overflow-hidden mt-1.5 mr-3">
        <div className="flex items-center justify-between">
          <ol className="flex items-center gap-1 text-slate-500 flex-nowrap overflow-hidden">
            <li className="flex flex-row gap-0 hover:text-violet-800 items-center">
              <Book className="size-4" />
              <button
                onClick={() => router.push('/lecturer/course')}
                className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition max-w-[130px] truncate"
              >
                Courses Management
              </button>
            </li>

            <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />

              <li className={isEditRoute ? "font-medium cursor-text text-slate-900 max-w-[150px] truncate" : "text-slate-500 max-w-[150px] truncate"}>
                <span className="flex items-center gap-2">
                  {course?.courseCode ? (
                    <button
                      onClick={() => router.push(id ? `/lecturer/course/${id}/course` : "/lecturer/course")}
                      className="px-1 py-0.5 cursor-pointer rounded hover:text-violet-800 transition max-w-[220px] truncate text-left"
                      title={course?.courseCodeTitle}
                    >
                      {`${course.courseCode} — ${course.courseCodeTitle}`}
                    </button>
                  ) : (
                    "Course Detail"
                  )}
                </span>
              </li>
              {id && (
                <>
                  <ChevronRight className="size-3 text-slate-400 hidden sm:inline" />
                  <li className={isDetailRoute ? "font-medium text-slate-900 max-w-[120px] truncate" : "text-slate-500 max-w-[120px] truncate"}>{id}</li>
                </>
              )}
          </ol>

          <div className="flex text-sm items-center gap-2">
              {/* When clicked, course title (below) will navigate to EditCourse page. Back button removed as requested. */}
          </div>
        </div>
      </nav>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as any);
          try {
            const url = new URL(window.location.href);
            url.searchParams.set("tab", v as string);
            router.replace(url.pathname + url.search);
          } catch (err) {
            // ignore - window might be undefined during SSR (shouldn't happen in client)
          }
        }}
        className="w-full"
      >
        {/* Underline style tabs */}
        <TabsList className="mt-4 mb-1 inline-flex items-center gap-5 bg-transparent px-0 self-start">
          <TabsTrigger
            className="relative -mb-px cursor-pointer pb-2 text-sm font-medium tracking-wide text-slate-600 hover:text-indigo-600 transition-colors focus-visible:outline-none focus:ring-0 data-[state=active]:text-indigo-600 data-[state=active]:font-semibold data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:-bottom-[1px] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-indigo-600 data-[state=active]:after:rounded-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0"
            value="students"
          >
            Students
          </TabsTrigger>
          <TabsTrigger
            className="relative -mb-px cursor-pointer pb-2 text-sm font-medium tracking-wide text-slate-600 hover:text-indigo-600 transition-colors focus-visible:outline-none focus:ring-0 data-[state=active]:text-indigo-600 data-[state=active]:font-semibold data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:-bottom-[1px] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-indigo-600 data-[state=active]:after:rounded-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0"
            value="groups"
          >
            Groups
          </TabsTrigger>
          <TabsTrigger
            className="relative -mb-px cursor-pointer pb-2 text-sm font-medium tracking-wide text-slate-600 hover:text-indigo-600 transition-colors focus-visible:outline-none focus:ring-0 data-[state=active]:text-indigo-600 data-[state=active]:font-semibold data-[state=active]:after:absolute data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:-bottom-[1px] data-[state=active]:after:h-[2px] data-[state=active]:after:bg-indigo-600 data-[state=active]:after:rounded-sm data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:ring-0"
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
                      <Shuffle className="size-4 mr-1" /> Randomize
                    </Button>
                    <Button
                      className="btn btn-gradient-slow text-xs text-white"
                      onClick={() => setOpenGroup(true)}
                    >
                      <FolderPlus className="size-4 mr-1" /> Create Group
                    </Button>
                  </div>
                )}
              </CardHeader>
            )}

            <CardContent className="-mx-2">
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
      {/* Global Create Group sheet opened from the header button */}
      <CreateGroupSheet
        open={openGroup}
        onOpenChange={setOpenGroup}
        courseId={id}
        onCreated={() => setGroupsRefresh((v) => v + 1)}
      />
    </div>
  );
}
