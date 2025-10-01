"use client";

import { useState, useCallback } from "react";
import { AuthService } from "@/services/auth.services";
import { ConfirmEmailPayload } from "@/types/auth/auth.payload";
import { ConfirmEmailResponse } from "@/types/auth/auth.response";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useConfirmEmail() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConfirmEmailResponse | null>(null);
  const router = useRouter();

  const confirmEmail = useCallback(async (payload: ConfirmEmailPayload): Promise<ConfirmEmailResponse | null> => {
    setLoading(true);
    try {
      const res = await AuthService.confirmEmail(payload);
      setResult(res);

      // ✅ Chỉ lấy message từ API
      if (res.message) {
        res.success ? toast.success(res.message) : toast.error(res.message);
      }

      if (res.success && !res.requiresApproval) {
        // Tự động chuyển hướng nếu không cần phê duyệt
        setTimeout(() => router.push("/"), 2500);
      }

      return res;
    } catch (err: any) {
      // ❌ Không ghi cứng, để axios interceptor lo việc toast
      return null;
    } finally {
      setLoading(false);
    }
  }, [router]);

  return { confirmEmail, loading, result };
}
