"use client";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccessCodeType } from "@/config/access-code-type";
import { useCourseCodeOptions } from "@/hooks/course-code/useCourseCodeOptions";
import { useCreateCourseRequest } from "@/hooks/course-request/useCreateCourseRequest";
import { useCreateCourse } from "@/hooks/course/useCreateCourse";
import { useEffect, useMemo, useState } from "react";

export default function CreateDialog({
  title,
  onSubmit,
  onCancel,
}: {
  title: string;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const { createCourse, loading } = useCreateCourse();
  const { createCourseRequest, loading: requestLoading } = useCreateCourseRequest();
  const { options: courseCodeOptions, loading: loadingCodes, fetchCourseCodeOptions } = useCourseCodeOptions();
  const [activeTab, setActiveTab] = useState<"course" | "request">("course");

  // ⚙️ State form
  const [form, setForm] = useState({
    courseCodeId: "",
    description: "",
    term: "",
    year: new Date().getFullYear(),
    requiresAccessCode: false,
    accessCodeType: undefined as AccessCodeType | undefined,
    accessCodeValue: "", // ✅ luôn có ô nhập cho mọi type
  });

  // 📨 Course Request form state (tab 2)
  const [requestForm, setRequestForm] = useState({
    courseCodeId: "",
    description: "",
    term: "",
    year: new Date().getFullYear(),
    requestReason: "",
    studentEnrollmentFile: null as File | null,
  });

  // 🚀 Chỉ fetch options 1 lần
  useEffect(() => {
    fetchCourseCodeOptions({ activeOnly: true });
  }, [fetchCourseCodeOptions]);

  // 🔧 Helper đổi state
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const setReq = (k: string, v: any) => setRequestForm((p) => ({ ...p, [k]: v }));

  // 🔎 Placeholder & helper theo type (gợi ý nhập code)
  const codeHint = useMemo(() => {
    switch (form.accessCodeType) {
      case AccessCodeType.Numeric:
        return { placeholder: "e.g. 123456", helper: "Digits only (0-9)." };
      case AccessCodeType.AlphaNumeric:
        return { placeholder: "e.g. ABC123", helper: "Letters and digits (A-Z, 0-9)." };
      case AccessCodeType.Words:
        return { placeholder: "e.g. happy-cat-123", helper: "Words chained with dashes, may include digits." };
      case AccessCodeType.Custom:
        return { placeholder: "Enter any code", helper: "Any pattern you prefer." };
      default:
        return { placeholder: "Choose a type first", helper: "" };
    }
  }, [form.accessCodeType]);

  // 💾 Submit
  const handleSubmit = async () => {
    if (!form.courseCodeId) return;

    // 📨 Payload tạo course
    // Lưu ý: BE chấp nhận customAccessCode. Theo yêu cầu: dù type nào cũng cho phép gửi customAccessCode nếu user tự nhập.
    const payload: any = {
      courseCodeId: form.courseCodeId,
      description: form.description,
      term: form.term,
      year: form.year,
      requiresAccessCode: form.requiresAccessCode,
    };

    if (form.requiresAccessCode) {
      payload.accessCodeType = form.accessCodeType;
      if (form.accessCodeValue?.trim()) {
        payload.customAccessCode = form.accessCodeValue.trim();
      }
    }

    const res = await createCourse(payload);
    if (res?.success) onSubmit();
  };

  // 💾 Submit for Course Request (tab 2)
  const handleSubmitRequest = async () => {
    if (!requestForm.courseCodeId) return;
    const payload: any = {
      courseCodeId: requestForm.courseCodeId,
      description: requestForm.description,
      term: requestForm.term,
      year: requestForm.year,
    };
    if (requestForm.requestReason?.trim()) payload.requestReason = requestForm.requestReason.trim();
    if (requestForm.studentEnrollmentFile) payload.studentEnrollmentFile = requestForm.studentEnrollmentFile;

    const res = await createCourseRequest(payload);
    if (res) onSubmit();
  };

  return (
    <DialogContent className="bg-white border-slate-200 text-slate-900">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-2">
        <TabsList>
          <TabsTrigger value="course">Create Course</TabsTrigger>
          <TabsTrigger value="request">Create Course Request</TabsTrigger>
        </TabsList>

        <TabsContent value="course">
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="courseCode">Course Code</Label>
              <select
                id="courseCode"
                value={form.courseCodeId}
                onChange={(e) => set("courseCodeId", e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                title="Select course code"
              >
                <option value="">{loadingCodes ? "Loading..." : "-- Select Course Code --"}</option>
                {courseCodeOptions.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.displayName || `${cc.code} - ${cc.title}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="term">Term</Label>
              <Input
                id="term"
                value={form.term}
                onChange={(e) => set("term", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={form.year}
                onChange={(e) => set("year", parseInt(e.target.value))}
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                placeholder="Checkbox"
                id="requiresCode"
                type="checkbox"
                checked={form.requiresAccessCode}
                onChange={(e) => set("requiresAccessCode", e.target.checked)}
              />
              <Label htmlFor="requiresCode">Requires Access Code</Label>
            </div>

            {form.requiresAccessCode && (
              <>
                <div>
                  <Label htmlFor="accessCodeType">Access Code Type</Label>
                  <select
                    id="accessCodeType"
                    value={form.accessCodeType ?? ""}
                    onChange={(e) =>
                      set("accessCodeType", e.target.value ? parseInt(e.target.value) : undefined)
                    }
                    className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                    title="Select access code type"
                  >
                    <option value="">-- Select Type --</option>
                    <option value={AccessCodeType.Numeric}>Numeric</option>
                    <option value={AccessCodeType.AlphaNumeric}>AlphaNumeric</option>
                    <option value={AccessCodeType.Words}>Words</option>
                    <option value={AccessCodeType.Custom}>Custom</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="accessCode">Access Code (optional)</Label>
                  <Input
                    id="accessCode"
                    placeholder={codeHint.placeholder}
                    value={form.accessCodeValue}
                    onChange={(e) => set("accessCodeValue", e.target.value)}
                    disabled={!form.accessCodeType}
                  />
                  {codeHint.helper && (
                    <p className="text-xs text-slate-500 mt-1">{codeHint.helper}</p>
                  )}
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="request">
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="requestCourseCode">Course Code</Label>
              <select
                id="requestCourseCode"
                required
                value={requestForm.courseCodeId}
                onChange={(e) => setReq("courseCodeId", e.target.value)}
                className={`w-full border rounded-md p-2 text-sm bg-white ${!requestForm.courseCodeId ? "border-red-500" : "border-slate-300"
                  }`}
                title="Select course code"
              >
                <option value="">
                  {loadingCodes ? "Loading..." : "-- Select Course Code --"}
                </option>
                {courseCodeOptions.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.displayName || `${cc.code} - ${cc.title}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="requestDescription">Description</Label>
              <Input
                id="requestDescription"
                required
                value={requestForm.description}
                onChange={(e) => setReq("description", e.target.value)}
                className={!requestForm.description ? "border-red-500" : ""}
              />
            </div>

            <div>
              <Label htmlFor="requestTerm">Term</Label>
              <Input
                id="requestTerm"
                required
                value={requestForm.term}
                onChange={(e) => setReq("term", e.target.value)}
                className={!requestForm.term ? "border-red-500" : ""}
              />
            </div>

            <div>
              <Label htmlFor="requestYear">Year</Label>
              <Input
                id="requestYear"
                type="number"
                value={requestForm.year}
                onChange={(e) => setReq("year", parseInt(e.target.value))}
              />
            </div>

            <div>
              <Label htmlFor="requestReason">Request Reason (optional)</Label>
              <Input
                id="requestReason"
                value={requestForm.requestReason}
                onChange={(e) => setReq("requestReason", e.target.value)}
                placeholder="Why do you need this course?"
              />
            </div>

            <div>
              <Label htmlFor="studentEnrollmentFile">Student Enrollment File (optional)</Label>
              <Input
                id="studentEnrollmentFile"
                type="file"
                onChange={(e) => setReq("studentEnrollmentFile", e.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-slate-500 mt-1">Accepted formats: CSV/Excel/PDF as allowed by server</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <DialogFooter>
        {activeTab === "course" ? (
          <Button onClick={handleSubmit} disabled={loading || !form.courseCodeId}>
            {loading ? "Creating..." : "Create"}
          </Button>
        ) : (
          <Button onClick={handleSubmitRequest} disabled={requestLoading || !requestForm.courseCodeId}>
            {requestLoading ? "Submitting..." : "Send Request"}
          </Button>
        )}
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
