// app/student/courses/[id]/support/components/SupportRequestCreate.tsx
"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { SupportRequestCategory } from "@/config/classroom-service/support-request-category.enum";
import { SupportRequestPriority } from "@/config/classroom-service/support-request-priority.enum";
import { useCreateSupportRequest } from "@/hooks/support-requests/useCreateSupportRequest";

type Props = {
  courseId: string;
  /** Callback để reload list sau khi tạo */
  onCreated?: () => Promise<void> | void;
};

export function SupportRequestCreate({ courseId, onCreated }: Props) {
  const { createSupportRequest, loading: creating } = useCreateSupportRequest();

  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<SupportRequestPriority>(
    SupportRequestPriority.Medium
  );
  const [category, setCategory] = useState<SupportRequestCategory>(
    SupportRequestCategory.Technical
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    await createSupportRequest({
      courseId,
      priority,
      category,
      subject: subject.trim(),
      description: description.trim(),
    });

    // Reset basic fields
    setSubject("");
    setDescription("");
    setPriority(SupportRequestPriority.Medium);
    setCategory(SupportRequestCategory.Technical);

    // Gọi callback để reload list
    if (onCreated) {
      await onCreated();
    }
  };

  return (
    <Card className="card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base">New Support Request</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Priority + Category */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Priority
              </label>
              <Select
                value={String(priority)}
                onValueChange={(v) =>
                  setPriority(Number(v) as SupportRequestPriority)
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(SupportRequestPriority.Low)}>
                    Low
                  </SelectItem>
                  <SelectItem value={String(SupportRequestPriority.Medium)}>
                    Medium
                  </SelectItem>
                  <SelectItem value={String(SupportRequestPriority.High)}>
                    High
                    </SelectItem>
                    <SelectItem value={String(SupportRequestPriority.Urgent)}>
                      Urgent
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Category
              </label>
              <Select
                value={String(category)}
                onValueChange={(v) =>
                  setCategory(Number(v) as SupportRequestCategory)
                }
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={String(SupportRequestCategory.Technical)}>
                    Technical
                  </SelectItem>
                  <SelectItem value={String(SupportRequestCategory.Academic)}>
                    Academic
                  </SelectItem>
                  <SelectItem
                    value={String(SupportRequestCategory.Administrative)}
                  >
                    Administrative
                  </SelectItem>
                  <SelectItem value={String(SupportRequestCategory.Other)}>
                    Other
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Subject */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Subject
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="E.g. Cannot access assignment, grade issue..."
              className="h-9 text-sm"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue in more detail..."
              className="min-h-[120px] text-sm"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-[11px] text-slate-500">
              Staff will respond through the linked support conversation.
            </p>
            <Button
              type="submit"
              className="btn btn-gradient px-4 py-2 h-9 text-sm"
              disabled={creating}
            >
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Request
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
