"use client";

import TinyMCE from "@/components/common/TinyMCE";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Select from "@/components/ui/select/Select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type Props = {
    name: string;
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
    name,
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
    const formatDate = (v?: string | null) => {
        if (!v) return "";
        try {
            return new Date(v).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
        } catch {
            return String(v);
        }
    };

    const selectedTerm = (terms ?? []).find((t: any) => t.id === selectedTermId);
    return (
        <form className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm mt-1" onSubmit={async (e) => { e.preventDefault(); await handleSave(); }}>
            <div className="flex flex-col">
                <label className="text-slate-500 text-xs cursor-text uppercase mb-1">Name</label>
                <Input value={name ?? ""} readOnly className="!bg-white text-slate-700 cursor-not-allowed" />
            </div>

            <div className="flex flex-col">
                <label className="text-slate-500 text-xs cursor-text uppercase mb-1">Term</label>
                <Select<string>
                    value={selectedTermId ?? ""}
                    options={(terms ?? []).map((t: any) => {
                        const start = formatDate(t.startDate);
                        const end = formatDate(t.endDate);
                        const datePart = start && end ? ` — ${start} to ${end}` : start || end ? ` — ${start || end}` : "";
                        return { value: t.id, label: `${t.name}${datePart}` };
                    })}
                    placeholder="Select term"
                    onChange={(v) => setSelectedTermId(v)}
                    className="w-full"
                />
                {selectedTerm && (
                    <p className="text-xs text-slate-500 mt-2">Start: {formatDate(selectedTerm.startDate)} &nbsp;•&nbsp; End: {formatDate(selectedTerm.endDate)}</p>
                )}
            </div>

            <div className="flex flex-col col-span-2">
                <label className="text-slate-500 cursor-text text-xs uppercase mb-1">Description</label>
                <Textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter course description..." className="resize-none bg-white focus:ring-2 focus:border-emerald-100 border rounded-lg border-slate-200 focus:ring-emerald-500" />
            </div>

            <div className="flex flex-col col-span-2">
                <label className="text-slate-500 cursor-text text-xs uppercase mb-1">Announcement (optional)</label>
                <TinyMCE
                    value={announcement || ""}
                    onChange={(html) => setAnnouncement(html)}
                    placeholder="Enter announcement for students (optional)"
                    className="bg-white focus:ring-2 focus:border-emerald-100 border rounded-lg border-slate-200 focus:ring-emerald-500"
                />
            </div>

            <div className="col-span-2 mt-2 flex border-t border-slate-200 justify-end">
                <Button type="submit" className="mt-5 btn btn-gradient-slow cursor-pointer text-white" disabled={updating}>
                    {updating ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>) : ("Save Changes")}
                </Button>
            </div>
        </form>
    );
}
