"use client";

import { GlobeAltIcon } from "@heroicons/react/24/solid";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-[#fff2e5] via-[#fdf8ff] to-[#e1ebff] text-slate-700">
      <div className="container mx-auto pt-12 pb-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-20">
          <div className="flex flex-col items-start space-y-4">
            <div className="flex items-center text-2xl font-bold">
              <span className="text-indigo-600">🟣</span>
              <span className="ml-2 text-indigo-900">AIDS-LMS</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-600 max-w-sm">
              We are many variations of passages available but the majority have suffered alteration some form by injected humour words believable.
            </p>

            <button className="flex items-center px-3 py-1.5 text-xs font-medium border rounded-md shadow-sm bg-white/50 backdrop-blur-sm hover:bg-white text-slate-700 border-slate-200 transition-colors">
              <GlobeAltIcon className="w-4 h-4 mr-2 text-indigo-500" />
              English
            </button>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold uppercase tracking-wider text-indigo-900">Get In Touch</h3>
            <ul className="space-y-8 text-sm text-slate-600">
              <li>
                <p className="font-semibold text-indigo-700 mb-0.5">Our Address</p>
                <p className="leading-snug">FPT Campus, Long Thanh My, Thu Duc, Ho Chi Minh City</p>
              </li>
              <li>
                <p className="font-semibold text-indigo-700 mb-0.5">Call Us</p>
                <p>+84 342 555 702</p>
              </li>
              <li>
                <p className="font-semibold text-indigo-700 mb-0.5">Mail Us</p>
                <p>support@ebridge.id.vn</p>
              </li>
            </ul>
          </div>

          <div className="flex flex-col items-center">
            <h3 className="mb-4 text-base font-bold uppercase tracking-wider text-indigo-900">Payment Methods</h3>
            <p className="mb-3 text-sm text-slate-600">We accept secure payment via:</p>
            <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-100">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzyLwczXxezKsQjX4t5uvXGWDvlwwOwuX-1A&s"
                alt="PayOS"
                className="h-12 w-auto object-contain opacity-90 hover:opacity-100 transition-opacity duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200/60 bg-white/30">
        <div className="container mx-auto py-10 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© Copyright 2025 <span className="font-semibold text-indigo-600">AIDS-LMS</span>. All Rights Reserved.</p>
        </div>
      </div>

      {/* <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed z-40 p-3 px-5 text-2xl text-white transition-all duration-500 ease-out transform rounded-full shadow-lg cursor-pointer rotate-310 bottom-8 right-8 bg-gradient-to-r from-purple-500 to-indigo-500 hover:rotate-0 hover:scale-110 hover:shadow-2xl"
      >
        ↑
      </button> */}
    </footer>
  );
}