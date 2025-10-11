"use client";

import AuthShell from "@/components/auth/AuthShell";
import { useConfirmEmail } from "@/hooks/auth/useConfirmEmail";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

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
        className="text-sm text-center text-slate-700"
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
