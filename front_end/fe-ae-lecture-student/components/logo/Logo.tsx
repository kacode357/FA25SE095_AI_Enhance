"use client";

import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  imgSrc?: string;
  imgAlt?: string;
  title?: string;
  subtitle?: string;
  className?: string; // cho phép override thêm class ngoài
};

export default function Logo({
  href = "/",
  imgSrc = "/aids-logo.png",
  imgAlt = "AIDS-LMS",
  title = "AIDS-LMS",
  subtitle = "Student Portal",
  className = "",
}: LogoProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-3 group transition-transform hover:scale-105 no-underline !text-black hover:!text-black focus:!text-black active:!text-black visited:!text-black ${className}`}
      aria-label={title}
    >
      <div className="relative ml-2">
        <Image
          src={imgSrc}
          alt={imgAlt}
          width={110}
          height={110}
          className="drop-shadow-sm"
          priority
        />
        {/* <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-md group-hover:blur-lg transition-all" /> */}
      </div>

      {/* <div className="flex flex-col">
        <span className="font-bold text-nav-active font-sans text-lg tracking-tight">
          {title}
        </span>
        <span className="text-xs text-nav-active font-sans  font-medium">{subtitle}</span>
      </div> */}
    </Link>
  );
}
