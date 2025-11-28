"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type Props = {
    selectedTermId: string;
    setSelectedTermId: (v: string) => void;
    year: string;
    setYear: (v: string) => void;
    description: string;
    setDescription: (v: string) => void;
    announcement: string;
    setAnnouncement: (v: string) => void;
    terms?: any[];
    handleSave: () => Promise<void>;
    updating: boolean;
};

export default function EditCourseForm({
    selectedTermId,
    setSelectedTermId,
    year,
    setYear,
    description,
    setDescription,
    announcement,
    setAnnouncement,
    terms = [],
    handleSave,
    updating,
}: Props) {
    return (
        <form className="grid grid-cols-2 gap-x-6 gap-y-10 text-sm mt-1">
            <div className="flex flex-col">
                <label className="text-slate-500 text-xs cursor-text uppercase mb-1">Name</label>
                <Input value={""} disabled className="!bg-slate-200 cursor-text" />
            </div>

            <div className="flex flex-col">
                <label className="text-slate-500 text-xs cursor-text uppercase mb-1">Term</label>
                <Select<string>
                    value={selectedTermId ?? ""}
                    options={(terms ?? []).map((t: any) => ({ value: t.id, label: t.name }))}
                    placeholder="Select term"
                    onChange={(v) => setSelectedTermId(v)}
                    className="w-full"
                />
            </div>

            <div className="flex flex-col col-span-2">
                <label className="text-slate-500 cursor-text text-xs uppercase mb-1">Description</label>
                <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter course description..." className="resize-none bg-white focus:ring-2 focus:border-emerald-100 border rounded-lg border-slate-200 focus:ring-emerald-500" />
            </div>

            <div className="flex flex-col col-span-2">
                <label className="text-slate-500 cursor-text text-xs uppercase mb-1">Announcement (optional)</label>
                <Textarea rows={2} value={announcement} onChange={(e) => setAnnouncement(e.target.value)} placeholder="Enter announcement for students (optional)" className="resize-none bg-white focus:ring-2 focus:border-emerald-100 border rounded-lg border-slate-200 focus:ring-emerald-500" />
            </div>

            <div className="col-span-2 mt-2 flex justify-end">
                <Button className="mt-5 btn btn-gradient-slow cursor-pointer text-white" onClick={async (e) => { e.preventDefault(); await handleSave(); }} disabled={updating}>
                    {updating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>) : ("Save Changes")}
                </Button>
            </div>
        </form>
    );
}
