"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTerm } from "@/hooks/term/useCreateTerm";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateTermPage() {
    const { createTerm, loading } = useCreateTerm();
    const router = useRouter();

    const defaultStart = new Date().toISOString();
    const defaultEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const [form, setForm] = useState({
        name: "",
        description: "",
        isActive: true,
        startDate: defaultStart,
        endDate: defaultEnd,
    });

    const handleChange = (key: string, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleSubmit = async () => {
        const payload = {
            name: form.name,
            description: form.description,
            isActive: form.isActive,
            startDate: form.startDate,
            endDate: form.endDate,
        };
        const res = await createTerm(payload);
        if (res?.success) {
            // Navigate back to terms list after creation
            router.push("/staff/terms");
        }
    };

    return (
        <div className="min-h-full p-6 bg-gray-50">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-semibold">Create New Term</h2>
                        <p className="text-sm text-gray-500">Define an academic term and set its dates</p>
                    </div>
                    <div className="flex items-center bg-violet-100 rounded-md gap-2">
                    </div>
                </div>

                <Card className="overflow-hidden shadow-lg border-slate-200 rounded-xl">
                    <CardContent className="p-6 bg-white">
                        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
                            <div className="grid grid-cols-1 gap-8">
                                <div>
                                    <Label className="mb-1">Name</Label>
                                    <Input
                                        placeholder="Enter term name"
                                        className="placeholder:text-sm text-sm rounded-md"
                                        value={form.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <Label className="mb-1">Description</Label>
                                    <Input
                                        placeholder="Enter term description"
                                        className="placeholder:text-sm text-sm rounded-md"
                                        value={form.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="mb-1">Start Date</Label>
                                    <DateTimePicker
                                        value={form.startDate}
                                        onChange={(v) => handleChange('startDate', v)}
                                        placeholder="Select start date"
                                        className="w-72"
                                    />
                                </div>
                                <div>
                                    <Label className="mb-1">End Date</Label>
                                    <DateTimePicker
                                        value={form.endDate}
                                        onChange={(v) => handleChange('endDate', v)}
                                        placeholder="Select end date"
                                        className="w-72"
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
                                <Label htmlFor="isActive" className="text-blue-600">Is Active</Label>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button variant="ghost" className="cursor-pointer" onClick={() => router.push('/staff/terms')}>Cancel</Button>
                                <Button className="btn btn-green-slow" type="submit" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Term'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
