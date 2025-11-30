"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { AssignmentStatus } from "@/types/assignments/assignment.response";
import { Paperclip } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { daysUntilDue, fmt, statusClass } from "./helpers";

type Props = {
    a: any;
    onBack: () => void;
    onEdit?: (id: string) => void;
    openOverview: boolean;
    setOpenOverview: Dispatch<SetStateAction<boolean>>;
    setOpenScheduleConfirm: (v: boolean) => void;
    loadingSchedule: boolean;
};

export default function AssignmentDetailHeader({ a, onBack, onEdit, openOverview, setOpenOverview, setOpenScheduleConfirm, loadingSchedule }: Props) {
    const [downloading, setDownloading] = useState<Record<string, boolean>>({});

    const handleDownload = async (att: any) => {
        const key = att.id ?? att.fileName ?? att.name ?? att.url;
        try {
            setDownloading((s) => ({ ...s, [key]: true }));
            // try fetching the file and triggering a download via blob
            const res = await fetch(att.url as string);
            if (!res.ok) throw new Error("Network response was not ok");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const el = document.createElement("a");
            el.href = url;
            el.download = att.fileName ?? att.name ?? "attachment";
            document.body.appendChild(el);
            el.click();
            el.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            // fallback: open in new tab (browser may handle download)
            window.open(att.url ?? "", "_blank");
        } finally {
            setDownloading((s) => ({ ...s, [key]: false }));
        }
    };
    return (
        <div className="min-w-0">
            <div className="flex mt-3 items-center gap-2 text-lg md:text-xl">
                {a ? (
                    <>
                        <span className="truncate text-[#000D83]">{a.title}</span>
                        <Badge className={`${statusClass[a.status as AssignmentStatus]} shadow-md`}>{a.statusDisplay}</Badge>
                        {a.isGroupAssignment && <Badge variant="secondary">Group</Badge>}
                    </>
                ) : (
                    "Assignment Detail"
                )}
            </div>

            {a && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                    {a.topicName && (
                        <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Topic: {a.topicName}</span>
                    )}
                    <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Max: {a.maxPoints ?? 0} pts</span>
                    <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Weight: {a.weight ?? 0} %</span>
                    <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Start: {fmt(a.startDate)}</span>
                    <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Due: {fmt(a.dueDate)}</span>
                    {a.extendedDueDate && (
                        <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Extended: {fmt(a.extendedDueDate)}</span>
                    )}
                    <span className="rounded-full border border-slate-300 bg-white px-2 py-1">Days until due: {daysUntilDue(a.extendedDueDate ?? a.dueDate)}</span>
                </div>
            )}

            {/* Attachments shown in separate component if needed - small preview here */}
            {a && a.attachments && a.attachments.length > 0 && (
                <div className="mt-3">
                    <div className="text-xs text-slate-600 mb-2">Attachments</div>
                    <div className="flex flex-wrap gap-2">
                        {a.attachments.map((att: any) => {
                            const key = att.id ?? att.fileName ?? att.name ?? att.url;
                            return (
                                <Tooltip key={key}>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleDownload(att);
                                            }}
                                            disabled={!!downloading[key]}
                                            className="inline-flex items-center gap-2 cursor-pointer rounded-full border border-blue-300 hover:bg-blue-50 bg-white px-2 py-1 text-xs max-w-[260px] disabled:opacity-60"
                                        >
                                            <Paperclip className="h-3.5 w-3.5 text-slate-600" />
                                            <span className="truncate text-blue-500">{att.fileName ?? att.name ?? "Attachment"}</span>
                                            {downloading[key] && <span className="ml-2 text-xs text-slate-500">Downloading...</span>}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>Download Attachment</TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Actions moved to `AssignmentHeaderActions` to keep header layout flexible */}
        </div>
    );
}
