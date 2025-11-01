"use client";
import { Apple, Utensils, BarChart3, Target } from "lucide-react";

export default function HowItWorks() {
  const features = [
    {
      title: "Snap Your Meal",
      description:
        "Take a photo of your meal. Our AI instantly recognizes dishes and provides nutrition facts.",
      icon: <Apple className="w-8 h-8 stroke-1" />,
      size: "lg:col-span-2",
    },
    {
      title: "Get Your Chart",
      description:
        "Receive detailed nutrition breakdown, macros, and personalized health recommendations.",
      icon: <BarChart3 className="w-8 h-8 stroke-1" />,
    },
    {
      title: "Plan Ahead",
      description:
        "Get personalized meal plans based on your budget, time, and dietary preferences.",
      icon: <Utensils className="w-8 h-8 stroke-1" />,
    },
    {
      title: "Track & Improve",
      description:
        "Monitor your progress with visual analytics and build lasting healthy habits.",
      icon: <Target className="w-8 h-8 stroke-1" />,
      size: "lg:col-span-2",
    },
  ];

  return (
    <section id="how-it-works" className="w-full py-20 lg:py-40 bg-white">
      <div className="container mx-auto">
        <div className="flex flex-col gap-10">
          {/* Heading */}
          <div className="flex flex-col items-start gap-4 text-left">
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-gray-100 rounded-full">
              How It Works
            </span>
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-semibold">
              Understand your nutrition
            </h2>
            <p className="text-base md:text-lg max-w-2xl text-gray-600 leading-relaxed">
              Unlike broad and vague nutrition advice that only uses basic metrics,
              we use a complete picture of your health to generate your personalized plan.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`bg-muted rounded-md p-6 aspect-square lg:aspect-auto flex justify-between flex-col hover:shadow-lg hover:bg-gray-50 transition-all duration-500 ${feature.size ?? ""
                  }`}
              >
                {feature.icon}
                <div className="flex flex-col">
                  <h3 className="text-xl font-semibold tracking-tight mb-1">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
