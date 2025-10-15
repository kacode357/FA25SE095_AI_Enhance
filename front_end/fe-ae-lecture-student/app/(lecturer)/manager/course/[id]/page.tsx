"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetCourseById } from "@/hooks/course/useGetCourseById";
import { useImportStudentTemplate } from "@/hooks/enrollments/useImportStudentTemplate";
import { ArrowLeft, FileSpreadsheet, FolderPlus, HardDriveDownload, PlusCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import AssignmentsPanel from "./components/AssignmentsPanel";
import CreateAssignmentSheet from "./components/CreateAssignmentSheet";
import CreateGroupSheet from "./components/CreateGroupSheet";
import GroupsPanel from "./components/GroupsPanel";
import ImportStudentsDialog from "./components/ImportStudentsDialog";

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: course, loading, error, fetchCourseById } = useGetCourseById();
  const { downloadTemplate, loading: downloading } = useImportStudentTemplate();
  const [openImport, setOpenImport] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [activeTab, setActiveTab] = useState<"students" | "groups" | "assignments">("students");
  const [groupsRefresh, setGroupsRefresh] = useState(0);
  const [assignmentsRefresh, setAssignmentsRefresh] = useState(0);

  useEffect(() => {
    if (id) fetchCourseById(id);
  }, [id, fetchCourseById]);

  const title = useMemo(() => {
    if (!course) return "";
    const code = course.courseCode ?? "";
    const codeTitle = course.courseCodeTitle ?? course.name ?? "";
    return `${code} — ${codeTitle}`;
  }, [course]);

  return (
    <div className="p-3 space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/manager/course">
            <Button variant="ghost" className="h-8 px-2 cursor-pointer">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="text-sm text-slate-500">Course Detail</div>
            {loading ? (
              <div className="h-6 w-64 rounded bg-slate-100 animate-pulse" />
            ) : (
              <>
                <h1 className="text-lg font-semibold text-slate-800">
                  {title}
                </h1>
                {course && (
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {(course.term || course.year) && (
                      <Badge className="text-[10px]">
                        {course.term}
                        {course.term && course.year ? " • " : ""}
                        {course.year}
                      </Badge>
                    )}
                    {course.department && (
                      <Badge variant="outline" className="text-[10px]">{course.department}</Badge>
                    )}
                    {course.lecturerName && (
                      <Badge variant="secondary" className="text-[10px]">{course.lecturerName}</Badge>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "students" && (
            <div className="flex gap-5">
              <button
                onClick={downloadTemplate}
                disabled={downloading}
                className="flex cursor-pointer items-center gap-1 text-sm text-emerald-600 hover:text-emerald-800 underline disabled:opacity-50"
              >
                <HardDriveDownload className="size-4 mr-1" />
                {downloading ? "Downloading..." : "Download Template"}
              </button>

              <Button className="h-8 cursor-pointer" onClick={() => setOpenImport(true)}>
                <FileSpreadsheet className="size-4" />
                Import Students
              </Button>
            </div>
          )}
          {activeTab === "groups" && (
            <Button className="h-8 cursor-pointer" onClick={() => setOpenGroup(true)}>
              <FolderPlus className="size-4 mr-2" />
              Create Group
            </Button>
          )}
          {activeTab === "assignments" && (
            <Button className="h-8 cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setOpenAssign(true)}>
              <PlusCircle className="size-4 mr-2" />
              New Assignment
            </Button>
          )}
        </div>
      </div>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          {loading && <div className="h-4 w-72 rounded bg-slate-100 animate-pulse" />}
          {!loading && error && (
            <div className="text-red-600">{error}</div>
          )}
          {!loading && !error && (course?.description || "No description.")}
        </CardContent>
      </Card>

      {/* Tabs: Students / Groups / Assignments (UI only) */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList>
          <TabsTrigger className="cursor-pointer" value="students">Students</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="groups">Groups</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-2">
          <Card className="border-emerald-500">
            <CardHeader>
              <CardTitle className="text-base">Student List</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Placeholder UI – không gọi API */}
              <div className="text-sm text-slate-500">
                No students yet. Use <b>Import Excel</b> to add students.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="groups" className="space-y-2">
          <GroupsPanel courseId={id} refreshSignal={groupsRefresh} />
        </TabsContent>

        <TabsContent value="assignments" className="space-y-2">
          <AssignmentsPanel courseId={id} refreshSignal={assignmentsRefresh} />
        </TabsContent>
      </Tabs>

      {/* Dialogs/Sheets */}
      <ImportStudentsDialog open={openImport} onOpenChange={setOpenImport} />
      <CreateGroupSheet
        open={openGroup}
        onOpenChange={setOpenGroup}
        courseId={id}
        onCreated={() => setGroupsRefresh((v) => v + 1)}
      />
      <CreateAssignmentSheet
        open={openAssign}
        onOpenChange={setOpenAssign}
        courseId={id}
        onCreated={() => setAssignmentsRefresh((v) => v + 1)}
      />
    </div>
  );
}
