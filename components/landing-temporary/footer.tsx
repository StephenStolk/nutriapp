export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-20">
        <div className="text-center mb-16 md:mb-20 pb-16 md:pb-20 border-b border-gray-800">
          <h3 className="font-playfair text-3xl md:text-4xl font-bold mb-4 tracking-tight">
            Ready for a nutrition app that understands you?
          </h3>
          <p className="text-sm text-gray-400 mb-8 max-w-2xl mx-auto">
            Experience Nutrgram today and discover how personalized nutrition feels when your app adapts to your
            lifestyle and celebrates Indian cuisine.
          </p>
          <a
            href="https://v0-nutritionapp1-eta.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-8 py-3 bg-white text-black text-sm tracking-wide font-medium hover:bg-gray-200 transition-all duration-500 ease-out"
          >
            TRY IT OUT
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-xs tracking-widest font-bold mb-4">PRODUCT</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#features" className="hover:text-white transition-all duration-500 ease-out">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-all duration-500 ease-out">
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="https://v0-nutritionapp1-eta.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all duration-500 ease-out"
                >
                  Download App
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-widest font-bold mb-4">COMPANY</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="#about" className="hover:text-white transition-all duration-500 ease-out">
                  About Us
                </a>
              </li>
              <li>
                <a href="/blog" className="hover:text-white transition-all duration-500 ease-out">
                  Blog
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-white transition-all duration-500 ease-out">
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-widest font-bold mb-4">LEGAL</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a href="/privacy-policy" className="hover:text-white transition-all duration-500 ease-out">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="/terms-of-service" className="hover:text-white transition-all duration-500 ease-out">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="/cookie-policy" className="hover:text-white transition-all duration-500 ease-out">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs tracking-widest font-bold mb-4">CONNECT</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all duration-500 ease-out"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all duration-500 ease-out"
                >
                  Twitter
                </a>
              </li>
              <li>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-all duration-500 ease-out"
                >
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">© 2025 Nutrgram. All rights reserved.</p>
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Email:</span> serversyncindia@gmail.com
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
