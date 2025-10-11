"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import Breadcrumbs from "../../components/Breadcrumbs";

type ScheduleItem = {
  id: string;
  day: string; // e.g., Mon, Tue
  start: string; // hh:mm
  end: string; // hh:mm
  groups: { id: string; name: string }[];
};

export default function ClassDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;

  // Mock initial class info (UI-only)
  const [code, setCode] = useState(`CLS-${id?.slice?.(0,6) ?? "000"}`);
  const [name, setName] = useState(`Class ${id}`);
  const [semester, setSemester] = useState("2025-FA");
  const [status, setStatus] = useState<"active" | "archived">("active");

  // Invite code
  const [inviteCode, setInviteCode] = useState<string | null>(null);

  // Schedules
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

  function genInvite() {
    const code = Math.random().toString(36).slice(2, 8).toUpperCase();
    setInviteCode(code);
  }

  function addSchedule() {
    const idGen = crypto.randomUUID();
    setSchedules(prev => [{ id: idGen, day: "Mon", start: "08:00", end: "09:30", groups: [] }, ...prev]);
  }

  function removeSchedule(sid: string) {
    setSchedules(prev => prev.filter(s => s.id !== sid));
  }

  function addGroup(sid: string) {
    const gid = crypto.randomUUID();
    setSchedules(prev => prev.map(s => s.id === sid ? { ...s, groups: [...s.groups, { id: gid, name: `Group ${s.groups.length + 1}` }] } : s));
  }

  function removeGroup(sid: string, gid: string) {
    setSchedules(prev => prev.map(s => s.id === sid ? { ...s, groups: s.groups.filter(g => g.id !== gid) } : s));
  }

  function saveChanges() {
    const payload = { id, code, name, semester, status, inviteCode, schedules };
    // UI-only: log and show minimal feedback
    console.log("Save class payload:", payload);
    // show ephemeral feedback
    alert("Saved changes (UI-only). Check console for payload.");
  }

  return (
    <div className="px-6 py-3 space-y-3">
      <Breadcrumbs items={[
        { label: "Manager", href: "/manager" },
        { label: "Classes", href: "/manager/class" },
        { label: `${name}` }
      ]} />

      <Card className="bg-white border border-slate-200">
        <CardHeader>
          <CardTitle>Class Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-600">Code</label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-600">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-slate-600">Semester</label>
              <Input value={semester} onChange={(e) => setSemester(e.target.value)} className="mt-1" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs text-slate-600">Status</label>
              <div className="mt-1 flex items-center gap-2">
                <button className={`px-3 py-1 rounded ${status === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-100'}`} onClick={() => setStatus('active')}>Active</button>
                <button className={`px-3 py-1 rounded ${status === 'archived' ? 'bg-amber-500 text-white' : 'bg-slate-100'}`} onClick={() => setStatus('archived')}>Archived</button>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <div className="text-xs text-slate-600">Invite code:</div>
              <div className="inline-flex items-center gap-2">
                <div className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-800">{inviteCode ?? '—'}</div>
                <Button variant="ghost" className="p-2" onClick={genInvite} aria-label="Generate invite code"><RefreshCw className="size-4" /></Button>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Schedules</h4>
              <div className="flex items-center gap-2">
                <Button className="h-8" variant="ghost" onClick={addSchedule}><Plus className="size-4" /> Add schedule</Button>
              </div>
            </div>

            <div className="mt-3 space-y-3">
              {schedules.map(s => (
                <div key={s.id} className="p-3 border rounded">
                  <div className="flex items-start gap-3">
                    <div className="w-48">
                      <label className="text-xs text-slate-600">Day</label>
                      <select title="Schedule" value={s.day} onChange={(e) => setSchedules(prev => prev.map(x => x.id === s.id ? { ...x, day: e.target.value } : x))} className="mt-1 h-8 w-full rounded border px-2 text-sm">
                        <option>Mon</option>
                        <option>Tue</option>
                        <option>Wed</option>
                        <option>Thu</option>
                        <option>Fri</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">Start</label>
                      <Input type="time" value={s.start} onChange={(e) => setSchedules(prev => prev.map(x => x.id === s.id ? { ...x, start: e.target.value } : x))} className="mt-1 w-32" />
                    </div>
                    <div>
                      <label className="text-xs text-slate-600">End</label>
                      <Input type="time" value={s.end} onChange={(e) => setSchedules(prev => prev.map(x => x.id === s.id ? { ...x, end: e.target.value } : x))} className="mt-1 w-32" />
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      <Button variant="ghost" className="h-8" onClick={() => addGroup(s.id)}>+ Add group</Button>
                      <Button variant="ghost" className="h-8" onClick={() => removeSchedule(s.id)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>

                  {s.groups.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs text-slate-600 mb-1">Groups for this schedule</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {s.groups.map(g => (
                          <div key={g.id} className="p-2 border rounded flex items-center justify-between">
                            <div className="text-sm">{g.name}</div>
                            <Button variant="ghost" className="h-7 px-2 text-red-600" onClick={() => removeGroup(s.id, g.id)}>Remove</Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {schedules.length === 0 && (
                <div className="text-slate-600">No schedules yet. Add a schedule to set meeting times and group students.</div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end">
            <Button className="h-9 bg-emerald-600 text-white" onClick={saveChanges}>Save changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
