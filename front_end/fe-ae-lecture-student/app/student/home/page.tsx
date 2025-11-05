"use client";

import Reveal from "@/components/common/Reveal";
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
  <main className="w-full max-w-[100vw] overflow-x-hidden">
      <HeroSection />

      <Reveal direction="up" amount={0.2} duration={1.6}>
        <FeatureSection />
      </Reveal>

      <Reveal direction="up" delay={0.15} amount={0.2} duration={1.6}>
        <PopularCourses />
      </Reveal>

      <Reveal direction="up" delay={0.3} amount={0.2} duration={1.6}>
        <CategorySection />
      </Reveal>

      <Reveal direction="up" delay={0.45} amount={0.2} duration={1.6}>
        <Testimonials />
      </Reveal>

      <Reveal direction="up" delay={0.6} amount={0.2} duration={1.6}>
        <BlogSection />
      </Reveal>

      <Reveal direction="up" delay={0.75} amount={0.2} duration={1.6}>
        <CTASection />
      </Reveal>

      <Footer />
    </main>
  );
}