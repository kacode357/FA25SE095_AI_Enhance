"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function SuccessInfoDialog({
    open,
    onOpenChange,
    title = "Success",
    message,
    onOk,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    message: string;
    onOk?: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white border-slate-200 text-slate-900">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="py-2 text-sm text-slate-700">{message}</div>
                <DialogFooter>
                    <Button
                        onClick={() => {
                            onOk?.();
                            onOpenChange(false);
                        }}
                    >
                        OK
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
