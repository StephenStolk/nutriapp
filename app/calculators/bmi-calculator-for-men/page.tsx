import BMICalculatorClient from '@/components/calculatory/BMICalculatorClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMI Calculator for Men – Male Body Mass Index | Kalnut',
  description:
    'Calculate BMI specifically for men, accounting for higher muscle mass and male physiology. Free BMI calculator with male-specific health interpretations by Kalnut.',
  alternates: {
    canonical: 'https://kalnut.com/calculators/bmi-calculator-for-men/',
  },
  openGraph: {
    title: 'BMI Calculator for Men | Kalnut',
    description: 'Calculate your BMI with male-specific health interpretations',
    url: 'https://kalnut.com/calculators/bmi-calculator-for-men/',
    type: 'website',
  },
};

export default function Page() {
  return (
    <BMICalculatorClient
      variant="men"
      defaultGender="male"
      showGenderSelector={false}
    />
  );
}