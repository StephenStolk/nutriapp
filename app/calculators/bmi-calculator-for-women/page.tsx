import BMICalculatorClient from '@/components/calculatory/BMICalculatorClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMI Calculator for Women – Female Body Mass Index | Kalnut',
  description:
    'Calculate BMI for women with considerations for female body composition and hormonal factors. Free BMI calculator with female-specific health guidance by Kalnut.',
  alternates: {
    canonical: 'https://kalnut.com/calculators/bmi-calculator-for-women/',
  },
  openGraph: {
    title: 'BMI Calculator for Women | Kalnut',
    description: 'Calculate your BMI with female-specific health interpretations',
    url: 'https://kalnut.com/calculators/bmi-calculator-for-women/',
    type: 'website',
  },
};

export default function Page() {
  return (
    <BMICalculatorClient
      variant="women"
      defaultGender="female"
      showGenderSelector={false}
    />
  );
}