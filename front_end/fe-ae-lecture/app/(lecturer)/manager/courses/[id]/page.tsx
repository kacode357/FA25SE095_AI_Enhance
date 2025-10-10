"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";

export default function CourseDetail({ params }: any) {
  const { id } = params;
  const [assignments, setAssignments] = useState<any[]>([]);

  function createAssignment() {
    const now = new Date().toISOString();
    const a = { id: crypto.randomUUID(), title: `New Assignment ${assignments.length+1}`, code: `A-${assignments.length+1}`, due: now, status: 'draft', submissions: 0, total: 0, createdAt: now, updatedAt: now };
    setAssignments(prev => [a, ...prev]);
  }

  return (
    <div className="min-h-full p-2 bg-white text-slate-900">
      <Breadcrumbs items={[{ label: 'Manager', href: '/manager' }, { label: 'Courses', href: '/manager/courses' }, { label: `Course ${id}`, href: `/manager/courses/${id}` }]} />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Course {id}</h3>
          <p className="text-sm text-slate-600">Course details and assignments</p>
        </div>
        <div>
          <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-2" onClick={createAssignment}><Plus className="size-4" /> Create Assignment</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assignments ({assignments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="p-4 text-slate-600">No assignments yet. Click "Create Assignment" to add one scoped to this course.</div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {assignments.map(a => (
                <div key={a.id} className="p-3 border rounded flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-slate-900">{a.title}</div>
                    <div className="text-xs text-slate-500">{a.code}</div>
                  </div>
                  <div className="text-xs text-slate-600">{new Date(a.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
