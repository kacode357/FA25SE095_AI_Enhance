"use client";
import { Button } from "@/components/ui/button";
import { GraduationCap } from "lucide-react";
import { useEffect } from "react";

export default function HeroSection() {
    useEffect(() => {
        const hdr = document.querySelector("header");
        if (!hdr) return;

        hdr.style.position = "fixed";
        hdr.style.top = "0";
        hdr.style.left = "0";
        hdr.style.right = "0";
        hdr.style.zIndex = "50";
        hdr.style.background = "transparent";
        hdr.style.transition = "background-color 0.3s ease, box-shadow 0.3s ease";
        hdr.classList.remove("backdrop-blur-sm");

        const handleScroll = () => {
            if (window.scrollY > 80) {
                hdr.style.background = "white";
                hdr.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.08)";
            } else {
                hdr.style.background = "transparent";
                hdr.style.boxShadow = "none";
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const reportImages = [
        "https://images.unsplash.com/photo-1460925895917-afdab827c2f2?w=200&h=80&fit=crop",
        "https://images.unsplash.com/photo-1551288048-9b4e2c2e1a2e?w=200&h=80&fit=crop",
        "https://images.unsplash.com/photo-1504868584818-4e9e0b54a5e0?w=200&h=80&fit=crop",
        "https://images.unsplash.com/photo-1552664730-d307ca8841cb?w=200&h=80&fit=crop",
        "https://images.unsplash.com/photo-1542744094-3f1161f96e4e?w=200&h=80&fit=crop",
        "https://images.unsplash.com/photo-1518186288438-1d3c7e6d2a9a?w=200&h=80&fit=crop",
        "https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=200&h=80&fit=crop",
    ];

    return (
        <section
            className="relative text-white overflow-visible"
            style={{
                paddingTop: "var(--app-header-h)",
                backgroundImage: "url('https://live.themewild.com/edubo/assets/img/shape/01.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
            }}
        >
            <div className="absolute inset-0" />

            {/* Hero content */}
            <div className="relative h-screen container mx-auto px-6 flex flex-col-reverse md:flex-row items-center gap-10 py-20">
                {/* Left: Text */}
                <div className="flex-1 text-center md:text-left">
                    <h1 className="text-4xl text-[#000D83] md:text-6xl font-bold leading-tight mb-10">
                        AI-Driven DataSync<br />
                        <span className="text-yellow-300">Digital Marketing</span>
                    </h1>

                    <p className="text-lg text-[#000D83] font-sans mb-20 opacity-90 max-w-md mx-auto md:mx-0">
                        Empowering education through AI. Collect cleaner data, track insights,
                        and personalize your digital learning experience — all powered by
                        <span className="font-semibold text-yellow-400">
                            {" "}intelligent analytics
                        </span>.
                    </p>

                    <div className="flex gap-4 justify-center md:justify-start">
                        <Button className="bg-yellow-400 btn btn-gradient text-black hover:bg-yellow-500 px-6 py-3 rounded-lg text-lg font-semibold">
                            Get Started
                        </Button>
                        <Button
                            variant="outline"
                            className="border-white text-[#000D83] hover:bg-white hover:text-indigo-700 px-6 py-3 rounded-lg text-lg font-semibold"
                        >
                            Explore Features
                        </Button>
                    </div>
                </div>

                {/* Right: Image + floating cards */}
                <div className="flex-1 relative flex justify-center">
                    <img
                        src="https://live.themewild.com/edubo/assets/img/hero/01.png"
                        alt="AI-powered LMS illustration"
                        className="w-full max-w-md md:max нот-w-lg"
                    />

                    {/* Floating "Students" card */}
                    <div className="absolute -top-6 left-0 md:-left-0 bg-white rounded-2xl shadow-lg px-5 py-4 flex items-center gap-4">
                        <div>
                            <p className="text-violet-500 font-sans text-xl font-bold">
                                250k+ <span className="font-bold text-[#000D83] text-lg"> Students</span>
                            </p>
                            <div className="flex mt-2">
                                {[
                                    "https://live.themewild.com/edubo/assets/img/account/01.jpg",
                                    "https://live.themewild.com/edubo/assets/img/account/03.jpg",
                                    "https://live.themewild.com/edubo/assets/img/account/02.jpg",
                                    "https://live.themewild.com/edubo/assets/img/account/04.jpg",
                                    "https://live.themewild.com/edubo/assets/img/account/05.jpg",
                                ].map((src, i) => (
                                    <img
                                        key={i}
                                        src={src}
                                        alt="student"
                                        className="w-9 h-2 rounded-full border-2 border-white -ml-2 first:ml-0"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="absolute bottom-100 right-0 md:-right-12 bg-white rounded-4xl shadow-lg flex items-center gap-2">
                        <div className="w-14 h-14 flex items-center justify-center rounded-full 
                bg-gradient-to-tr from-violet-400 to-pink-200">
                            <GraduationCap className="text-[#000D83]" />
                        </div>

                        <p className="text-violet-500 mr-4 text-xl font-bold">
                            160+ <span className="font-bold text-[#000D83] text-lg"> Courses</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Decorative blurry circles */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-yellow-300 rounded-full opacity-20 blur-xl" />
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-pink-400 rounded-full opacity-20 blur-2xl" />

            <div className="absolute right-0 bottom-[-3.5rem] z-40 pointer-events-none">
                <div className="container mx-auto px-6 pointer-events-auto">
                    <div className="bg-white rounded-3xl shadow-xl md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                        <div>
                            <h3 className="text-lg md:text-xl font-bold text-slate-800 flex items-center justify-center md:justify-center gap-2">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Let's start with <span className="text-purple-600">AIDS-LMS</span>
                            </h3>
                            <p className="text-slate-600 text-xs md:text-sm">
                                AI-powered marketing reports & analytics
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-5">
                            {reportImages.map((src, i) => (
                                <img
                                    key={i}
                                    src={src}
                                    alt={`Report ${i + 1}`}
                                    className="h-8 md:h-10 object-contain opacity-75 hover:opacity-100 transition"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://via.placeholder.com/140x50?text=Report+" + (i + 1);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}