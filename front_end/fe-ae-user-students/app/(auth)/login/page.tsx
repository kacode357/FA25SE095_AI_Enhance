// app/(auth)/login/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { useAuthRedirect } from "@/hooks/auth/useAuthRedirect";
import { useLogin } from "@/hooks/auth/useLogin";
import { motion } from "framer-motion";
import { Chrome, Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const { login, loading } = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      title="Welcome to DataSync!"
      subtitle={
        <span>
          New to our platform?{" "}
          <Link className="underline hover:text-green-700 font-medium" href="/register">
            Create your account
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-50" size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-white border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl py-4 px-4 pl-11 text-gray-900 placeholder-gray-500 transition-all duration-200"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-50" size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-white border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl py-4 px-4 pl-11 pr-11 text-gray-900 placeholder-gray-500 transition-all duration-200"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-3 select-none cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-5 w-5 rounded border-2 border-gray-300 text-green-600 focus:ring-green-500 focus:ring-2 focus:ring-offset-0"
            />
            <span className="text-sm text-slate-600">Remember me</span>
          </label>
          <Link href="/forgot-password" className="text-sm text-green-600 hover:text-green-700 font-medium">
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
          loading={loading}
        >
          Access DataSync
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-slate-500 font-medium">or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          className="w-full bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3"
          onClick={handleGoogleLogin}
          loading={googleLoading}
          aria-label="Sign in with Google"
        >
          <Chrome size={18} />
          Continue with Google
        </Button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center text-sm text-slate-500 pt-6"
        >
          By accessing DataSync, you agree to our{" "}
          <a href="#" className="text-green-600 hover:text-green-700 underline font-medium">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-green-600 hover:text-green-700 underline font-medium">
            Privacy Policy
          </a>
          .
        </motion.div>
      </form>
    </AuthShell>
  );
}
