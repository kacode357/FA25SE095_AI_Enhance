"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Props = {
    confirmId: string | null;
    setConfirmId: (id: string | null) => void;
    onConfirmDelete: () => Promise<void>;
    deleting?: boolean;
};

export default function ConfirmDeleteDialog({ confirmId, setConfirmId, onConfirmDelete, deleting }: Props) {
    return (
        <AlertDialog
            open={!!confirmId}
            onOpenChange={(open) => !open && setConfirmId(null)}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete this message?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action can’t be undone. The message will be marked as deleted
                        for everyone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={onConfirmDelete}
                        disabled={deleting}
                    >
                        Delete
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
