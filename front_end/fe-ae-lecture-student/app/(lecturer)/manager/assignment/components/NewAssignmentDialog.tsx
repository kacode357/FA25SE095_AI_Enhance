"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function NewAssignmentDialog({ onCreate }: { onCreate: (payload: any) => void }) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [courseId, setCourseId] = useState<string | null>(null);

  // note: we don't call API here to fetch real courses; this is UI-only. We provide a simple text field for Course ID or leave null.
  return (
    <div className="flex items-center gap-2">
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-8 text-xs rounded-md border px-2" />
      <input placeholder="Code" value={code} onChange={(e) => setCode(e.target.value)} className="h-8 text-xs rounded-md border px-2" />
      <input placeholder="Course id (optional)" value={courseId ?? ""} onChange={(e) => setCourseId(e.target.value || null)} className="h-8 text-xs rounded-md border px-2" />
      <Button className="h-8 bg-emerald-600 text-white" onClick={() => {
        const now = new Date().toISOString();
        onCreate({ id: crypto.randomUUID(), title: title || 'New Assignment', code: code || 'ASG-'+Math.floor(Math.random()*1000), due: now, status: 'draft', submissions: 0, total: 0, createdAt: now, updatedAt: now, courseId });
        setTitle(''); setCode(''); setCourseId(null);
      }}>Create</Button>
    </div>
  );
}
