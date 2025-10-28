"use client";

import BlogSection from "./components/BlogSection";
import CategorySection from "./components/CategorySection";
import CTASection from "./components/CTASection";
import FeatureSection from "./components/FeatureSection";
import HeroSection from "./components/HeroSection";
import PopularCourses from "./components/PopularCourses";
import Testimonials from "./components/Testimonials";

export default function StudentHomePage() {
  return (
            {
              icon: BookOpen,
              title: "AI Report Generator",
              desc: "Instant sentiment & keyword analysis to PDF/Word/Markdown using templates.",
            },
            {
              icon: GraduationCap,
              title: "Smart LMS",
              desc: "Classes, assignments, grading, groups, quota, and analytics — all-in-one.",
            },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -4 }}
                className="rounded-2xl border bg-white/70 backdrop-blur-xl p-6 shadow-sm hover:shadow-md transition"
                style={{
                  borderColor: "color-mix(in oklab, var(--color-brand) 25%, var(--color-border))",
                  backgroundImage:
                    "linear-gradient(to bottom, color-mix(in oklab, var(--color-brand) 10%, white), transparent)",
                }}
    <main className="overflow-hidden">
      <HeroSection />
      <FeatureSection />
      <PopularCourses />
      <CategorySection />
      <Testimonials />
      <BlogSection />
      <CTASection />
    </main>
  );
}
