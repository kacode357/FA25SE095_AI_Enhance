"use client";

import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUpdateTerm } from "@/hooks/term/useUpdateTerm";
import { TermService } from "@/services/terms.services";
import { Term } from "@/types/terms/terms.response";
import { useEffect, useState } from "react";

export default function EditDialog({
  termId,
  title,
  onSubmit,
  onCancel,
}: {
  termId: string;
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { updateTerm, loading } = useUpdateTerm();
  const [term, setTerm] = useState<Term | null>(null);

  const fetchDetail = async () => {
    try {
      const res = await TermService.getById(termId);
      setTerm(res.term);
    } catch (err) {
      console.error("Failed to fetch term detail", err);
    }
  };

  useEffect(() => {
    if (termId) fetchDetail();
  }, [termId]);

  const handleSave = async () => {
    if (!term) return;
    const payload = {
      name: term.name,
      description: term.description,
      isActive: term.isActive,
      startDate: term.startDate,
      endDate: term.endDate,
    };
    const res = await updateTerm(termId, payload);
    if (res?.success) onSubmit();
  };

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      {!term ? (
        <div className="py-6 text-center text-slate-500">Loading...</div>
      ) : (
        <div className="space-y-6 py-2">
          <div>
            <Label className="mb-1">Name</Label>
            <Input value={term.name} onChange={(e) => setTerm({ ...term, name: e.target.value })} />
          </div>
          <div>
            <Label className="mb-1">Description</Label>
            <Input value={term.description} onChange={(e) => setTerm({ ...term, description: e.target.value })} />
          </div>
          <div className="flex justify-between">
            <div>
              <Label className="mb-1">Start Date</Label>
              <DateTimePicker
                value={term.startDate}
                onChange={(v) => setTerm({ ...term, startDate: v })}
                placeholder="Select start date"
              />
            </div>
            <div>
              <Label className="mb-1">End Date</Label>
              <DateTimePicker
                value={term.endDate}
                onChange={(v) => setTerm({ ...term, endDate: v })}
                placeholder="Select end date"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              title="checkbox"
              type="checkbox"
              id="isActive"
              checked={term.isActive}
              onChange={(e) => setTerm({ ...term, isActive: e.target.checked })}
            />
            <Label className="mb-1" htmlFor="isActive">Is Active</Label>
          </div>
        </div>
      )}
      <DialogFooter>
        <Button className="btn btn-gradient-slow" onClick={handleSave} disabled={loading || !term}>
          {loading ? "Saving..." : "Save"}
        </Button>
        {/* <Button variant="ghost" onClick={onCancel}>Cancel</Button> */}
      </DialogFooter>
    </DialogContent>
  );
}
