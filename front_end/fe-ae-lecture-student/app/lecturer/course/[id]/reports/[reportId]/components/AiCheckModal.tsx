"use client";

import type { ReportAiCheckResult } from "@/types/reports/reports.response";
import { Dialog, Transition } from "@headlessui/react";
import { motion } from "framer-motion";
import { AlertCircle, Bot, CheckCircle2, Loader2, X } from "lucide-react";
import { Fragment } from "react";
import StatusBadge from "../../utils/status";

interface Props {
    open: boolean;
    onClose: () => void;
    loading: boolean;
    result: ReportAiCheckResult | null;
    assignmentTitle?: string | null;
    studentName?: string | null;
    onReassess?: () => Promise<void>;
}

export default function AiCheckModal({ open, onClose, loading, result, assignmentTitle, studentName, onReassess }: Props) {
    const aiPercentage = result ? Math.round(result.aiPercentage) : 0;
    const riskLevel = aiPercentage >= 70 ? "high" : aiPercentage >= 40 ? "medium" : "low";

    const getRiskConfig = () => {
        if (riskLevel === "high") return { color: "text-red-600", bg: "bg-red-50", border: "border-red-200", icon: AlertCircle };
        if (riskLevel === "medium") return { color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: AlertCircle };
        return { color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle2 };
    };

    const { color, bg, border, icon: RiskIcon } = getRiskConfig();

    // SVG Circle Progress
    const circumference = 2 * Math.PI * 54;
    const strokeDashoffset = circumference - (circumference * aiPercentage) / 100;

    const formatCheckedAt = (iso?: string | null) => {
        if (!iso) return "-";
        const d = new Date(iso);
        if (Number.isNaN(d.getTime())) return "-";
        const datePart = d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
        const timePart = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
        const [hh, mm, ss] = timePart.split(":");
        const timeFormatted = `${hh}:${mm}:${ss}`;
        return `${datePart}, ${timeFormatted}`;
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-500"
                            enterFrom="opacity-0 scale-95 translate-y-8"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-300"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 -translate-y-8"
                        >
                            <Dialog.Panel className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
                                {/* Header */}
                                <div className="flex items-start justify-between border-b border-gray-100 px-8 pt-6 pb-5">
                                    <div className="flex items-start gap-4">
                                        <div className="rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 p-3">
                                            <Bot className="w-6 h-6 text-violet-600" />
                                        </div>
                                        <div>
                                            <Dialog.Title className="text-xl font-semibold text-gray-900">
                                                AI Content Detection
                                            </Dialog.Title>
                                            <p className="mt-1 text-sm text-gray-500">
                                                Powered by ZeroGPT • {assignmentTitle ?? 'Untitled'} • {studentName ?? 'Unknown Student'}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        title="Close"
                                        onClick={onClose}
                                        className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="px-8 py-8">
                                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                                        {/* Result Circle */}
                                        <div className="flex flex-col items-center justify-center">
                                            {loading ? (
                                                <div className="relative">
                                                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-50 to-purple-50 flex items-center justify-center">
                                                        <motion.div
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                        >
                                                            <Loader2 className="w-12 h-12 text-violet-600" />
                                                        </motion.div>
                                                    </div>
                                                    <p className="mt-4 text-sm font-medium text-gray-600">Analyzing Submission...</p>
                                                </div>
                                            ) : result ? (
                                                <motion.div
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                                                    className="relative"
                                                >
                                                    <svg className="w-40 h-40 -rotate-90">
                                                        <circle
                                                            cx="80"
                                                            cy="80"
                                                            r="54"
                                                            stroke="currentColor"
                                                            strokeWidth="12"
                                                            fill="none"
                                                            className="text-gray-100"
                                                        />
                                                        <motion.circle
                                                            cx="80"
                                                            cy="80"
                                                            r="54"
                                                            stroke="currentColor"
                                                            strokeWidth="12"
                                                            fill="none"
                                                            strokeLinecap="round"
                                                            className={aiPercentage >= 70 ? "text-red-500" : aiPercentage >= 40 ? "text-amber-500" : "text-emerald-500"}
                                                            strokeDasharray={circumference}
                                                            initial={{ strokeDashoffset: circumference }}
                                                            animate={{ strokeDashoffset }}
                                                            transition={{ duration: 1.2, ease: "easeOut" }}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                        <span className={`text-4xl font-bold ${color}`}>
                                                            {aiPercentage}%
                                                        </span>
                                                        <span className="text-xs font-medium text-gray-500 mt-1">AI Score</span>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <div className="w-32 h-32 rounded-full bg-gray-50 flex items-center justify-center border-2 border-dashed border-gray-300">
                                                    <Bot className="w-12 h-12 text-gray-300" />
                                                </div>
                                            )}

                                            {result && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="mt-5 flex items-center gap-2"
                                                >
                                                    <RiskIcon className={`w-5 h-5 ${color}`} />
                                                    <span className={`text-sm font-medium ${color}`}>
                                                        {riskLevel === "high" ? "High Risk" : riskLevel === "medium" ? "Moderate Risk" : "Low Risk"}
                                                    </span>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="lg:col-span-2 space-y-10">
                                            {loading ? (
                                                <div className="space-y-3">
                                                    {[...Array(3)].map((_, i) => (
                                                        <div key={i} className="h-4 bg-gray-100 rounded-full animate-pulse" data-width={`${70 + i * 10}%`} />
                                                    ))}
                                                </div>
                                            ) : result ? (
                                                <>
                                                        <div className="grid grid-cols-2 gap-8 text-sm">
                                                        <div>
                                                            <span className="text-gray-500">Provider</span>
                                                            <p className="font-semibold text-gray-900">{result.provider}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Checked by</span>
                                                            <p className="font-semibold text-gray-900">{result.checkedByName ?? "System"}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Checked at</span>
                                                            <p className="font-medium text-gray-900">
                                                                    {formatCheckedAt(result.checkedAt)}
                                                            </p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-500">Status</span>
                                                            <div className="mt-1">
                                                                <StatusBadge status={result.reportStatus ?? undefined} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {result.notes && (
                                                        <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-700 border border-gray-200">
                                                            <strong>Notes:</strong> {result.notes}
                                                        </div>
                                                    )}

                                                    {aiPercentage >= 70 && (
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="rounded-xl border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800"
                                                        >
                                                            <strong className="font-semibold">Warning:</strong> This submission has a high probability of being AI-generated. Please review carefully and consider academic integrity policies.
                                                        </motion.div>
                                                    )}
                                                </>
                                            ) : (
                                                <p className="text-sm text-gray-500 italic">
                                                    AI check will run automatically when a submission is available.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {/* Footer */}
                                <div className="px-8 pb-6 pt-2 border-t border-gray-100 flex justify-end gap-3">
                                    <button
                                        onClick={async () => {
                                            if (loading || !onReassess) return;
                                            await onReassess();
                                        }}
                                        disabled={loading || !onReassess}
                                        className={`inline-flex items-center btn btn-green-slow gap-2 rounded-md px-3 py-1.5 text-sm font-medium border ${loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                    >
                                        Evaluate
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
