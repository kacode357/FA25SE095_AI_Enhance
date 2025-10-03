// app/(auth)/verify/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import Link from "next/link";
import { motion } from "framer-motion";

export default function VerifyPage() {
  return (
    <AuthShell
      title="Email verified!"
      subtitle={<span>Your account has been successfully verified.</span>}
      footer={<Link href="/login" className="underline">Back to sign in</Link>}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="text-sm text-center text-white/80"
      >
        ✅ Your email has been verified. You can now sign in to your account.
      </motion.div>
    </AuthShell>
  );
}
