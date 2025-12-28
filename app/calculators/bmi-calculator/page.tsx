import BMICalculatorClient from '@/components/calculatory/BMICalculatorClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMI Calculator – Body Mass Index Calculator | Kalnut',
  description:
    "Calculate your Body Mass Index (BMI) to assess if you're at a healthy weight. Free, accurate BMI calculator with health interpretations and multiple standards.",
  alternates: {
    canonical: 'https://kalnut.com/calculators/bmi-calculator/',
  },
  openGraph: {
    title: 'BMI Calculator | Kalnut',
    description: 'Calculate your BMI instantly with our free calculator',
    url: 'https://kalnut.com/calculators/bmi-calculator/',
    type: 'website',
  },
};

export default function Page() {
  return (
    <BMICalculatorClient
      variant="default"
      showCountrySelector={true}
      showGenderSelector={true}
    />
  );
}