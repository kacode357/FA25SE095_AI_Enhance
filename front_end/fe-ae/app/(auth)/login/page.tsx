"use client";

import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 900));
        setLoading(false);
    };

    return (
        <AuthShell
            title="Welcome back!"
            subtitle={
                <span>
                    New here? <Link className="underline" href="/register">Create an account</Link>
                </span>
            }
            // footer={<Link href="/forgot-password" className="underline">AI Enhance?</Link>}
        >
            <form onSubmit={onSubmit} className="space-y-4">
                <Input type="email" name="email" label="Email" placeholder="you@example.com" required />
                <Input type="password" name="password" label="Password" placeholder="••••••••" required />

                <div className="flex items-center mb-6 justify-between text-sm text-white/70">
                    <label className="inline-flex items-center gap-2 select-none">
                        <input type="checkbox" className="h-4 w-4 rounded border border-white/20 bg-black" />
                        Remember me
                    </label>
                    <Link href="/forgot-password" className="underline">Forgot password?</Link>
                </div>

                <Button type="submit" className="w-full" loading={loading}>
                    Sign in
                </Button>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                    className="text-center text-xs text-white/50"
                >
                    By continuing, you agree to our <a href="#" className="text-green-600">Terms</a> and <a href="#" className="text-green-600">Privacy Policy</a>.
                </motion.div>
            </form>
        </AuthShell>
    );
}
