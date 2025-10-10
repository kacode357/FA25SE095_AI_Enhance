"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useState } from "react";
import Breadcrumbs from "../components/Breadcrumbs";

function CreateCourseDialog({ open, onOpenChange, onCreate }: any) {
  // simple client-only dialog
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  return (
    <div className="flex items-center gap-2">
      <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1" onClick={() => {
        const nowIso = new Date().toISOString();
        const id = crypto.randomUUID();
        onCreate({ id, name: name || `Course ${id.slice(0,6)}`, code: code || `C-${id.slice(0,5)}`, createdAt: nowIso, updatedAt: nowIso });
        setName(""); setCode("");
      }}>
        <Plus className="size-4" />
        Create Course
      </Button>
    </div>
  );
}

export default function CoursesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [qTitle, setQTitle] = useState("");

  const filtered = items.filter(i => {
    if (!qTitle) return true;
    return (i.name || "").toLowerCase().includes(qTitle.toLowerCase()) || (i.code || "").toLowerCase().includes(qTitle.toLowerCase());
  });

  return (
    <div className="min-h-full flex flex-col p-2 bg-white text-slate-900">
      <Breadcrumbs items={[{ label: 'Manager', href: '/manager' }, { label: 'Courses', href: '/manager/courses' }]} />

      <header className="sticky top-0 z-20 mb-4 bg-white/90 supports-[backdrop-filter]:backdrop-blur p-2 rounded-md border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-slate-600 text-sm relative pl-3 before:content-['•'] before:absolute before:left-0 before:text-slate-500">
            Create and manage your courses. After creating a course you can create assignments scoped to it.
          </p>
          <div className="flex items-center gap-2">
            <input placeholder="Search name or code" value={qTitle} onChange={(e) => setQTitle(e.target.value)} className="h-8 w-48 rounded-md border px-2 text-xs" />
            <CreateCourseDialog open={false} onOpenChange={() => {}} onCreate={(c: any) => setItems(prev => [c, ...prev])} />
          </div>
        </div>
      </header>

      <Card className="bg-white border border-slate-200 flex-1 flex flex-col">
        <CardHeader className="flex flex-col gap-3">
          <CardTitle className="text-base text-slate-800">Courses <span className="text-slate-500">({filtered.length})</span></CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(c => (
              <div key={c.id} className="p-4 border rounded bg-white hover:shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-600">{c.code}</div>
                    <a href={`/manager/courses/${c.id}`} className="text-slate-900 font-semibold hover:text-emerald-700">{c.name}</a>
                    <div className="text-xs text-slate-500 mt-1">Updated: {new Date(c.updatedAt).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" className="h-8 px-2">Edit</Button>
                    <Button variant="ghost" className="h-8 px-2 text-red-600" onClick={() => { if (confirm('Delete course?')) setItems(prev => prev.filter(x => x.id !== c.id)); }}>Delete</Button>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full p-6 text-slate-600">No courses yet. Use "Create Course" to add one.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
