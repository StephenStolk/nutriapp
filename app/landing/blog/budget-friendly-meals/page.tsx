"use client"

export default function BlogPost3() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <article className="prose prose-sm md:prose-base max-w-none">
          <div className="mb-8">
            <span className="text-xs tracking-widest text-gray-500 uppercase">Meal Planning</span>
            <h1 className="font-playfair text-4xl md:text-5xl font-bold mt-4 mb-4 tracking-tight">
              Budget-Friendly Healthy Indian Meals Under ₹50
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>Published: January 16, 2025</span>
              <span>Reading Time: 7 minutes</span>
            </div>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Introduction</h2>
              <p>
                "Healthy food is too expensive." We hear this all the time. People think eating healthy means buying
                imported quinoa, organic vegetables, and expensive protein powders.
              </p>
              <p>
                The truth? Some of the healthiest meals cost less than ₹50. Indian cuisine is naturally budget-friendly
                if you know what to cook.
              </p>
              <p>
                In this guide, you'll find 15 complete, nutritious meals that cost under ₹50 per serving. These aren't
                just cheap—they're delicious, filling, and actually healthy.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">
                Why Indian Food is Naturally Budget-Friendly
              </h2>

              <h3 className="font-semibold mt-4 mb-2">1. Dal and legumes are cheap</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Moong dal: ₹120-140/kg</li>
                <li>Masoor dal: ₹80-100/kg</li>
                <li>Chana: ₹60-80/kg</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">2. Vegetables are affordable</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Seasonal vegetables: ₹20-40/kg</li>
                <li>Onions, tomatoes, potatoes: Always available</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">3. Whole grains cost less than processed foods</h3>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Rice: ₹40-60/kg</li>
                <li>Wheat flour: ₹30-40/kg</li>
                <li>Poha: ₹50-70/kg</li>
              </ul>

              <h3 className="font-semibold mt-4 mb-2">4. No need for expensive equipment</h3>
              <p>Pressure cooker, tawa, kadhai—that's it. No air fryers, blenders, or fancy gadgets needed.</p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">15 Complete Meals Under ₹50</h2>

              <h3 className="font-semibold mt-6 mb-2">Breakfast Options</h3>

              <h4 className="font-semibold mt-4 mb-2">1. Vegetable Poha - ₹25 per serving</h4>
              <p>Ingredients: Poha (₹10), Onion, potato, peas (₹10), Peanuts, spices (₹5)</p>
              <p className="text-sm mt-2">
                Why it's healthy: Light, easy to digest, good source of carbs, peanuts add protein
              </p>

              <h4 className="font-semibold mt-4 mb-2">2. Moong Dal Chilla (2 pieces) - ₹20 per serving</h4>
              <p>Ingredients: Moong dal (₹15), Onion, tomato, spices (₹5)</p>
              <p className="text-sm mt-2">Why it's healthy: High protein (12g per serving), gluten-free, filling</p>

              <h4 className="font-semibold mt-4 mb-2">3. Vegetable Upma - ₹30 per serving</h4>
              <p>Ingredients: Rava/semolina (₹8), Mixed vegetables (₹15), Peanuts, spices (₹7)</p>
              <p className="text-sm mt-2">Why it's healthy: Fiber-rich, vegetables add vitamins, keeps you full</p>

              <h4 className="font-semibold mt-4 mb-2">4. Besan Chilla with Chutney - ₹18 per serving</h4>
              <p>Ingredients: Besan (₹10), Onion, tomato, spices (₹5), Mint chutney (₹3)</p>
              <p className="text-sm mt-2">Why it's healthy: High protein from besan, low-calorie, gluten-free</p>

              <h3 className="font-semibold mt-6 mb-2">Lunch/Dinner Options</h3>

              <h4 className="font-semibold mt-4 mb-2">5. Dal Chawal (Comfort Classic) - ₹35 per serving</h4>
              <p>Ingredients: Rice (₹8), Dal (₹15), Tadka (₹5), Onion, tomato (₹7)</p>
              <p className="text-sm mt-2">Why it's healthy: Complete protein, balanced meal, easy to digest</p>

              <h4 className="font-semibold mt-4 mb-2">6. Rajma Chawal - ₹40 per serving</h4>
              <p>Ingredients: Rajma (₹20), Rice (₹8), Onion, tomato, spices (₹12)</p>
              <p className="text-sm mt-2">Why it's healthy: High protein (15g), high fiber, very filling</p>

              <h4 className="font-semibold mt-4 mb-2">7. Chole with Roti (2 rotis) - ₹45 per serving</h4>
              <p>Ingredients: Chickpeas (₹20), Wheat flour (₹8), Onion, tomato, spices (₹17)</p>
              <p className="text-sm mt-2">Why it's healthy: Protein-packed, whole wheat carbs, satisfying</p>

              <h4 className="font-semibold mt-4 mb-2">8. Mix Veg Sabzi with Roti - ₹38 per serving</h4>
              <p>Ingredients: Seasonal vegetables (₹25), Wheat flour (₹8), Oil, spices (₹5)</p>
              <p className="text-sm mt-2">Why it's healthy: Vitamins and minerals, low-calorie, high fiber</p>

              <h4 className="font-semibold mt-4 mb-2">9. Palak Dal with Rice - ₹32 per serving</h4>
              <p>Ingredients: Spinach (₹10), Dal (₹12), Rice (₹8), Spices (₹2)</p>
              <p className="text-sm mt-2">Why it's healthy: Iron from spinach, protein from dal, nutrient-dense</p>

              <h4 className="font-semibold mt-4 mb-2">10. Egg Curry with Roti (2 eggs) - ₹48 per serving</h4>
              <p>Ingredients: Eggs (₹20), Onion, tomato (₹10), Wheat flour (₹8), Spices (₹10)</p>
              <p className="text-sm mt-2">
                Why it's healthy: High protein (14g), affordable protein source, complete amino acids
              </p>

              <h3 className="font-semibold mt-6 mb-2">Quick Dinner Options</h3>

              <h4 className="font-semibold mt-4 mb-2">11. Khichdi (One-Pot Meal) - ₹28 per serving</h4>
              <p>Ingredients: Rice + moong dal (₹15), Vegetables (₹10), Ghee, spices (₹3)</p>
              <p className="text-sm mt-2">Why it's healthy: Easy to digest, comfort food, balanced meal</p>

              <h4 className="font-semibold mt-4 mb-2">12. Vegetable Dal Soup - ₹25 per serving</h4>
              <p>Ingredients: Mixed dal (₹12), Carrots, tomato, spinach (₹10), Spices (₹3)</p>
              <p className="text-sm mt-2">Why it's healthy: Light dinner, protein + fiber, low-calorie</p>

              <h4 className="font-semibold mt-4 mb-2">
                13. Paneer Bhurji with Roti (Budget Version) - ₹50 per serving
              </h4>
              <p>Ingredients: Paneer (₹30), Onion, tomato (₹8), Wheat flour (₹8), Spices (₹4)</p>
              <p className="text-sm mt-2">Why it's healthy: High protein (16g), filling, quick to make</p>

              <h4 className="font-semibold mt-4 mb-2">14. Aloo Paratha (2 pieces) - ₹22 per serving</h4>
              <p>Ingredients: Wheat flour (₹10), Potato (₹8), Oil, spices (₹4)</p>
              <p className="text-sm mt-2">
                Why it's healthy: Filling carbs, can add vegetables for nutrition, portable meal
              </p>

              <h4 className="font-semibold mt-4 mb-2">15. Vegetable Pulao - ₹35 per serving</h4>
              <p>Ingredients: Rice (₹10), Mixed vegetables (₹18), Ghee, spices (₹7)</p>
              <p className="text-sm mt-2">Why it's healthy: One-pot meal, vegetables add nutrition, flavorful</p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Money-Saving Tips</h2>

              <h3 className="font-semibold mt-4 mb-2">1. Buy in bulk</h3>
              <p>Dal, rice, spices last months. Saves 20-30% compared to small packets.</p>

              <h3 className="font-semibold mt-4 mb-2">2. Use seasonal vegetables</h3>
              <p>Much cheaper than off-season. Fresher and more nutritious.</p>

              <h3 className="font-semibold mt-4 mb-2">3. Plan your meals</h3>
              <p>Reduces waste. Buy only what you need. Use leftovers creatively.</p>

              <h3 className="font-semibold mt-4 mb-2">4. Cook at home</h3>
              <p>Outside food costs 3-4x more. Healthier and cleaner.</p>

              <h3 className="font-semibold mt-4 mb-2">5. Don't waste</h3>
              <p>Use vegetable peels for stock. Leftover roti becomes chilla. Leftover rice becomes fried rice.</p>

              <h3 className="font-semibold mt-4 mb-2">6. Protein on a budget</h3>
              <p>Dal, eggs, chole are equally nutritious as expensive meats. Much cheaper.</p>

              <h3 className="font-semibold mt-4 mb-2">7. Skip processed foods</h3>
              <p>Biscuits, chips, packaged snacks are expensive. Make your own snacks (roasted chana, makhana).</p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">The Bottom Line</h2>
              <p>
                Healthy eating doesn't require a big budget. Indian food is naturally nutritious and affordable when you
                cook at home, use dal and legumes for protein, buy seasonal vegetables, plan your meals, and avoid
                processed foods.
              </p>
              <p>
                You can eat healthy, delicious meals for under ₹50 per serving. It just requires a little planning and
                smart shopping.
              </p>
            </section>

            <section>
              <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Start Your Journey</h2>
              <p>
                Ready to track your meals and build healthy habits? Kalnut helps you log your meals, track nutrition,
                and get personalized recommendations.
              </p>
              <div className="mt-6">
                <a
                  href="https://v0-nutritionapp1-eta.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-8 py-3 bg-black text-white text-sm tracking-wide font-medium hover:bg-gray-800 transition-all duration-500 ease-out"
                >
                  TRY IT OUT
                </a>
              </div>
            </section>
          </div>
        </article>
      </div>
    </main>
  )
}
