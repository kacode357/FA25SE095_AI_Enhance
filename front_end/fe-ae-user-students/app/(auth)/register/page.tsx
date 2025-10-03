// app/(auth)/register/page.tsx
"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRegisterLecturer } from "@/hooks/auth/useRegister"; // ✅ đổi sang hook Lecturer
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register, loading } = useRegisterLecturer();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }

    const res = await register({
      email: String(formData.get("email") ?? "").trim(),
      password,
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
    });

    if (res) {
      form.reset();
    }
  };

  return (
    <AuthShell
      title="Create your account!"
      subtitle={
        <span>
          Already have an account?{" "}
          <Link className="underline hover:text-green-700 font-medium" href="/login">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
              First Name
            </label>
            <Input 
              id="firstName"
              name="firstName" 
              placeholder="Enter your first name" 
              className="w-full bg-white border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl py-4 px-4 text-gray-900 placeholder-gray-500 transition-all duration-200"
              required 
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
              Last Name
            </label>
            <Input 
              id="lastName"
              name="lastName" 
              placeholder="Enter your last name" 
              className="w-full bg-white border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl py-4 px-4 text-gray-900 placeholder-gray-500 transition-all duration-200"
              required 
            />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
            Email Address
          </label>
          <Input 
            id="email"
            type="email" 
            name="email" 
            placeholder="Enter your email address" 
            className="w-full bg-white border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl py-4 px-4 text-gray-900 placeholder-gray-500 transition-all duration-200"
            required 
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
            Password
          </label>
          <Input 
            id="password"
            type="password" 
            name="password" 
            placeholder="At least 8 characters" 
            className="w-full bg-white border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl py-4 px-4 text-gray-900 placeholder-gray-500 transition-all duration-200"
            required 
          />
        </div>

        <div>
          <label htmlFor="confirm" className="block text-sm font-medium text-slate-700 mb-2">
            Confirm Password
          </label>
          <Input 
            id="confirm"
            type="password" 
            name="confirm" 
            placeholder="Re-enter your password" 
            className="w-full bg-white border-2 border-gray-200 focus:border-green-500 focus:ring-4 focus:ring-green-100 rounded-xl py-4 px-4 text-gray-900 placeholder-gray-500 transition-all duration-200"
            required 
          />
        </div>

        <Button 
          type="submit" 
          className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200" 
          loading={loading}
        >
          Create Account
        </Button>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center text-sm text-slate-500 pt-2"
        >
          After registration, you may need to verify your email or wait for account approval.
        </motion.div>
      </form>
    </AuthShell>
  );
}
