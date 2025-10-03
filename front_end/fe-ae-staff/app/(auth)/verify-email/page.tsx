"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import { motion } from "framer-motion";
import Link from "next/link";
import { useConfirmEmail } from "@/hooks/auth/useConfirmEmail";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const { confirmEmail, loading, result } = useConfirmEmail();
  const calledRef = useRef(false);

  useEffect(() => {
    if (calledRef.current) return;
    const token = searchParams.get("token");
    if (token) {
      confirmEmail({ token });
      calledRef.current = true;
    }
  }, [searchParams, confirmEmail]);

  return (
    <AuthShell
      title="Email Verification"
      subtitle={
        result === null
          ? "Đang xác thực email của bạn..."
          : result.success
          ? "Xác thực thành công!"
          : "Xác thực thất bại"
      }
      footer={<Link href="/" className="underline">Quay lại đăng nhập</Link>}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-sm text-center text-white/80"
      >
        {loading
          ? "Đang xử lý..."
          : result
          ? result.message
          : "Không tìm thấy token xác thực."}
      </motion.div>
    </AuthShell>
  );
}
