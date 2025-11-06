"use client";

export default function OurSkillsSection() {
    return (
        <section className="relative overflow-hidden pt-30 pb-25 bg-slate-50">
            <div className="container grid items-center gap-12 px-6 mx-auto md:grid-cols-2">
                <div className="relative flex justify-center">
                    <div className="absolute -top-6 -left-5 w-[420px] h-[520px] bg-[#fff1eb] rotate-[10deg] rounded-[3rem] shadow-md"></div>
                    <div className="relative bg-[#fff6f1] rounded-[3rem] z-10 shadow-xl">
                        <img
                            src="https://live.themewild.com/edubo/assets/img/skill/01.jpg"
                            alt="Student"
                            className="rounded-[2.5rem] w-[480px] h-[500px] object-cover"
                        />
                    </div>
                    <div className="absolute w-48 h-48 bg-pink-300 rounded-full -bottom-10 -left-10 opacity-20 blur-3xl"></div>
                </div>

                <div className="text-left">
                    <span className="inline-flex items-center gap-2 px-4 py-1 mb-5 text-sm font-semibold text-indigo-600 bg-indigo-100 rounded-full shadow-sm">
                        💡 Let's Skills
                    </span>
                    <h2 className="mb-6 text-4xl font-extrabold leading-tight md:text-5xl text-slate-900">
                        Getting Best{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
                            Quality
                        </span>{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                            Education
                        </span>{" "}
                        Is More Easy
                    </h2>

                    <p className="mb-10 leading-relaxed text-slate-500">
                        Join the activity with features, functions, interfaces, optimal operations, easy, friendly,
                        promoting the most effective quality in each report to meet the needs of data collection with
                        the criteria, <strong>"Dark - Fast - Strong - Correct"</strong>.
                    </p>

                    <div className="mb-12 space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold text-slate-800">
                                    Optimal
                                </span>
                                <span className="font-bold text-slate-900">87%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div className="bg-gradient-to-r from-orange-400 to-pink-400 h-2 rounded-full w-[87%]"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold text-slate-800">
                                    Fast
                                </span>
                                <span className="font-bold text-slate-900">86%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div className="bg-gradient-to-r from-orange-400 to-pink-400 h-2 rounded-full w-[86%]"></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold text-slate-800">
                                    Powerful
                                </span>
                                <span className="font-bold text-slate-900">85%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div className="bg-gradient-to-r from-orange-400 to-pink-400 h-2 rounded-full w-[85%]"></div>
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="font-semibold text-slate-800">
                                    Accurate
                                </span>
                                <span className="font-bold text-slate-900">89%</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full">
                                <div className="bg-gradient-to-r from-orange-400 to-pink-400 h-2 rounded-full w-[89%]"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
