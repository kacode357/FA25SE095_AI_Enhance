// app/(auth)/login/page.tsx
"use client";

import { Chrome } from "lucide-react";
import { Link } from 'next/link';
import { useState } from "react";
import { AuthCard, AuthShellStaff, OAuthDivider } from "../../../components/staff";
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAuthRedirect } from '../../../hooks/useAuthRedirect';
import { useLogin } from '../../../hooks/useLogin';

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
    <AuthShellStaff hideFooter>
      <AuthCard
        title="Staff Sign In"
        subtitle={<span className="text-slate-600">Đăng nhập không gian hỗ trợ & vận hành.</span>}
        footer={<div className="space-y-2">
          <span className="block text-slate-500">Bằng việc tiếp tục bạn đồng ý với <a className="text-slate-700 font-medium hover:underline" href="#">Điều khoản</a> & <a className="text-slate-700 font-medium hover:underline" href="#">Chính sách</a>.</span>
          <span className="block text-slate-400">© 2025 Staff Console.</span>
        </div>}
      >
        <form onSubmit={onSubmit} className="space-y-6" aria-label="Staff login form">
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
            <Link href="/forgot-password" className="text-sky-600 hover:underline">Quên mật khẩu?</Link>
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
            <Chrome size={18} className="text-sky-500" />
            <span className="ml-1 text-sky-500">Sign in with Google</span>
          </Button>
          <div className="pt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-wide font-medium text-slate-500">
              <span>SECURITY</span>
              <span>CONTROL</span>
              <span>OBSERVABILITY</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-gradient-to-r from-sky-200 via-sky-400 to-indigo-500" />
          </div>
        </form>
      </AuthCard>
    </AuthShellStaff>
  );
}
