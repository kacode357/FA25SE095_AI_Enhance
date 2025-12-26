"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CTASection() {
    const [navigating, setNavigating] = useState(false);
    const router = useRouter();
    const { user } = useAuth();

    const handleLearnMore = async () => {
        if (navigating) return;
        setNavigating(true);

        try {
            if (!user) {
                router.push("/login");
                return;
            }

            const role = user.role;
            const STUDENT_ROUTE = "/student/home";
            const LECTURER_ROUTE = "/lecturer/course";

            if (role === "Student") router.push(STUDENT_ROUTE);
            else if (role === "Lecturer") router.push(LECTURER_ROUTE);
            else router.push("/");
        } finally {
            setNavigating(false);
        }
    };

    return (
        <section className="py-20 text-center text-white bg-gradient-to-r from-indigo-600 to-violet-600">
            <div className="container px-6 mx-auto">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                    Start Learning with AIDS-LMS Today
                </h2>
                <p className="mb-8 text-lg opacity-90">
                    Join the course now to get support for standard form and high quality Marketing documents. Your next skill is one click away.
                </p>
                <Button
                    onClick={handleLearnMore}
                    disabled={navigating}
                    className="px-8 font-semibold text-white transition-all rounded-full shadow-lg btn btn-gradient bg-gradient-to-r from-purple-500 to-indigo-500 hover:opacity-90 shadow-purple-200 hover:shadow-purple-300"
                >
                    {navigating ? "Redirecting..." : "Learn More →"}
                </Button>
            </div>
        </section>
    );
}
