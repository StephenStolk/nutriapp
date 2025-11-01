"use client"

export default function BlogPost2() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <article className="prose prose-sm md:prose-base max-w-none">
          <div className="mb-8">
            <span className="text-xs tracking-widest text-gray-500 uppercase">Nutrition Basics</span>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mt-4 mb-4 tracking-tight">
              10 High-Protein Vegetarian Indian Foods You Should Eat Daily
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Published: January 18, 2025</span>
              <span>Reading Time: 6 minutes</span>
            </div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Introduction</h2>
              <p>
                "Where do you get your protein from?" If you're vegetarian in India, you've heard this question a
                million times. The truth? India has some of the best vegetarian protein sources in the world. Our
                ancestors thrived on these foods for thousands of years.
              </p>
              <p>
                The problem is most people don't know which foods are protein-rich, or how much to eat. This guide will
                show you exactly which vegetarian Indian foods pack the most protein, and how to include them in your
                daily diet.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Why Protein Matters</h2>
              <p>Protein is essential for:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Building and repairing muscles</li>
                <li>Keeping you full longer (reduces cravings)</li>
                <li>Maintaining healthy skin, hair, and nails</li>
                <li>Supporting immune function</li>
                <li>Preserving muscle during weight loss</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">How much protein do you need?</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Sedentary adult: 0.8g per kg body weight (48g for 60kg person)</li>
                <li>Active adult: 1.2-1.6g per kg (72-96g for 60kg person)</li>
                <li>Athlete/bodybuilder: 1.6-2.2g per kg (96-132g for 60kg person)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">
                Top 10 High-Protein Vegetarian Indian Foods
              </h2>

              <h3 className="font-semibold mt-6 mb-2">1. Paneer (Cottage Cheese) - 14g per 100g</h3>
              <p>The king of vegetarian protein in India. Paneer is versatile, tasty, and widely available.</p>
              <p className="font-semibold mt-2">How to eat it:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Paneer tikka (grilled, not fried)</li>
                <li>Paneer bhurji for breakfast</li>
                <li>Add cubes to salad</li>
                <li>Palak paneer (reduce oil)</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">2. Dal (Lentils) - 9g per cup cooked</h3>
              <p>India's staple protein source. Every region has its own dal variety.</p>
              <p className="font-semibold mt-2">Best options:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Moong dal (easiest to digest)</li>
                <li>Masoor dal (cooks fastest)</li>
                <li>Toor dal (traditional, filling)</li>
                <li>Urad dal (highest protein)</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">3. Chole (Chickpeas) - 15g per cup cooked</h3>
              <p>One of the highest protein legumes. Popular across North India.</p>
              <p className="font-semibold mt-2">How to eat it:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Chole with 2 rotis (not bhature—too oily)</li>
                <li>Boiled chana salad</li>
                <li>Hummus (Indian-style with cumin)</li>
                <li>Roasted chana as snacks</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">4. Rajma (Kidney Beans) - 15g per cup cooked</h3>
              <p>Comfort food that's also a protein powerhouse.</p>
              <p className="font-semibold mt-2">How to eat it:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Rajma chawal (Sunday classic)</li>
                <li>Rajma salad with vegetables</li>
                <li>Rajma tikki (cutlets)</li>
                <li>Rajma soup</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">5. Soya Chunks - 52g per 100g (dry weight)</h3>
              <p>The highest protein vegetarian food. Often underrated.</p>
              <p className="font-semibold mt-2">How to eat it:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Soya keema (minced texture)</li>
                <li>Soya curry</li>
                <li>Add to pulao</li>
                <li>Soya cutlets</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">6. Tofu - 8g per 100g</h3>
              <p>Similar to paneer but lower in fat and calories.</p>
              <p className="font-semibold mt-2">How to eat it:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Scrambled tofu bhurji</li>
                <li>Grilled tofu tikka</li>
                <li>Add to stir-fry vegetables</li>
                <li>Tofu palak</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">7. Greek Yogurt / Hung Curd - 10g per 100g</h3>
              <p>Double the protein of regular curd.</p>
              <p className="font-semibold mt-2">How to eat it:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>As a breakfast bowl with fruits</li>
                <li>Raita (skip the salt if trying to lose weight)</li>
                <li>Smoothies</li>
                <li>Marinade for paneer/tofu</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">8. Peanuts - 26g per 100g</h3>
              <p>Cheap, accessible, and protein-packed.</p>
              <p className="font-semibold mt-2">How to eat it:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Roasted peanuts (not fried)</li>
                <li>Peanut butter (sugar-free)</li>
                <li>Add to poha, upma</li>
                <li>Peanut chutney</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">9. Almonds & Cashews - 21g & 18g per 100g</h3>
              <p>Premium nuts with great nutrition.</p>
              <p className="font-semibold mt-2">How to eat it:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Soaked almonds (10-12) for breakfast</li>
                <li>Add to curries for creaminess (instead of cream)</li>
                <li>Nut butter</li>
                <li>Trail mix</li>
              </ul>

              <h3 className="font-semibold mt-6 mb-2">10. Quinoa - 8g per cup cooked</h3>
              <p>A complete protein (has all 9 essential amino acids). Growing popular in India.</p>
              <p className="font-semibold mt-2">How to eat it:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Quinoa pulao</li>
                <li>Quinoa khichdi</li>
                <li>Quinoa salad</li>
                <li>Replace rice with quinoa</li>
              </ul>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Sample High-Protein Vegetarian Day</h2>
              <p className="font-semibold">Breakfast:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>2 moong dal chillas (12g protein)</li>
                <li>1 cup milk (8g protein)</li>
              </ul>
              <p className="text-sm mt-2">Total: 20g</p>

              <p className="font-semibold mt-4">Mid-Morning Snack:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>10 almonds (3g protein)</li>
              </ul>

              <p className="font-semibold mt-4">Lunch:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>1 bowl rajma (15g protein)</li>
                <li>2 rotis (6g protein)</li>
                <li>Salad + curd (3g protein)</li>
              </ul>
              <p className="text-sm mt-2">Total: 24g</p>

              <p className="font-semibold mt-4">Evening Snack:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Roasted chana (10g protein)</li>
              </ul>

              <p className="font-semibold mt-4">Dinner:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Paneer tikka 100g (14g protein)</li>
                <li>Mixed dal (9g protein)</li>
                <li>1 roti (3g protein)</li>
              </ul>
              <p className="text-sm mt-2">Total: 26g</p>

              <p className="font-semibold mt-4">Daily Total: ~83g protein</p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">The Bottom Line</h2>
              <p>
                You don't need meat to get enough protein. India's vegetarian foods are naturally protein-rich when
                eaten in the right combinations and quantities. The key is variety. Don't just eat dal every day—rotate
                between paneer, chole, rajma, soya, and other options.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Track Your Protein Easily</h2>
              <p>
                Want to know exactly how much protein you're eating? Nutrgram helps you scan Indian foods and see
                protein content, log your meals in seconds, track daily protein goals, and get high-protein meal
                suggestions.
              </p>
              <div className="mt-6">
                <a
                  href="https://v0-nutritionapp1-eta.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 bg-black text-white text-sm tracking-wide font-medium hover:bg-gray-800 transition-all duration-500 ease-out"
                >
                  START TRACKING FREE
                </a>
              </div>
            </section>
          </div>
        </article>
      </div>
    </main>
  )
}
