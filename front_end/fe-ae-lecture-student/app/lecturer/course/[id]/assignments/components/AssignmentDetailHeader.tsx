"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useDeleteAssignmentAttachment } from "@/hooks/assignment/useDeleteAssignmentAttachment";
import { AssignmentStatus } from "@/types/assignments/assignment.response";
import {
    Loader2,
    Paperclip,
    Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

export default function AssignmentDetailHeader({
    a,
    onBack,
    onEdit,
    openOverview,
    setOpenOverview,
    setOpenScheduleConfirm,
    loadingSchedule,
}: Props) {
    const router = useRouter();

    const [downloading, setDownloading] = useState<Record<string, boolean>>(
        {}
    );
    const [deletingMap, setDeletingMap] = useState<Record<string, boolean>>(
        {}
    );

    const { deleteAttachment } = useDeleteAssignmentAttachment();

    const handleDownload = async (att: any) => {
        const key = att.id ?? att.fileName ?? att.name ?? att.url;
        try {
            setDownloading((s) => ({ ...s, [key]: true }));
            const res = await fetch(att.url as string);
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const aEl = document.createElement("a");
            aEl.href = url;
            aEl.download = att.fileName ?? att.name ?? "attachment";
            document.body.appendChild(aEl);
            aEl.click();
            aEl.remove();
            URL.revokeObjectURL(url);
        } catch {
            window.open(att.url ?? "", "_blank");
        } finally {
            setDownloading((s) => ({ ...s, [key]: false }));
        }
    };

    return (
        <div className="min-w-0">
            {/* TITLE */}
            <div className="flex mt-3 items-center gap-2 text-lg md:text-xl">
                {a ? (
                    <>
                        <span className="truncate text-[#000D83]">
                            {a.title}
                        </span>
                        <Badge
                            className={`${statusClass[a.status as AssignmentStatus]} shadow-md`}
                        >
                            {a.statusDisplay}
                        </Badge>
                        {a.isGroupAssignment && (
                            <Badge variant="secondary">Group</Badge>
                        )}
                    </>
                ) : (
                    "Assignment Detail"
                )}
            </div>

            {/* META */}
            {a && (
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                    {a.topicName && (
                        <span className="rounded-full border px-2 py-1">
                            Topic: {a.topicName}
                        </span>
                    )}
                    <span className="rounded-full border px-2 py-1">
                        Max: {a.maxPoints ?? 0} pts
                    </span>
                    <span className="rounded-full border px-2 py-1">
                        Weight: {a.weightPercentage ?? 0} %
                    </span>
                    <span className="rounded-full border px-2 py-1">
                        Start: {fmt(a.startDate)}
                    </span>
                    <span className="rounded-full border px-2 py-1">
                        Due: {fmt(a.dueDate)}
                    </span>
                    {a.extendedDueDate && (
                        <span className="rounded-full border px-2 py-1">
                            Extended: {fmt(a.extendedDueDate)}
                        </span>
                    )}
                    <span className="rounded-full border px-2 py-1">
                        Days until due:{" "}
                        {daysUntilDue(a.extendedDueDate ?? a.dueDate)}
                    </span>
                </div>
            )}

            {/* ATTACHMENTS */}
            <div className="mt-3">
                <div className="flex items-center justify-between">
                    <Button
                        size="xs"
                        variant="ghost"
                        onClick={() =>
                            router.push(
                                `/lecturer/course/${a?.courseId}/assignments/${a?.id}/upload?fr=assignment-detail`
                            )
                        }
                        className="inline-flex items-center gap-2 bg-black text-white text-[10px]"
                    >
                        <Paperclip className="h-3 w-3" />
                        Attachment
                    </Button>
                </div>

                {a?.attachments?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {a.attachments.map((att: any) => {
                            const key =
                                att.id ??
                                att.fileName ??
                                att.name ??
                                att.url;

                            const isDownloading = !!downloading[key];
                            const isDeleting = !!deletingMap[key];

                            return (
                                <div
                                    key={key}
                                    className="relative flex items-center group"
                                >
                                    {/* DOWNLOAD */}
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDownload(att)
                                                }
                                                disabled={
                                                    isDownloading ||
                                                    isDeleting
                                                }
                                                className="inline-flex items-center gap-2 rounded-full
                                                    border border-blue-300 bg-white px-2 py-1 text-xs
                                                    max-w-[260px] hover:bg-blue-50 disabled:opacity-60 cursor-pointer"
                                            >
                                                <Paperclip className="h-3.5 w-3.5 text-slate-600" />
                                                <span className="truncate text-blue-500">
                                                    {att.fileName ??
                                                        att.name ??
                                                        "Attachment"}
                                                </span>
                                                {isDownloading && (
                                                    <span className="ml-2 text-xs text-slate-500">
                                                        Downloading...
                                                    </span>
                                                )}
                                            </button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Download Attachment
                                        </TooltipContent>
                                    </Tooltip>

                                    {/* DELETE */}
                                    <div>
                                        <button
                                            type="button"
                                            title="Delete attachment"
                                            onClick={async (e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                if (
                                                    !a?.id ||
                                                    !att?.id ||
                                                    isDeleting
                                                )
                                                    return;

                                                setDeletingMap((s) => ({
                                                    ...s,
                                                    [key]: true,
                                                }));
                                                try {
                                                    const res =
                                                        await deleteAttachment(
                                                            a.id,
                                                            att.id
                                                        );
                                                    if (
                                                        res?.success &&
                                                        Array.isArray(
                                                            a.attachments
                                                        )
                                                    ) {
                                                        a.attachments =
                                                            a.attachments.filter(
                                                                (
                                                                    x: any
                                                                ) =>
                                                                    (x.id ??
                                                                        x.fileName ??
                                                                        x.name ??
                                                                        x.url) !==
                                                                    key
                                                            );
                                                    }
                                                } finally {
                                                    setDeletingMap((s) => ({
                                                        ...s,
                                                        [key]: false,
                                                    }));
                                                }
                                            }}
                                            className={`
                                                absolute right-0 top-1/2 -translate-y-1/2 mr-0.5
                                                inline-flex items-center justify-center p-1 rounded-full
                                                bg-white text-red-600
                                                opacity-0 group-hover:opacity-100
                                                hover:bg-red-50 transition-opacity cursor-pointer
                                                ${isDeleting ? "opacity-100 pointer-events-none" : ""}
                                            `}
                                        >
                                            {isDeleting ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-3 w-3" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
