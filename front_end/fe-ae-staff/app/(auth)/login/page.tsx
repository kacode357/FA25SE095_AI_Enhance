// app/(auth)/login/page.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Chrome } from "lucide-react";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useLogin } from "@/hooks/auth/useLogin";
import { useAuthRedirect } from "@/hooks/auth/useAuthRedirect";
import { useGoogleProfilePreview } from "@/hooks/auth/useGoogleProfilePreview";

export default function LoginPage() {
  const { login, loading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useAuthRedirect();

  const {
    ready: googleReady,
    loading: googleLoading,
    error,
    profile,
    loginGooglePreview,
    credential,
    credentialPayload,
    promptOneTap,
    cancelOneTap,
    renderGoogleButton,
    reset,
  } = useGoogleProfilePreview();

  // --- chống hydration mismatch ---
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Chỉ render những phần phụ thuộc browser sau khi mounted
  const canUseGoogleUI = mounted && googleReady;

  const googleBtnRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!canUseGoogleUI || !googleBtnRef.current) return;
    renderGoogleButton(googleBtnRef.current, { width: "100%" });
  }, [canUseGoogleUI, renderGoogleButton]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login({ email: email.trim(), password: password.trim() }, rememberMe);
  };

  const handleGoogleOAuth = async () => {
    await loginGooglePreview();
  };

  const handleOneTap = () => {
    if (canUseGoogleUI) promptOneTap();
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
          autoComplete="email"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          autoComplete="current-password"
        />

        <div className="mb-6 flex items-center justify-between text-sm text-white/70">
          <label className="inline-flex select-none items-center gap-2">
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
          <span className="bg-[--color-card] text-[11px] text-white/60 absolute -top-3 left-1/2 -translate-x-1/2 px-2 tracking-wide">
            hoặc
          </span>
        </div>

        {/* Giữ trạng thái ổn định trước khi mounted để không mismatch */}
        <Button
          type="button"
          variant="ghost"
          className="w-full border border-white/15 hover:border-white/25"
          onClick={handleGoogleOAuth}
          loading={!mounted ? true : googleLoading || !googleReady}
          aria-label="Đăng nhập với Google (OAuth)"
          disabled={!mounted ? true : !googleReady}
        >
          <Chrome size={18} />
          Đăng nhập với Google (OAuth)
        </Button>

        {/* Nút Credential chỉ render sau khi mounted & ready */}
        {canUseGoogleUI && (
          <div className="mt-2">
            <div ref={googleBtnRef} className="w-full" />
          </div>
        )}

        <div className="mt-2 flex gap-2">
          <Button
            type="button"
            variant="secondary"
            className="h-9 px-3"
            onClick={handleOneTap}
            disabled={!canUseGoogleUI}
          >
            Bật One Tap
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-9 px-3"
            onClick={cancelOneTap}
          >
            Tắt One Tap
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="h-9 px-3"
            onClick={reset}
          >
            Clear
          </Button>
        </div>

        {(profile || credentialPayload) && (
          <div className="mt-4 rounded-lg border border-white/10 p-3 text-sm text-white/80">
            {profile && (
              <>
                <div className="mb-2 text-xs font-semibold text-white/60">
                  OAuth userinfo
                </div>
                <div className="flex items-center gap-3">
                  {profile.picture && (
                    <img
                      src={profile.picture}
                      alt="avatar"
                      className="h-8 w-8 rounded-full"
                    />
                  )}
                  <div className="font-medium">{profile.name || "(no name)"}</div>
                </div>
                <div className="mt-2">
                  <div>Email: {profile.email ?? "—"}</div>
                  <div>Verified: {String(profile.email_verified ?? false)}</div>
                  <div>sub (id): {profile.sub}</div>
                </div>
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-black/40 p-2 text-xs">
                  {JSON.stringify(profile, null, 2)}
                </pre>
              </>
            )}

            {credentialPayload && (
              <>
                <div className="mt-4 text-xs font-semibold text-white/60">
                  Credential (ID token) payload
                </div>
                <div className="mt-1 break-all text-xs text-white/60">
                  <span className="font-medium">JWT: </span>
                  {credential?.slice(0, 60)}...
                </div>
                <pre className="mt-2 max-h-40 overflow-auto rounded bg-black/40 p-2 text-xs">
                  {JSON.stringify(credentialPayload, null, 2)}
                </pre>
              </>
            )}
          </div>
        )}

        {error && <div className="mt-3 text-xs text-red-400">Google error: {error}</div>}

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
