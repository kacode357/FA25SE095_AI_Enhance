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
import { useTerms } from "@/hooks/term/useTerms";
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
  const { data: termOptions, loading: loadingTerms, fetchTerms } = useTerms();
  const [activeTab, setActiveTab] = useState<"course" | "request">("course");

  // ⚙️ State form
  const [form, setForm] = useState({
    courseCodeId: "",
    description: "",
    termId: "",
    year: new Date().getFullYear(),
    requiresAccessCode: false,
    accessCodeType: undefined as AccessCodeType | undefined,
    accessCodeValue: "", // ✅ luôn có ô nhập cho mọi type
  });

  // 📨 Course Request form state (tab 2)
  const [requestForm, setRequestForm] = useState({
    courseCodeId: "",
    description: "",
    termId: "",
    year: new Date().getFullYear(),
    requestReason: "",
    studentEnrollmentFile: null as File | null,
  });

  useEffect(() => {
    fetchCourseCodeOptions({ activeOnly: true });
    fetchTerms();
  }, []);

  // 🔧 Helper đổi state
  const set = (k: string, v: any) => setForm((p) => ({ ...p, [k]: v }));
  const setReq = (k: string, v: any) => setRequestForm((p) => ({ ...p, [k]: v }));

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

  const handleSubmit = async () => {
    if (!form.courseCodeId) return;

    const payload: any = {
      courseCodeId: form.courseCodeId,
      description: form.description,
      termId: form.termId,
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

  const handleSubmitRequest = async () => {
    if (!requestForm.courseCodeId) return;
    const payload: any = {
      courseCodeId: requestForm.courseCodeId,
      description: requestForm.description,
      termId: requestForm.termId,
      year: requestForm.year,
    };
    if (requestForm.requestReason?.trim()) payload.requestReason = requestForm.requestReason.trim();
    if (requestForm.studentEnrollmentFile) payload.studentEnrollmentFile = requestForm.studentEnrollmentFile;

    const res = await createCourseRequest(payload);
    if (res) onSubmit();
  };

  return (
    <DialogContent
      className="bg-white border-slate-200 text-slate-900 w-[calc(100vw-2rem)] sm:w-auto sm:max-w-2xl lg:max-w-3xl max-h-[85vh] overflow-y-auto p-4 sm:p-6"
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="mt-2">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="course" className="text-sm sm:text-base">
            Create Course
          </TabsTrigger>
          <TabsTrigger value="request" className="text-sm sm:text-base">
            Create Course Request
          </TabsTrigger>
        </TabsList>

        <TabsContent value="course">
          <div className="py-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
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

            <div className="sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="term">Term</Label>
              <select
                id="term"
                value={form.termId}
                onChange={(e) => set("termId", e.target.value)}
                className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
                title="Select term"
              >
                <option value="">{loadingTerms ? "Loading..." : "-- Select Term --"}</option>
                {termOptions.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
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

            <div className="flex items-center gap-2 sm:col-span-2">
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
                    onChange={(e) => {
                      const v = e.target.value ? parseInt(e.target.value) : undefined;
                      setForm((prev) => ({
                        ...prev,
                        accessCodeType: v,
                        // Clear any custom code when switching away from Custom
                        accessCodeValue: v === AccessCodeType.Custom ? prev.accessCodeValue : "",
                      }));
                    }}
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

                {form.accessCodeType === AccessCodeType.Custom && (
                  <div>
                    <Label htmlFor="accessCode">Access Code (optional)</Label>
                    <Input
                      id="accessCode"
                      placeholder={codeHint.placeholder}
                      value={form.accessCodeValue}
                      onChange={(e) => set("accessCodeValue", e.target.value)}
                    />
                    {codeHint.helper && (
                      <p className="text-xs text-slate-500 mt-1">{codeHint.helper}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="request">
          <div className="py-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="requestCourseCode">Course Code</Label>
              <select
                id="requestCourseCode"
                required
                value={requestForm.courseCodeId}
                onChange={(e) => setReq("courseCodeId", e.target.value)}
                className={`w-full border rounded-md p-2 text-sm bg-white ${!requestForm.courseCodeId ? "border-slate-300" : "border-slate-300"
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

            <div className="sm:col-span-2">
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
              <select
                id="requestTerm"
                required
                value={requestForm.termId}
                onChange={(e) => setReq("termId", e.target.value)}
                className={`w-full border rounded-md p-2 text-sm bg-white ${!requestForm.termId ? "border-slate-300" : "border-slate-300"
                  }`}
                title="Select term"
              >
                <option value="">{loadingTerms ? "Loading..." : "-- Select Term --"}</option>
                {termOptions.map((term) => (
                  <option key={term.id} value={term.id}>
                    {term.name}
                  </option>
                ))}
              </select>
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

            <div className="sm:col-span-2">
              <Label htmlFor="requestReason">Request Reason (optional)</Label>
              <Input
                id="requestReason"
                value={requestForm.requestReason}
                onChange={(e) => setReq("requestReason", e.target.value)}
                placeholder="Why do you need this course?"
              />
            </div>

            <div className="sm:col-span-2">
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

      <DialogFooter className="flex flex-col sm:flex-row gap-2">
        {activeTab === "course" ? (
          <Button onClick={handleSubmit} disabled={loading || !form.courseCodeId} className="w-full sm:w-auto">
            {loading ? "Creating..." : "Create"}
          </Button>
        ) : (
          <Button
            onClick={handleSubmitRequest}
            disabled={requestLoading || !requestForm.courseCodeId}
            className="w-full sm:w-auto"
          >
            {requestLoading ? "Submitting..." : "Send Request"}
          </Button>
        )}
        <Button variant="ghost" onClick={onCancel} className="w-full sm:w-auto">
          Cancel
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
