'use client';

import { useState } from 'react';
import { Activity, Info } from 'lucide-react';
import Header from '../landing-temporary/header';
import Footer from '../landing-temporary/footer';


export default function BMICalculatorPage() {
  const [system, setSystem] = useState('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [feet, setFeet] = useState('');
  const [inches, setInches] = useState('');
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
    const totalInches =
      parseFloat(feet) * 12 + (parseFloat(inches) || 0);
    bmiValue = (parseFloat(weight) / (totalInches ** 2)) * 703;
  }

  setBmi(Number(bmiValue.toFixed(1)));

  if (bmiValue < 18.5) setCategory('Underweight');
  else if (bmiValue < 25) setCategory('Normal weight');
  else if (bmiValue < 30) setCategory('Overweight');
  else setCategory('Obese');
};


  return (
    <>
      <Header />

      <div className="min-h-screen bg-white py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              BMI Calculator – Body Mass Index Calculator
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Calculate your Body Mass Index (BMI) to assess if you're at a healthy weight. 
              BMI is a widely used screening tool that helps identify potential weight-related 
              health issues. Whether you're tracking fitness goals or monitoring your health with Kalnut, 
              this calculator provides instant results with clear health interpretations.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Calculate Your BMI</h2>
            </div>

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
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition ${
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

            <button
              onClick={calculateBMI}
              className="w-full bg-black text-white font-semibold py-4 rounded-sm transition"
            >
              Calculate BMI
            </button>

            {/* Results */}
            {bmi && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border-2 border-green-200">
                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm mb-2">Your BMI is</p>
                  <p className="text-5xl font-bold text-gray-900">{bmi}</p>
                  <p className={`text-xl font-semibold mt-2 ${
                    category === 'Normal weight' ? 'text-green-600' :
                    category === 'Underweight' ? 'text-blue-600' :
                    category === 'Overweight' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {category}
                  </p>
                </div>

                {/* BMI Scale */}
                <div className="mt-6">
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
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">Increased risk of malnutrition</td>
                    </tr>
                    <tr className="bg-green-600">
                      <td className="border border-gray-300 px-4 py-2">18.5 - 24.9</td>
                      <td className="border border-gray-300 px-4 py-2">Normal weight</td>
                      <td className="border border-gray-300 px-4 py-2">Minimal health risk</td>
                    </tr>
                    <tr>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">25.0 - 29.9</td>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">Overweight</td>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">Increased health risk</td>
                    </tr>
                    <tr>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">30.0 and above</td>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">Obese</td>
                      <td className="text-gray-800 border border-gray-300 px-4 py-2">High health risk</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Limitations of BMI</h3>
              <p className="text-gray-700 mb-4">
                While BMI is a useful screening tool, it has limitations. It doesn't distinguish 
                between muscle and fat mass, so athletes with high muscle mass may have a high BMI 
                despite being healthy. Similarly, it may not accurately reflect body fat in older 
                adults who have lost muscle mass. Kalnut recommends consulting with healthcare 
                professionals for a comprehensive health assessment.
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
                  What is a healthy BMI range?
                </h3>
                <p className="text-gray-700 ml-7">
                  According to the World Health Organization, a BMI between 18.5 and 24.9 is considered 
                  healthy for most adults. However, healthy weight ranges can vary based on individual 
                  factors like age, gender, and ethnicity.
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
                  BMI can indicate potential health risks associated with weight. Higher BMI is linked 
                  to increased risk of heart disease, diabetes, and other conditions. However, it's just 
                  one factor and should be considered along with other health indicators, lifestyle factors, 
                  and family history.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-gray-600 text-sm mt-8">
            This BMI calculator is provided by Kalnut for informational purposes. 
            Always consult with healthcare professionals for personalized medical advice.
          </p>
        </div>

        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "BMI Calculator",
              "applicationCategory": "HealthApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0"
              }
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "Is BMI accurate for everyone?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "BMI is a general screening tool and may not be accurate for athletes, pregnant women, elderly individuals, or those with high muscle mass."
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is a healthy BMI range?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "According to the World Health Organization, a BMI between 18.5 and 24.9 is considered healthy for most adults."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How often should I calculate my BMI?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "It's beneficial to calculate your BMI whenever there's a significant change in your weight or as part of regular health check-ups."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can BMI predict health problems?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "BMI can indicate potential health risks associated with weight. Higher BMI is linked to increased risk of heart disease, diabetes, and other conditions."
                  }
                }
              ]
            })
          }}
        />
      </div>

      <Footer />
    </>
  );
}