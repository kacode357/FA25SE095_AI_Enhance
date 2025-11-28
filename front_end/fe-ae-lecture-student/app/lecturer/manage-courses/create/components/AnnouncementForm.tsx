"use client";

import TinyMCE from "@/components/common/TinyMCE";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AccessCodeType } from "@/config/access-code-type";
import { BookType } from "lucide-react";
import React from "react";

type FormState = {
    courseCodeId: string;
    termId: string;
    year: number;
    description: string;
    announcement?: string;
    syllabus?: File | null;
    requiresAccessCode: boolean;
    accessCodeType: AccessCodeType;
    customAccessCode?: string;
    accessCodeExpiresAt?: string;
};

type Props = {
    form: FormState;
    setForm: React.Dispatch<React.SetStateAction<FormState>>;
    disableMainForm: boolean;
};

export default function AnnouncementForm({ form, setForm, disableMainForm }: Props) {
    return (
        <aside className="md:col-span-1 flex flex-col">
            <Card className="p-4 gap-0 border-slate-200 shadow-sm h-full flex flex-col">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm mb-2 font-semibold">Announcement</h3>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="flex items-center text-violet-400 text-sm cursor-help">(<BookType className="size-3.5" />&nbsp;Tips)</span>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="bg-slate-900 text-white text-center max-w-xs">
                            Provide a concise description to help students quickly understand the course scope. Use the announcement to highlight important info.
                        </TooltipContent>
                    </Tooltip>
                </div>
                <TinyMCE
                    value={form.announcement ?? ""}
                    onChange={(html) => setForm((f) => ({ ...f, announcement: html }))}
                    placeholder="An optional announcement for students (short)."
                    className="mt-1 bg-white border-slate-200 min-h-[120px] flex-1"
                    readOnly={disableMainForm}
                />
            </Card>
        </aside>
    );
}
