// app/(auth)/login/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";
import { useState } from "react";
import { useLogin } from "@/hooks/useLogin";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function LoginPage() {
  const { login, loading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // ✅ check nếu đã login thì redirect
  useAuthRedirect();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(
      { email: email.trim(), password: password.trim() },
      rememberMe
    );
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await new Promise((r) => setTimeout(r, 900));
      // TODO: gọi Google API thật
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back!"
      subtitle={
        <span>
          New here?{" "}
          <Link className="underline" href="/register">
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="youremail@example.com"
          required
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
        />

        <div className="flex items-center mb-6 justify-between text-sm text-white/70">
          <label className="inline-flex items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border border-white/20 bg-black"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Sign in
        </Button>

        <div className="relative my-4">
          <div className="border-t border-white/10" />
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[--color-card] px-2 text-[11px] tracking-wide text-white/60">
            hoặc
          </span>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full border border-white/15 hover:border-white/25"
          onClick={handleGoogleLogin}
          loading={googleLoading}
          aria-label="Đăng nhập với Google"
        >
          <Chrome size={18} />
          Đăng nhập với Google
        </Button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center text-xs text-white/50"
        >
          By continuing, you agree to our{" "}
          <a href="#" className="text-green-600">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="text-green-600">
            Privacy Policy
          </a>
          .
        </motion.div>
      </form>
    </AuthShell>
  );
}
