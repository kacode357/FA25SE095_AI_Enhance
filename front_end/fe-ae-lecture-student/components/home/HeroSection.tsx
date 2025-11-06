"use client";
import Reveal from "@/components/common/Reveal";
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

    return (
        <section
            className="relative overflow-visible text-white"
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
            <div className="container relative flex flex-col-reverse items-center h-screen gap-10 px-6 py-20 mx-auto md:flex-row">
                {/* Left: Text */}
                <div className="flex-1 text-center md:text-left">
                    <Reveal direction="up" amount={0.22}>
                        <h1 className="text-4xl text-[#000D83] md:text-6xl font-bold leading-tight mb-6">
                            AI-Driven DataSync<br />
                            <span className="text-yellow-300">Digital Marketing</span>
                        </h1>
                    </Reveal>

                    <Reveal direction="up" delay={0.1} amount={0.22}>
                        <p className="text-lg text-[#000D83] font-sans mb-10 opacity-90 max-w-md mx-auto md:mx-0">
                            Empowering education through AI. Collect cleaner data, track insights,
                            and personalize your digital learning experience — all powered by
                            <span className="font-semibold text-yellow-400">
                                {" "}intelligent analytics
                            </span>.
                        </p>
                    </Reveal>

                    <Reveal direction="up" delay={0.2} amount={0.22}>
                        <div className="flex justify-center gap-4 md:justify-start">
                            <Button className="px-6 py-3 text-lg font-semibold text-black bg-yellow-400 rounded-lg btn btn-gradient hover:bg-yellow-500">
                                Get Started
                            </Button>
                            <Button
                                variant="outline"
                                className="border-white text-[#000D83] hover:bg-white hover:text-indigo-700 px-6 py-3 rounded-lg text-lg font-semibold"
                            >
                                Explore Features
                            </Button>
                        </div>
                    </Reveal>
                </div>

                {/* Right: Image + floating cards */}
                <Reveal direction="up" delay={0.25} amount={0.22} className="relative flex justify-center flex-1">
                    <img
                        src="https://live.themewild.com/edubo/assets/img/hero/01.png"
                        alt="AI-powered LMS illustration"
                        className="w-full max-w-md md:max-w-lg"
                    />

                    {/* Floating "Students" card */}
                    <Reveal direction="left" delay={0.35} className="absolute left-0 -top-6 md:-left-0">
                        <div className="flex items-center gap-4 px-5 py-4 bg-white shadow-lg rounded-2xl">
                            <div>
                                <p className="font-sans text-xl font-bold text-violet-500">
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
                                            className="h-2 -ml-2 border-2 border-white rounded-full w-9 first:ml-0"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Reveal>

                    <Reveal direction="right" delay={0.45} className="absolute right-0 bottom-100 md:-right-12">
                        <div className="flex items-center gap-2 bg-white shadow-lg rounded-4xl">
                            <div className="flex items-center justify-center rounded-full w-14 h-14 bg-gradient-to-tr from-violet-400 to-pink-200">
                                <GraduationCap className="text-[#000D83]" />
                            </div>

                            <p className="mr-4 text-xl font-bold text-violet-500">
                                160+ <span className="font-bold text-[#000D83] text-lg"> Courses</span>
                            </p>
                        </div>
                    </Reveal>
                </Reveal>
            </div>

            {/* Decorative blurry circles with subtle pulse */}
            <div className="absolute w-16 h-16 bg-yellow-300 rounded-full top-10 left-10 opacity-20 blur-xl animate-pulse" />
            <div className="absolute w-24 h-24 bg-pink-400 rounded-full bottom-10 right-10 opacity-20 blur-2xl animate-pulse" />

            <div className="absolute right-0 bottom-[-5.3rem] z-40 pointer-events-none">
                <div className="container px-6 mx-auto pointer-events-auto">
                    <Reveal direction="up" delay={0.3} className="flex flex-col items-center justify-between gap-20 text-center bg-white shadow-xl h-48 rounded-3xl md:p-6 md:px-10 md:flex-row md:text-left">
                        <div>
                            <h3 className="flex items-center justify-center gap-2 mb-3 text-lg font-bold md:text-3xl text-slate-800 md:justify-center">
                                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                Let's start with <span className="text-purple-600">AIDS-LMS</span>
                            </h3>
                            <p className="text-xs text-slate-600 md:text-lg">
                                AI-powered marketing reports & analytics
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-3 md:gap-5 max-w-full overflow-hidden md:max-w-[350px] rounded-xl">
                            <img
                                src="https://dashthis.com/media/1680/ppc-report-template.jpg"
                                alt="Default report"
                                className="object-contain w-full h-auto max-h-36 transition-opacity duration-300 opacity-80 hover:opacity-100"
                            />
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}