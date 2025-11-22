"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Loader2, Power } from "lucide-react";
import { useAdminUsers } from "@/hooks/admin/useAdminUsers";
import { toast } from "sonner";
import { statusToString } from "@/config/user-status";

type Props = {
  userId: string;
  /** current status text from BE, e.g. "Suspended" | "Inactive" | "Active" ... */
  status: string | number;
  /** optional className for button */
  className?: string;
  /** called after reactivate success (e.g. to refetch detail or list) */
  onSuccess?: () => void | Promise<void>;
  /** label override (default: "Reactivate") */
  label?: string;
  /** disable rendering when not eligible (default: true) */
  hideIfNotEligible?: boolean;
};

export default function ReactivateUserButton({
  userId,
  status,
  className,
  onSuccess,
  label = "Reactivate",
  hideIfNotEligible = true,
}: Props) {
  const { reactivateUser, loadingReactivate } = useAdminUsers();
  const [done, setDone] = useState(false);

  const isEligible = useMemo(() => {
    let sVal = "";
    if (typeof status === "number") {
      sVal = statusToString(status as any);
    } else {
      sVal = status || "";
    }
    const s = sVal.toLowerCase();
    return s === "suspended" || s === "inactive";
  }, [status]);

  if (hideIfNotEligible && !isEligible) return null;

  const handleClick = async () => {
    const res = await reactivateUser(userId);
    if (res?.success) {
      setDone(true);
      if (res.message) toast.success(res.message);
      await onSuccess?.();
      // reset done state sau 1 lúc cho UI nhẹ
      setTimeout(() => setDone(false), 1200);
    }
  };

  return (
    <Button
      variant="ghost"
      disabled={loadingReactivate || !isEligible}
      onClick={handleClick}
      className={`h-8 px-2 text-emerald-700 hover:bg-emerald-50 ${className ?? ""}`}
      title={label}
    >
      {loadingReactivate ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          {label}
        </>
      ) : done ? (
        <>
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Done
        </>
      ) : (
        <>
          <Power className="w-4 h-4 mr-1" />
          {label}
        </>
      )}
    </Button>
  );
}
