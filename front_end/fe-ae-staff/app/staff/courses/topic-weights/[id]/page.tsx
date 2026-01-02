"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetTopicWeightById } from "@/hooks/topic/useGetTopicWeightById";
import { useUpdateTopicWeight } from "@/hooks/topic/useUpdateTopicWeight";
import { formatToVN } from "@/utils/datetime/time";
import { ArrowLeft, CalendarDays, Edit, Layers, Library, Percent, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function TopicWeightDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string | undefined;

    const { data, loading, fetchTopicWeightById } = useGetTopicWeightById();
    const { loading: updating, updateTopicWeight } = useUpdateTopicWeight();

    const [isEditing, setIsEditing] = useState(false);
    const [weightValue, setWeightValue] = useState<number | undefined>(undefined);
    const [descValue, setDescValue] = useState<string>("");

    useEffect(() => {
        if (!id) return;
        fetchTopicWeightById(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Populate form data
    useEffect(() => {
        if (!data) return;
        setWeightValue(data.weightPercentage ?? undefined);
        setDescValue(data.description ?? "");
    }, [data]);

    // --- Loading Skeleton ---
    if (loading) {
        return (
            <div className="max-w-5xl mx-auto p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
                    <div className="h-10 w-24 bg-slate-200 rounded animate-pulse" />
                </div>
                <Card className="h-[400px] bg-slate-50 animate-pulse border-slate-200" />
            </div>
        );
    }

    // --- Empty State ---
    if (!data && !loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
                <Layers className="w-16 h-16 text-slate-300" />
                <h2 className="text-xl font-semibold text-slate-700">Topic Weight Not Found</h2>
                <Button variant="outline" onClick={() => router.back()}>Go Back</Button>
            </div>
        );
    }

    const handleCancel = () => {
        setIsEditing(false);
        setWeightValue(data?.weightPercentage ?? undefined);
        setDescValue(data?.description ?? "");
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* --- Header Navigation --- */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="gap-2 flex space-y-1">
                        <button
                            title="Back"
                            onClick={() => router.back()}
                            className="h-10 w-10 cursor-pointer hover:bg-slate-100 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center transition-all mb-1"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-700" />
                        </button>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center">
                            Topic Configuration
                        </h1>
                    </div>

                    {!isEditing && (
                        <Button
                            onClick={() => setIsEditing(true)}
                            className="shadow-sm bg-indigo-600 btn btn-green-slow hover:bg-indigo-700 text-white transition-colors"
                        >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Configuration
                        </Button>
                    )}
                </div>

                {/* --- Main Details Card --- */}
                {data && (
                    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">

                        {/* WRAPPER: Nội dung hiển thị chính. 
                            Sẽ bị mờ (blur) và không click được khi isEditing = true.
                        */}
                        <div className={`transition-all duration-300 ${isEditing ? 'opacity-30 blur-[2px] pointer-events-none select-none grayscale-[0.5]' : ''}`}>
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3">
                                            {data.courseCodeName && (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 whitespace-nowrap">
                                                        {data.courseCodeName}
                                                    </span>
                                                </div>
                                            )}

                                            {data.specificCourseName && (
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
                                                        {data.specificCourseName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <h2 className="text-xl font-bold text-slate-900">{data.topicName}</h2>
                                    </div>

                                    <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
                                        <div className="p-2 bg-emerald-100 rounded-full">
                                            <Percent className="w-5 h-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-medium uppercase">Weight</p>
                                            <p className="text-xl font-bold text-slate-900 leading-none">{data.weightPercentage}%</p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 grid gap-6">
                                <div className="space-y-2">
                                    <h3 className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                        <Layers className="w-4 h-4" /> Description
                                    </h3>
                                    <div className="p-4 bg-slate-50 rounded-md border border-slate-100 text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {data.description || <span className="italic text-slate-400">No description provided for this topic weight.</span>}
                                    </div>
                                </div>

                                <Separator className="bg-slate-100" />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                            <Library className="w-3.5 h-3.5" /> Specific Course Context
                                        </h3>
                                        <p className="text-sm font-medium text-slate-900">
                                            {data.specificCourseName || "Applied globally to Course Code"}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <h3 className="text-xs font-medium text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                            <CalendarDays className="w-3.5 h-3.5" /> Configured At
                                        </h3>
                                        <p className="text-sm font-medium text-slate-900">
                                            {data.configuredAt ? formatToVN(data.configuredAt) : '-'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </div>

                        {/* MODAL EDIT: Nằm Tuyệt đối (Absolute) đè lên trên content.
                        */}
                        {isEditing && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-white border border-slate-200 shadow-2xl rounded-xl w-full max-w-2xl overflow-hidden ring-1 ring-slate-900/5 flex flex-col max-h-[90%]">

                                    {/* Modal Header */}
                                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <div>
                                            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                                Edit Configuration
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                                                    Editing
                                                </span>
                                            </h4>
                                        </div>
                                        <button
                                            title="Cancel"
                                            onClick={handleCancel}
                                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-md transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 space-y-6 bg-white overflow-y-auto">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                                            {/* Column 1: Weight (nhỏ hơn) */}
                                            <div className="md:col-span-4 space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Weight Percentage</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        autoFocus
                                                        value={weightValue ?? ''}
                                                        onChange={(e) => setWeightValue(e.target.value === '' ? undefined : Math.max(0, Math.min(100, Number(e.target.value))))}
                                                        className="block w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-0 focus:border-slate-300 transition-all shadow-sm"
                                                        placeholder="0"
                                                    />
                                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                        <Percent className="h-4 w-4 text-slate-400" aria-hidden="true" />
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-400 leading-tight">
                                                    Set the percentage weight for this topic (0-100).
                                                </p>
                                            </div>

                                            {/* Column 2: Description (lớn hơn + TextArea) */}
                                            <div className="md:col-span-8 space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
                                                <textarea
                                                    rows={4}
                                                    value={descValue}
                                                    onChange={(e) => setDescValue(e.target.value)}
                                                    className="block w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-0 focus:border-slate-300 transition-all shadow-sm resize-none"
                                                    placeholder="Enter a detailed description for this topic configuration..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                        <Button
                                            variant="outline"
                                            onClick={handleCancel}
                                            className="bg-white hover:bg-slate-50 cursor-pointer border-slate-200 text-slate-700"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={async () => {
                                                if (!id) return;
                                                const payload: any = {};
                                                if (typeof weightValue === 'number') payload.weightPercentage = weightValue;
                                                payload.description = descValue || null;

                                                const res = await updateTopicWeight(id, payload);
                                                if (res) {
                                                    setIsEditing(false);
                                                    fetchTopicWeightById(id);
                                                }
                                            }}
                                            disabled={updating}
                                            className="bg-indigo-600 btn btn-green-slow hover:bg-indigo-700 text-white shadow-sm min-w-[120px]"
                                        >
                                            {updating ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="h-3 w-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
                                                </span>
                                            ) : 'Save Changes'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}