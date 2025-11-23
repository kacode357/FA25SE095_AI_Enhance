"use client";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SupportRequestItem } from "@/types/support/support-request.response";

import {
    Dialog,
    DialogClose,
    DialogContent
} from "@/components/ui/dialog";
import Select from "@/components/ui/select/Select";
import { SupportRequestStatus } from "@/config/classroom-service/support-request-status.enum";
import { useAuth } from "@/contexts/AuthContext";
import { useMyCourses } from "@/hooks/course/useMyCourses";
import { useAcceptSupportRequest } from "@/hooks/support-requests/useAcceptSupportRequest";
import { useCancelSupportRequest } from "@/hooks/support-requests/useCancelSupportRequest";
import { useMySupportRequests } from "@/hooks/support-requests/useMySupportRequests";
import { useResolveSupportRequest } from "@/hooks/support-requests/useResolveSupportRequest";
import { Check, Loader2, MessageSquare, Wrench, X } from "lucide-react";
import { useRouter } from "next/navigation";
import CancelSupportRequestDialog from "./components/CancelSupportRequestDialog";

import {
    categoryLabel,
    formatDateTime,
    priorityLabel,
    statusColor,
    statusLabel
} from "./components/support-labels"; // <-- added statusColor

import { categoryColor, priorityColor } from "./components/support-labels";

type Props = {
    courseId?: string;
};

