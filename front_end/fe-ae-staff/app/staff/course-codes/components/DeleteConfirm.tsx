"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";
import React from "react";

interface DeleteConfirmProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    loading?: boolean;
    title?: string;
    details?: React.ReactNode;
}

export default function DeleteConfirm({
    open,
    onOpenChange,
    onConfirm,
    loading,
    title,
    details,
}: DeleteConfirmProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-sm bg-white border border-slate-200 rounded-xl shadow-xl px-6 py-5">
                <DialogHeader className="flex flex-col items-center text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-3">
                        <AlertTriangle className="w-6 h-6 text-red-600" />
                    </div>

                    <DialogTitle className="text-lg font-semibold text-slate-900">
                        {title ?? "Delete Confirmation"}
                    </DialogTitle>

                    <p className="text-sm text-center text-slate-600 mt-2">
                        Are you sure you want to delete this Course Code? <br /> This action cannot be undone.
                    </p>
                </DialogHeader>

                {details && (
                    <div className="mt-4 bg-slate-50 border border-slate-200 p-3 rounded-md text-sm text-slate-700 shadow-inner">
                        {details}
                    </div>
                )}

                <DialogFooter className="mt-6 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading}
                        className="rounded-lg border-slate-300 cursor-pointer hover:bg-slate-100"
                    >
                        Cancel
                    </Button>

                    <Button
                        onClick={onConfirm}
                        disabled={loading}
                        className="rounded-lg cursor-pointer bg-red-600 text-white hover:bg-red-700 hover:shadow-md"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
