"use client"

import Link from "next/link"

export default function Blog() {
  const posts = [
    {
      id: 1,
      title: "How to Lose Weight While Eating Indian Food: A Complete Guide",
      excerpt:
        "Learn how to enjoy your favorite Indian dishes while losing weight sustainably. Discover smart swaps, portion control, and meal timing strategies.",
      date: "January 20, 2025",
      category: "Weight Loss & Health",
      slug: "weight-loss-indian-food",
    },
    {
      id: 2,
      title: "10 High-Protein Vegetarian Indian Foods You Should Eat Daily",
      excerpt:
        "Discover the top 10 vegetarian protein sources in Indian cuisine. From paneer to dal, learn how to get enough protein without meat.",
      date: "January 18, 2025",
      category: "Nutrition Basics",
      slug: "high-protein-vegetarian",
    },
    {
      id: 3,
      title: "Budget-Friendly Healthy Indian Meals Under ₹50",
      excerpt:
        "Eat healthy without breaking the bank. Find 15 complete, nutritious meals that cost less than ₹50 per serving.",
      date: "January 16, 2025",
      category: "Meal Planning",
      slug: "budget-friendly-meals",
    },
  ]

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4 tracking-tight">Kalnut Blog</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Discover insights, tips, and stories about nutrition, health, and building sustainable eating habits with
            Indian food.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <article className="border border-gray-200 p-6 hover:border-black transition-all duration-500 ease-out group h-full cursor-pointer">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-widest text-gray-500 uppercase">{post.category}</span>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>
                <h2 className="font-playfair text-lg font-bold mb-3 group-hover:text-gray-700 transition-all duration-500 ease-out">
                  {post.title}
                </h2>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">{post.excerpt}</p>
                <span className="text-xs tracking-widest font-medium group-hover:text-gray-700 transition-all duration-500 ease-out">
                  READ MORE
                </span>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