export default function SupportRequestsList({ courseId }: Props) {
    const router = useRouter();
    const { user } = useAuth();
    const userId = user?.id;

    const { fetchMySupportRequests, loading: loadingList, items } = useMySupportRequests();
    const { acceptSupportRequest } = useAcceptSupportRequest();
    const { cancelSupportRequest } = useCancelSupportRequest();
    const { resolveSupportRequest } = useResolveSupportRequest();
    const { listData: courses, loading: loadingCourses, fetchMyCourses } = useMyCourses();

    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [selectedCourseId, setSelectedCourseId] = useState<string | undefined>(courseId ?? "all");
    const [loadedForCourse, setLoadedForCourse] = useState<string | null>(null);

    useEffect(() => {
        fetchMyCourses({ asLecturer: true, page: 1, pageSize: 100 });
    }, [fetchMyCourses]);

    useEffect(() => {
        if (!selectedCourseId) return;
        if (loadedForCourse === selectedCourseId) return;

        const params: any = { pageNumber: 1, pageSize: 30 };
        if (selectedCourseId !== "all") params.courseId = selectedCourseId;

        fetchMySupportRequests(params).finally(() => setLoadedForCourse(selectedCourseId));
    }, [selectedCourseId, fetchMySupportRequests]);

    const handleAccept = async (id: string) => {
        if (!confirm("Accept this support request and assign it to you?")) return;
        try {
            setActionLoading(id);
            await acceptSupportRequest(id);

            const current = selectedCourseId === "all" ? undefined : selectedCourseId;
            const params: any = { pageNumber: 1, pageSize: 30 };
            if (current) params.courseId = current;

            await fetchMySupportRequests(params);
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async (
        id: string,
        subject?: string | null,
        courseName?: string | null,
        requesterName?: string | null,
        requestedAt?: string | null,
        description?: string | null
    ) => {
        // Open confirmation modal instead of using native confirm
        setCancelTargetId(id);
        setCancelTargetSubject(subject ?? null);
        setCancelTargetCourse(courseName ?? null);
        setCancelTargetRequester(requesterName ?? null);
        setCancelTargetRequestedAt(requestedAt ?? null);
        setCancelTargetDescription(description ?? null);
        setCancelModalOpen(true);
    };

    // Modal state for cancel confirmation
    const [cancelModalOpen, setCancelModalOpen] = useState(false);
    const [cancelTargetId, setCancelTargetId] = useState<string | null>(null);
    const [cancelTargetSubject, setCancelTargetSubject] = useState<string | null>(null);
    const [cancelTargetCourse, setCancelTargetCourse] = useState<string | null>(null);
    const [cancelTargetRequester, setCancelTargetRequester] = useState<string | null>(null);
    const [cancelTargetRequestedAt, setCancelTargetRequestedAt] = useState<string | null>(null);
    const [cancelTargetDescription, setCancelTargetDescription] = useState<string | null>(null);

    const handleConfirmCancel = async () => {
        if (!cancelTargetId) return;
        try {
            setActionLoading(cancelTargetId);
            await cancelSupportRequest(cancelTargetId);

            const current = selectedCourseId === "all" ? undefined : selectedCourseId;
            const params: any = { pageNumber: 1, pageSize: 30 };
            if (current) params.courseId = current;

            await fetchMySupportRequests(params);
        } finally {
            setActionLoading(null);
            setCancelModalOpen(false);
            setCancelTargetId(null);
            setCancelTargetSubject(null);
            setCancelTargetCourse(null);
            setCancelTargetRequester(null);
            setCancelTargetRequestedAt(null);
            setCancelTargetDescription(null);
        }
    };

    const handleResolve = async (id: string) => {
        if (!confirm("Mark this support request as resolved?")) return;
        try {
            setActionLoading(id);
            await resolveSupportRequest(id);

            const current = selectedCourseId === "all" ? undefined : selectedCourseId;
            const params: any = { pageNumber: 1, pageSize: 30 };
            if (current) params.courseId = current;

            await fetchMySupportRequests(params);
        } finally {
            setActionLoading(null);
        }
    };

    return (
        <div className="space-y-2 p-3 py-2.5 mr-2">
            <div className="flex items-center justify-between mt-0.5">
                <h2 className="text-sm uppercase font-semibold">Support Requests</h2>

                <Button
                    size="sm"
                    onClick={() => {
                        const cid = selectedCourseId === "all" ? undefined : selectedCourseId;
                        router.push(
                            cid
                                ? `/lecturer/course/support-requests/create`
                                : `/lecturer/course/support-requests/create`
                        );
                    }}
                    className="btn btn-gradient-slow"
                >
                    <Wrench className="size-4" />Create Support
                </Button>
            </div>

            <Card className="card rounded-2xl">
                <CardContent className="space-y-3 max-h-[640px] overflow-y-auto">
                    {items.length === 0 && !loadingList && (
                        <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs text-slate-500">
                            <MessageSquare className="h-4 w-4 text-slate-400" />
                            <span>No support requests found for this course.</span>
                        </div>
                    )}

                    {/* Filter */}
                        <div className="flex justify-between items-center">
                            {loadingList && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}

                            <div className="flex justify-start items-center w-full gap-2">
                                <span className="text-slate-600 text-sm">Filter by Course: </span>

                                {!loadingCourses && courses && (
                                    <div className="w-48">
                                        <Select<string>
                                            value={selectedCourseId ?? "all"}
                                            options={[
                                                { value: "all", label: "All" },
                                                ...courses.map((c: any) => ({ value: c.id, label: (c.courseCode + " — " + c.courseCodeTitle) || c.id }))
                                            ]}
                                            placeholder="All"
                                            onChange={(v) => setSelectedCourseId(v === "all" ? "all" : v)}
                                            className="w-72"
                                            disabled={false}
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="text-slate-500 text-sm">{items.length}(requests)</div>
                        </div>

                    {/* LIST */}
                    {items.map((item: SupportRequestItem) => (
                        <div key={item.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                            <div className="flex items-start gap-10">
                                <div className="flex-1">
                                    <span
                                        className={`text-xs px-2 py-1 mb-2 rounded-full font-medium ${statusColor(
                                            item.status
                                        )}`}
                                    >
                                        {statusLabel(item.status) || "-"}
                                    </span>
                                    {/* subject + badges */}
                                    <div className="flex items-center justify-between mt-5 gap-4">
                                        <div className="flex items-center gap-1 min-w-0">
                                            <div className="text-lg font-semibold text-slate-900 truncate">
                                                {item.subject || "-"}
                                            </div>
                                        </div>

                                        {/* ⭐ UPDATED — status có màu */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-600">Category:</span>
                                            <span className={`text-xs px-2 mr-5 py-1 rounded-full items-start gap-4 ${categoryColor(item.category)}`}>
                                                {categoryLabel(item.category) || "-"}
                                            </span>
                                            <span className="text-sm text-slate-600">Priority:</span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${priorityColor(item.priority)}`}>
                                                {priorityLabel(item.priority) || "-"}
                                            </span>
                                        </div>
                                    </div>

                                    {/* description */}
                                    <div className="mt-3 text-sm text-slate-700">
                                        <span className="text-sm text-slate-600-">Description:</span> {item.description || "-"}
                                    </div>

                                    {/* details grid */}
                                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-500">
                                        <div>
                                            <span className="text-slate-600">Course:</span>{" "}
                                            {item.courseName ?? item.courseId ?? "-"}
                                        </div>
                                        <div>
                                            <span className="text-slate-600">Requester:</span>{" "}
                                            {item.requesterName
                                                ? `${item.requesterName} (${item.requesterRole || "-"})`
                                                : "-"}
                                        </div>
                                        <div>
                                            <span className="text-slate-600">Assigned:</span>{" "}
                                            {item.assignedStaffName ?? "-"}
                                        </div>
                                        <div>
                                            <span className="text-slate-600">Conversation:</span>{" "}
                                            {item.conversationId ?? "-"}
                                        </div>
                                    </div>
                                </div>

                                {/* Right side: buttons + timestamps */}
                                <div className="w-56 flex-shrink-0 flex flex-col items-end gap-3">
                                    <div className="text-right text-xs text-slate-400">
                                        <div>Requested: {formatDateTime(item.requestedAt)}</div>
                                        <div>Accepted: {item.acceptedAt ? formatDateTime(item.acceptedAt) : '-'}</div>
                                        <div>Resolved: {item.resolvedAt ? formatDateTime(item.resolvedAt) : '-'}</div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center gap-2">
                                            {/* Chat */}
                                            {item.conversationId && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-violet-800 hover:text-violet-500"
                                                    onClick={() => {
                                                        const messageCourseId =
                                                            selectedCourseId === "all"
                                                                ? item.courseId
                                                                : selectedCourseId;
                                                        if (!messageCourseId) return;

                                                        const peerId = item.assignedStaffId ?? item.requesterId ?? undefined;
                                                        const peerName = item.assignedStaffName ?? item.requesterName ?? "Support";

                                                        const base = `/lecturer/course/${messageCourseId}/messages/${item.conversationId}`;
                                                        const qs = new URLSearchParams();
                                                        if (peerId) qs.set("peerId", String(peerId));
                                                        if (peerName) qs.set("peerName", String(peerName));
                                                        qs.set("supportRequestId", item.id);
                                                        if (item.subject) qs.set("requestTitle", String(item.subject));

                                                        router.push(`${base}?${qs.toString()}`);
                                                    }}
                                                >
                                                    <MessageSquare className="h-4 w-4" /> Chat
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                            </div>
                            <div className="flex justify-end">
                                {item.status === SupportRequestStatus.InProgress && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleResolve(item.id)}
                                        disabled={actionLoading !== null}
                                        className="shadow-lg text-green-600"
                                    >
                                        <Check className="h-4 w-4" /> Resolve
                                    </Button>
                                )}

                                {item.status === SupportRequestStatus.Pending && (
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => handleCancel(item.id, item.subject, item.courseName, item.requesterName, item.requestedAt, item.description)}
                                        disabled={actionLoading !== null}
                                        className="shadow-lg text-red-600"
                                    >
                                        <X className=" h-4 w-4" /> Cancel
                                    </Button>
                                )}
                            </div>
                            {/* Cancel confirmation modal (reusable component) */}
                            <Dialog open={cancelModalOpen} onOpenChange={(open) => setCancelModalOpen(open)}>
                                <DialogContent>
                                    <CancelSupportRequestDialog
                                        open={cancelModalOpen}
                                        onOpenChange={(open) => setCancelModalOpen(open)}
                                        subject={cancelTargetSubject}
                                        courseName={cancelTargetCourse}
                                        requesterName={cancelTargetRequester}
                                        requestedAt={cancelTargetRequestedAt}
                                        description={cancelTargetDescription}
                                        loading={actionLoading !== null}
                                        onConfirm={handleConfirmCancel}
                                    />
                                    <DialogClose />
                                </DialogContent>
                            </Dialog>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
