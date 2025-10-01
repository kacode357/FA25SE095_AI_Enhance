// app/(auth)/login/page.tsx
"use client";

import { AuthCard, AuthShellAdmin, OAuthDivider } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useLogin } from "@/hooks/useLogin";
import { Chrome } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

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
    <AuthShellAdmin hideFooter>
      <AuthCard
        title="Admin Sign In"
        subtitle={<span className="text-slate-600">Use your provisioned administrator credentials.</span>}
        footer={<div className="space-y-2">
          <span className="block text-slate-500">By continuing you agree to our <a className="text-slate-700 font-medium hover:underline" href="#">Terms</a> & <a className="text-slate-700 font-medium hover:underline" href="#">Privacy</a>.</span>
          <span className="block text-slate-400">© 2025 IDCLMS. All rights reserved.</span>
        </div>}
      >
        <form onSubmit={onSubmit} className="space-y-6" aria-label="Admin login form">
          <fieldset className="space-y-4" disabled={loading || googleLoading}>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@domain.com"
              label="Email"
              required
              autoComplete="username"
              variant="light"
              className="placeholder-emerald-600"
            />
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              label="Password"
              required
              autoComplete="current-password"
              variant="light"
              className="placeholder-emerald-600"
            />
          </fieldset>
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <label className="inline-flex items-center gap-2 select-none text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              Remember me
            </label>
            <Link href="/forgot-password" className="text-emerald-600 hover:underline">Forgot password?</Link>
          </div>
          <Button type="submit" className="w-full h-11 text-[15px] font-semibold tracking-tight" loading={loading}>Sign in</Button>
          <OAuthDivider />
          <Button
            type="button"
            variant="ghost"
            className="w-full h-10 border border-slate-200 hover:bg-slate-50"
            onClick={handleGoogleLogin}
            loading={googleLoading}
            aria-label="Sign in with Google"
          >
            <Chrome size={18} className="text-emerald-500" />
            <span className="ml-1 text-emerald-500">Sign in with Google</span>
          </Button>
          <div className="pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide font-medium text-slate-500">
              <span>SECURITY</span>
              <span>CONTROL</span>
              <span>OBSERVABILITY</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-600" />
          </div>
        </form>
      </AuthCard>
    </AuthShellAdmin>
  );
}
