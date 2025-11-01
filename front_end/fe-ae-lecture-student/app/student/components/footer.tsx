"use client";

import { GlobeAltIcon, PaperAirplaneIcon } from "@heroicons/react/24/solid";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-br from-[#fff2e5] via-[#fdf8ff] to-[#e1ebff] text-slate-700">
      <div className="container px-6 py-16 mx-auto md:px-0 lg:px-2">
        <div className="grid grid-cols-1 gap-25 md:grid-cols-[35%_65%]">
          {/* --- Column 1: Logo & About --- */}
          <div>
            <div className="flex items-center mb-4 text-3xl font-bold">
              <span className="text-indigo-600">🟣</span>
              <span className="ml-2 text-indigo-900">AIDS-LMS</span>
            </div>
            <p className="pr-10 mb-6 text-sm leading-relaxed text-slate-600">
              We are many variations of passages available but the majority have suffered alteration some form by injected humour words believable.
            </p>

            <button className="flex items-center px-4 py-2 text-sm font-medium border rounded-md shadow-sm text-slate-700 border-slate-200">
              <GlobeAltIcon className="w-4 h-4 mr-2 text-indigo-500" />
              English
            </button>

            {/* --- Newsletter --- */}
            <div className="mt-7 md:w-full">
              <h4 className="mb-4 text-lg font-semibold text-indigo-900">Subscribe Newsletter</h4>
              <div className="flex flex-col gap-3 pb-1 border-b border-[#000D83] sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <input
                    type="email"
                    placeholder="Your Email"
                    className="w-full px-4 py-3 pl-10 text-sm bg-transparent focus:outline-none focus:border-indigo-400"
                  />
                  <span className="absolute text-indigo-500 left-2 top-3">✉️</span>
                </div>
                <button className="flex items-center justify-center px-4 py-2.5 mt-2 text-white rounded-full cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 sm:mt-0 hover:opacity-90">
                  Subscribe <PaperAirplaneIcon className="w-4 h-4 ml-2 rotate-45" />
                </button>
              </div>
            </div>
          </div>

          {/* --- Column 2: Company + Quick Links + Get In Touch --- */}
          <div className="grid grid-cols-1 mr-20 md:grid-cols-3">
            {/* --- Column 2: Company --- */}
            <div>
              <h3 className="text-xl font-semibold text-indigo-900 mb-7">Company</h3>
              <ul className="space-y-5 text-slate-600">
                <li><a href="#">About Us</a></li>
                <li><a href="#">Update News</a></li>
                <li><a href="#">Testimonials</a></li>
                <li><a href="#">Contact Us</a></li>
                <li><a href="#">Terms Of Service</a></li>
                <li><a href="#">Privacy Policy</a></li>
              </ul>
            </div>

            {/* --- Column 3: Quick Links --- */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-indigo-900">Quick Links</h3>
              <ul className="space-y-5 text-slate-600">
                <li><a href="#">Popular Courses</a></li>
                <li><a href="#">Become Instructor</a></li>
                <li><a href="#">Help & Support</a></li>
                <li><a href="#">Upcoming Events</a></li>
                <li><a href="#">Our Affiliate</a></li>
                <li><a href="#">Join Our Team</a></li>
              </ul>
            </div>

            {/* --- Column 4: Get In Touch --- */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-indigo-900">Get In Touch</h3>
              <ul className="space-y-5 text-slate-600">
                <li>
                  <p className="font-semibold text-indigo-700">Our Address</p>
                  <p>FPT Campus, Long Thanh My, Thu Duc, Ho Chi Minh City</p>
                </li>
                <li>
                  <p className="font-semibold text-indigo-700">Call Us</p>
                  <p>+84 123 654 7898</p>
                </li>
                <li>
                  <p className="font-semibold text-indigo-700">Mail Us</p>
                  <p>aidslms.contact@info.com</p>
                </li>
              </ul>
            </div>
          </div>

        </div>

        {/* --- Payment Gateways --- */}
        <div className="mt-12">
          <p className="mb-4 text-lg font-semibold text-slate-700">We Accept Payment Gateway</p>
          <div className="flex flex-wrap items-center gap-9">
            <img src="https://live.themewild.com/edubo/assets/img/payment/paypal.png" alt="PayPal" className="transition-all duration-300 w-28 h-28 opacity-80 hover:opacity-100" />
            <img src="https://live.themewild.com/edubo/assets/img/payment/master-card.png" alt="Mastercard" className="transition-all duration-300 w-18 h-18 opacity-80 hover:opacity-100" />
            <img src="https://live.themewild.com/edubo/assets/img/payment/visa.png" alt="Visa" className="mr-2 transition-all duration-300 w-25 h-25 opacity-80 hover:opacity-100" />
            <img src="https://live.themewild.com/edubo/assets/img/payment/google-pay.png" alt="Apple Pay" className="transition-all duration-300 w-23 h-23 opacity-80 hover:opacity-100" />
            <img src="https://live.themewild.com/edubo/assets/img/payment/apple-pay.png" alt="Stripe" className="transition-all duration-300 w-22 h-22 opacity-80 hover:opacity-100" />
            <img src="https://live.themewild.com/edubo/assets/img/payment/stripe.png" alt="Amex" className="transition-all duration-300 w-22 h-22 opacity-80 hover:opacity-100" />
            <img src="https://live.themewild.com/edubo/assets/img/payment/american-express.png" alt="Discover" className="w-24 h-24 transition-all duration-300 opacity-80 hover:opacity-100" />
            <img src="https://live.themewild.com/edubo/assets/img/payment/discover.png" alt="Amazon Pay" className="transition-all duration-300 w-25 h-25 opacity-80 hover:opacity-100" />
            <img src="https://live.themewild.com/edubo/assets/img/payment/amazon-pay.png" alt="Amazon Pay" className="transition-all duration-300 w-30 h-30 opacity-80 hover:opacity-100" />
          </div>
        </div>

      </div>

      {/* --- Bottom bar --- */}
      <div className="border-t border-slate-200">
        <div className="container flex flex-col items-center justify-between px-6 py-6 mx-auto space-y-4 text-sm text-slate-600 md:flex-row md:space-y-0">
          <p>© Copyright 2025 <span className="font-semibold text-indigo-600">AIDS-LMS</span> All Rights Reserved.</p>

          <div className="flex gap-4 text-indigo-500">
            <a href="#" className="p-2 bg-indigo-100 rounded-full hover:bg-indigo-200">
              <FaFacebookF />
            </a>
            <a href="#" className="p-2 bg-indigo-100 rounded-full hover:bg-indigo-200">
              <FaTwitter />
            </a>
            <a href="#" className="p-2 bg-indigo-100 rounded-full hover:bg-indigo-200">
              <FaLinkedinIn />
            </a>
            <a href="#" className="p-2 bg-indigo-100 rounded-full hover:bg-indigo-200">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      {/* --- Back to top button --- */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed z-40 p-3 px-5 text-2xl text-white transition-all duration-500 ease-out transform rounded-full shadow-lg cursor-pointer rotate-310 bottom-8 right-8 bg-gradient-to-r from-purple-500 to-indigo-500 hover:rotate-0 hover:scale-110 hover:shadow-2xl"
      >
        ↑
      </button>
    </footer>
  );
}
