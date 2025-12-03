"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCreateTopic } from "@/hooks/topic/useCreateTopic";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateTopicPage() {
    const { createTopic, loading } = useCreateTopic();
    const router = useRouter();

    const [form, setForm] = useState({ name: "", description: "", isActive: true });

    const handleChange = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        const payload = {
            name: form.name,
            description: form.description,
            isActive: form.isActive,
        };

        const res = await createTopic(payload);
        if (res?.topic) {
            router.push('/staff/courses/topics');
        }
    };

    return (
        <div className="min-h-full p-6 bg-gray-50">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold">Create New Topic</h2>
                        <p className="text-sm text-gray-500">Create a topic used to categorize courses</p>
                    </div>
                </div>

                <Card className="overflow-hidden shadow-lg border-slate-200 rounded-xl">
                    <CardContent className="p-6 bg-white">
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                            <div className="mb-10">
                                <Label className="mb-3">Name</Label>
                                <Input placeholder="Topic name" className="placeholder:text-sm text-sm rounded-md" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
                            </div>

                            <div>
                                <Label className="mb-3">Description</Label>
                                <Textarea placeholder="Short description" className="w-full border-slate-200 rounded-md" value={form.description} onChange={(e) => handleChange('description', e.target.value)} />
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    title="checkbox"
                                    type="checkbox"
                                    id="isActive"
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                    checked={form.isActive}
                                    onChange={(e) => handleChange('isActive', e.target.checked)}
                                />
                                <Label htmlFor="isActive" className="text-blue-600">Is Active</Label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button className="btn btn-green-slow" type="submit" disabled={loading}>{loading ? 'Creating...' : 'Create Topic'}</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
