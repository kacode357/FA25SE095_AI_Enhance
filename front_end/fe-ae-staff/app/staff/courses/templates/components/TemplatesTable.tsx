"use client";
import React from "react";
import { FileText, Power, CheckCircle2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Badge from "./Badge";

type Props = {
    templates: any[];
    loadingMeta: boolean;
    toggling?: boolean;
    deleting?: boolean;
    handleToggle: (id: string) => void;
    handleDelete: (id: string, name: string) => void;
    formatToVN: (v: any) => string;
};

export default function TemplatesTable({ templates, loadingMeta, toggling, deleting, handleToggle, handleDelete, formatToVN }: Props) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-xs uppercase text-slate-500 font-semibold tracking-wider border-b border-slate-100">
                    <tr>
                        <th className="px-6 text-[11px] py-4">File Name</th>
                        <th className="px-6 text-[11px] py-4 w-[30%]">Description</th>
                        <th className="px-6 text-[11px] py-4 text-center">Type</th>
                        <th className="px-6 text-[11px] py-4 text-center">Status</th>
                        <th className="px-6 text-[11px] py-4 text-center">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {loadingMeta ? (
                        [...Array(3)].map((_, i) => (
                            <tr key={i} className="animate-pulse">
                                <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-200 rounded"></div></td>
                                <td className="px-6 py-4"><div className="h-4 w-48 bg-slate-200 rounded"></div></td>
                                <td colSpan={3} className="px-6 py-4"></td>
                            </tr>
                        ))
                    ) : templates.length > 0 ? (
                        templates.map((t, idx) => (
                            <tr key={t.id ?? idx} className="hover:bg-slate-50/80 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <FileText className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-[12px] text-slate-900">
                                                <span
                                                    className="hover:text-blue-800 text-blue-500 text-left transition-colors"
                                                    title={t.name || t.filename || 'file'}
                                                >
                                                    {t.name || t.filename || "Untitled"}
                                                </span>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-2 mb-1">
                                                {t.sizeFormatted ?? (t.size ? `${(t.size / 1024).toFixed(1)} KB` : "Unknown Size")}
                                            </div>
                                            <div className="text-xs text-slate-400">Updated: {t.updatedAt ? formatToVN(t.updatedAt) : "-"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-600 leading-relaxed">
                                    {t.description || <span className="text-slate-400 italic">No description provided</span>}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-[10px] font-medium text-slate-600 border border-slate-200 uppercase tracking-wide">
                                        {t.type ? t.type.split('/').pop().toUpperCase() : "DOC"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-[10px] text-center">
                                    <Badge active={t.isActive} />
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-4">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            onClick={() => handleToggle(t.id)}
                                            disabled={toggling}
                                            className={
                                                `
                                                            h-8 px-3 text-[11px] font-medium border transition-all
                                                                    ${t.isActive
                                                            ? "!text-red-600 cursor-pointer !bg-red-50 !border-red-200"
                                                            : "!text-emerald-600 cursor-pointer !bg-emerald-50 !border-emerald-200"
                                                        }
                                                        `}
                                        >
                                            {t.isActive ? (
                                                <><Power className="w-3 h-3 mr-1.5" /> Deactivate</>
                                            ) : (
                                                <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> Activate</>
                                            )}
                                        </Button>

                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            disabled={deleting}
                                            onClick={() => handleDelete(t.id, t.name || t.filename)}
                                            className="h-5 w-5 !text-red-600 cursor-pointer !bg-red-50 !border-red-200 flex items-center justify-center"
                                            title="Delete Template"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 text-current" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center text-slate-400">
                                    <div className="p-4 bg-slate-50 rounded-full mb-3">
                                        <FileText className="w-8 h-8 opacity-50" />
                                    </div>
                                    <p className="text-base font-medium text-slate-600">No templates found</p>
                                    <p className="text-sm">Upload a new file to get started.</p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
