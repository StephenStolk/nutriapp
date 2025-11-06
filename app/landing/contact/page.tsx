"use client"

export default function Contact() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-16">
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4 tracking-tight">Get in Touch</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Have questions about Kalnut? We'd love to hear from you. Reach out to us through any of the channels
            below.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div className="border border-gray-200 p-8 hover:border-black transition-all duration-500 ease-out">
            <h2 className="font-playfair text-2xl font-bold mb-6">Contact Information</h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-xs tracking-widest font-bold mb-2 uppercase">Email</h3>
                <a
                  href="mailto:kalnutcompany@gmail.com"
                  className="text-lg hover:text-gray-700 transition-all duration-500 ease-out"
                >
                  kalnutcompany@gmail.com
                </a>
              </div>

              <div>
                <h3 className="text-xs tracking-widest font-bold mb-2 uppercase">Phone</h3>
                <a
                  href="tel:+919445699217"
                  className="text-lg hover:text-gray-700 transition-all duration-500 ease-out"
                >
                  +91 9445699217
                </a>
              </div>

              <div>
                <h3 className="text-xs tracking-widest font-bold mb-4 uppercase">Quick Query Form</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Have a question? Fill out our quick form and we'll get back to you within 24 hours.
                </p>
                <a
                  href="https://forms.gle/tB5W19oHiS36XQYe9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-6 py-2 border border-black text-sm tracking-wide font-medium hover:bg-black hover:text-white transition-all duration-500 ease-out"
                >
                  OPEN FORM
                </a>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 p-8 hover:border-black transition-all duration-500 ease-out">
            <h2 className="font-playfair text-2xl font-bold mb-6">Why Contact Us?</h2>

            <ul className="space-y-4 text-sm text-gray-700">
              <li className="flex gap-3">
                <span className="font-bold">Feature Requests</span>
                <span className="text-gray-600">Tell us what features you'd like to see in Kalnut</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">Bug Reports</span>
                <span className="text-gray-600">Found an issue? Let us know and we'll fix it</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">Partnerships</span>
                <span className="text-gray-600">Interested in collaborating? We'd love to hear from you</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">Feedback</span>
                <span className="text-gray-600">Your feedback helps us improve Kalnut</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">Support</span>
                <span className="text-gray-600">Need help using the app? We're here to assist</span>
              </li>
              <li className="flex gap-3">
                <span className="font-bold">General Inquiries</span>
                <span className="text-gray-600">Any other questions? Feel free to reach out</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border border-gray-200 p-8 text-center">
          <h2 className="font-playfair text-2xl font-bold mb-4">Response Time</h2>
          <p className="text-gray-600 mb-6">
            We typically respond to all inquiries within 24 hours during business days. For urgent matters, please call
            us directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://forms.gle/tB5W19oHiS36XQYe9"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-black text-white text-sm tracking-wide font-medium hover:bg-gray-800 transition-all duration-500 ease-out"
            >
              SUBMIT QUERY
            </a>
            <a
              href="mailto:kalnutcompany@gmail.com"
              className="px-8 py-3 border border-black text-sm tracking-wide font-medium hover:bg-black hover:text-white transition-all duration-500 ease-out"
            >
              SEND EMAIL
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
