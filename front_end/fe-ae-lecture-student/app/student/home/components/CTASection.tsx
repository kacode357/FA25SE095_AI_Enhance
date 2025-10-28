"use client";

import { Button } from "@/components/ui/button";

export default function CTASection() {
    return (
        <section className="py-20 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-center">
            <div className="container mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                    Start Learning with Edubo Today
                </h2>
                <p className="mb-8 text-lg opacity-90">
                    Join thousands of learners achieving their dreams. Your next skill is one click away.
                </p>
                <Button className="bg-yellow-400 text-black hover:bg-yellow-500 px-8 py-3 rounded-lg text-lg font-semibold">
                    Get Started Now
                </Button>
            </div>
        </section>
    );
}
