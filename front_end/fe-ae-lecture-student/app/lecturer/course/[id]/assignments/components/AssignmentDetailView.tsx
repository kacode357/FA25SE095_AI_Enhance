// app/lecturer/course/[id]/assignments/components/AssignmentDetailView.tsx
"use client";

import { useEffect, useState } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import LiteRichTextEditor from "@/components/common/TinyMCE";
import { useAssignmentById } from "@/hooks/assignment/useAssignmentById";
import { useCloseAssignment } from "@/hooks/assignment/useCloseAssignment";
import { useExtendDueDate } from "@/hooks/assignment/useExtendDueDate";
import { useScheduleAssignment } from "@/hooks/assignment/useScheduleAssignment";
import { AssignmentService } from "@/services/assignment.services";
import { GroupItem } from "@/types/assignments/assignment.response";

import AssignmentDetailHeader from "./AssignmentDetailHeader";
import AssignmentGroups from "./AssignmentGroups";
import AssignmentHeaderActions from "./AssignmentHeaderActions";
import AssignmentOverview from "./AssignmentOverview";
import ConfirmScheduleAssignmentDialog from "./ConfirmScheduleAssignmentDialog";

type Props = {
    id: string;
    onBack: () => void;
    onEdit?: (id: string) => void;
};

export default function AssignmentDetailView({ id, onBack, onEdit }: Props) {
    const { data, loading, fetchAssignment } = useAssignmentById();
    const { extendDueDate, loading: loadingExtend } = useExtendDueDate();
    const { closeAssignment, loading: loadingClose } = useCloseAssignment();
    const { scheduleAssignment, loading: loadingSchedule } = useScheduleAssignment();

    const [openOverview, setOpenOverview] = useState(false);
    const [openScheduleConfirm, setOpenScheduleConfirm] = useState(false);
    const [overviewEnter, setOverviewEnter] = useState(false);
    const [overviewMounted, setOverviewMounted] = useState(false);

    const [assignedGroupsState, setAssignedGroupsState] = useState<GroupItem[]>([]);

    useEffect(() => {
        // fetch assignment details and assigned groups together
        async function load() {
            if (!id) return;
            await fetchAssignment(id);
            try {
                const res = await AssignmentService.getGroups(id);
                setAssignedGroupsState(res.groups || []);
            } catch {
                // ignore
            }
        }
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const a = data?.assignment;

    const refetchDetail = async () => {
        if (!id) return;
        await fetchAssignment(id);
        try {
            const res = await AssignmentService.getGroups(id);
            setAssignedGroupsState(res.groups || []);
        } catch {
            // ignore
        }
    };

    const handleExtend = async (iso: string) => {
        await extendDueDate(id, { extendedDueDate: iso });
        refetchDetail();
    };

    const handleClose = async () => {
        await closeAssignment(id);
        refetchDetail();
    };

    const handleSchedule = async () => {
        await scheduleAssignment(id, { schedule: true });
        setOpenScheduleConfirm(false);
        refetchDetail();
    };

    // animation
    useEffect(() => {
        let t: number | undefined;
        if (openOverview) {
            setOverviewMounted(true);
            setOverviewEnter(false);
            requestAnimationFrame(() => setOverviewEnter(true));
        } else {
            setOverviewEnter(false);
            t = window.setTimeout(() => setOverviewMounted(false), 500);
        }
        return () => {
            if (t) window.clearTimeout(t);
        };
    }, [openOverview]);

    return (
        <Card className="border border-slate-200 py-0 px-2 -gap-2 shadow-none">
            {/* ===== Header ===== */}
            <CardHeader className="flex items-start justify-between mb-5 -mx-3 gap-3">
                <div className="min-w-0 w-full lg:max-w-[calc(100%-300px)]">
                    <AssignmentDetailHeader a={a} onBack={onBack} onEdit={onEdit} openOverview={openOverview} setOpenOverview={setOpenOverview} setOpenScheduleConfirm={setOpenScheduleConfirm} loadingSchedule={loadingSchedule} />
                </div>
                <div className="flex-shrink-0">
                    <AssignmentHeaderActions a={a} onBack={onBack} onEdit={onEdit} setOpenOverview={setOpenOverview} setOpenScheduleConfirm={setOpenScheduleConfirm} loadingSchedule={loadingSchedule} />
                </div>
            </CardHeader>

            <Separator />

            {/* ===== Content ===== */}
            <CardContent className="px-3 min-h-0 bg-slate-50 rounded-sm">
                {loading && <div className="text-sm text-slate-500">Loading assignment...</div>}
                {!loading && !a && <div className="text-sm text-slate-500">Not found or failed to load.</div>}

                {!loading && a && (
                    <>
                        <ConfirmScheduleAssignmentDialog open={openScheduleConfirm} onOpenChange={setOpenScheduleConfirm} submitting={loadingSchedule} info={{ title: a.title, start: a.startDate, due: a.dueDate, statusDisplay: a.statusDisplay }} onConfirm={handleSchedule} />

                        <div className="flex flex-col gap-6 lg:h-[calc(100vh-220px)] min-h-0 overflow-auto mr-4">
                            <AssignmentOverview a={a} overviewEnter={overviewEnter} overviewMounted={overviewMounted} setOpenOverview={setOpenOverview} onExtend={handleExtend} onClose={handleClose} loadingExtend={loadingExtend} loadingClose={loadingClose} />

                            <div className={`${overviewMounted ? "lg:col-span-8" : "lg:col-span-12"} order-1 min-h-0 grid grid-rows-[auto,auto,auto] gap-6 relative`}>
                                {/* Description */}
                                <section className="min-h-0 h-full rounded-lg flex flex-col bg-slate-50 md:h-128">
                                    <div className="mb-2 mt-3 text-sm text-slate-500">Description</div>
                                    <ScrollArea className="rounded-lg bg-slate-50 flex-1 min-h-0 w-full overflow-y-auto ">
                                        <div className="bg-slate-50">
                                            <LiteRichTextEditor value={a.description ?? ""} onChange={() => { }} readOnly className="rounded-md" debounceMs={200} placeholder="No description..." />
                                        </div>
                                    </ScrollArea>
                                </section>

                                <AssignmentGroups a={a} assignedGroupsState={assignedGroupsState} refetchDetail={refetchDetail} />
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
