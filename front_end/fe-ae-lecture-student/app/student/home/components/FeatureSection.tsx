"use client";

import { ArrowRight, Bot, Brain, Headphones } from "lucide-react";

export default function DashboardSection() {
    return (
        <section className="py-24 bg-slate-50 overflow-hidden">
            <div className="container mx-auto px-6 max-w-7xl">
                <div className="grid lg:grid-cols-2 gap-10 items-center">
                    {/* Left: Images + Experience Badge – OVAL SHAPE */}
                    <div className="relative h-[600px] lg:h-[700px] flex items-center justify-center">
                        <div className="absolute top-15 left-65 z-30">
                            <div className="bg-gradient-to-br from-orange-400 to-pink-500 text-white px-10 py-5 rounded-full font-bold text-lg shadow-xl flex flex-col items-center leading-tight">
                                <span className="text-3xl">30+</span>
                                <span className="text-xs font-medium">Years Of Experience</span>
                            </div>
                        </div>

                        <div className="absolute top-12 left-4 w-64 h-80 md:w-72 md:h-96 lg:w-80 lg:h-[420px] rounded-full overflow-hidden shadow-2xl border-8 border-white z-10">
                            <img
                                src="https://live.themewild.com/edubo/assets/img/about/01.jpg"
                                alt="Team collaborating"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="absolute bottom-0 right-4 w-56 h-72 md:w-64 md:h-80 lg:w-72 lg:h-[380px] rounded-full overflow-hidden shadow-2xl border-8 border-white z-0 -translate-x-6 -translate-y-12">
                            <img
                                src="https://live.themewild.com/edubo/assets/img/about/02.jpg"
                                alt="Student learning"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="absolute top-32 left-16 w-20 h-20 border-4 border-purple-300 rounded-full opacity-30"></div>
                        <div className="absolute bottom-24 right-20 w-28 h-28 border-4 border-purple-400 rounded-full opacity-20"></div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex justify-start">
                            <button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2 rounded-full text-sm font-medium shadow-md hover:shadow-lg transition">
                                <Bot className="w-4 h-4" />
                                AIDS-LMS
                            </button>
                        </div>

                        {/* Main Title */}
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight">
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                                Whether You Want To Learn Or Share What You Know
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="text-slate-600 text-lg leading-relaxed">
                            Collect clean data, generate instant AI reports, and manage classes and group projects — all in one place, optimized for assignments and research.
                        </p>

                        {/* Feature Cards */}
                        <div className="grid sm:grid-cols-2 gap-4 mt-8">
                            <div className="bg-gray-50 p-5 rounded-2xl flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">Flexible Learning</h4>
                                    <p className="text-sm text-slate-600">Take a look at our up of the round shows</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-5 rounded-2xl flex items-center gap-3">
                                <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full">
                                    <Headphones className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">24/7 Live Support</h4>
                                    <p className="text-sm text-slate-600">Take a look at our up of the round shows</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button className="mt-8 bg-gradient-to-r btn btn-gradient from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold flex items-center gap-2 hover:shadow-xl transition transform hover:scale-105">
                            Discover More
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}