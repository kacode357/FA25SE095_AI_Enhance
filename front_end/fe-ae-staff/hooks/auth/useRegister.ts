// hooks/auth/useRegister.ts
"use client";

import { useState } from "react";
import { AuthService } from "@/services/auth.services";
import type { RegisterPayload } from "@/types/auth/auth.payload";
import type { RegisterResponse } from "@/types/auth/auth.response";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
// Đổi sang enum của UserService, alias thành UserRole để không phải sửa code bên dưới
import { UserServiceRole as UserRole } from "@/config/user-service/user-role";

/**
 * Dùng chung cho mọi role. Truyền role khi gọi hook.
 * - payload không cần role, hook sẽ ghép vào.
 */
export function useRegister(role: UserRole) {
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

      // Nếu không cần confirm/duyệt thì đưa về login cho đăng nhập luôn
      if (!res.requiresEmailConfirmation && !res.requiresApproval) {
        router.push("/login");
      }

      return res;
    } catch (error) {
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { register, loading };
}
