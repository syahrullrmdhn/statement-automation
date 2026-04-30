"use client";

import Image from "next/image";
import { useState } from "react";

type SafeLogoProps = {
  size?: number;
  className?: string;
};

export function SafeLogo({ size = 96, className = "" }: SafeLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-900 ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-lg font-bold tracking-wide">3S</span>
      </div>
    );
  }

  return (
    <Image
      src="/3S_Logogram.png"
      alt="3S Logo"
      width={size}
      height={size}
      unoptimized
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
