"use client";

import { Button } from "@/components/ui/button";
import { AssignmentStatus } from "@/types/assignments/assignment.response";
import { ArrowLeft, CalendarCheck2, Pencil } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

type Props = {
    a: any;
    onBack: () => void;
    onEdit?: (id: string) => void;
    setOpenOverview: Dispatch<SetStateAction<boolean>>;
    setOpenScheduleConfirm: (v: boolean) => void;
    loadingSchedule: boolean;
};

export default function AssignmentHeaderActions({ a, onBack, onEdit, setOpenOverview, setOpenScheduleConfirm, loadingSchedule }: Props) {
    return (
        <div className="flex flex-col mt-3 items-start gap-4 shrink-0">
            <div className="flex flex-col items-end">
                <Button className="text-[#000D83] bg-slate-100 text-sm" variant="outline" onClick={onBack}>
                    <ArrowLeft className="size-4" /> Back to Assignments
                </Button>
            </div>

            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setOpenOverview((s) => !s)}
                        className="text-xs inline-flex items-center cursor-pointer gap-2 rounded-md border border-slate-200 bg-white px-3 py-1 hover:shadow-sm mr-2"
                        title="Toggle Overview"
                    >
                        Show Overview
                    </button>
                </div>
                <div className="flex items-center gap-2">
                    {a && a.status === AssignmentStatus.Draft && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs flex btn btn-gradient-slow mr-3 items-center gap-1"
                            onClick={() => setOpenScheduleConfirm(true)}
                            disabled={loadingSchedule}
                            title="Schedule this assignment"
                        >
                            <CalendarCheck2 className="h-3.5 w-3.5" /> Schedule
                        </Button>
                    )}

                    {a && a.status !== AssignmentStatus.Overdue && (
                        <Button
                            size="sm"
                            variant="outline"
                            className="text-xs flex btn btn-gradient-slow items-center gap-1"
                            onClick={() => onEdit && onEdit(a.id)}
                            disabled={a.status === AssignmentStatus.Closed}
                        >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
