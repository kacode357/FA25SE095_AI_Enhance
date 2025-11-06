"use client";

import Reveal from "@/components/common/Reveal";
import Footer from "@/components/home/Footer";
import BlogSection from "@/components/home/BlogSection";
import CategorySection from "@/components/home/CategorySection";
import CTASection from "@/components/home/CTASection";
import FeatureSection from "@/components/home/FeatureSection";
import HeroSection from "@/components/home/HeroSection";
import PopularCourses from "@/components/home/PopularCourses";
import Testimonials from "@/components/home/Testimonials";
import Header from "@/components/home/Header";

export default function StudentHomePage() {
  return (
    <main className="w-full max-w-[100vw] overflow-x-hidden">
 
      <Header /> 
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