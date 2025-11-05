"use client";

import { ArrowRight, Bot, Brain, Headphones } from "lucide-react";

export default function DashboardSection() {
    return (
        <section className="pt-30 pb-16 overflow-visible bg-slate-50">
            <div className="container px-6 mx-auto max-w-7xl">
                <div className="grid items-center gap-10 lg:grid-cols-2">
                    {/* Left: Images + Experience Badge – OVAL SHAPE */}
                    <div className="relative h-[600px] lg:h-[700px] flex items-center justify-center">
                        <div className="absolute z-30 top-15 left-65">
                            <div className="flex flex-col items-center px-10 py-5 text-lg font-bold leading-tight text-white rounded-full shadow-xl bg-gradient-to-br from-orange-400 to-pink-500">
                                <span className="text-3xl">30+</span>
                                <span className="text-xs font-medium">Years Of Experience</span>
                            </div>
                        </div>

                        <div className="absolute top-12 left-4 w-64 h-80 md:w-72 md:h-96 lg:w-80 lg:h-[420px] rounded-full overflow-hidden shadow-2xl border-8 border-white z-10">
                            <img
                                src="https://live.themewild.com/edubo/assets/img/about/01.jpg"
                                alt="Team collaborating"
                                className="object-cover w-full h-full"
                            />
                        </div>

                        <div className="absolute bottom-0 right-4 w-56 h-72 md:w-64 md:h-80 lg:w-72 lg:h-[380px] rounded-full overflow-hidden shadow-2xl border-8 border-white z-5 -translate-x-6 -translate-y-12">
                            <img
                                src="https://live.themewild.com/edubo/assets/img/about/02.jpg"
                                alt="Student learning"
                                className="object-cover w-full h-full"
                            />
                        </div>

                        <div className="absolute w-72 h-72 rounded-full border-[8px] border-purple-400 opacity-50 -bottom-10 left-1/3 translate-x-[-50%] translate-y-[-50%]"></div>
                        <div className="absolute w-20 h-20 border-4 border-purple-300 rounded-full top-32 left-16 opacity-30"></div>
                        <div className="absolute border-4 border-purple-400 rounded-full bottom-95 right-45 w-28 h-28 opacity-20"></div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex justify-start">
                            <button className="flex items-center gap-2 px-5 py-2 text-sm font-medium text-white transition rounded-full shadow-md bg-gradient-to-r from-purple-600 to-indigo-600 hover:shadow-lg">
                                <Bot className="w-4 h-4" />
                                AIDS-LMS
                            </button>
                        </div>

                        {/* Main Title */}
                        <h2 className="text-4xl font-bold leading-tight md:text-5xl">
                            <span className="text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text">
                                Whether You Want To Learn Or Share What You Know
                            </span>
                        </h2>

                        {/* Description */}
                        <p className="text-lg leading-relaxed text-slate-600">
                            Collect clean data, generate instant AI reports, and manage classes and group projects — all in one place, optimized for assignments and research.
                        </p>

                        {/* Feature Cards */}
                        <div className="grid gap-4 mt-8 sm:grid-cols-2">
                            <div className="flex items-center gap-3 p-5 bg-gray-50 rounded-2xl">
                                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                                    <Brain className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">Flexible Learning</h4>
                                    <p className="text-sm text-slate-600">Take a look at our up of the round shows</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-5 bg-gray-50 rounded-2xl">
                                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                                    <Headphones className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-semibold text-slate-800">24/7 Live Support</h4>
                                    <p className="text-sm text-slate-600">Take a look at our up of the round shows</p>
                                </div>
                            </div>
                        </div>

                        {/* CTA Button */}
                        <button className="flex items-center gap-2 px-8 py-4 mt-8 font-semibold text-white transition transform rounded-full bg-gradient-to-r btn btn-gradient from-purple-600 to-pink-600 hover:shadow-xl hover:scale-105">
                            Discover More
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}