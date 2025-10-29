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