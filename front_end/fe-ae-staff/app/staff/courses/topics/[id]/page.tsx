"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from "@/components/ui/alert-dialog";
import Button from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDeleteTopic } from "@/hooks/topic/useDeleteTopic";
import { useGetTopicById } from "@/hooks/topic/useGetTopicById";
import { useUpdateTopic } from "@/hooks/topic/useUpdateTopic";
import { Topic as TopicType } from "@/types/topic/topic.response";
import { formatToVN } from "@/utils/datetime/time";
import { ArrowLeft, Check, Edit, Trash2, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopicDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const { data, loading, error, fetchTopicById } = useGetTopicById();
    const { updateTopic, loading: updating } = useUpdateTopic();
    const { deleteTopic, loading: deleting } = useDeleteTopic();

    const [isEditing, setIsEditing] = useState(false);
    const [formName, setFormName] = useState("");
    const [formDescription, setFormDescription] = useState("");
    const [formIsActive, setFormIsActive] = useState<boolean | undefined>(undefined);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (!id || typeof id !== "string") return;
        fetchTopicById(id);
    }, [id]);

    useEffect(() => {
        // when topic loads, populate form if not editing
        const t = data ?? null;
        if (t && !isEditing) {
            setFormName(t.name ?? "");
            setFormDescription(t.description ?? "");
            setFormIsActive(typeof t.isActive === 'boolean' ? t.isActive : undefined);
        }
    }, [data, isEditing]);

    const fmt = (v?: string | null) =>
        v ? formatToVN(v, { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }) : "-";

    const topic: TopicType | null = data ?? null;

    const startEdit = () => setIsEditing(true);

    const cancelEdit = () => {
        setIsEditing(false);
        const t = data ?? null;
        if (t) {
            setFormName(t.name ?? "");
            setFormDescription(t.description ?? "");
            setFormIsActive(typeof t.isActive === 'boolean' ? t.isActive : undefined);
        }
    };

    const handleSave = async () => {
        if (!topic) return;
        const payload: any = {
            name: formName,
            description: formDescription,
            isActive: formIsActive,
        };
        try {
            await updateTopic(topic.id, payload);
            await fetchTopicById(topic.id);
            setIsEditing(false);
        } catch (e) {
            // handled by hook
        }
    };

    const handleDelete = async () => {
        if (!topic) return;
        const res = await deleteTopic(topic.id);
        if (res?.success) router.push("/staff/courses/topics");
    };

    return (
        <div className="p-4 md:p-6">
            <div className="flex items-center justify-end mb-4">
                <Button variant="ghost" className="text-sm btn btn-green-slow" onClick={() => router.push("/staff/courses/topics")}>
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </Button>
            </div>

            <Card className="border border-slate-200 shadow-sm overflow-hidden">
                <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <CardTitle className="text-2xl font-semibold leading-tight">Topic Detail</CardTitle>
                                <p className="text-slate-500 text-sm mt-1">View topic information and metadata.</p>
                            </div>

                            <div className="flex items-center gap-2">
                                {!isEditing ? (
                                    <>
                                        <Button size="sm" variant="outline" onClick={startEdit} className="flex cursor-pointer items-center gap-2">
                                            <Edit className="h-4 w-4" /> Edit
                                        </Button>
                                        <Button size="sm" onClick={() => setDeleteDialogOpen(true)} className="flex cursor-pointer bg-red-500 hover:bg-red-600 text-white items-center gap-2">
                                            <Trash2 className="h-4 w-4" /> Delete
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Button size="sm"  onClick={handleSave} disabled={updating} className="flex btn btn-green-slow items-center gap-2">
                                            <Check className="h-4 w-4" /> Save
                                        </Button>
                                        <Button size="sm" variant="ghost" onClick={cancelEdit} className="flex cursor-pointer items-center gap-2">
                                            <X className="h-4 w-4" /> Cancel
                                        </Button>
                                    </>
                                )}

                                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                    <AlertDialogContent className="bg-white border border-slate-200">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Topic?</AlertDialogTitle>
                                            <AlertDialogDescription>Are you sure you want to delete this topic? This action cannot be undone.</AlertDialogDescription>
                                        </AlertDialogHeader>

                                        <div className="mt-2 text-sm text-slate-700">
                                            <div><strong>Name:</strong> {topic?.name ?? '-'}</div>
                                            <div className="mt-1"><strong>Description:</strong> {topic?.description ?? '-'}</div>
                                        </div>

                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                            <AlertDialogAction className="bg-red-500 hover:bg-red-600 hover:shadow-md cursor-pointer" onClick={handleDelete}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-slate-800">{topic?.name ?? "-"}</h2>
                </CardHeader>

                <CardContent className="space-y-6">
                    {loading && <div className="text-sm text-slate-500">Loading...</div>}
                    {error && <div className="text-sm text-red-500">{error}</div>}

                    {!loading && !topic && !error && (
                        <div className="p-4 text-sm text-slate-500">Topic not found.</div>
                    )}

                    {topic && (
                        <section className="grid md:grid-cols-2 gap-x-10 gap-y-10 text-sm">
                            {!isEditing ? (
                                <>
                                    <Field label="Name" value={topic.name ?? "-"} />
                                    <Field label="Active" value={typeof topic.isActive === 'boolean' ? (topic.isActive ? 'Yes' : 'No') : '-'} />
                                    <Field label="Description" value={topic.description ?? "-"} multiline />
                                    <Field label="Created By" value={topic.createdBy ?? "-"} />
                                    <Field label="Created At" value={fmt(topic.createdAt)} />
                                    <Field label="Updated At" value={fmt(topic.updatedAt)} />
                                    <Field label="Last Modified By" value={topic.lastModifiedBy ?? "-"} />
                                    <Field label="Last Modified At" value={fmt(topic.lastModifiedAt)} />
                                </>
                            ) : (
                                <>
                                    <div>
                                        <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">Name</div>
                                        <Input value={formName} onChange={(e) => setFormName(e.target.value)} className="mt-1" />
                                    </div>

                                    <div>
                                        <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">Active</div>
                                        <div className="mt-1">
                                            <label className="flex items-center gap-2">
                                                <input type="checkbox" checked={!!formIsActive} onChange={(e) => setFormIsActive(e.target.checked)} />
                                                <span className="text-sm text-slate-700">Active</span>
                                            </label>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">Description</div>
                                        <Textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} className="mt-1 w-full border-slate-200" />
                                    </div>

                                    <Field label="Created By" value={topic.createdBy ?? "-"} />
                                    <Field label="Created At" value={fmt(topic.createdAt)} />
                                    <Field label="Updated At" value={fmt(topic.updatedAt)} />
                                    <Field label="Last Modified By" value={topic.lastModifiedBy ?? "-"} />
                                    <Field label="Last Modified At" value={fmt(topic.lastModifiedAt)} />
                                </>
                            )}
                        </section>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function Field({ label, value, multiline }: { label: string; value: string; multiline?: boolean }) {
    return (
        <div>
            <div className="text-[11px] uppercase tracking-wide text-slate-500 font-medium">{label}</div>
            <div className={`mt-1 text-slate-900 ${multiline ? "whitespace-pre-wrap" : ""}`}>{value}</div>
        </div>
    );
}
