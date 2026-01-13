"use client";

import Image from "next/image";

export function Header() {
  return (
    <header className="py-12 text-center mb-8">
      <div className="w-20 h-20 mx-auto mb-6 plasma-green rounded-2xl flex items-center justify-center shadow-lg">
        <span className="text-white text-3xl font-bold">P</span>
      </div>
      <h1 className="text-4xl font-semibold plasma-green-text mb-3">
        Plasma Figurine Generator
      </h1>
      <p className="text-[#295B4F] text-lg max-w-xl mx-auto">
        Create your personalized isometric miniature figurine with Plasma branding.
        Upload a photo, customize your pose, and generate!
      </p>
    </header>
  );
}
