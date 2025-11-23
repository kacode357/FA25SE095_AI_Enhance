"use client";

import { Button } from "@/components/ui/button";
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/ui/select/Select";
import { AccessCodeType } from "@/config/access-code-type";
import { useUpdateAccessCode } from "@/hooks/course/useUpdateAccessCode";
import { useEffect, useMemo, useState } from "react";

type Props = {
  courseId: string;
  defaultType?: number | null;
  defaultCustom?: string | null;
  defaultExpiresAt?: string | null; // ISO
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdated: () => void;
};

export default function AccessCodeDialog({
  courseId,
  defaultType,
  defaultCustom,
  defaultExpiresAt,
  open,
  onOpenChange,
  onUpdated,
}: Props) {
  const { updateAccessCode, loading } = useUpdateAccessCode();

  // ⚙️ State dialog
  const [requiresAccessCode, setRequiresAccessCode] = useState(true);
  const [accessCodeType, setAccessCodeType] = useState<number | "">("");
  const [accessCodeValue, setAccessCodeValue] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>(""); // datetime-local
  const [regenerateCode, setRegenerateCode] = useState(true);

  // ⏱️ ISO <-> datetime-local mapping
  const isoToLocal = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    const pad = (n: number) => `${n}`.padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const localToIso = (local?: string) => {
    if (!local) return undefined;
    try { return new Date(local).toISOString(); } catch { return undefined; }
  };

  // ♻️ Init khi mở dialog
  useEffect(() => {
    if (!open) return;
    setRequiresAccessCode(true);
    setAccessCodeType(defaultType ?? "");
    setAccessCodeValue(defaultCustom ?? ""); // giá trị code cũ (nếu có)
    setExpiresAt(isoToLocal(defaultExpiresAt ?? undefined));
    setRegenerateCode(true);
  }, [open, defaultType, defaultCustom, defaultExpiresAt]);

  // 💡 Gợi ý theo type
  const codeHint = useMemo(() => {
    switch (accessCodeType) {
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
  }, [accessCodeType]);

  // 💾 Submit
  const handleSubmit = async () => {
    const payload = {
      requiresAccessCode,
      accessCodeType: accessCodeType === "" ? undefined : Number(accessCodeType),
      // ✅ Theo yêu cầu: type nào cũng có thể nhập code thủ công → luôn gửi nếu có
      customAccessCode: accessCodeValue?.trim() ? accessCodeValue.trim() : undefined,
      expiresAt: localToIso(expiresAt),
      regenerateCode,
    };
    const res = await updateAccessCode(courseId, payload);
    if (res?.success) {
      onUpdated();
      onOpenChange(false);
    }
  };

  return (
    <DialogContent onClick={(e) => e.stopPropagation()}
      className="bg-white border-slate-200 text-slate-900 max-w-md">
      <DialogHeader>
        <DialogTitle>Update Access Code</DialogTitle>
      </DialogHeader>

      <div className="space-y-3 py-1">
        {/* Bật/tắt access code */}
        <div className="flex items-center gap-2">
          <input
            placeholder="Checkbox"
            id="requiresAccessCode"
            type="checkbox"
            checked={requiresAccessCode}
            onChange={(e) => setRequiresAccessCode(e.target.checked)}
          />
          <Label htmlFor="requiresAccessCode">Requires Access Code</Label>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {/* Type */}
          <div>
            <Label>Access Code Type</Label>
            <Select<number>
              value={accessCodeType === "" ? ("" as any) : (accessCodeType as number)}
              options={[
                { value: AccessCodeType.Numeric, label: "Numeric" },
                { value: AccessCodeType.AlphaNumeric, label: "AlphaNumeric" },
                { value: AccessCodeType.Words, label: "Words" },
                { value: AccessCodeType.Custom, label: "Custom" },
              ]}
              placeholder="-- Select Type --"
              onChange={(v) => setAccessCodeType(v)}
              className="w-full"
              disabled={!requiresAccessCode}
            />
          </div>

          {/* ✅ Ô nhập code luôn hiển thị cho mọi type, optional */}
          <div>
            <Label>Access Code (optional)</Label>
            <Input
              placeholder={codeHint.placeholder}
              value={accessCodeValue}
              onChange={(e) => setAccessCodeValue(e.target.value)}
              disabled={!requiresAccessCode || !accessCodeType}
            />
            {codeHint.helper && (
              <p className="text-xs text-slate-500 mt-1">{codeHint.helper}</p>
            )}
          </div>

          {/* Expiration */}
          <div>
            <Label>Expires At</Label>
            <input
              placeholder="Label"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full border border-slate-300 rounded-md p-2 text-sm bg-white"
              disabled={!requiresAccessCode}
            />
          </div>

          {/* Regenerate */}
          <div className="flex items-center gap-2">
            <input
              placeholder="Checkbox"

              id="regenerateCode"
              type="checkbox"
              checked={regenerateCode}
              onChange={(e) => setRegenerateCode(e.target.checked)}
              disabled={!requiresAccessCode}
            />
            <Label htmlFor="regenerateCode">Regenerate new code</Label>
          </div>
        </div>
      </div>

      <DialogFooter className="flex justify-end gap-2">
        <Button
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange(false);
          }}
          disabled={loading}
        >
          Cancel
        </Button>

        <Button onClick={handleSubmit} disabled={loading || !requiresAccessCode || !accessCodeType}>
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
