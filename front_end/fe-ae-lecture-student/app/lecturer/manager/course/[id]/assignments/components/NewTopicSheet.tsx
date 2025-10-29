"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCreateTopic } from "@/hooks/topic/useCreateTopic";
import { useGetTopicById } from "@/hooks/topic/useGetTopicById";
import { useGetTopics } from "@/hooks/topic/useGetTopics";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface NewTopicSheetProps {
    open: boolean;
    onOpenChange: (v: boolean) => void;
    onCreated?: () => void;
}

export default function NewTopicSheet({ open, onOpenChange, onCreated }: NewTopicSheetProps) {
    const { createTopic, loading, error: hookError } = useCreateTopic();
    const { data: topicsData, loading: loadingTopics, fetchTopics } = useGetTopics();
    const { data: topicDetails, loading: loadingTopicDetails, fetchTopicById } = useGetTopicById();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        if (open) {
            fetchTopics({ page: 1, pageSize: 50 });
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            setName("");
            setDescription("");
            setIsActive(true);
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            setError("Topic name is required");
            return;
        }
        if (!description.trim()) {
            setError("Description is required");
            return;
        }
        setError(null);

        const res = await createTopic({
            name: name.trim(),
            description: description.trim(),
            isActive,
        });

        if (res?.success) {
            toast.success("Topic created successfully");
            onCreated?.();
            fetchTopics({ page: 1, pageSize: 50 });
            setName("");
            setDescription("");
            setIsActive(true);
        } else {
            setError(res?.message || "Failed to create topic");
        }
    };

    const handleTopicClick = async (id: string) => {
        setSelectedTopicId(id);
        setOpenDialog(true);
        await fetchTopicById(id);
    };

    return (
        <>
            <Sheet open={open} onOpenChange={onOpenChange}>
                <SheetContent className="bg-white w-full border border-slate-200 sm:max-w-xl md:max-w-2xl h-screen flex flex-col">
                    <SheetHeader className="flex-shrink-0">
                        <SheetTitle>New Topic</SheetTitle>
                    </SheetHeader>

                    <div className="px-4 pb-2 space-y-3 flex-shrink-0">
                        {error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</div>}
                        {hookError && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{hookError}</div>}

                        <div>
                            <Label className="text-sm mb-1">Topic Name *</Label>
                            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter topic name" />
                        </div>

                        <div>
                            <Label className="text-sm mb-1">Description *</Label>
                            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" />
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                            <Checkbox checked={isActive} onCheckedChange={(v) => setIsActive(!!v)} />
                            <Label className="cursor-pointer">Active</Label>
                        </div>
                    </div>

                    {/* LIST TOPICS */}
                    <div className="px-4 pt-4 border-t border-slate-200 flex-1 flex flex-col overflow-hidden">
                        <div className="flex justify-between text-sm font-medium mb-2 flex-shrink-0 bg-white z-10">
                            <div>Existing Topics</div>
                            <div>Active</div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            {loadingTopics && <div className="text-sm text-slate-500">Loading...</div>}
                            {!loadingTopics && topicsData?.topics.length === 0 && (
                                <div className="text-sm text-slate-500">No topics found.</div>
                            )}
                            {!loadingTopics &&
                                topicsData?.topics.map((t) => (
                                    <div
                                        key={t.id}
                                        className="p-2 border-b border-slate-100 flex justify-between items-center cursor-pointer hover:bg-slate-50"
                                        onClick={() => handleTopicClick(t.id)}
                                    >
                                        <div>
                                            <div className="font-medium">{t.name}</div>
                                            <div className="text-xs text-slate-500">{t.description}</div>
                                        </div>
                                        <div>
                                            <Checkbox checked={t.isActive} disabled />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <SheetFooter className="flex flex-row justify-start gap-2 flex-shrink-0">
                        <Button className="btn btn-gradient" onClick={handleSubmit} disabled={loading}>
                            {loading ? "Creating..." : "Create Topic"}
                        </Button>
                        <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={loading}>
                            Cancel
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent className="border border-slate-200">
                    <DialogHeader>
                        <DialogTitle>Topic Details</DialogTitle>
                        <DialogClose />
                    </DialogHeader>

                    {loadingTopicDetails && <div>Loading...</div>}
                    {!loadingTopicDetails && topicDetails && (
                        <div className="space-y-2">
                            <div><strong>Name:</strong> {topicDetails.name}</div>
                            <div><strong>Description:</strong> {topicDetails.description}</div>
                            <div><strong>Active:</strong> {topicDetails.isActive ? "Yes" : "No"}</div>
                            <div className="flex items-center gap-2"><strong>Create By:</strong>
                                {topicDetails.createdBy || <div className="italic text-sm text-slate-500">Chưa cập nhật</div>}
                            </div>
                            <div><strong>Created At:</strong> {new Date(topicDetails.createdAt).toLocaleString("vi-VN", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false
                            })}</div>
                            {topicDetails.updatedAt && (
                                <div><strong>Updated At:</strong> {new Date(topicDetails.updatedAt).toLocaleString("vi-VN", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: false
                                })}</div>
                            )}
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
