"use client";

import Footer from "../components/footer";
import BlogSection from "./components/BlogSection";
import CategorySection from "./components/CategorySection";
import CTASection from "./components/CTASection";
import FeatureSection from "./components/FeatureSection";
import HeroSection from "./components/HeroSection";
import PopularCourses from "./components/PopularCourses";
import Testimonials from "./components/Testimonials";

export default function StudentHomePage() {
  return (
  <main className="overflow-visible">
      <HeroSection />
      <FeatureSection />
      <PopularCourses />
      <CategorySection />
      <Testimonials />
      <BlogSection />
      <CTASection />
      <Footer />
    </main>
  );
}