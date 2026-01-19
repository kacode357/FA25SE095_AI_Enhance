"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import TopicWeightHistory from "../../components/TopicWeightHistory";

export default function TopicWeightHistoryPage() {
    const params = useParams() as any;
    const topicWeightId = params?.topicWeightId as string | undefined;
    const router = useRouter();

    // State lưu tên topic được chọn từ component con
    const [currentTopicName, setCurrentTopicName] = useState<string>("");

    return (
        <div className="min-h-screen bg-gray-50/30 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Area */}
                <div className="flex flex-row items-center justify-between gap-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                                Topic Weight History
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Viewing history for: <span className="font-semibold text-blue-600">{currentTopicName || "Loading..."}</span>
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        className="w-fit pl-0 btn btn-green-slow hover:bg-transparent hover:text-blue-600 transition-colors"
                        onClick={() => router.back()}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to previous page
                    </Button>
                </div>

                {/* Main Content */}
                <TopicWeightHistory
                    topicWeightId={topicWeightId}
                    onTopicNameChange={(name) => setCurrentTopicName(name)}
                />
            </div>
        </div>
    );
}