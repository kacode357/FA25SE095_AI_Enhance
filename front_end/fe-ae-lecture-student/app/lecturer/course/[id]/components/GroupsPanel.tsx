"use client";

import { Button } from "@/components/ui/button";
// list-style groups; individual cards removed in favor of expandable list
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteGroup } from "@/hooks/group/useDeleteGroup";
import { useGroupsByCourseId } from "@/hooks/group/useGroupsByCourseId";
import { GroupDetail } from "@/types/group/group.response";
import { ChevronDown, Lock, PencilLine, Trash2, Unlock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import CreateGroupSheet from "./CreateGroupSheet";

export default function GroupsPanel({
    courseId,
    refreshSignal = 0,
    onViewDetails,
    onChanged,
}: {
    courseId: string;
    refreshSignal?: number;
    onViewDetails?: (groupId: string) => void;
    onChanged?: () => void;
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
        router.push(`/lecturer/course/${courseId}/group/${id}`);
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
            try { onChanged?.(); } catch { }
        }
        // Xoá khối else (báo lỗi)

        setOpenDeleteDialog(false);
        setSelectedGroup(null);
    };

    const groupsCount = groups?.length ?? 0;
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggleExpand = (id: string) => {
        setExpanded((s) => ({ ...s, [id]: !s[id] }));
    };

    return (
        <div className="-mt-3 pb-3">
            {loading && <div className="text-sm text-slate-500">Loading groups...</div>}

            <div className="text-sm flex justify-end mb-2 mt-3 mr-1 text-slate-500">{groupsCount} group(s)</div>

            {!loading && groups.length === 0 && (
                <div className="text-sm text-slate-500">
                    No groups yet. Click <b>Create Group</b> to make one. This action is only available when the course is active.
                </div>
            )}
            {!loading && groups.length > 0 && (
                <div className="divide-y divide-slate-200 bg-white rounded-md border border-slate-200 overflow-hidden">
                    {groups.map((g) => {
                        const isOpen = !!expanded[g.id];
                        return (
                            <div
                                key={g.id}
                                className="px-4 py-3 flex flex-col hover:bg-slate-50 cursor-pointer"
                                onClick={() => toggleExpand(g.id)}
                            >
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <button
                                            type="button"
                                            onClick={(e) => { e.stopPropagation(); toggleExpand(g.id); }}
                                            aria-expanded={isOpen ? "true" : "false"}
                                            aria-label={isOpen ? "Collapse group" : "Expand group"}
                                            className="p-1 rounded-md hover:bg-slate-100"
                                        >
                                            <ChevronDown className={`h-4 w-4 transform transition-transform duration-300 ${isOpen ? 'rotate-180 text-slate-500' : 'text-slate-500'}`} />
                                        </button>
                                        <div className="min-w-0">
                                            <div className="text-sm font-semibold text-violet-600 truncate">{g.name}</div>
                                            {g.description && <div className="text-xs text-slate-500 truncate">{g.description}</div>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <p className="text-sm text-slate-500">Member:</p>
                                        <div className="text-sm bg-orange-50 text-slate-600 mr-4 hidden sm:block">
                                            {g.memberCount}/{g.maxMembers}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEdit(g.id); }} className="text-slate-700">
                                                <PencilLine className="size-4 text-blue-500" />
                                            </Button>
                                            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDeleteClick(g); }} className="text-red-600">
                                                <Trash2 className="size-4" />
                                            </Button>
                                            <Button size="sm" className="ml-2 text-violet-800 hover:text-violet-500 bg-violet-50" onClick={(e) => { e.stopPropagation(); handleOpenDetails(g.id); }}>
                                                Details
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                <div className={`mt-0 ml-8.5 text-sm text-slate-700 grid grid-cols-1 md:grid-cols-5 gap-2 overflow-hidden transition-all duration-300 ease-out ${isOpen ? 'max-h-[600px] opacity-100 py-4' : 'max-h-0 opacity-0'}`}>
                                    <div className="md:col-span-1">
                                        <div className="text-xs pb-2 text-slate-500">Status</div>
                                        <div className="font-medium flex items-center gap-2">
                                            {g.isLocked ? (
                                                <><Lock className="text-red-500 w-4 h-4" /> <span className="text-red-500">Locked</span></>
                                            ) : (
                                                <><Unlock className="text-emerald-500 w-4 h-4" /> <span className="text-emerald-500">Unlocked</span></>
                                            )}
                                        </div>
                                    </div>
                                    <div className="md:col-span-3">
                                        <div className="text-xs pb-2 text-slate-500">Assignment</div>
                                        <div className="font-medium">{g.assignmentTitle || "—"}</div>
                                    </div>
                                    <div className="md:col-span-1">
                                        <div className="text-xs pb-2 text-slate-500">Leader</div>
                                        <div className="font-medium">{g.leaderName || "—"}</div>
                                    </div>
                                    <div className="col-span-1 md:col-span-5 text-right text-xs text-slate-400 mt-2">Created: {new Date(g.createdAt).toLocaleString()}</div>
                                </div>
                            </div>
                        );
                    })}
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
                    try { onChanged?.(); } catch { }
                }}
            />
        </div>
    );
}