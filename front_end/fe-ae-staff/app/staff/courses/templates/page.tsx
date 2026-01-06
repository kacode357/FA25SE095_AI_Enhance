"use client";

import { Button } from "@/components/ui/button";
import useDeleteTemplate from "@/hooks/template/useDeleteTemplate";
import useTemplateMetadata from "@/hooks/template/useTemplateMetadata";
import useToggleTemplateStatus from "@/hooks/template/useToggleTemplateStatus";
import useUploadTemplate from "@/hooks/template/useUploadTemplate";
import { formatToVN } from "@/utils/datetime/time";
import {
    RefreshCw
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import Card from "./components/Card";
import DeleteDialog from "./components/DeleteDialog";
import normalizeTemplate from "./components/normalizeTemplate";
import TemplatesTable from "./components/TemplatesTable";
import UploadSection from "./components/UploadSection";

export default function Page() {
    // Hooks
    const { data, fetch, loading: loadingMeta, error: metaError } = useTemplateMetadata();
    const { upload, loading: uploading } = useUploadTemplate();
    const { toggle, loading: toggling } = useToggleTemplateStatus();
    const { remove, loading: deleting } = useDeleteTemplate();

    // Local State
    const [files, setFiles] = useState<FileList | null>(null);
    const [desc, setDesc] = useState("");
    const [refreshKey, setRefreshKey] = useState(0);
    const [filter, setFilter] = useState<'active' | 'inactive'>('active');

    // Ref
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Effects
    useEffect(() => {
        const isActiveParam = filter === 'active';
        fetch(isActiveParam);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey, filter]);

    // Handlers
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFiles(e.target.files);
    };

    const handleTriggerFile = () => {
        fileInputRef.current?.click();
    };

    const handleUpload = async () => {
        if (!files || files.length === 0) return;
        const file = files[0];
        const res = await upload(file, desc);
        if (res) {
            setDesc("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            setFiles(null);
            setRefreshKey((k) => k + 1);
        }
    };

    const handleToggle = async (id: string) => {
        const res = await toggle(id);
        if (res) setRefreshKey((k) => k + 1);
    };

    const handleDelete = async (id: string, name: string) => {
        if (!id) return;
        setConfirmId(id);
    };

    const [confirmId, setConfirmId] = useState<string | null>(null);

    const handleConfirmDelete = async () => {
        const id = confirmId;
        if (!id) return;
        const res = await remove(id);
        if (res) {
            setRefreshKey((k) => k + 1);
        }
        setConfirmId(null);
    };

    let templates: any[] = [];
    if (!data) templates = [];
    else if (Array.isArray(data)) templates = data.map(normalizeTemplate);
    else if ((data as any).template) templates = [normalizeTemplate((data as any).template)];
    else templates = [normalizeTemplate(data)];

    const apiMessage = (data && (data as any).message) ? (data as any).message : undefined;

    const confirmingItem = templates.find((it) => String(it.id) === String(confirmId));

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 md:p-10">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Documents & Templates</h1>
                        <p className="text-slate-500 mt-1 text-sm">Manage course materials and system templates.</p>
                    </div>
                    <Button
                        onClick={() => setRefreshKey((k) => k + 1)}
                        variant="outline"
                        size="sm"
                        className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${loadingMeta ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
                </div>

                <Card className="overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        <h2 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                            Upload New Template
                        </h2>
                    </div>
                    <UploadSection
                        files={files}
                        fileInputRef={fileInputRef}
                        handleTriggerFile={handleTriggerFile}
                        handleFileChange={handleFileChange}
                        desc={desc}
                        setDesc={setDesc}
                        handleUpload={handleUpload}
                        uploading={uploading}
                        metaError={metaError}
                    />

                    <DeleteDialog
                        confirmId={confirmId}
                        setConfirmId={setConfirmId}
                        confirmingItem={confirmingItem}
                        handleConfirmDelete={handleConfirmDelete}
                        deleting={deleting}
                    />
                </Card>

                {apiMessage && (
                    <div className="max-w-6xl mx-auto">
                        <div className="mb-2 p-3 bg-blue-50 text-blue-700 text-sm rounded-md border border-blue-100">{apiMessage}</div>
                    </div>
                )}

                <Card>
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold text-slate-900">All Files</h2>

                            <div className="inline-flex items-center bg-slate-100 rounded-md p-1">
                                <button
                                    type="button"
                                    onClick={() => setFilter('active')}
                                    className={`px-3 cursor-pointer py-1 text-xs rounded-md transition-colors ${filter === 'active' ? 'bg-white shadow-sm text-blue-700 ring-1 ring-blue-100' : 'text-slate-600 hover:text-slate-800'}`}
                                >Active</button>
                                <button
                                    type="button"
                                    onClick={() => setFilter('inactive')}
                                    className={`px-3 cursor-pointer py-1 text-xs rounded-md transition-colors ${filter === 'inactive' ? 'bg-white shadow-sm text-amber-700 ring-1 ring-amber-100' : 'text-slate-600 hover:text-slate-800'}`}
                                >Inactive</button>
                            </div>
                        </div>

                        <span className="text-xs font-medium px-2 py-1 bg-slate-100 text-slate-600 rounded-md">
                            {templates.length} items
                        </span>
                    </div>

                    <TemplatesTable
                        templates={templates}
                        loadingMeta={loadingMeta}
                        toggling={toggling}
                        deleting={deleting}
                        handleToggle={handleToggle}
                        handleDelete={handleDelete}
                        formatToVN={formatToVN}
                    />
                </Card>
            </div>
        </div>
    );
}