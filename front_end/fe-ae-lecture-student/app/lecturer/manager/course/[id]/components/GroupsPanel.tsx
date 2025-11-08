"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteGroup } from "@/hooks/group/useDeleteGroup";
// Chắc chắn rằng useGroupsByCourseId không còn trả về error nữa
import { useGroupsByCourseId } from "@/hooks/group/useGroupsByCourseId";
import { GroupDetail } from "@/types/group/group.response";
import { Lock, PencilLine, Trash2, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateGroupSheet from "./CreateGroupSheet";

export default function GroupsPanel({
    courseId,
    refreshSignal = 0,
    onViewDetails,
}: {
    courseId: string;
    refreshSignal?: number;
    onViewDetails?: (groupId: string) => void;
}) {
    // Xoá error khỏi destructuring
    const { listData: groups, loading, fetchByCourseId } =
        useGroupsByCourseId();
    const { deleteGroup, loading: deleting } = useDeleteGroup();

    const [openSheet, setOpenSheet] = useState(false);
    const [editingGroup, setEditingGroup] = useState<GroupDetail | null>(null);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupDetail | null>(null);
    const router = useRouter();

    useEffect(() => {
        if (courseId) fetchByCourseId(courseId, true);
    }, [courseId, refreshSignal, fetchByCourseId]);

    const handleEdit = (id: string) => {
        const g = groups.find((x) => x.id === id) || null;
        if (!g) return;
        setEditingGroup(g);
        setOpenSheet(true);
    };

    const handleOpenDetails = (id: string) => {
        // if parent passed a callback, use it to render inline details. Otherwise navigate.
        if (onViewDetails) {
            onViewDetails(id);
            return;
        }
        router.push(`/lecturer/manager/course/${courseId}/group/${id}`);
    };

    const handleDeleteClick = (g: GroupDetail) => {
        setSelectedGroup(g);
        setOpenDeleteDialog(true);
    };

    const confirmDelete = async () => {
        if (!selectedGroup) return;
        const res = await deleteGroup(selectedGroup.id);
        if (res?.success) {
            toast.success("Group deleted successfully");
            fetchByCourseId(courseId, true);
        }
        // Xoá khối else (báo lỗi)

        setOpenDeleteDialog(false);
        setSelectedGroup(null);
    };

    const groupsList = groups?.length || [];

    return (
        <div className="-mt-3">
            {loading && <div className="text-sm text-slate-500">Loading groups...</div>}

            {!loading && groups.length === 0 && (
                <div className="text-sm text-slate-500">
                    No groups yet. Click <b>Create Group</b> to make one. This action is only available when the course is active.
                </div>
            )}
            <div className="text-sm flex justify-start ml-0.5 mb-2 text-slate-500">{groupsList} group(s)</div>
            {!loading && groups.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pb-4 gap-5">
                    {groups.map((g) => (
                        <Card
                            key={g.id}
                            className="h-full py-4 border-slate-200 hover:shadow-sm transition cursor-default"
                        >
                            <CardHeader className="pb-2 px-4">
                                <div className="flex justify-between items-start">
                                    <div
                                        onClick={() => handleOpenDetails(g.id)}
                                        className="cursor-pointer">
                                        <CardTitle
                                            className="text-base text-violet-500 font-semibold">
                                            {g.name}
                                        </CardTitle>
                                        {g.description && (
                                            <div className="text-xs text-slate-500">{g.description}</div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="ghost"
                                            className="h-7 px-0 cursor-pointer text-blue-600 bg-blue-50 hover:bg-emerald-50"
                                            title="Edit group"
                                            onClick={() => handleEdit(g.id)}
                                        >
                                            <PencilLine className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            className="h-7 px-0 cursor-pointer text-red-600 bg-red-50 hover:bg-red-50"
                                            title="Delete group"
                                            onClick={() => handleDeleteClick(g)}
                                            disabled={deleting}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0 px-4">
                                <div className="text-xs space-y-5 text-slate-600">
                                    <div className="flex justify-between">
                                    <div className="cursor-text">
                                        <span className="text-slate-500 cursor-text">Members:</span>{" "}
                                        {g.memberCount}/{g.maxMembers}
                                    </div>
                                    <div className="cursor-text">
                                        <span className="text-slate-500 cursor-text">Leader:</span>{" "}
                                        {g.leaderName || "—"}
                                    </div>
                                    </div>
                                    <div className="col-span-2 cursor-text">
                                        <span className="text-slate-500 cursor-text">Assignment:</span>{" "}
                                        {g.assignmentTitle || "—"}
                                    </div>
                                    {/* <div className="cursor-text">
                                        <span className="text-slate-500 cursor-text">By:</span> {g.createdBy}
                                    </div> */}
                                    <div className="flex items-center gap-1">
                                        {g.isLocked ? (
                                            <>
                                                <Lock className="text-red-500 w-4 h-4" />
                                                <span className="text-red-500 text-xs font-medium">Locked</span>
                                            </>
                                        ) : (
                                            <>
                                                <Unlock className="text-emerald-500 w-4 h-4" />
                                                <span className="text-emerald-500 text-xs font-medium">Unlocked</span>
                                            </>
                                        )}
                                    </div>
                                    <div className="col-span-2 text-right text-[10px] cursor-text text-slate-400">
                                        Created: {new Date(g.createdAt).toLocaleString()}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onOpenChange={setOpenDeleteDialog}>
                <DialogContent className="sm:max-w-md border-slate-200">
                    <DialogHeader>
                        <DialogTitle>Delete Group</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete{" "}
                            <b>{selectedGroup?.name}</b>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-4 flex justify-end gap-2">
                        <Button
                            className="text-violet-800 hover:text-violet-500"
                            variant="ghost"
                            onClick={() => setOpenDeleteDialog(false)}
                            disabled={deleting}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="ghost"
                            onClick={confirmDelete}
                            disabled={deleting}
                            className="btn btn-gradient-slow"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CreateGroupSheet
                open={openSheet}
                onOpenChange={(v) => {
                    setOpenSheet(v);
                    if (!v) setEditingGroup(null);
                }}
                courseId={courseId}
                mode={editingGroup ? "edit" : "create"}
                initialData={editingGroup || undefined}
                onUpdated={() => {
                    toast.success("Group updated successfully");
                    fetchByCourseId(courseId, true);
                }}
            />
        </div>
    );
}