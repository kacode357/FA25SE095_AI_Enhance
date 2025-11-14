"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CalendarCheck2, Info } from "lucide-react";

type Props = {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    submitting?: boolean;
    info?: {
        title?: string;
        start?: string | null;
        due?: string | null;
        statusDisplay?: string;
    } | null;
    onConfirm: () => Promise<void> | void;
};

export default function ConfirmScheduleAssignmentDialog({
    open,
    onOpenChange,
    submitting,
    info,
    onConfirm,
}: Props) {
    const fmt = (s?: string | null) => (s ? new Date(s).toLocaleString() : "—");
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="border-slate-200">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2">
                        <CalendarCheck2 className="size-5 text-emerald-600" /> Schedule this assignment?
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-xs flex gap-1.5 text-slate-600">
                        <Info className="size-4 text-amber-500" />Scheduling will publish this assignment to students based on its start date. You can continue editing after scheduling if your flow allows it.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                {info && (
                    <div className="text-sm space-y-2 px-1">
                        <div className="truncate font-medium text-slate-900">{info.title ?? "Untitled"}</div>
                        <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-medium">{info.statusDisplay ?? "-"}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Start</span><span className="font-medium">{fmt(info.start)}</span></div>
                        <div className="flex justify-between"><span className="text-slate-500">Due</span><span className="font-medium">{fmt(info.due)}</span></div>
                    </div>
                )}
                <AlertDialogFooter className="mt-5">
                    <AlertDialogCancel asChild>
                        <Button variant="outline" className="text-violet-800 hover:text-violet-500">Cancel</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            className="btn btn-gradient-slow"
                            disabled={submitting}
                            onClick={async () => {
                                await onConfirm();
                            }}
                        >
                            Schedule
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
