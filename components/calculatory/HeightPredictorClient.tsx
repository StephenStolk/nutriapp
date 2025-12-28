'use client';

import { useState } from 'react';
import { Ruler, Info, TrendingUp } from 'lucide-react';
import Header from '../landing-temporary/header';
import Footer from '../landing-temporary/footer';

export default function HeightPredictorClient() {
  const [system, setSystem] = useState('metric');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [currentHeight, setCurrentHeight] = useState('');
  const [currentFeet, setCurrentFeet] = useState('');
  const [currentInches, setCurrentInches] = useState('');
  const [motherHeight, setMotherHeight] = useState('');
  const [motherFeet, setMotherFeet] = useState('');
  const [motherInches, setMotherInches] = useState('');
  const [fatherHeight, setFatherHeight] = useState('');
  const [fatherFeet, setFatherFeet] = useState('');
  const [fatherInches, setFatherInches] = useState('');
  const [predictedHeight, setPredictedHeight] = useState<number | null>(null);
  const [heightRange, setHeightRange] = useState<{ min: number; max: number } | null>(null);

  const calculatePredictedHeight = () => {
    let motherHeightCm: number;
    let fatherHeightCm: number;

    if (system === 'metric') {
      if (!motherHeight || !fatherHeight) return;
      motherHeightCm = parseFloat(motherHeight);
      fatherHeightCm = parseFloat(fatherHeight);
    } else {
      if (!motherFeet || !fatherFeet) return;
      const motherTotalInches = parseFloat(motherFeet) * 12 + (parseFloat(motherInches) || 0);
      const fatherTotalInches = parseFloat(fatherFeet) * 12 + (parseFloat(fatherInches) || 0);
      motherHeightCm = motherTotalInches * 2.54;
      fatherHeightCm = fatherTotalInches * 2.54;
    }

    // Mid-parental height formula
    let midParentalHeight: number;
    if (gender === 'male') {
      midParentalHeight = (motherHeightCm + fatherHeightCm + 13) / 2;
    } else {
      midParentalHeight = (motherHeightCm + fatherHeightCm - 13) / 2;
    }

    // Add variability range (±8.5 cm is standard deviation)
    const minHeight = midParentalHeight - 8.5;
    const maxHeight = midParentalHeight + 8.5;

    setPredictedHeight(Number(midParentalHeight.toFixed(1)));
    setHeightRange({
      min: Number(minHeight.toFixed(1)),
      max: Number(maxHeight.toFixed(1)),
    });
  };

  const convertCmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  return (
    <>
      <Header />

      <div className="min-h-screen bg-white py-12 px-4 mt-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Height Predictor Calculator – Estimate Adult Height
            </h1>
            <p className="text-lg text-gray-700 max-w-2xl mx-auto">
              Estimate your child's future adult height using scientifically-backed formulas based on parental heights and gender. 
              This height predictor calculator by Kalnut uses the mid-parental height method to provide 
              accurate predictions for growth monitoring and health tracking. Whether you're tracking 
              your child's development or curious about expected height, get instant results with clear explanations.
            </p>
          </div>

          {/* Calculator Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <Ruler className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-semibold text-gray-900">Predict Adult Height</h2>
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
                Metric (cm)
              </button>
              <button
                onClick={() => setSystem('imperial')}
                className={`flex-1 py-3 px-6 rounded-sm font-medium transition ${
                  system === 'imperial'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Imperial (ft/in)
              </button>
            </div>

            {/* Input Fields */}
            <div className="space-y-6 mb-6">
              {/* Child Info */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Age (years)
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    placeholder="10"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                    aria-label="Child's age"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Child's Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                    aria-label="Child's gender"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              {/* Current Height (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Child's Current Height (Optional)
                </label>
                {system === 'metric' ? (
                  <input
                    type="number"
                    value={currentHeight}
                    onChange={(e) => setCurrentHeight(e.target.value)}
                    placeholder="140"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                    aria-label="Current height in centimeters"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={currentFeet}
                      onChange={(e) => setCurrentFeet(e.target.value)}
                      placeholder="4"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                      aria-label="Current height in feet"
                    />
                    <input
                      type="number"
                      value={currentInches}
                      onChange={(e) => setCurrentInches(e.target.value)}
                      placeholder="7"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                      aria-label="Current height in inches"
                    />
                  </div>
                )}
              </div>

              {/* Mother's Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mother's Height {system === 'metric' ? '(cm)' : '(ft/in)'}
                </label>
                {system === 'metric' ? (
                  <input
                    type="number"
                    value={motherHeight}
                    onChange={(e) => setMotherHeight(e.target.value)}
                    placeholder="165"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                    aria-label="Mother's height in centimeters"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={motherFeet}
                      onChange={(e) => setMotherFeet(e.target.value)}
                      placeholder="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                      aria-label="Mother's height in feet"
                    />
                    <input
                      type="number"
                      value={motherInches}
                      onChange={(e) => setMotherInches(e.target.value)}
                      placeholder="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                      aria-label="Mother's height in inches"
                    />
                  </div>
                )}
              </div>

              {/* Father's Height */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Father's Height {system === 'metric' ? '(cm)' : '(ft/in)'}
                </label>
                {system === 'metric' ? (
                  <input
                    type="number"
                    value={fatherHeight}
                    onChange={(e) => setFatherHeight(e.target.value)}
                    placeholder="178"
                    className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                    aria-label="Father's height in centimeters"
                  />
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="number"
                      value={fatherFeet}
                      onChange={(e) => setFatherFeet(e.target.value)}
                      placeholder="5"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                      aria-label="Father's height in feet"
                    />
                    <input
                      type="number"
                      value={fatherInches}
                      onChange={(e) => setFatherInches(e.target.value)}
                      placeholder="10"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm focus:ring-1 focus:ring-black focus:border-transparent text-black"
                      aria-label="Father's height in inches"
                    />
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={calculatePredictedHeight}
              className="w-full bg-black text-white font-semibold py-4 rounded-sm transition"
            >
              Predict Adult Height
            </button>

            {/* Results */}
            {predictedHeight && heightRange && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                <div className="text-center mb-4">
                  <p className="text-gray-600 text-sm mb-2">Predicted Adult Height</p>
                  <p className="text-5xl font-bold text-gray-900">
                    {system === 'metric' 
                      ? `${predictedHeight} cm` 
                      : convertCmToFeetInches(predictedHeight)}
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <p className="text-lg text-gray-700">
                      Expected Range: {' '}
                      <span className="font-semibold">
                        {system === 'metric'
                          ? `${heightRange.min} - ${heightRange.max} cm`
                          : `${convertCmToFeetInches(heightRange.min)} - ${convertCmToFeetInches(heightRange.max)}`}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Visual Height Range */}
                <div className="mt-6">
                  <div className="relative h-12 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 rounded-lg">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-1 h-full bg-blue-900"></div>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>Lower Range</span>
                    <span className="font-semibold">Predicted</span>
                    <span>Upper Range</span>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">
                    <Info className="w-4 h-4 inline mr-1 text-blue-600" />
                    This prediction is based on the mid-parental height formula. Actual adult height may vary by ±8.5 cm 
                    due to genetic variability, nutrition, health, and environmental factors.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Explanation Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Understanding Height Prediction</h2>
            
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">What is a Height Predictor?</h3>
              <p className="text-gray-700 mb-4">
                A height predictor calculator estimates a child's potential adult height based on genetic factors, 
                primarily parental heights. Kalnut's calculator uses the mid-parental height formula, a scientifically 
                validated method used by pediatricians and growth specialists worldwide. This tool helps parents 
                monitor their child's growth trajectory and identify potential growth concerns early.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Mid-Parental Height Formula</h3>
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <p className="font-mono text-sm">
                  <strong>For Boys:</strong> [(Mother's Height + Father's Height + 13 cm) / 2] ± 8.5 cm
                </p>
                <p className="font-mono text-sm mt-2">
                  <strong>For Girls:</strong> [(Mother's Height + Father's Height - 13 cm) / 2] ± 8.5 cm
                </p>
                <p className="text-xs text-gray-600 mt-3">
                  The ±8.5 cm represents the standard deviation, accounting for genetic variability.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Factors Affecting Height</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-600">
                      <th className="border border-gray-300 px-4 py-2 text-left">Factor</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Impact</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">Genetics</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">60-80%</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">Primary determinant from parental heights</td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">Nutrition</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">10-20%</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">Adequate protein, vitamins, and minerals</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">Health</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">5-10%</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">Chronic conditions can affect growth</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">Sleep & Exercise</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">5-10%</td>
                      <td className="border border-gray-300 px-4 py-2 text-gray-800">Growth hormone release during sleep</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Growth Charts and Percentiles</h3>
              <p className="text-gray-700 mb-4">
                The CDC and WHO provide growth charts that plot a child's height against age and gender percentiles. 
                While the mid-parental height formula predicts final adult height, tracking growth velocity on these 
                charts helps identify if a child is following their expected growth curve. Kalnut recommends using 
                both tools together for comprehensive growth monitoring.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">Limitations of Height Prediction</h3>
              <p className="text-gray-700 mb-4">
                Height prediction calculators provide estimates, not guarantees. Factors like nutrition deficiencies, 
                hormonal imbalances, chronic illnesses, and genetic variations can cause actual height to differ from 
                predictions. The mid-parental height formula has an accuracy range of ±8.5 cm (about ±3.3 inches) due 
                to natural genetic variability. Kalnut's calculator is a screening tool and should not replace 
                professional medical evaluation for growth concerns.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  How accurate are height predictor calculators?
                </h3>
                <p className="text-gray-700 ml-7">
                  Height predictor calculators using the mid-parental height formula have an accuracy range of ±8.5 cm 
                  (±3.3 inches). About 68% of children will fall within this range, and 95% will be within ±17 cm of 
                  the prediction. Accuracy improves as children get older and closer to their adult height.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  At what age can you predict a child's height?
                </h3>
                <p className="text-gray-700 ml-7">
                  You can use the mid-parental height formula at any age, but predictions become more accurate after age 2 
                  when infant growth patterns stabilize. For the most accurate predictions, wait until after puberty begins, 
                  as growth spurts can temporarily alter predictions. Kalnut's calculator works for children of all ages.
                </p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  Can nutrition affect predicted height?
                </h3>
                <p className="text-gray-700 ml-7">
                  Yes, nutrition plays a significant role in whether a child reaches their genetic height potential. 
                  Adequate protein, calcium, vitamin D, and overall balanced nutrition support optimal growth. 
                  Malnutrition or chronic deficiencies can prevent children from reaching their predicted height, 
                  while optimal nutrition helps them achieve it.
                </p>
              </div>

              <div className="pb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <Info className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                  When should I be concerned about my child's height?
                </h3>
                <p className="text-gray-700 ml-7">
                  Consult a pediatrician if your child's height is consistently below the 3rd percentile, if they stop 
                  growing or grow much slower than expected, or if their growth curve changes significantly. Other 
                  warning signs include very early or very late puberty. While Kalnut's height predictor is helpful for 
                  monitoring, professional evaluation is essential for growth concerns.
                </p>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <p className="text-center text-gray-600 text-sm mt-8">
            This height predictor calculator is provided by Kalnut for informational purposes. 
            Always consult with healthcare professionals for personalized medical advice and growth monitoring.
          </p>
        </div>

        {/* Schema Markup */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Height Predictor Calculator",
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
                  "name": "How accurate are height predictor calculators?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Height predictor calculators using the mid-parental height formula have an accuracy range of ±8.5 cm (±3.3 inches). About 68% of children will fall within this range."
                  }
                },
                {
                  "@type": "Question",
                  "name": "At what age can you predict a child's height?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can use the mid-parental height formula at any age, but predictions become more accurate after age 2 when infant growth patterns stabilize."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Can nutrition affect predicted height?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, nutrition plays a significant role in whether a child reaches their genetic height potential. Adequate protein, calcium, vitamin D, and overall balanced nutrition support optimal growth."
                  }
                },
                {
                  "@type": "Question",
                  "name": "When should I be concerned about my child's height?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Consult a pediatrician if your child's height is consistently below the 3rd percentile, if they stop growing or grow much slower than expected, or if their growth curve changes significantly."
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