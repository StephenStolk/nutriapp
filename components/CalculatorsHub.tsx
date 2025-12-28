'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Heart,
  TrendingUp,
  Zap,
  Scale,
  Ruler,
  Flame,
  Target,
  Plus
} from 'lucide-react';

const calculators = [
  {
    name: 'BMI Calculator',
    description: 'Calculate your Body Mass Index to understand your weight category.',
    url: '/calculators/bmi-calculator/',
    icon: Activity,
    available: true
  },
  {
    name: 'Calorie Calculator',
    description: 'Estimate daily calorie needs based on age, gender, and activity.',
    url: '/calculators/calorie-calculator/',
    icon: Zap,
    available: false
  },
  {
    name: 'Weight Loss Calculator',
    description: 'Plan your weight loss journey with realistic calorie targets.',
    url: '/calculators/weight-loss-calculator/',
    icon: TrendingUp,
    available: false
  },
  {
    name: 'BMR Calculator',
    description: 'Understand how many calories your body burns at rest.',
    url: '/calculators/bmr-calculator/',
    icon: Heart,
    available: false
  },
  {
      name: 'Height Predictor Calculator',
      description: 'Predict a child\'s future adult height based on parental heights and current growth patterns.',
      url: '/calculators/height-predictor/',
      icon: Ruler,
      color: 'bg-indigo-500',
      available: true
    },
  {
    name: 'Ideal Weight Calculator',
    description: 'Find a healthy weight range based on height and gender.',
    url: '/calculators/ideal-weight-calculator/',
    icon: Target,
    available: false
  },
  {
    name: 'Macro Calculator',
    description: 'Calculate optimal protein, carbs, and fat intake.',
    url: '/calculators/macro-calculator/',
    icon: Flame,
    available: false
  },
  {
    name: 'Height Percentile Calculator',
    description: 'See how your height compares with population averages.',
    url: '/calculators/height-percentile-calculator/',
    icon: Ruler,
    available: false
  }
];

export default function CalculatorsHub() {
  const [open, setOpen] = useState(false);

  const visibleCards = calculators.slice(0, 7);
  const hiddenCards = calculators.slice(7);

  return (
    <main className="min-h-screen bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="text-center mb-14">
          <h1 className="text-4xl font-bold text-black mb-4">
            Health & Fitness Calculators
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Kalnut offers free, evidence-based health calculators to help you
            understand key body metrics like BMI, calories, and metabolism.
          </p>
        </header>

        {/* Grid */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          aria-label="Health calculators list"
        >
          {visibleCards.map((calc, i) => {
            const Icon = calc.icon;
            return (
              <article
                key={i}
                className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition"
              >
                <Icon className="w-8 h-8 text-black mb-4" />
                <h2 className="text-xl font-semibold text-black mb-2">
                  {calc.name}
                </h2>
                <p className="text-gray-700 text-sm mb-4">
                  {calc.description}
                </p>

                {calc.available ? (
                  <Link
                    href={calc.url}
                    className="block text-center border border-black text-black font-medium py-2 rounded-md hover:bg-black hover:text-white transition"
                  >
                    Use Calculator
                  </Link>
                ) : (
                  <span className="block text-center text-gray-400 border border-gray-300 py-2 rounded-md">
                    Coming Soon
                  </span>
                )}
              </article>
            );
          })}

          {/* Explore More Card */}
          <button
            onClick={() => setOpen(true)}
            className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:border-black transition"
            aria-haspopup="dialog"
            aria-controls="more-calculators-modal"
          >
            <Plus className="w-10 h-10 text-black mb-3" />
            <span className="text-black font-semibold">
              Explore More Calculators
            </span>
          </button>
        </section>

        {/* Modal */}
        {open && (
          <div
            role="dialog"
            aria-modal="true"
            id="more-calculators-modal"
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
          >
            <div className="bg-white max-w-lg w-full rounded-xl p-6 relative">
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 text-black"
                aria-label="Close"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold text-black mb-4">
                More Health Calculators
              </h2>

              <ul className="space-y-3">
                {hiddenCards.map((calc, i) => (
                  <li key={i}>
                    <Link
                      href={calc.url}
                      className="text-black underline hover:no-underline"
                    >
                      {calc.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-600 mt-16 max-w-2xl mx-auto">
          Kalnut calculators are for informational purposes only and do not
          replace professional medical advice.
        </p>
      </div>
    </main>
  );
}
