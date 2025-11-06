export default function About() {
  return (
    <section id="about" className="py-20 md:py-32 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-playfair text-4xl md:text-5xl font-bold text-center mb-8 tracking-tight">About Kalnut</h2>

        <div className="space-y-8 md:space-y-12">
          <div className="animate-fade-in">
            <h3 className="font-playfair text-2xl font-bold mb-4">Our Mission</h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              We built Kalnut to solve a simple problem: tracking nutrition for Indian foods is hard. Most nutrition
              apps focus on Western foods, leaving millions struggling to find accurate data for dal, roti, biryani, and
              the diverse dishes we eat every day.
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-4">
              Our mission is to make healthy eating accessible for everyone who loves Indian cuisine. Whether you're
              trying to lose weight, build muscle, manage a health condition, or simply eat more mindfully, we provide
              the tools you need.
            </p>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "100ms" }}>
            <h3 className="font-playfair text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              To empower millions of Indians to take control of their health through better nutrition awareness and
              smart meal planning. With Kalnut, you can scan any Indian food, log your meals effortlessly, plan
              budget-friendly meals based on where you live, and build lasting healthy habits.
            </p>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed mt-4">
              We believe healthy eating shouldn't be complicated or expensive—it should fit naturally into your
              lifestyle.
            </p>
          </div>

          <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
            <h3 className="font-playfair text-2xl font-bold mb-4">Get In Touch</h3>
            <p className="text-sm md:text-base text-gray-700 leading-relaxed">
              Have questions or feedback? We'd love to hear from you.
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Email:</span> kalnutcompany@gmail.com
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Follow us:</span> Instagram • Twitter • LinkedIn
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
