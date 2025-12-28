'use client';

import { useState, useEffect } from 'react';
import { Activity, Info, TrendingUp, Users, Globe } from 'lucide-react';
import Header from '../landing-temporary/header';
import Footer from '../landing-temporary/footer';

interface BMIRange {
  max?: number;
  min?: number;
}

interface CountryStandard {
  name: string;
  bmi_ranges: {
    underweight: BMIRange;
    normal: BMIRange;
    overweight: BMIRange;
    obese: BMIRange;
  };
  note?: string;
}

interface BMICalculatorProps {
  variant?: 'default' | 'men' | 'women' | 'india';
  defaultCountry?: 'global' | 'india';
  defaultGender?: 'male' | 'female' | 'unspecified';
  showCountrySelector?: boolean;
  showGenderSelector?: boolean;
}

const countryStandards: Record<string, CountryStandard> = {
  global: {
    name: 'Global (WHO)',
    bmi_ranges: {
      underweight: { max: 18.4 },
      normal: { min: 18.5, max: 24.9 },
      overweight: { min: 25, max: 29.9 },
      obese: { min: 30 },
    },
  },
  india: {
    name: 'India / South Asia',
    bmi_ranges: {
      underweight: { max: 18.4 },
      normal: { min: 18.5, max: 22.9 },
      overweight: { min: 23, max: 24.9 },
      obese: { min: 25 },
    },
    note: 'Asian populations face metabolic risks at lower BMI thresholds.',
  },
};

const genderContext = {
  male: {
    context: 'Men generally have higher lean muscle mass.',
    disclaimer: 'Physically active men may have a higher BMI without increased health risk.',
  },
  female: {
    context: 'Women naturally have higher essential body fat.',
    disclaimer: 'BMI does not account for pregnancy or hormonal changes.',
  },
  unspecified: {
    context: 'BMI interpretation based on general population standards.',
  },
};

