export default function About() {
  return (
    <section
      id="about"
      className="py-20 md:py-32 bg-gradient-to-b from-white to-gray-50"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-playfair text-md sm:text-2xl md:text-2xl text-start mb-8 md:mb-10 tracking-tight text-gray-900">
          About Kalnut: Everyday User's AI-Powered Nutrition App
        </h2>

        <div className="space-y-16 md:space-y-20">
          {/* Mission / Story */}
          <div className="animate-fade-in">
            <h3 className="font-playfair text-sm sm:text-xl md:text-xl md:mb-6 text-gray-900">
              Making Nutrition Tracking Easy for Every Individual
            </h3>

            {/* <div className="relative mb-6 md:mb-8">
              {/* <img
                src="https://drive.google.com/thumbnail?id=12IRANZrht7-UJVDhHW2elEdDFVgxJT_4&sz=w800"
                alt="Kalnut founders working on AI-powered nutrition tracking for Indian meals"
                className="w-full max-w-xl mx-auto rounded-xl shadow-md h-64 md:h-80 object-cover"
              /> */}
            {/* <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent rounded-xl max-w-xl mx-auto"></div>
            </div>  */}

            <div className="prose prose-sm max-w-none">
              <p className="font-playfair text-base text-sm md:text-lg text-gray-700 leading-relaxed text-justify">
                Kalnut was born from a simple truth: tracking nutrition for food
                shouldn't feel impossible or expensive. While popular fitness
                apps cater to Western diets, millions of people struggle to find
                accurate nutritional data for everyday meals like dal, roti,
                dosa, sambar, and biryani. As engineers who faced this challenge
                daily, we knew there had to be a better way. That's why we
                created Kalnut. With intelligent meal tracking, a comprehensive
                food database covering regional cuisines, and personalized
                insights, Kalnut helps you understand your nutrition, plan
                healthier meals, and build lasting habits all for just $ 2.5 per
                month. It's not just affordable it's a smart investment in your
                long-term health and wellness. Whether you're a busy
                professional, a bachelor learning to cook, a fitness enthusiast,
                or someone simply trying to eat more mindfully, Kalnut makes
                healthy eating feel natural and effortless. We built it to make
                nutrition practical, accessible, local, and personal.
              </p>
            </div>
          </div>

          {/* Key Stats */}
          <div
            className="grid grid-cols-3 gap-6 md:gap-8 animate-fade-in"
            style={{ animationDelay: "50ms" }}
          >
            <div className="text-center p-4 bg-white rounded-xl shadow-xs hover:shadow-md transition-shadow">
              <div className="text-xl md:text-4xl font-bold text-blue-600 mb-2">
                $2.5
              </div>
              <div className="text-sm md:text-base text-gray-600">
                Per Month
              </div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-xs hover:shadow-md transition-shadow">
              <div className="text-xl md:text-4xl font-bold text-green-600 mb-2">
                AI
              </div>
              <div className="text-sm md:text-base text-gray-600">Powered</div>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-xs hover:shadow-md transition-shadow">
              <div className="text-xl md:text-4xl font-bold text-orange-600 mb-2">
                1000+
              </div>
              <div className="text-sm md:text-base text-gray-600">Foods</div>
            </div>
            {/* <div className="text-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">100%</div>
              <div className="text-sm md:text-base text-gray-600">Made in India</div>
            </div> */}
          </div>

          {/* Vision */}
          <div
            className="animate-fade-in bg-white "
            style={{ animationDelay: "100ms" }}
          >
            <h3 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">
              Our Vision: Empowering Health Through AI & Awareness
            </h3>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed">
              We're building Most intelligent nutrition companion; an AI-driven
              platform that truly understands regional foods, diverse cultural
              diets, and real-life eating habits across the country. Our mission
              is to help millions of people take control of their health through
              smart, easy-to-use, and affordable technology. Kalnut goes far
              beyond simple calorie counting. We're focused on empowering every
              person to eat smarter, live healthier, and feel better through the
              power of AI and nutritional awareness. Because when technology
              truly understands your food and your lifestyle, wellness becomes
              effortless and sustainable.
            </p>
          </div>

          {/* Founders */}
         <div className="animate-fade-in" style={{ animationDelay: "200ms" }}>
  <h3 className="font-playfair text-2xl md:text-3xl font-semibold mb-10 text-center text-gray-900">
    Meet the Founders Behind Kalnut
  </h3>

  <div className="grid md:grid-cols-2 gap-10">
    
    {/* Founder Card */}
    <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <img
        src="https://media.licdn.com/dms/image/v2/D5603AQFtcop9_Cuueg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1719175102348?e=1764201600&v=beta&t=pOu5D1c31I6z13C-wgyxoH20HGgvZ_ArO5wA1h2h78I"
        alt="Aditya Kumar Jha"
        className="w-36 h-36 md:w-40 md:h-40 rounded-full mx-auto mb-4 object-cover shadow-sm border border-gray-200"
      />

      <h4 className="font-semibold text-xl text-gray-900">Aditya Kumar Jha</h4>
      <p className="text-sm text-gray-500 font-medium">Founder & CEO</p>

      <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-4 text-justify">
        Engineer, published author, and founder of Gallant, Aditya believes 
        in using technology and storytelling to transform how people approach 
        health. He leads Kalnut’s vision for creating a seamless, intuitive 
        nutrition experience powered by AI and thoughtful design.
      </p>

      <a
        href="https://www.linkedin.com/in/aditya-kumar-jha-b0b669252"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-white bg-gray-900 px-4 py-2 rounded-lg text-sm font-medium mt-5 hover:bg-black transition-colors"
      >
        Connect on LinkedIn
        <svg
          className="w-4 h-4 transform transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </a>
    </div>

    {/* Shikhar */}
    <div className="text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
      <img
        src="https://drive.google.com/thumbnail?id=1_0r0Vzqzy92ChKFQDrX6DinqP_Jf2wcW&sz=w400"
        alt="Shikhar Burman"
        className="w-36 h-36 md:w-40 md:h-40 rounded-full mx-auto mb-4 object-cover shadow-sm border border-gray-200"
      />

      <h4 className="font-semibold text-xl text-gray-900">Shikhar Burman</h4>
      <p className="text-sm text-gray-500 font-medium">Co-Founder & CTO</p>

      <p className="text-sm md:text-base text-gray-600 leading-relaxed mt-4 text-justify">
        AI specialist and engineer, Shikhar brings Kalnut’s core technology 
        to life. With a focus on reliability, speed, and intelligence, he 
        ensures the platform stays precise and scalable for every user—from 
        the first log to their full transformation journey.
      </p>

      <a
        href="https://www.linkedin.com/in/shikharburman/"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-white bg-gray-900 px-4 py-2 rounded-lg text-sm font-medium mt-5 hover:bg-black transition-colors"
      >
        Connect on LinkedIn
        <svg
          className="w-4 h-4 transform transition-transform group-hover:translate-x-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      </a>
    </div>

  </div>
</div>


          {/* Contact */}
          <div
            className="animate-fade-in rounded-xl md:rounded-2xl p-6 md:p-10"
            style={{ animationDelay: "300ms" }}
          >
            <h3 className="font-playfair text-md sm:text-xl md:text-3xl mb-3 md:mb-4 text-gray-900 text-center">
              We'd Love to Hear From You
            </h3>
            <p className="text-sm sm:text-base md:text-md text-gray-700 leading-relaxed mb-6 md:mb-8 text-center max-w-2xl mx-auto">
              Have questions about Kalnut? Want to share feedback or ideas?
              Looking to collaborate or partner with us? We'd love to connect
              and hear your thoughts.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-stretch sm:items-center">
              <a
                href="mailto:kalnutcompany@gmail.com"
                className="flex items-center gap-2 md:gap-3 bg-white hover:bg-gray-50 text-gray-800 font-medium px-4 md:px-6 py-3 rounded-xs shadow-md hover:shadow-lg transition-all w-full sm:w-auto justify-center text-sm md:text-base"
                aria-label="Email Kalnut"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 text-black flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="truncate">kalnutcompany@gmail.com</span>
              </a>
              <a
                href="https://www.instagram.com/kalnutcompany"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 md:gap-3 bg-black text-white font-medium px-4 md:px-6 py-3 rounded-xs shadow-md hover:shadow-lg transition-all w-full sm:w-auto justify-center text-sm md:text-base"
                aria-label="Follow Kalnut on Instagram"
              >
                <svg
                  className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
                <span>@kalnutcompany</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
