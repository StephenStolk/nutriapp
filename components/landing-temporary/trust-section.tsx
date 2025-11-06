export default function TrustSection() {
  const testimonials = [
    {
      quote: "Kalnut completely changed how I track my nutrition. Finally, an app that understands Indian food!",
      source: "Priya M.",
    },
    {
      quote: "The meal planning feature saved me so much time and money. Highly recommended!",
      source: "Rajesh K.",
    },
    {
      quote: "Best nutrition app I've used. The AI recognition is incredibly accurate.",
      source: "Ananya S.",
    },
    {
      quote: "I love how personalized everything is. It feels like having a nutritionist in my pocket.",
      source: "Vikram P.",
    },
    {
      quote: "The habit tracking keeps me motivated. I've never been more consistent with my health goals.",
      source: "Neha D.",
    },
    {
      quote: "Finally, an app that celebrates Indian cuisine while helping me eat healthier.",
      source: "Arjun T.",
    },
  ]

  const stats = [
    { number: "10K+", label: "Active Users" },
    { number: "500K+", label: "Meals Tracked" },
    { number: "4.8★", label: "App Rating" },
  ]

  return (
    <section className="py-20 md:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-playfair text-4xl md:text-5xl font-bold text-center mb-4 tracking-tight">
          Loved by thousands
        </h2>
        <p className="text-center text-sm text-gray-600 mb-16 md:mb-20 max-w-2xl mx-auto">
          Join thousands of Indians who've transformed their nutrition journey with Kalnut.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 mb-16 md:mb-20">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 border border-black/10 hover:border-black hover:shadow-lg transition-all duration-500 ease-out group"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <p className="font-playfair text-base md:text-lg font-bold mb-4 group-hover:text-gray-800 transition-all duration-500 ease-out">
                "{testimonial.quote}"
              </p>
              <p className="text-xs text-gray-600 group-hover:text-gray-800 transition-all duration-500 ease-out">
                — {testimonial.source}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-black/10 pt-16 md:pt-20">
          <div className="grid grid-cols-3 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
                <p className="font-playfair text-3xl md:text-4xl font-bold mb-2">{stat.number}</p>
                <p className="text-xs md:text-sm text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