export default function BMICalculatorClient({
  variant = 'default',
  defaultCountry = 'global',
  defaultGender = 'unspecified',
  showCountrySelector = true,
  showGenderSelector = true,
}: BMICalculatorProps) {
  const [system, setSystem] = useState('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
  const [age, setAge] = useState('');
  const [country, setCountry] = useState(defaultCountry);
  const [gender, setGender] = useState(defaultGender);
  const [bmi, setBmi] = useState<number | null>(null);
  const [category, setCategory] = useState('');

  const calculateBMI = () => {
    let bmiValue: number;

    if (system === 'metric') {
      if (!weight || !height) return;
      const heightInMeters = parseFloat(height) / 100;
      bmiValue = parseFloat(weight) / (heightInMeters ** 2);
    } else {
      if (!weight || !feet) return;
      const totalInches = parseFloat(feet) * 12 + (parseFloat(inches) || 0);
      bmiValue = (parseFloat(weight) / (totalInches ** 2)) * 703;
    }

    setBmi(Number(bmiValue.toFixed(1)));

    // Get country-specific ranges
    const ranges = countryStandards[country].bmi_ranges;

    if (bmiValue <= (ranges.underweight.max || 18.4)) {
      setCategory('Underweight');
    } else if (bmiValue >= (ranges.normal.min || 18.5) && bmiValue <= (ranges.normal.max || 24.9)) {
      setCategory('Normal weight');
    } else if (bmiValue >= (ranges.overweight.min || 25) && bmiValue <= (ranges.overweight.max || 29.9)) {
      setCategory('Overweight');
    } else {
      setCategory('Obese');
    }
  };

  const getCategoryColor = () => {
    if (category === 'Normal weight') return 'text-green-600';
    if (category === 'Underweight') return 'text-blue-600';
    if (category === 'Overweight') return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthyMidpoint = () => {
    const ranges = countryStandards[country].bmi_ranges;
    return ((ranges.normal.min || 18.5) + (ranges.normal.max || 24.9)) / 2;
  };

  const getBMIPosition = () => {
    if (!bmi) return 0;
    const min = 10;
    const max = 40;
    return ((bmi - min) / (max - min)) * 100;
  };

  const getPageTitle = () => {
    switch (variant) {
      case 'men':
        return 'BMI Calculator for Men';
      case 'women':
        return 'BMI Calculator for Women';
      case 'india':
        return 'BMI Calculator India – Asian BMI Standards';
      default:
        return 'BMI Calculator – Body Mass Index Calculator';
    }
  };

  const getPageDescription = () => {
    switch (variant) {
      case 'men':
        return 'Calculate BMI specifically for men, accounting for higher muscle mass and male physiology. Free BMI calculator with male-specific health interpretations by Kalnut.';
      case 'women':
        return 'Calculate BMI for women with considerations for female body composition and hormonal factors. Free BMI calculator with female-specific health guidance by Kalnut.';
      case 'india':
        return 'Calculate BMI using Indian and South Asian standards with lower health risk thresholds. Free BMI calculator following Asian BMI guidelines by Kalnut.';
      default:
        return 'Calculate your Body Mass Index (BMI) to assess if you\'re at a healthy weight. BMI is a widely used screening tool that helps identify potential weight-related health issues.';
    }
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-white py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{getPageTitle()}</h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">{getPageDescription()}</p>
          </div>

          {/* Related Pages Links */}
          {variant === 'default' && (
            <div className="mb-8 p-6 bg-gray-50 rounded-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Looking for specific BMI calculators?
              </h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href="/calculators/bmi-calculator-for-men/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-black transition text-sm text-black"
                >
                  <Users className="w-4 h-4" />
                  BMI for Men
                </a>
                <a
                  href="/calculators/bmi-calculator-for-women/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-black transition text-sm text-black"
                >
                  <Users className="w-4 h-4" />
                  BMI for Women
                </a>
                <a
                  href="/calculators/bmi-calculator-india/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-black transition text-sm text-black"
                >
                  <Globe className="w-4 h-4" />
                  BMI India
                </a>
              </div>
            </div>
          )}

          {/* Back to Main Calculator (for variant pages) */}
          {variant !== 'default' && (
            <div className="mb-6">
              <a
                href="/calculators/bmi-calculator/"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition text-sm"
              >
                ← Back to Main BMI Calculator
              </a>
            </div>
          )}

          {/* Calculator Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Calculate Your BMI</h2>
            </div>

            {/* Country Selector */}
            {showCountrySelector && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  BMI Standard
                </label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value as 'global' | 'india')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                  aria-label="Select BMI standard"
                >
                  <option value="global">Global (WHO)</option>
                  <option value="india">India / South Asia</option>
                </select>
                {country === 'india' && (
                  <p className="text-xs text-blue-600 mt-2">
                    {countryStandards.india.note}
                  </p>
                )}
              </div>
            )}

            {/* Unit Toggle */}
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSystem('metric')}
                className={`flex-1 py-3 px-6 rounded-sm font-medium transition ${
                  system === 'metric'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Metric (kg, cm)
              </button>
              <button
                onClick={() => setSystem('imperial')}
                className={`flex-1 py-3 px-6 rounded-sm font-medium transition ${
                  system === 'imperial'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Imperial (lbs, ft/in)
              </button>
            </div>

            {/* Input Fields */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Weight {system === 'metric' ? '(kg)' : '(lbs)'}
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder={system === 'metric' ? '70' : '154'}
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                  aria-label="Weight input"
                />
              </div>

              {system === 'metric' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="170"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 text-black focus:ring-black focus:border-transparent"
                    aria-label="Height input in centimeters"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Height
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={feet}
                      onChange={(e) => setFeet(e.target.value)}
                      placeholder="5"
                      className="w-full text-black px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent"
                      aria-label="Height in feet"
                    />
                    <input
                      type="number"
                      value={inches}
                      onChange={(e) => setInches(e.target.value)}
                      placeholder="7"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black text-black focus:border-transparent"
                      aria-label="Height in inches"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Feet / Inches</p>
                </div>
              )}
            </div>

            {/* Optional Fields */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {showGenderSelector && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender (Optional)
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                    aria-label="Select gender"
                  >
                    <option value="unspecified">Prefer not to say</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age (Optional)
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="25"
                  className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                  aria-label="Age input"
                />
              </div>
            </div>

            <button
              onClick={calculateBMI}
              className="w-full bg-black text-white font-semibold py-4 rounded-sm transition hover:bg-gray-800"
            >
              Calculate BMI
            </button>

            {/* Results */}
            {bmi && (
              <div className="mt-8 space-y-6">
                {/* Main Result */}
                <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                  <div className="text-center mb-4">
                    <p className="text-gray-600 text-sm mb-2">Your BMI is</p>
                    <p className="text-5xl font-bold text-gray-900">{bmi}</p>
                    <p className={`text-xl font-semibold mt-2 ${getCategoryColor()}`}>
                      {category}
                    </p>
                  </div>

                  {/* BMI Scale Bar */}
                  <div className="mt-6" aria-label="BMI category scale">
                    <div className="h-3 flex rounded-full overflow-hidden">
                      <div className="flex-1 bg-blue-500"></div>
                      <div className="flex-1 bg-green-500"></div>
                      <div className="flex-1 bg-yellow-500"></div>
                      <div className="flex-1 bg-red-500"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>Underweight</span>
                      <span>Normal</span>
                      <span>Overweight</span>
                      <span>Obese</span>
                    </div>
                  </div>

                  {/* Country-Specific Ranges */}
                  <div className="mt-4 p-3 bg-white rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-2">
                      {countryStandards[country].name} Ranges:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-blue-600 font-medium">Underweight:</span>{' '}
                        &lt;{countryStandards[country].bmi_ranges.underweight.max}
                      </div>
                      <div>
                        <span className="text-green-600 font-medium">Normal:</span>{' '}
                        {countryStandards[country].bmi_ranges.normal.min}-
                        {countryStandards[country].bmi_ranges.normal.max}
                      </div>
                      <div>
                        <span className="text-yellow-600 font-medium">Overweight:</span>{' '}
                        {countryStandards[country].bmi_ranges.overweight.min}-
                        {countryStandards[country].bmi_ranges.overweight.max}
                      </div>
                      <div>
                        <span className="text-red-600 font-medium">Obese:</span>{' '}
                        ≥{countryStandards[country].bmi_ranges.obese.min}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BMI Position Gauge */}
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Your BMI Position
                  </h3>
                  <div className="relative">
                    <div className="h-8 bg-gradient-to-r from-blue-400 via-green-400 via-yellow-400 to-red-400 rounded-lg"></div>
                    <div
                      className="absolute top-0 h-8 w-1 bg-black"
                      style={{ left: `${Math.min(Math.max(getBMIPosition(), 0), 100)}%` }}
                      title={`Your BMI: ${bmi}`}
                    ></div>
                    <div className="flex justify-between text-xs text-gray-600 mt-2">
                      <span>10</span>
                      <span>20</span>
                      <span>30</span>
                      <span>40</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    The black line shows where your BMI falls on the health scale
                  </p>
                </div>

                {/* Comparison Chart */}
                <div className="p-6 bg-gray-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">BMI Comparison</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Your BMI</span>
                        <span className="font-semibold">{bmi}</span>
                      </div>
                      <div className="h-6 bg-blue-200 rounded-sm relative overflow-hidden">
                        <div
                          className="h-full bg-blue-600"
                          style={{ width: `${(bmi / 40) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Healthy BMI Average</span>
                        <span className="font-semibold">{getHealthyMidpoint().toFixed(1)}</span>
                      </div>
                      <div className="h-6 bg-green-200 rounded-sm relative overflow-hidden">
                        <div
                          className="h-full bg-green-600"
                          style={{ width: `${(getHealthyMidpoint() / 40) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gender-Specific Context */}
                {gender !== 'unspecified' && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <p className="text-sm text-gray-800 mb-2">
                      <Info className="w-4 h-4 inline mr-1 text-purple-600" />
                      <strong>Note for {gender === 'male' ? 'Men' : 'Women'}:</strong>{' '}
                      {genderContext[gender].context}
                    </p>
                    <p className="text-xs text-gray-600">
                      {genderContext[gender].disclaimer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Explanation Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding BMI</h2>

            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">What is BMI?</h3>
              <p className="text-gray-700 mb-4">
                Body Mass Index (BMI) is a numerical value derived from your weight and height.
                It's used by healthcare professionals worldwide as a screening tool to categorize
                individuals into weight status categories. While BMI doesn't directly measure body
                fat, it correlates with more direct measures of body fat and can indicate potential
                health risks associated with being underweight or overweight.
              </p>

              {variant === 'men' && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                    BMI for Men – What You Need to Know
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Men typically have higher muscle mass and lower body fat percentages compared to women.
                    Since BMI doesn't distinguish between muscle and fat, athletic or physically active men
                    may have a higher BMI without increased health risks. Kalnut's BMI calculator for men
                    provides context-specific interpretations accounting for male physiology.
                  </p>
                </>
              )}

              {variant === 'women' && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                    BMI for Women – Special Considerations
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Women naturally have higher essential body fat percentages needed for reproductive health
                    and hormone regulation. BMI calculations don't account for pregnancy, menstrual cycle
                    changes, or menopause-related body composition shifts. Kalnut's BMI calculator for women
                    provides female-specific health context and interpretations.
                  </p>
                </>
              )}

              {variant === 'india' && (
                <>
                  <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
                    Why Different BMI Standards for India and South Asia?
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Research shows that Asian populations, including Indians, face higher health risks at
                    lower BMI levels compared to Western populations. This is due to differences in body
                    composition, with Asians having higher body fat percentages at the same BMI. Kalnut's
                    India BMI calculator uses adjusted thresholds recommended by health authorities for
                    more accurate risk assessment.
                  </p>
                </>
              )}

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">BMI Formula</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-mono text-sm">
                  <strong>Metric:</strong> BMI = weight (kg) / [height (m)]²
                </p>
                <p className="font-mono text-sm mt-2">
                  <strong>Imperial:</strong> BMI = [weight (lbs) / height (in)²] × 703
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">BMI Categories</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-600">
                      <th className="border border-gray-300 px-4 py-2 text-left">BMI Range</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Health Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">Below 18.5</td>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">Underweight</td>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">
                        Increased risk of malnutrition
                      </td>
                    </tr>
                    <tr className="bg-green-600">
                      <td className="border border-gray-300 px-4 py-2">
                        {countryStandards[country === 'india' ? 'india' : 'global'].bmi_ranges.normal.min} -{' '}
                        {countryStandards[country === 'india' ? 'india' : 'global'].bmi_ranges.normal.max}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">Normal weight</td>
                      <td className="border border-gray-300 px-4 py-2">Minimal health risk</td>
                    </tr>
                    <tr>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">
                        {countryStandards[country === 'india' ? 'india' : 'global'].bmi_ranges.overweight.min} -{' '}
                        {countryStandards[country === 'india' ? 'india' : 'global'].bmi_ranges.overweight.max}
                      </td>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">Overweight</td>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">Increased health risk</td>
                    </tr>
                    <tr>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">
                        {countryStandards[country === 'india' ? 'india' : 'global'].bmi_ranges.obese.min} and above
                      </td>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">Obese</td>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">High health risk</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Limitations of BMI</h3>
              <p className="text-gray-700 mb-4">
                While BMI is a useful screening tool, it has limitations. It doesn't distinguish between
                muscle and fat mass, so athletes with high muscle mass may have a high BMI despite being
                healthy. Similarly, it may not accurately reflect body fat in older adults who have lost
                muscle mass. Kalnut recommends consulting with healthcare professionals for a comprehensive
                health assessment.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>

            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <Info className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  Is BMI accurate for everyone?
                </h3>
                <p className="text-gray-700 ml-7">
                  BMI is a general screening tool and may not be accurate for athletes, pregnant women,
                  elderly individuals, or those with high muscle mass. It should be used alongside other
                  health metrics for a complete picture of your health status.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <Info className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  {variant === 'india'
                    ? 'Why are BMI cutoffs lower for India and South Asia?'
                    : 'What is a healthy BMI range?'}
                </h3>
                <p className="text-gray-700 ml-7">
                  {variant === 'india'
                    ? 'Studies show that South Asian populations have higher body fat percentages and face metabolic health risks at lower BMI levels. The adjusted cutoffs (normal: 18.5-22.9, overweight: 23-24.9, obese: ≥25) provide more accurate health risk assessments for Indians and other Asians.'
                    : 'According to the World Health Organization, a BMI between 18.5 and 24.9 is considered healthy for most adults. However, healthy weight ranges can vary based on individual factors like age, gender, and ethnicity.'}
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <Info className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  How often should I calculate my BMI?
                </h3>
                <p className="text-gray-700 ml-7">
                  It's beneficial to calculate your BMI whenever there's a significant change in your
                  weight or as part of regular health check-ups. For those actively managing their weight,
                  monthly BMI tracking with Kalnut's calculator can help monitor progress.
                </p>
              </div>

              <div className="pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <Info className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                  Can BMI predict health problems?
                </h3>
                <p className="text-gray-700 ml-7">
                  BMI can indicate potential health risks associated with weight. Higher BMI is linked to
                  increased risk of heart disease, diabetes, and other conditions. However, it's just one
                  factor and should be considered along with other health indicators, lifestyle factors,
                  and family history.
                </p>
              </div>
            </div>
          </div>

          {/* Medical Disclaimer */}
          <p className="text-center text-gray-600 text-sm mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <strong>Medical Disclaimer:</strong> This BMI calculator is provided by Kalnut for
            informational purposes only. BMI is a screening tool and not a diagnostic of body fatness or
            health. Always consult with qualified healthcare professionals for personalized medical advice
            and health assessments.
          </p>
        </div>

        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: getPageTitle(),
              applicationCategory: 'HealthApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
              },
              ...(variant === 'men' && { audience: { suggestedGender: 'Male' } }),
              ...(variant === 'women' && { audience: { suggestedGender: 'Female' } }),
              ...(variant === 'india' && { audience: { geographicArea: 'India' } }),
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: [
                {
                  '@type': 'Question',
                  name: 'Is BMI accurate for everyone?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'BMI is a general screening tool and may not be accurate for athletes, pregnant women, elderly individuals, or those with high muscle mass.',
                  },
                },
                {
                  '@type': 'Question',
                  name:
                    variant === 'india'
                      ? 'Why are BMI cutoffs lower for India and South Asia?'
                      : 'What is a healthy BMI range?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text:
                      variant === 'india'
                        ? 'Studies show that South Asian populations have higher body fat percentages and face metabolic health risks at lower BMI levels.'
                        : 'According to the World Health Organization, a BMI between 18.5 and 24.9 is considered healthy for most adults.',
                  },
                },
                {
                  '@type': 'Question',
                  name: 'How often should I calculate my BMI?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: "It's beneficial to calculate your BMI whenever there's a significant change in your weight or as part of regular health check-ups.",
                  },
                },
                {
                  '@type': 'Question',
                  name: 'Can BMI predict health problems?',
                  acceptedAnswer: {
                    '@type': 'Answer',
                    text: 'BMI can indicate potential health risks associated with weight. Higher BMI is linked to increased risk of heart disease, diabetes, and other conditions.',
                  },
                },
              ],
            }),
          }}
        />
      </div>

      <Footer />
    </>
  );
}