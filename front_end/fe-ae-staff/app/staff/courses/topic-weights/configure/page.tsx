"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Select from "@/components/ui/select/Select";
import { Separator } from "@/components/ui/separator";
import { useCourseCodes } from "@/hooks/course-code/useCourseCodes";
import { useCourses } from "@/hooks/course/useCourses";
import { useGetTopics } from "@/hooks/topic/useGetTopics";
import { useGetTopicsDropdown } from "@/hooks/topic/useGetTopicsDropdown";
import { TopicWeightsService } from "@/services/topic-weights.services";
import { ArrowLeft, BookOpen, Info, Layers, Library, Percent, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export default function ConfigureTopicWeightPage() {
    const router = useRouter();
    const { data: topicsData, fetchTopics } = useGetTopics();
    const { listData: courseCodes, fetchCourseCodes } = useCourseCodes();
    const { listData: coursesData, fetchCourses } = useCourses();

    const [topicId, setTopicId] = useState<string>("");
    const [courseCodeId, setCourseCodeId] = useState<string>("");
    const [specificCourseId, setSpecificCourseId] = useState<string>("");
    const [weightPercentage, setWeightPercentage] = useState<number | "">("");
    const [description, setDescription] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    const { data: dropdownTopics, fetchDropdown: fetchDropdownTopics } = useGetTopicsDropdown();
    const courseCodeWrapperRef = useRef<HTMLDivElement | null>(null);
    const specificCourseWrapperRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        fetchTopics({ page: 1, pageSize: 1000, isActive: true });
        fetchCourseCodes({ page: 1, pageSize: 1000, isActive: true });
        fetchCourses({ page: 1, pageSize: 1000, status: 2 });
        fetchDropdownTopics();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!topicId) { toast.error("Please select a Topic."); return; }
        if (!courseCodeId && !specificCourseId) { toast.error("Please select a Course Code or a Specific Course."); return; }
        if (weightPercentage === "" || weightPercentage === null) { toast.error("Please enter Weight Percentage."); return; }
        if (typeof weightPercentage === "number" && (weightPercentage < 0 || weightPercentage > 100)) { toast.error("Weight must be between 0 and 100."); return; }

        // Only include IDs that the user explicitly selected.
        const payload = {
            topicId,
            courseCodeId: courseCodeId ? courseCodeId : null,
            specificCourseId: specificCourseId ? specificCourseId : null,
            weightPercentage: Number(weightPercentage),
            description: description || null,
        } as any;

        try {
            setSubmitting(true);
            await TopicWeightsService.create(payload);
            router.push("/staff/courses/topic-weights");
        } catch (err: any) {
            toast.error(err?.message || "Failed to create configuration. Please check your inputs.");
        } finally {
            setSubmitting(false);
        }
    };

    const topics = topicsData?.topics || [];
    const codes = courseCodes || [];
    const courses = coursesData?.courses || [];

    const topicOptions = (topics.length ? topics : dropdownTopics || []).map((t: any) => ({ value: String(t.id), label: t.name || t.topicName || t.title }));

    const SelectWrapper = ({ children, icon: Icon }: { children: React.ReactNode, icon?: any }) => (
        <div className="relative">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Icon className="w-4 h-4" />
                </div>
            )}
            {children}
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            title="Back"
                            onClick={() => router.back()}
                            className="h-10 w-10 cursor-pointer hover:bg-slate-100 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center transition-all mb-1"
                        >
                            <ArrowLeft className="w-4 h-4 text-slate-700" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configure New Topic Weight</h1>
                            <p className="text-sm text-slate-500">Define how topics are weighted for specific courses.</p>
                        </div>
                    </div>
                </div>

                <Card className="border-slate-200 shadow-sm gap-0 bg-white overflow-hidden">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-8 py-5">
                        <div className="flex items-center gap-2">
                            <div className="bg-indigo-100 p-1.5 rounded text-indigo-600">
                                <Layers className="w-4 h-4" />
                            </div>
                            <CardTitle className="text-base font-semibold text-slate-800">New Configuration Details</CardTitle>
                        </div>
                        <CardDescription>Fill in the details below. All fields marked with * are required.</CardDescription>
                    </CardHeader>

                    <CardContent className="p-8">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                {/* Topic Select */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Topic <span className="text-red-500">*</span>
                                    </label>
                                    <SelectWrapper icon={Layers}>
                                        <Select<string>
                                            value={topicId}
                                            options={topicOptions}
                                            placeholder="Select a Topic..."
                                            onChange={(v) => setTopicId(String(v))}
                                            className="w-full pl-10"
                                        />
                                    </SelectWrapper>
                                </div>

                                {/* Course Code Select */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Course Code <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative" ref={courseCodeWrapperRef}>
                                        <SelectWrapper icon={Library}>
                                            <Select<string>
                                                value={courseCodeId}
                                                options={codes.map((c: any) => ({ value: String(c.id), label: c.code || c.title }))}
                                                placeholder="Select Course Code..."
                                                onChange={(v) => setCourseCodeId(String(v))}
                                                className="w-full pl-10"
                                                disabled={!!specificCourseId}
                                            />
                                        </SelectWrapper>

                                        {specificCourseId && (
                                            <button
                                                title="Course"
                                                type="button"
                                                className="absolute inset-0 bg-transparent"
                                                onClick={() => {
                                                    setSpecificCourseId("");
                                                    setTimeout(() => {
                                                        courseCodeWrapperRef.current?.querySelector("button")?.click();
                                                    }, 60);
                                                }}
                                                aria-hidden
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Specific Course Select */}
                                <div className="md:col-span-2 space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            Specific Course Context <span className="text-red-500">*</span>
                                        </label>
                                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 rounded-full">Optional</span>
                                    </div>
                                    <div className="relative" ref={specificCourseWrapperRef}>
                                        <SelectWrapper icon={BookOpen}>
                                            <Select<string>
                                                value={specificCourseId}
                                                options={[{ value: "", label: "-- Apply Globally to Course Code --" },
                                                ...courses.map((c: any) => ({ value: String(c.id), label: `${c.name || c.title} (${c.code})` }))
                                                ]}
                                                placeholder="-- Apply Globally to Course Code --"
                                                onChange={(v) => setSpecificCourseId(String(v))}
                                                className="w-full pl-10"
                                                disabled={!!courseCodeId}
                                            />
                                        </SelectWrapper>

                                        {courseCodeId && (
                                            <button
                                                title="Course Course"
                                                type="button"
                                                className="absolute inset-0 bg-transparent"
                                                onClick={() => {
                                                    setCourseCodeId("");
                                                    setTimeout(() => {
                                                        specificCourseWrapperRef.current?.querySelector("button")?.click();
                                                    }, 60);
                                                }}
                                                aria-hidden
                                            />
                                        )}
                                    </div>
                                    <p className="text-[11px] mt-4 text-slate-400">Configuration is only allowed for specific Course Codes or specific Courses. Leave blank to apply this weight to all courses under the selected code.</p>
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Weight Input - FIX: Đã sửa ở đây */}
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Weight Percentage <span className="text-red-500">*</span>
                                    </label>
                                    {/* Chỉ thẻ input và icon nằm trong relative */}
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min={0}
                                            max={100}
                                            value={weightPercentage}
                                            onChange={(e) => {
                                                const v = e.target.value === "" ? "" : Number(e.target.value);
                                                if (v === "") return setWeightPercentage("");
                                                setWeightPercentage(Math.max(0, Math.min(100, Number(v))));
                                            }}
                                            className="block w-full pl-4 pr-10 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-0 focus:border-slate-300 transition-shadow shadow-sm"
                                            placeholder="0"
                                        />
                                        {/* Icon giờ sẽ căn giữa hoàn hảo theo input */}
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                            <Percent className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
                                    {/* Thẻ P được đưa ra ngoài để không ảnh hưởng chiều cao của div relative */}
                                    <p className="text-[11px] flex items-center gap-2 mt-2 text-slate-400 leading-tight">
                                        <Info className="size-4" />Set the percentage weight for this topic (0-100).
                                    </p>
                                </div>

                                {/* Description Input */}
                                <div className="md:col-span-8 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="block w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0 focus:border-slate-300 transition-shadow shadow-sm resize-none"
                                        placeholder="Briefly describe the purpose of this weight configuration..."
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="bg-white border-slate-300 cursor-pointer text-slate-700 hover:bg-slate-50 min-w-[100px]"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="bg-indigo-600 btn btn-green-slow hover:bg-indigo-700 text-white shadow-md shadow-indigo-200 min-w-[140px]"
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Save className="w-4 h-4" /> Save Configuration
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}