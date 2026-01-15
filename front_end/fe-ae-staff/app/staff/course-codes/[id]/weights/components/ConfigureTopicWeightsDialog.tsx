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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { allowNumericKey, preventInvalidPaste } from "@/lib/inputValidators";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";

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
    loading: boolean;
    handleSubmit: () => Promise<void>;
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
}: Props) {
    // Note: keyboard and paste validators live in /lib/inputValidators.ts

    const handleWeightChange = (idx: number, raw: string) => {
        if (raw === "") {
            updateRow(idx, { weightPercentage: null });
            return;
        }
        // remove leading zeros except single 0 and keep dot if present
        const normalized = raw.replace(/^0+(\d)/, '$1');
        const num = Number(normalized);
        if (Number.isNaN(num)) return;
        const clamped = Math.max(0, Math.min(100, num));
        updateRow(idx, { weightPercentage: clamped });
    };
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-emerald-600 btn btn-green-slow hover:bg-emerald-700 text-white shadow-sm transition-all">
                    <Plus className="size-4 mr-2" />
                    Configure Topic Weight
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[700px] border border-slate-200 flex flex-col gap-0 p-3 max-h-[90vh] overflow-auto">
                <DialogHeader className="p-6 pb-4 border-b border-slate-200 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <DialogTitle className="text-xl">Configure Weights</DialogTitle>
                            <DialogDescription>
                                Assign percentage weights to topics. Total must equal 100%.
                            </DialogDescription>
                        </div>
                        <div className={cn(
                            "flex flex-col items-end px-3 py-1.5 rounded-md border",
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

                <div className="p-6 space-y-4">
                    <div className="grid grid-cols-11 gap-3 px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        <div className="col-span-7">Topic</div>
                        <div className="col-span-3">Weight (%)</div>
                        <div className="col-span-1 text-center">Action</div>
                    </div>

                    <Separator />

                    <ScrollArea className="max-h-[50vh] -mr-4 pr-4">
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
                                                // block non-digit / non-dot
                                                if (!/^\d|\.$/.test(data)) {
                                                    e.preventDefault();
                                                    return;
                                                }
                                                // prevent second dot
                                                const current = (e.target as HTMLInputElement).value || '';
                                                if (data === '.' && current.includes('.')) e.preventDefault();
                                            }}
                                            onChange={(e) => handleWeightChange(idx, e.target.value)}
                                            onBlur={(e) => {
                                                // ensure final clamped value on blur
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

                                    <div className="col-span-11 col-start-1 border-b border-slate-100 pb-5 mt-2">
                                        <Input
                                            placeholder="Note (optional)"
                                            value={row.description ?? ""}
                                            onChange={(e) => updateRow(idx, { description: e.target.value })}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            onClick={addRow}
                            variant="outline"
                            className="mt-5 w-full border-dashed text-muted-foreground hover:text-primary hover:bg-slate-50"
                        >
                            <Plus className="size-4 mr-2" /> Configure another topic
                        </Button>
                    </ScrollArea>
                </div>

                <DialogFooter className="p-6 pt-2">
                    <div className="w-full flex justify-end items-center">
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || !isValidTotal}
                            className={cn(
                                "min-w-[120px] btn btn-green-slow",
                                isValidTotal ? "bg-emerald-600 hover:bg-emerald-700" : "",
                                !isValidTotal ? "opacity-50 cursor-not-allowed" : ""
                            )}
                        >
                            {loading ? "Saving..." : "Save Configuration"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
