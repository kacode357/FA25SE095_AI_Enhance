"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileSpreadsheet, FolderPlus, PlusCircle } from "lucide-react";
import ImportStudentsDialog from "./components/ImportStudentsDialog";
import CreateGroupSheet from "./components/CreateGroupSheet";
import CreateAssignmentSheet from "./components/CreateAssignmentSheet";

// ⚠️ UI only: giả lập data qua URL param (id). Thực tế sẽ fetch theo id.
export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [openImport, setOpenImport] = useState(false);
  const [openGroup, setOpenGroup] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);

  // demo info (UI-only)
  const demo = useMemo(
    () => ({
      id,
      courseCode: "BIO150",
      courseCodeTitle: "General Biology",
      lecturerName: "Smith John",
      term: "Spring 2025",
      year: 2025,
      department: "Biology",
      description: "Foundations of biology including cell structure, genetics and ecology.",
    }),
    [id]
  );

  return (
    <div className="p-3 space-y-3">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/manager/course">
            <Button variant="ghost" className="h-8 px-2">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <div className="text-sm text-slate-500">Course Detail</div>
            <h1 className="text-lg font-semibold text-slate-800">
              {demo.courseCode} — {demo.courseCodeTitle}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge className="text-[10px]">{demo.term} • {demo.year}</Badge>
              <Badge variant="outline" className="text-[10px]">{demo.department}</Badge>
              <Badge variant="secondary" className="text-[10px]">{demo.lecturerName}</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button className="h-8" onClick={() => setOpenImport(true)}>
            <FileSpreadsheet className="size-4 mr-2" />
            Import Excel
          </Button>
          <Button  className="h-8" onClick={() => setOpenGroup(true)}>
            <FolderPlus className="size-4 mr-2" />
            Create Group
          </Button>
          <Button className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setOpenAssign(true)}>
            <PlusCircle className="size-4 mr-2" />
            Create Assignment
          </Button>
        </div>
      </div>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Overview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          {demo.description}
        </CardContent>
      </Card>

      {/* Tabs: Students / Groups / Assignments (UI only) */}
      <Tabs defaultValue="students" className="w-full">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="groups">Groups</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
        </TabsList>

        <TabsContent value="students" className="space-y-2">
          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Groups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500">
                No groups yet. Click <b>Create Group</b> to make one.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Assignments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-slate-500">
                No assignments yet. Click <b>Create Assignment</b> to add one.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs/Sheets */}
      <ImportStudentsDialog open={openImport} onOpenChange={setOpenImport} />
      <CreateGroupSheet open={openGroup} onOpenChange={setOpenGroup} />
      <CreateAssignmentSheet open={openAssign} onOpenChange={setOpenAssign} />
    </div>
  );
}
