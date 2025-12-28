import BMICalculatorClient from '@/components/calculatory/BMICalculatorClient';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BMI Calculator India – Asian BMI Standards | Kalnut',
  description:
    'Calculate BMI using Indian and South Asian standards with lower health risk thresholds. Free BMI calculator following Asian BMI guidelines by Kalnut.',
  alternates: {
    canonical: 'https://kalnut.com/calculators/bmi-calculator-india/',
  },
  openGraph: {
    title: 'BMI Calculator India | Kalnut',
    description: 'Calculate your BMI using Indian/South Asian standards',
    url: 'https://kalnut.com/calculators/bmi-calculator-india/',
    type: 'website',
  },
};

export default function Page() {
  return (
    <BMICalculatorClient
      variant="india"
      defaultCountry="india"
      showCountrySelector={false}
    />
  );
}