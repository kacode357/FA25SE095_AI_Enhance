"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Select from "@/components/ui/select/Select";
import { Separator } from "@/components/ui/separator";
import { useCourseCodes } from "@/hooks/course-code/useCourseCodes";
import { useCourses } from "@/hooks/course/useCourses";
import { useCreateTopicWeight } from "@/hooks/topic/useCreateTopicWeight";
import { useGetTopicWeights } from "@/hooks/topic/useGetTopicWeights";
import { useGetTopics } from "@/hooks/topic/useGetTopics";
import { useGetTopicsDropdown } from "@/hooks/topic/useGetTopicsDropdown";
import { ArrowLeft, BookOpen, Info, Layers, Percent, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ConfigureTopicWeightPage() {
    const router = useRouter();
    
    // Hooks lấy dữ liệu
    const { data: topicsData, fetchTopics } = useGetTopics();
    const { fetchCourseCodes } = useCourseCodes(); // Vẫn giữ hook này để không lỗi logic cũ, dù không render UI
    const { listData: coursesData, fetchCourses } = useCourses();

    // State quản lý form
    const [topicId, setTopicId] = useState<string>("");
    // Giữ state courseCodeId để payload không bị lỗi cấu trúc, mặc định rỗng vì đã ẩn UI
    const [courseCodeId] = useState<string>(""); 
    const [specificCourseId, setSpecificCourseId] = useState<string>("");
    const [weightPercentage, setWeightPercentage] = useState<number | "">("");
    const [description, setDescription] = useState<string>("");
    const [submitting, setSubmitting] = useState(false);

    const { data: dropdownTopics, fetchDropdown: fetchDropdownTopics } = useGetTopicsDropdown();
    const { data: topicWeightsData, fetchTopicWeights } = useGetTopicWeights();
    const { createTopicWeight } = useCreateTopicWeight();

    // Logic kiểm tra điều kiện để enable nút Save
    // Phải có Topic, Specific Course và Weight thì mới hợp lệ
    const isFormValid = topicId && specificCourseId && (weightPercentage !== "" && weightPercentage !== null);

    useEffect(() => {
        fetchTopics({ page: 1, pageSize: 1000, isActive: true });
        fetchCourseCodes({ page: 1, pageSize: 1000, isActive: true });
        fetchCourses({ page: 1, pageSize: 1000, status: 2 });
        fetchDropdownTopics();
        fetchTopicWeights({ pageNumber: 1, pageSize: 1000 });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When topic changes, refetch topic weights filtered by that topic
    useEffect(() => {
        if (!topicId) {
            fetchTopicWeights({ pageNumber: 1, pageSize: 1000 });
            setSpecificCourseId("");
            return;
        }

        // Clear any previously selected specific course to prevent showing a value
        // that's already configured for this topic, then fetch weights for the topic.
        setSpecificCourseId("");
        fetchTopicWeights({ pageNumber: 1, pageSize: 1000, topicId });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        
        // Validation logic bổ sung
        if (!topicId) return;
        if (!specificCourseId) return;
        if (weightPercentage === "" || weightPercentage === null) return;
        if (typeof weightPercentage === "number" && (weightPercentage < 0 || weightPercentage > 100)) return;

        // Payload giữ nguyên cấu trúc cũ
        const payload = {
            topicId,
            courseCodeId: courseCodeId || null, // Field này sẽ là null
            specificCourseId: specificCourseId || null,
            weightPercentage: Number(weightPercentage),
            description: description || null,
        } as any;

            try {
                setSubmitting(true);
                const res = await createTopicWeight(payload);

                if (!res) {
                    setSubmitting(false);
                    return;
                }

                router.push("/staff/courses/topic-weights");
            } catch (err: any) {
                console.error(err);
            } finally {
                setSubmitting(false);
            }
    };

    const topics = topicsData?.topics || [];
    const courses = coursesData?.courses || [];

    const topicOptions = (topics.length ? topics : dropdownTopics || []).map((t: any) => ({ value: String(t.id), label: t.name || t.topicName || t.title }));

    // Build a set of specificCourseIds already configured for the currently selected topic
    const configuredSpecificCourseIds = new Set<string>();
    if (topicWeightsData && topicWeightsData.data && topicId) {
        topicWeightsData.data
            .filter((tw: any) => String(tw.topicId) === String(topicId) && tw.specificCourseId)
            .forEach((tw: any) => configuredSpecificCourseIds.add(String(tw.specificCourseId)));
    }

    // Filter courses to hide those already configured for the selected topic
    const availableCourses = courses.filter((c: any) => !configuredSpecificCourseIds.has(String(c.id)));

    // Helper component để wrap Select với Icon
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
                {/* Header Page */}
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
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Configure Topic Weight With Specific Course</h1>
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
                            <CardTitle className="text-base font-semibold text-slate-800">Configuration Details</CardTitle>
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

                                {/* Specific Course Select (Đã di chuyển lên đây thay cho Course Code) */}
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                            Specific Course <span className="text-red-500">*</span>
                                        </label>
                                    </div>
                                    <SelectWrapper icon={BookOpen}>
                                        <Select<string>
                                            value={specificCourseId}
                                            options={courses.map((c: any) => ({
                                                value: String(c.id),
                                                label: `${c.name || c.title} (${c.code})`,
                                                disabled: configuredSpecificCourseIds.has(String(c.id)),
                                            }))}
                                            placeholder="Select Specific Course..."
                                            onChange={(v) => setSpecificCourseId(String(v))}
                                            className="w-full pl-10"
                                        />
                                    </SelectWrapper>
                                    <p className="text-[11px] mt-1 text-slate-400">
                                        Configuration applies only to the selected course.
                                    </p>
                                </div>
                            </div>

                            <Separator className="bg-slate-100" />

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                                {/* Weight Input */}
                                <div className="md:col-span-4 space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                                        Weight Percentage <span className="text-red-500">*</span>
                                    </label>
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
                                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                            <Percent className="h-4 w-4 text-slate-400" />
                                        </div>
                                    </div>
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
                                    disabled={submitting || !isFormValid}
                                    className={`
                                        min-w-[140px] shadow-md transition-all btn btn-green-slow
                                        ${!isFormValid 
                                            ? "bg-slate-300 text-slate-500 cursor-not-allowed shadow-none" 
                                            : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 btn btn-green-slow"
                                        }
                                    `}
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