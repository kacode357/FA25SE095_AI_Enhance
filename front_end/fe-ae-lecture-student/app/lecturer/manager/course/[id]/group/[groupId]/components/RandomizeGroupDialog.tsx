"use client";

import { Button } from "@/components/ui/button";
import { DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRandomizeGroup } from "@/hooks/group/useRandomizeGroup";
import { useEffect, useState } from "react";

interface Props {
    courseId: string;
    onClose?: () => void;
    onRandomized?: () => void;
}

export default function RandomizeGroupDialog({ courseId, onClose, onRandomized }: Props) {
    const [groupSize, setGroupSize] = useState<number | undefined>();
    const [countdown, setCountdown] = useState(5);
    const { randomizeGroups, loading, result, error } = useRandomizeGroup();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!groupSize || groupSize <= 0) {
            alert("Please enter a valid group size!");
            return;
        }

        try {
            const payload = { courseId, groupSize };
            await randomizeGroups(payload);
            onRandomized?.();
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (result) {
            setCountdown(5);
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        setTimeout(() => onClose?.(), 0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [result, onClose]);

    return (
        <>
            <DialogHeader>
                <DialogTitle>Randomize Students into Groups</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 py-2">
                {!result && (
                    <div>
                        <Label className="mb-2 cursor-text">Group Size</Label>
                        <Input
                            type="number"
                            min={1}
                            placeholder="Enter group size"
                            value={groupSize ?? ""}
                            onChange={(e) => setGroupSize(Number(e.target.value))}
                            required
                        />
                    </div>
                )}

                {error && <p className="text-red-500 text-sm">{error}</p>}

                {result && (
                    <div className="mt-3 border-t pt-3 text-sm">
                        <p className="font-semibold text-green-700">{result.message}</p>
                        <p>Groups created: {result.groupsCreated}</p>
                        <p>Students assigned: {result.studentsAssigned}</p>

                        {result.groups && result.groups.length > 0 && (
                            <div className="mt-2">
                                <p className="font-semibold">Groups:</p>
                                <ul className="list-disc list-inside text-slate-700">
                                    {result.groups.map((g) => (
                                        <li key={g.id}>
                                            {g.name} – {g.memberCount} members (Leader:{" "}
                                            <span className="italic">{g.leaderName}</span>)
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <p className="text-gray-500 italic mt-3">
                            Dialog will close automatically in {countdown}s...
                        </p>
                    </div>
                )}

                <DialogFooter className="mt-4">
                    {!result && (
                        <Button
                            type="submit"
                            disabled={loading}
                            className="cursor-pointer bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {loading ? "Randomizing..." : "Randomize"}
                        </Button>
                    )}
                    <Button
                        type="button"
                        variant="ghost"
                        onClick={onClose}
                        className="cursor-pointer"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </form>
        </>
    );
}
