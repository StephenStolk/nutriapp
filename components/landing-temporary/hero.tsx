"use client";

import { GridBackground } from "./GridBackground";
import Link from "next/link";
import Header from "./header";

export default function Hero() {
  return (
    <>
    <Header />
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Grid Animated Background with darker beams */}
      <GridBackground
        gridSize="12:16"
        colors={{
          background: "bg-white"
        }}
        beams={{
          count: 30,
          colors: ["bg-gray-400/20"],
          shadow: "shadow-[0_0_20px_rgba(16,185,129,0.15)]",
          speed: 5,
        }}
        className="absolute inset-0 z-0"
      />

      {/* Subtle gradient overlay */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-neutral-50/50 pointer-events-none" /> */}

      {/* Content Layer */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-8">
          {/* Badge */}
          {/* <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-full shadow-sm animate-fade-in">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-medium text-neutral-700 tracking-wide">
              AI-POWER NUTRITION
            </span>
          </div> */}

          {/* Main Heading */}
          <h1 className="font-playfair text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight animate-fade-in">
            <span className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-600 bg-clip-text text-transparent">
              Kalnut
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl lg:text-2xl text-neutral-600 font-light leading-relaxed max-w-3xl mx-auto animate-slide-up">
            Decipher the mystery of your health through{" "}
            <span className="text-neutral-900 font-medium">AI-powered insights</span>{" "}
            and personalized nutrition guidance
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-slide-up">
            <Link 
              href="/mainapp" 
              className="group relative px-10 py-4 bg-neutral-900 text-white text-sm font-semibold tracking-wide rounded-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-neutral-900/20 hover:-translate-y-0.5"
            >
              <span className="relative z-10">START YOUR JOURNEY</span>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            
            <a
              href="#features"
              className="group px-10 py-4 bg-white/80 backdrop-blur-sm border border-neutral-200 text-neutral-900 text-sm font-semibold tracking-wide rounded-lg transition-all duration-300 hover:border-neutral-300 hover:bg-white hover:shadow-lg hover:-translate-y-0.5"
            >
              <span className="group-hover:text-emerald-600 transition-colors duration-300">
                EXPLORE FEATURES
              </span>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs text-neutral-500 animate-fade-in">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Science-backed</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Personalized plans</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Real-time tracking</span>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="pt-12 animate-bounce-slow">
            <div className="w-6 h-10 mx-auto border-2 border-neutral-300 rounded-full p-1">
              <div className="w-1.5 h-3 bg-neutral-400 rounded-full mx-auto animate-scroll" />
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes scroll {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(12px);
            opacity: 0;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }

        .animate-slide-up {
          animation: slide-up 1s ease-out 0.2s forwards;
          opacity: 0;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-scroll {
          animation: scroll 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
    </>
  );
}