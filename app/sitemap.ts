export default function sitemap() {
  return [
    {
      url: 'https://kalnut.com',
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: 'https://kalnut.com/calculators/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    // BMI Calculator Pages
    {
      url: 'https://kalnut.com/calculators/bmi-calculator/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://kalnut.com/calculators/bmi-calculator-for-men/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://kalnut.com/calculators/bmi-calculator-for-women/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://kalnut.com/calculators/bmi-calculator-india/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    // Height Predictor
    {
      url: 'https://kalnut.com/calculators/height-predictor-calculator/',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}