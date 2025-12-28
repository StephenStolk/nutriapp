import HeightPredictorClient from '@/components/calculatory/HeightPredictorClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Height Predictor Calculator – Estimate Adult Height | Kalnut',
  description:
    "Estimate future adult height using age, gender, and parent height. Free height predictor calculator by Kalnut with scientifically-backed formulas.",
  alternates: {
    canonical: 'https://kalnut.com/calculators/height-predictor-calculator/',
  },
  openGraph: {
    title: 'Height Predictor Calculator | Kalnut',
    description: 'Estimate your child\'s future adult height instantly with our free calculator',
    url: 'https://kalnut.com/calculators/height-predictor-calculator/',
    type: 'website',
  },
};

export default function Page() {
  return <HeightPredictorClient />;
}