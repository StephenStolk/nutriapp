"use client";

import { GridBackground } from "./GridBackground";

export default function Hero() {
  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden text-white">
      {/* Grid Animated Background */}
      <GridBackground
        gridSize="12:12"
        colors={{
          background: "bg-white",
          borderColor: "border-neutral-200/30",
          borderSize: "1px",
          borderStyle: "solid",
        }}
        beams={{
          count: 20,
          colors: ["bg-emerald-400/20", "bg-gray-500/20"],
          shadow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]",
          speed: 6,
        }}
        className="absolute inset-0"
      />

      {/* Content Layer */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="font-playfair text-5xl md:text-7xl font-bold mb-6 tracking-tight animate-fade-in text-gray-900">
          Nutrgram.
        </h1>

        <p className="text-base md:text-lg text-gray-600 mb-8 leading-relaxed max-w-2xl mx-auto animate-slide-up">
          The nutrition app that deciphers the mystery of your health through AI data and personalized insights.
        </p>

        <div className="flex justify-center mb-8 animate-slide-up">
          <a
            href="https://v0-nutritionapp1-eta.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 bg-black text-white text-sm tracking-wide font-medium hover:bg-gray-900 transition-all duration-500 ease-out rounded-md"
          >
            TRY IT OUT
          </a>
        </div>

        <p className="text-xs tracking-widest text-gray-500 mb-12">
          OR{" "}
          <a
            href="#features"
            className="underline hover:text-black transition-all duration-500 ease-out"
          >
            LEARN MORE
          </a>
        </p>

        <div className="w-12 h-px bg-black/20 mx-auto"></div>
      </div>
    </section>
  );
}
