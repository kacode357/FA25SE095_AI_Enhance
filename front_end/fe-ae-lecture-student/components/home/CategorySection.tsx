"use client";

import {
  Award,
  BookOpen,
  Cpu,
  Gauge,
  GraduationCap,
  Network,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: <Gauge className="w-8 h-8 text-white" />,
    title: "High-Speed Crawling",
    description:
      "Optimized multi-threaded engine that scrapes millions of pages per hour with minimal latency.",
  },
  {
    icon: <Cpu className="w-8 h-8 text-white" />,
    title: "Low Resource Usage",
    description:
      "Lightweight architecture ensures efficient CPU and memory consumption even under high loads.",
  },
  {
    icon: <Network className="w-8 h-8 text-white" />,
    title: "Scalable Infrastructure",
    description:
      "Easily scale your crawler across distributed nodes with real-time performance monitoring.",
  },
  {
    icon: <ShieldCheck className="w-8 h-8 text-white" />,
    title: "Error Handling & Accuracy",
    description:
      "Advanced retry logic, proxy rotation, and validation layers to ensure clean and accurate data.",
  },
];

const stats = [
  {
    icon: <GraduationCap className="w-10 h-10 text-white" />,
    value: "150k",
    label: "Students Enrolled",
  },
  {
    icon: <BookOpen className="w-10 h-10 text-white" />,
    value: "25k",
    label: "Total Courses",
  },
  {
    icon: <Users className="w-10 h-10 text-white" />,
    value: "120+",
    label: "Expert Tutors",
  },
  {
    icon: <Award className="w-10 h-10 text-white" />,
    value: "50+",
    label: "Win Awards",
  },
];

export default function CategorySection() {
  return (
    <>
      <section className="py-20 overflow-hidden bg-slate-50">
        <div className="container px-6 mx-auto">
          <div className="flex flex-col items-stretch gap-30 md:flex-row">
            <div className="flex flex-col justify-between space-y-6 text-center md:w-1/2 md:text-left">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-full shadow-md bg-gradient-to-r from-indigo-500 to-purple-500">
                  <span className="flex items-center gap-2 text-sm">
                    ⚙️ Data Crawler Performance
                  </span>
                </div>

                <h2 className="flex flex-col gap-2 mt-4 text-xl font-bold leading-tight md:text-3xl">
                  <span className="py-1 text-2xl text-transparent md:text-5xl bg-clip-text bg-gradient-to-r from-teal-400 via-purple-500 to-pink-500">
                    Crawling System Massive
                  </span>{" "}
                  High-Performance Data Collection
                </h2>

                <p className="max-w-lg mt-2 text-slate-600">
                  Crawler infrastructure is designed to deliver real-time,
                  high-throughput data collection while maintaining stability and
                  precision across thousands of sources.
                </p>
              </div>

              <div className="w-full overflow-hidden bg-black shadow-xl aspect-video rounded-3xl">
                <video
                  src="/demo_crawler.mp4"
                  controls
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="object-cover w-full h-full"
                  // poster="/poster.jpg"
                />
              </div>
            </div>

            <div className="grid h-full grid-cols-1 sm:grid-cols-2 gap-7 md:w-1/2">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-white p-6 rounded-3xl shadow-md hover:shadow-lg transition relative overflow-hidden group flex flex-col justify-between min-h-[220px] md:min-h-[250px] lg:min-h-[280px]"
                >
                  <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-full bg-gradient-to-br from-indigo-300 to-purple-400 opacity-10"></div>

                  <div className="flex items-center justify-center mb-4 transition-transform shadow-md bg-gradient-to-br from-orange-200 to-orange-500 w-14 h-14 rounded-2xl group-hover:scale-110">
                    {f.icon}
                  </div>

                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-800">
                      {f.title}
                    </h3>
                    <p className="text-lg leading-relaxed text-slate-500">
                      {f.description}
                    </p>
                  </div>

                  <div className="absolute w-16 h-16 border-t-2 border-l-2 border-indigo-400 bottom-2 right-2 rounded-tr-3xl opacity-30"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section
        className="relative py-16 mb-20 bg-white bg-center bg-no-repeat bg-cover shadow-2xl mt-14 rounded-r-4xl mr-50"
        style={{
          backgroundImage:
            "url('https://live.themewild.com/edubo/assets/img/shape/04.png')",
        }}
      >
        <div className="container relative z-10 px-6 mx-auto">
          <div className="grid grid-cols-1 gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="flex flex-row items-center justify-center gap-5 hover:shadow-xl hover:rounded-2xl"
              >
                <div className="flex items-center justify-center w-16 h-16 rounded-full shadow-md bg-gradient-to-br from-orange-200 to-orange-500">
                  {stat.icon}
                </div>
                <div className="flex flex-col text-start">
                  <div className="text-5xl font-extrabold text-indigo-800">
                    {stat.value}
                  </div>

                  <div className="text-lg font-semibold text-indigo-900">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
