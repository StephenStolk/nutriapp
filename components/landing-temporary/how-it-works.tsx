"use client";
import { motion } from "framer-motion";
import { Apple, Utensils, BarChart3, Target } from "lucide-react";

export default function HowItWorks() {
  const features = [
    {
      title: "Snap Your Meal",
      description:
        "Take a photo of your meal. Our AI instantly recognizes dishes and provides nutrition facts.",
      icon: <Apple className="w-8 h-8 text-black" />,
      size: "lg:col-span-2",
    },
    {
      title: "Get Your Chart",
      description:
        "Receive detailed nutrition breakdown, macros, and personalized health recommendations.",
      icon: <BarChart3 className="w-8 h-8 text-black" />,
    },
    {
      title: "Plan Ahead",
      description:
        "Get personalized meal plans based on your budget, time, and dietary preferences.",
      icon: <Utensils className="w-8 h-8 text-black" />,
    },
    {
      title: "Track & Improve",
      description:
        "Monitor your progress with visual analytics and build lasting healthy habits.",
      icon: <Target className="w-8 h-8 text-black" />,
      size: "lg:col-span-2",
    },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.15, duration: 0.6, ease: "easeOut" },
    }),
  };

  return (
    <section id="how-it-works" className="w-full py-20 lg:py-40 bg-white">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex flex-col items-start gap-4 text-left mb-16"
        >
          <span className="inline-flex items-center px-3 py-1 text-sm font-medium border border-gray-200 rounded-full">
            How It Works
          </span>
          <h2 className="text-3xl md:text-5xl font-semibold tracking-tight">
            Understand your nutrition
          </h2>
          <p className="text-base md:text-lg max-w-2xl text-gray-700 leading-relaxed">
            Unlike broad and vague nutrition advice that only uses basic metrics,
            we use a complete picture of your health to generate your personalized plan.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              whileHover={{
                scale: 1.03,
                boxShadow: "0 8px 30px rgba(0,0,0,0.08)",
              }}
              className={`bg-white border border-gray-200 rounded-2xl p-6 flex justify-between flex-col transition-transform duration-300 ease-out hover:border-black ${feature.size ?? ""
                }`}
            >
              <div>{feature.icon}</div>
              <div className="flex flex-col mt-16">
                <h3 className="text-xl font-semibold mb-1">{feature.title}</h3>
                <p className="text-gray-700 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
