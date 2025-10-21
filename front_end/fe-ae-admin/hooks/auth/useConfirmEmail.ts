// hooks/auth/useConfirmEmail.ts
"use client";

import { useState, useCallback } from "react";
import { AuthService } from "@/services/auth.services";
import type { ConfirmEmailPayload } from "@/types/auth/auth.payload";
import type { ConfirmEmailResponse } from "@/types/auth/auth.response";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function useConfirmEmail() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConfirmEmailResponse | null>(null);
  const router = useRouter();

  const confirmEmail = useCallback(
    async (payload: ConfirmEmailPayload): Promise<ConfirmEmailResponse> => {
      setLoading(true);
      try {
        const res = await AuthService.confirmEmail(payload);
        setResult(res);

        // chỉ toast thành công (nếu có message)
        if (res.success && res.message) toast.success(res.message);
        if (!res.success && res.message) {
          // không toast lỗi ở đây, interceptor lo rồi
        }

        // không cần phê duyệt -> về home
        if (res.success && !res.requiresApproval) {
          router.push("/");
        }
        return res;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return { confirmEmail, loading, result };
}
