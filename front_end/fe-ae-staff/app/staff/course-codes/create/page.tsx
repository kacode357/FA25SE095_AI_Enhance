"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCourseCode } from "@/hooks/course-code/useCreateCourseCode";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateCourseCodePage() {
    const { createCourseCode, loading } = useCreateCourseCode();
    const router = useRouter();

    const [form, setForm] = useState({
        code: "",
        title: "",
        description: "",
        department: "",
        isActive: true,
    });

    const handleChange = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        const payload = {
            code: form.code,
            title: form.title,
            description: form.description,
            department: form.department,
            isActive: form.isActive,
        };

        const res = await createCourseCode(payload);
        if (res?.courseCode) {
            router.push("/staff/course-codes");
        }
    };

    return (
        <div className="min-h-full p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold">Create Course Code</h2>
                        <p className="text-sm text-gray-500">Create, manage and organize course codes</p>
                    </div>
                    <div className="flex items-center bg-violet-100 rounded-md gap-2">
                        <Button variant="ghost" className="text-violet-700" onClick={() => router.push('/staff/course-codes')}><ArrowLeft className="size-4 mr-2" />Back to Course Codes</Button>
                    </div>
                </div>

                <Card className="overflow-hidden shadow-lg border-slate-200 rounded-xl">
                    <CardContent className="p-6 bg-white">
                        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <Label className="mb-1">Code</Label>
                                    <Input
                                        placeholder="Enter course code (e.g. CS101)"
                                        className="placeholder:text-sm text-sm rounded-md"
                                        value={form.code}
                                        onChange={(e) => handleChange('code', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-1">Title</Label>
                                    <Input
                                        placeholder="Enter course title"
                                        className="placeholder:text-sm text-sm rounded-md"
                                        value={form.title}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-1">Description</Label>
                                    <Input
                                        placeholder="Short description"
                                        className="placeholder:text-sm text-sm rounded-md"
                                        value={form.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-1">Department</Label>
                                    <Input
                                        placeholder="Department name"
                                        className="placeholder:text-sm text-sm rounded-md"
                                        value={form.department}
                                        onChange={(e) => handleChange('department', e.target.value)}
                                    />
                                </div>
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
                                <Label htmlFor="isActive">Is Active</Label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button variant="ghost" onClick={() => router.push('/staff/course-codes')}>Cancel</Button>
                                <Button className="btn btn-gradient-slow" type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Course Code'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
