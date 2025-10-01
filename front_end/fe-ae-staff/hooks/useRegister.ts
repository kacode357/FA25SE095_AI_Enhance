// hooks/useRegister.ts
"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.services";
import { RegisterPayload } from "@/types/auth/auth.payload";
import { RegisterResponse } from "@/types/auth/auth.response";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UserRole } from "@/config/user-role";

export function useRegisterLecturer() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const register = async (
    payload: Omit<RegisterPayload, "role">
  ): Promise<RegisterResponse | null> => {
    setLoading(true);
    try {
      const res = await AuthService.register({
        ...payload,
        role: UserRole.Lecturer,
      });

      toast.success(res.message);

      if (!res.requiresEmailConfirmation && !res.requiresApproval) {
        router.push("/login");
      }

      return res;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
}
