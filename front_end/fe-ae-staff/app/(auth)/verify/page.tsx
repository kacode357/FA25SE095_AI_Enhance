// app/(auth)/verify/page.tsx
"use client";

import { AuthCard, AuthShellAdmin } from "@/components/admin";
import { motion } from "framer-motion";
import Link from "next/link";

export default function VerifyPage() {
  return (
    <AuthShellAdmin>
      <AuthCard
        title="Email verified"
        subtitle={<span>Your account has been successfully verified.</span>}
        footer={<Link href="/login" className="text-emerald-600 hover:underline">Back to sign in</Link>}
      >
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:.4 }} className="text-sm text-center text-slate-600">
          ✅ Your email has been verified. You can now sign in to your account.
        </motion.div>
      </AuthCard>
    </AuthShellAdmin>
  );
}
