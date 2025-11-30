"use client";


type Props = {
  size?: number;
  className?: string;
  label?: string;
  spin?: boolean;
};

export function LogoLoader({ size = 24, className = "", label, spin = true }: Props) {
  return (
    <div className={`inline-flex items-center gap-2 ${className}`} role="status" aria-live="polite">
      {/* Using <img> keeps it light for tiny inline spinners */}
      <img
        src="/short-logo-aids.png"
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className={`${spin ? "animate-spin" : ""} select-none`}
        draggable={false}
      />
      {label && <span className="text-sm text-white/80">{label}</span>}
    </div>
  );
}

export default LogoLoader;
