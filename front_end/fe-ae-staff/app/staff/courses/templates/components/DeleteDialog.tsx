"use client";
import React from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TriangleAlert } from "lucide-react";
import { formatToVN } from "@/utils/datetime/time";

type Props = {
    confirmId: string | null;
    setConfirmId: (v: string | null) => void;
    confirmingItem: any;
    handleConfirmDelete: () => Promise<void> | void;
    deleting?: boolean;
};

export default function DeleteDialog({ confirmId, setConfirmId, confirmingItem, handleConfirmDelete, deleting }: Props) {
    return (
        <AlertDialog
            open={!!confirmId}
            onOpenChange={(open) => {
                if (!open) setConfirmId(null);
            }}
        >
            <AlertDialogContent className="bg-white border-white">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this template?</AlertDialogTitle>
                    <div className="mt-3">
                        <div className="bg-slate-50 p-4 rounded-md space-y-3 text-sm text-slate-700">
                            <div>
                                <span className="text-slate-900 font-semibold">File Name:</span>
                                <span className="ml-2">{confirmingItem?.name || confirmingItem?.filename || '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-900 font-semibold">Size:</span>
                                <span className="ml-2">{confirmingItem?.sizeFormatted ?? (confirmingItem?.size ? `${(confirmingItem.size/1024).toFixed(1)} KB` : '-')}</span>
                            </div>
                            <div>
                                <span className="text-slate-900 font-semibold">Updated At:</span>
                                <span className="ml-2">{confirmingItem?.updatedAt ? formatToVN(confirmingItem.updatedAt) : '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-900 font-semibold">Status:</span>
                                <span className="ml-2">{confirmingItem ? (confirmingItem.isActive ? 'Active' : 'Inactive') : '-'}</span>
                            </div>
                            <div>
                                <span className="text-slate-900 font-semibold">Description:</span>
                                <span className="ml-2">{confirmingItem?.description || '-'}</span>
                            </div>
                        </div>

                        <p className="mt-3 mb-6 text-xs text-yellow-600">
                            <em className="flex items-start gap-1"><TriangleAlert className="size-3.5" />This action can’t be undone. The template file will be permanently removed.</em>
                        </p>
                    </div>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer" onClick={() => setConfirmId(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 cursor-pointer text-white">{deleting ? 'Deleting...' : 'Delete'}</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
