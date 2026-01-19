"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { useBulkCreateTopicWeights } from "@/hooks/topic/useBulkCreateTopicWeights";
import { useBulkUpdateTopicWeightsByCourse } from "@/hooks/topic/useBulkUpdateTopicWeightsByCourse";
import { allowNumericKey, preventInvalidPaste } from "@/lib/inputValidators";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type Row = {
    topicId?: string | null;
    topicName?: string | null;
    weightPercentage?: number | null;
    description?: string | null;
};

type Props = {
    open: boolean;
    setOpen: (v: boolean) => void;
    rows: Row[];
    addRow: () => void;
    updateRow: (index: number, patch: Partial<Row>) => void;
    removeRow: (index: number) => void;
    topics: { id: string; name: string }[];
    selectedTopicIds: string[];
    totalWeight: number;
    isValidTotal: boolean;
    loading?: boolean;
    handleSubmit?: () => Promise<void>;
    courseId?: string | undefined;
    existingTopicWeights?: any[] | undefined; // array of existing configured items ({ id, topicId, ... })
    hideTrigger?: boolean;
    onSuccess?: () => void;
};

export default function ConfigureTopicWeightsDialog({
    open,
    setOpen,
    rows,
    addRow,
    updateRow,
    removeRow,
    topics,
    selectedTopicIds,
    totalWeight,
    isValidTotal,
    loading,
    handleSubmit,
    hideTrigger = false,
    courseId,
    existingTopicWeights,
    onSuccess,
}: Props) {
    const { bulkCreate, loading: creating } = useBulkCreateTopicWeights();
    const { bulkUpdate, loading: updating } = useBulkUpdateTopicWeightsByCourse();
    const apiLoading = creating || updating || loading;

    const isUpdateMode = Boolean(existingTopicWeights && existingTopicWeights.length > 0);

    const { user } = useAuth();

    const internalHandleSubmit = async () => {
        // If parent provided a handler, prefer it (keeps backward compatibility)
        if (handleSubmit) return handleSubmit();

        if (!courseId) {
            toast.error("Missing course id");
            return;
        }

        if (!user?.id) {
            toast.error("Missing user id");
            return;
        }

        if (!isValidTotal) {
            toast.error("Total weight must equal 100%");
            return;
        }

        if (isUpdateMode) {
            // Build updates: find existing id for each selected topic
            const updates: { id: string; weightPercentage: number; description?: string | null }[] = [];
            for (const r of rows) {
                if (!r.topicId) continue;
                const found = existingTopicWeights?.find((it: any) => String(it.topicId) === String(r.topicId));
                if (!found) {
                    toast.error("All edited rows must correspond to existing configured topics");
                    return;
                }
                updates.push({ id: found.id, weightPercentage: r.weightPercentage ?? 0, description: r.description ?? null });
            }

            if (updates.length === 0) {
                toast.error("Please select at least one topic");
                return;
            }

            const payload = {
                courseId: courseId,
                configuredBy: user.id,
                changeReason: "Updated via UI",
                updates,
            };

            // Send flat payload object (backend expects root-level fields)
            const res = await bulkUpdate(courseId, payload as any);
            if (res && (res as any).success !== false) {
                toast.success((res as any).message || "Topic weights updated");
                setOpen(false);
                onSuccess?.();
            } else {
                toast.error((res as any)?.errors?.join?.(", ") || "Failed to update topic weights");
            }

        } else {
            // Create mode
            const weights = rows
                .filter((r) => r.topicId)
                .map((r) => ({ topicId: r.topicId!, weightPercentage: r.weightPercentage ?? 0, description: r.description ?? null }));

            if (weights.length === 0) {
                toast.error("Please select at least one topic");
                return;
            }

            const payload = {
                courseId: courseId,
                weights,
                configuredBy: user.id,
                changeReason: "Configured via UI",
            };

            // Send flat payload object (backend expects root-level fields)
            const res = await bulkCreate(courseId, payload as any);
            if (res && (res as any).success !== false) {
                toast.success((res as any).message || "Topic weights configured successfully");
                setOpen(false);
                onSuccess?.();
            } else {
                toast.error((res as any)?.errors?.join?.(", ") || "Failed to configure topic weights");
            }
        }
    };
    
    const handleWeightChange = (idx: number, raw: string) => {
        if (raw === "") {
            updateRow(idx, { weightPercentage: null });
            return;
        }
        const normalized = raw.replace(/^0+(\d)/, '$1');
        const num = Number(normalized);
        if (Number.isNaN(num)) return;
        const clamped = Math.max(0, Math.min(100, num));
        updateRow(idx, { weightPercentage: clamped });
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {!hideTrigger && (
                <DialogTrigger asChild>
                    <Button className="bg-emerald-600 btn btn-green-slow hover:bg-emerald-700 text-white shadow-sm transition-all">
                        <Plus className="size-4 mr-2" />
                        Configure Topic Weight
                    </Button>
                </DialogTrigger>
            )}

            <DialogContent className="sm:max-w-[700px] border border-slate-200 flex flex-col gap-0 p-0 max-h-[90vh]">
                <DialogHeader className="p-6 pb-4 border-b border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl">Configure Weights</DialogTitle>
                            <DialogDescription>
                                Assign percentage weights to topics. Total must equal 100%.
                            </DialogDescription>
                        </div>
                        <div className={cn(
                            "flex flex-col items-end px-3 py-1.5 rounded-md border mr-6",
                            isValidTotal ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"
                        )}>
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Allocation</span>
                            <div className={cn("flex items-center gap-1.5 font-bold text-lg", isValidTotal ? "text-emerald-700" : "text-amber-600")}>
                                {isValidTotal ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />}
                                {totalWeight}%
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 space-y-4 overflow-auto" style={{ maxHeight: '56vh' }}>
                    <div className="grid grid-cols-11 gap-3 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-7">Topic</div>
                        <div className="col-span-3">Weight (%)</div>
                        <div className="col-span-1 text-center">Action</div>
                    </div>

                    <Separator />

                    <div className="space-y-3 pt-1">
                        {rows.map((row, idx) => (
                            <div key={idx} className="grid grid-cols-11 pb-5 px-1 gap-3 items-start group">
                                <div className="col-span-7">
                                    <Select
                                        value={row.topicId ?? ""}
                                        onValueChange={(value) => {
                                            const selected = topics.find((t) => t.id === value);
                                            updateRow(idx, {
                                                topicId: selected?.id ?? null,
                                                topicName: selected?.name ?? null,
                                            });
                                        }}
                                    >
                                        <SelectTrigger className={cn("h-10 px-3 border-slate-200 border bg-white focus:border-slate-200 focus:ring-0 rounded-md flex items-center")}>
                                            <SelectValue className="" placeholder="Select topic..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {topics.map((t) => (
                                                <SelectItem
                                                    key={t.id}
                                                    value={t.id}
                                                    disabled={
                                                        selectedTopicIds.includes(t.id) &&
                                                        row.topicId !== t.id
                                                    }
                                                >
                                                    {t.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="col-span-3 relative">
                                    <Input
                                        type="number"
                                        min={0}
                                        max={100}
                                        placeholder="0"
                                        className="h-10 px-3 pr-10 text-right font-medium"
                                        value={row.weightPercentage === null ? "" : row.weightPercentage}
                                        onKeyDown={allowNumericKey}
                                        onPaste={preventInvalidPaste}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        onBeforeInput={(e: any) => {
                                            const data = e.data ?? '';
                                            if (!/^\d|\.$/.test(data)) {
                                                e.preventDefault();
                                                return;
                                            }
                                            const current = (e.target as HTMLInputElement).value || '';
                                            if (data === '.' && current.includes('.')) e.preventDefault();
                                        }}
                                        onChange={(e) => handleWeightChange(idx, e.target.value)}
                                        onBlur={(e) => {
                                            const v = e.target.value;
                                            if (v === "") return;
                                            const num = Number(v);
                                            if (Number.isNaN(num)) {
                                                updateRow(idx, { weightPercentage: null });
                                            } else {
                                                updateRow(idx, { weightPercentage: Math.max(0, Math.min(100, num)) });
                                            }
                                        }}
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs text-muted-foreground font-medium">%</span>
                                </div>

                                <div className="col-span-1 flex justify-center">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-muted-foreground text-red-400 hover:text-red-600 cursor-pointer hover:bg-red-50"
                                        onClick={() => removeRow(idx)}
                                        disabled={rows.length === 1}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </div>

                                <div className="col-span-11 col-start-1 text-xs border-b border-slate-100 pb-5 mt-2">
                                    <Input
                                        placeholder="Note (optional)"
                                        value={row.description ?? ""}
                                        onChange={(e) => updateRow(idx, { description: e.target.value })}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* {!isValidTotal && ( */}
                        <div className="mt-5">
                            <Button
                                onClick={addRow}
                                variant="outline"
                                className="w-full border-dashed text-muted-foreground hover:text-primary hover:bg-slate-50"
                            >
                                <Plus className="size-4 mr-2" /> Configure another topic
                            </Button>
                        </div>
                    {/* )} */}
                </div>

                <DialogFooter className="p-6 pt-2">
                    <div className="w-full flex justify-end items-center">
                        <Button
                            onClick={internalHandleSubmit}
                            disabled={apiLoading || !isValidTotal}
                            className={cn(
                                "min-w-[120px] btn btn-green-slow",
                                isValidTotal ? "bg-emerald-600 hover:bg-emerald-700" : "",
                                !isValidTotal ? "opacity-50 cursor-not-allowed" : ""
                            )}
                        >
                            {apiLoading ? "Saving..." : "Save Configuration"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
