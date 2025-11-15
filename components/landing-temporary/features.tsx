"use client";

import { cn } from "@/lib/utils";
import {
  Salad,
  NotebookPen,
  Camera,
  UtensilsCrossed,
  Clock,
  HeartPulse,
} from "lucide-react";

export default function Features() {
  const features = [
    {
      title: "Smart Food Scanning",
      description:
        "Point your camera at any Indian dish and get instant nutritional information. Our database covers thousands of Indian foods—from street food to home-cooked meals.",
      icon: <Camera className="w-6 h-6" />,
    },
    {
      title: "Easy Nutrition Logging",
      description:
        "Track your calories, protein, carbs, and other nutrients in seconds. No more guessing or complicated calculations.",
      icon: <NotebookPen className="w-6 h-6" />,
    },
    {
      title: "Habit Building",
      description:
        "Set healthy eating goals and track your progress. Build sustainable habits that stick, with daily reminders and streak tracking.",
      icon: <HeartPulse className="w-6 h-6" />,
    },
    {
      title: "Personalized Meal Plans",
      description:
        "Get customized meal plans for 2, 3, or 5 days based on your budget, dietary preferences, and location. Eat healthy without breaking the bank.",
      icon: <UtensilsCrossed className="w-6 h-6" />,
    },
    {
      title: "Quick Meal Suggestions",
      description:
        "Snap a photo of what's in your fridge, and we'll suggest healthy meals you can make in under 10 minutes. Perfect for busy days.",
      icon: <Clock className="w-6 h-6" />,
    },
    {
      title: "Daily Journal",
      description:
        "Reflect on your eating habits, track how you feel, and understand patterns in your nutrition journey.",
      icon: <Salad className="w-6 h-6" />,
    },
  ];

  return (
    <section
      id="features"
      className="py-20 md:py-32 bg-black text-white relative z-10 overflow-hidden"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-xs tracking-widest mb-16 md:mb-20 text-gray-400 uppercase">
          KEY FEATURES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 border-t border-l border-neutral-800">
          {features.map((feature, index) => (
            <Feature key={feature.title} {...feature} index={index} />
          ))}
        </div>
      </div>

      {/* background radial glow */}
      <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] -translate-x-1/2 -translate-y-1/2 bg-white/5 blur-3xl rounded-full pointer-events-none" />
    </section>
  );
}

function Feature({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) {
  return (
    <div
      className={cn(
        "group relative border-b border-r border-neutral-800 py-12 px-8 flex flex-col justify-start items-start overflow-hidden",
        "transition-all duration-500 hover:bg-white/5",
        "group-[.hover]:bg-white/5"
      )}
      onTouchStart={(e) => e.currentTarget.classList.add("hover")}
      onTouchEnd={(e) => e.currentTarget.classList.remove("hover")}
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      {/* Background shimmer */}
      <div
        className="
          absolute inset-0 opacity-0 
          group-hover:opacity-100 
          group-[.hover]:opacity-100 
          transition-opacity duration-500 
          bg-gradient-to-t from-white/10 via-transparent to-transparent 
          pointer-events-none
        "
      />

      {/* Icon */}
      <div
        className="
          mb-5 text-gray-400 
          group-hover:text-white group-[.hover]:text-white
          transform 
          group-hover:-translate-y-1 group-[.hover]:-translate-y-1
          transition-all duration-500 ease-out
        "
      >
        {icon}
      </div>

      {/* Title */}
      <h3
        className="
          text-lg font-semibold mb-3 text-white
          group-hover:text-gray-100 group-[.hover]:text-gray-100
          transform 
          group-hover:-translate-y-1 group-[.hover]:-translate-y-1
          transition-all duration-500 ease-out
        "
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="
          text-sm text-gray-400 leading-relaxed
          group-hover:text-gray-200 group-[.hover]:text-gray-200
          transition-all duration-500 ease-out
        "
      >
        {description}
      </p>

      {/* Underline */}
      <span
        className="
          absolute left-8 bottom-8 w-0 
          group-hover:w-12 group-[.hover]:w-12
          h-[1px] bg-white 
          transition-all duration-500 ease-out
        "
      />
    </div>
  );
}

/* Fade-in animation */
const styles = `
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;

// Inject custom styles globally
if (typeof document !== "undefined") {
  const styleEl = document.createElement("style");
  styleEl.innerHTML = styles;
  document.head.appendChild(styleEl);
}
