"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useGetTopicWeightById } from "@/hooks/topic/useGetTopicWeightById";
import { useUpdateTopicWeight } from "@/hooks/topic/useUpdateTopicWeight";
import { formatToVN } from "@/utils/datetime/time";
import { AlertTriangle, ArrowLeft, CalendarDays, Check, Clock, Edit, Layers, Library, Percent, X } from "lucide-react";
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
        <div className="min-h-screen bg-slate-50/50 p-6 font-sans text-slate-900">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* --- Header Navigation --- */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            title="Back"
                            onClick={() => router.back()}
                            className="h-9 w-9 cursor-pointer shadow-sm hover:bg-white hover:shadow-sm rounded-full border border-slate-200 hover:border-slate-200 flex items-center justify-center transition-all"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Topic Configuration
                            </h1>
                            <p className="text-sm text-slate-500">View and manage weight distribution details.</p>
                        </div>
                    </div>

                    {!isEditing && (
                        <div className="flex items-center gap-2">
                            {data?.courseCodeId && (
                                <Button 
                                    variant="outline" 
                                    className="bg-white btn btn-green-slow"
                                    onClick={() => router.push(`/staff/course-codes/${data.courseCodeId}/weights`)}
                                >
                                <Edit className="w-4 h-4 mr-2" />
                                    Update Configuration
                                </Button>
                            )}
                        </div>
                    )}
                </div>

                {/* --- Main Details Card --- */}
                {data && (
                    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden relative min-h-[500px]">

                        {/* WRAPPER: Nội dung hiển thị chính. 
                            Sẽ bị mờ (blur) và không click được khi isEditing = true.
                        */}
                        <div className={`transition-all duration-300 ${isEditing ? 'opacity-40 blur-[2px] pointer-events-none select-none grayscale-[0.3]' : ''}`}>
                            <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6 pt-6">
                                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            {data.courseCodeName && (
                                                <span className="inline-flex items-center rounded-md bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 whitespace-nowrap">
                                                    Code: {data.courseCodeName}
                                                </span>
                                            )}
                                            {data.specificCourseName && (
                                                <span className="inline-flex items-center rounded-md bg-purple-50 px-2.5 py-1 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-700/10">
                                                    Specific: {data.specificCourseName}
                                                </span>
                                            )}
                                        </div>
                                        <h2 className="text-2xl font-bold text-slate-900">{data.topicName}</h2>
                                    </div>

                                    {/* Big Weight Badge */}
                                    <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-xl border border-slate-200 shadow-sm">
                                        <div className="p-2.5 bg-emerald-100 rounded-lg">
                                            <Percent className="w-6 h-6 text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Current Weight</p>
                                            <p className="text-2xl font-bold text-slate-900 leading-none">{data.weightPercentage}%</p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-6 md:p-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    
                                    {/* Main column: Description + context */}
                                    <div className="md:col-span-2 space-y-8">
                                        {/* Description Section */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wide">
                                                <Layers className="w-4 h-4 text-slate-400" /> Description
                                            </h3>
                                            <div className="p-5 bg-slate-50/80 rounded-lg border border-slate-100 text-sm text-slate-700 leading-7 whitespace-pre-wrap">
                                                {data.description || <span className="italic text-slate-400">No description provided for this topic weight.</span>}
                                            </div>
                                        </div>

                                        {/* Context Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                                            <div className="space-y-1.5">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                                    <Library className="w-3.5 h-3.5" /> Scope
                                                </h4>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {data.specificCourseName ? "Applied to Specific Course" : "Applied Globally (Course Code)"}
                                                </p>
                                            </div>

                                            <div className="space-y-1.5">
                                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                                                    <CalendarDays className="w-3.5 h-3.5" /> Configured At
                                                </h4>
                                                <p className="text-sm font-medium text-slate-800">
                                                    {data.configuredAt ? formatToVN(data.configuredAt) : 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column: Sidebar Metadata */}
                                    <aside className="md:col-span-1 space-y-5">
                                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-5 space-y-5">
                                            <div className="flex items-center gap-3 pb-4 border-b border-slate-200/60">
                                                <div className="p-2 bg-indigo-50 rounded-full">
                                                    <Clock className="w-4 h-4 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <div className="text-xs text-slate-500 font-medium">Last Updated</div>
                                                    <div className="text-sm font-bold text-slate-900">{data.updatedAt ? formatToVN(data.updatedAt) : '-'}</div>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Permissions</div>
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-600">Can Update</span>
                                                        {data.canUpdate ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                                                <Check className="w-3 h-3" /> Yes
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">No</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-slate-600">Can Delete</span>
                                                        {data.canDelete ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                                                                <AlertTriangle className="w-3 h-3" /> Yes
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">No</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Warnings / Blocks */}
                                            {(data.blockReason || data.warning) && (
                                                <div className="pt-2 space-y-2">
                                                    {data.blockReason && (
                                                        <div className="bg-rose-50 border border-rose-100 rounded-md p-3 text-xs text-rose-800">
                                                            <span className="font-bold block mb-1">Block Reason:</span>
                                                            {data.blockReason}
                                                        </div>
                                                    )}
                                                    {data.warning && (
                                                        <div className="bg-amber-50 border border-amber-100 rounded-md p-3 text-xs text-amber-800">
                                                            <span className="font-bold block mb-1">Warning:</span>
                                                            {data.warning}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </aside>
                                </div>
                            </CardContent>
                        </div>

                        {/* MODAL EDIT: Nằm Tuyệt đối (Absolute) đè lên trên content */}
                        {isEditing && (
                            <div className="absolute inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-white border border-slate-200 shadow-2xl rounded-xl w-full max-w-2xl overflow-hidden ring-1 ring-slate-900/5 flex flex-col max-h-[90%]">

                                    {/* Modal Header */}
                                    <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                        <div>
                                            <h4 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                                Update Configuration
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase tracking-wide">
                                                    Active
                                                </span>
                                            </h4>
                                            <p className="text-xs text-slate-500 mt-0.5">Update weight percentage and description.</p>
                                        </div>
                                        <button
                                            title="Cancel"
                                            onClick={handleCancel}
                                            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-2 rounded-full transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    {/* Modal Body */}
                                    <div className="p-6 space-y-6 bg-white overflow-y-auto">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                                            {/* Column 1: Weight */}
                                            <div className="md:col-span-4 space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Weight Percentage</label>
                                                <div className="relative group">
                                                    <input
                                                        type="number"
                                                        min={0}
                                                        max={100}
                                                        autoFocus
                                                        value={weightValue ?? ''}
                                                        onChange={(e) => setWeightValue(e.target.value === '' ? undefined : Math.max(0, Math.min(100, Number(e.target.value))))}
                                                        className="block w-full pl-4 pr-10 py-3 bg-white border border-slate-300 rounded-lg text-lg font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                                                        placeholder="0"
                                                    />
                                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                                        <Percent className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                                    </div>
                                                </div>
                                                <p className="text-[11px] text-slate-400">
                                                    Enter a value between 0 and 100.
                                                </p>
                                            </div>

                                            {/* Column 2: Description */}
                                            <div className="md:col-span-8 space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
                                                <textarea
                                                    rows={5}
                                                    value={descValue}
                                                    onChange={(e) => setDescValue(e.target.value)}
                                                    className="block w-full px-4 py-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm resize-none"
                                                    placeholder="Enter a detailed description explaining this configuration..."
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Modal Footer */}
                                    <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                                        <Button
                                            variant="ghost"
                                            onClick={handleCancel}
                                            className="text-slate-600 hover:text-slate-800 hover:bg-slate-200/50"
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
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm min-w-[140px]"
                                        >
                                            {updating ? (
                                                <span className="flex items-center gap-2">
                                                    <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
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