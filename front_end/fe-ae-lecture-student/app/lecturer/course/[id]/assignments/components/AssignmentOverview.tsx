"use client";

import { ArrowUpDown } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import AssignmentActionsBar from "./AssignmentActionsBar";
import { fmt } from "./helpers";

type Props = {
    a: any;
    overviewEnter: boolean;
    overviewMounted: boolean;
    setOpenOverview: Dispatch<SetStateAction<boolean>>;
    onExtend: (iso: string) => Promise<void>;
    onClose: () => Promise<void>;
    loadingExtend: boolean;
    loadingClose: boolean;
};

export default function AssignmentOverview({ a, overviewEnter, overviewMounted, setOpenOverview, onExtend, onClose, loadingExtend, loadingClose }: Props) {
    if (!overviewMounted) return null;

    return (
        <div className="lg:col-span-4 order-0">
            <div className="rounded-md border mt-1 border-slate-200 bg-white overflow-hidden transition-all duration-300">
                <div className="py-3 border-b border-slate-300 flex items-center justify-end px-3">
                    <button
                        className="text-[11px] h-8 px-2 inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-100 hover:shadow-lg cursor-pointer border-blue-200 text-[#000D83] border rounded-md"
                        onClick={() => setOpenOverview((s) => !s)}
                    >
                        <span className="flex items-center justify-end gap-1 text-[#000D83]"><ArrowUpDown className="size-4" />Collapse</span>
                    </button>
                </div>

                <div className={`px-4 py-3 text-sm grid grid-cols-1 gap-5 transition-all duration-500 ease-out transform ${overviewEnter ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}`}>
                    <div className="flex items-start justify-between gap-3">
                        <span className="text-slate-500">Course</span>
                        <span className="font-medium text-right">{a.courseName}</span>
                    </div>

                    {a.topicName && (
                        <div className="flex items-start justify-between gap-3">
                            <span className="text-slate-500">Topic</span>
                            <span className="font-medium text-right">{a.topicName}</span>
                        </div>
                    )}

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Type</span>
                        <span className="font-medium">{a.isGroupAssignment ? "Group" : "Individual"}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Max Points</span>
                        <span className="font-medium">{a.maxPoints ?? 0} pts</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Format</span>
                        <span className="font-medium">{a.format?.trim() || "—"}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Start</span>
                        <span className="font-medium">{fmt(a.startDate)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Due</span>
                        <span className="font-medium">{fmt(a.dueDate)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Extended Due</span>
                        <span className="font-medium">{fmt(a.extendedDueDate)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Created</span>
                        <span className="font-medium">{fmt(a.createdAt)}</span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <span className="text-slate-500">Updated</span>
                        <span className="font-medium">{fmt(a.updatedAt)}</span>
                    </div>

                    <div className="mt-2">
                        <AssignmentActionsBar
                            assignmentId={a.id}
                            status={a.status}
                            currentDue={a.dueDate}
                            currentExtendedDue={a.extendedDueDate}
                            onExtend={onExtend}
                            onClose={onClose}
                            defaultOpen
                            loadingExtend={loadingExtend}
                            loadingClose={loadingClose}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
