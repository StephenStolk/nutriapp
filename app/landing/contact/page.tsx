"use client"

export default function Contact() {
  return (
    <main className="min-h-screen">
      <div className="max-w-2xl mx-auto px-6 py-24 md:py-32">
        {/* Header */}
        <div className="mb-20">
          <h1 className="text-3xl md:text-6xl font-light mb-6 tracking-tight mt-16">Contact</h1>
          <p className="text-gray-500 text-lg font-light">
            Questions about Kalnut? Reach out through any channel below.
          </p>
        </div>

        {/* Contact Information */}
        <div className="space-y-16 mb-20">
          <div className="border-t border-gray-200 pt-10">
            <div className="space-y-12">
              <div>
                <p className="text-xs text-gray-400 mb-3 font-light tracking-wider uppercase">Email</p>
                <a
                  href="mailto:kalnutcompany@gmail.com"
                  className="text-xl md:text-2xl font-light hover:opacity-50 transition-opacity block"
                >
                  kalnutcompany@gmail.com
                </a>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-3 font-light tracking-wider uppercase">Phone</p>
                <a
                  href="tel:+919445699217"
                  className="text-xl md:text-2xl font-light hover:opacity-50 transition-opacity block"
                >
                  +91 9445699217
                </a>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-3 font-light tracking-wider uppercase">Quick Form</p>
                <a
                  href="https://forms.gle/tB5W19oHiS36XQYe9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm font-light underline underline-offset-4 hover:opacity-50 transition-opacity"
                >
                  Submit a query
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="border-t border-gray-200 pt-10">
          <p className="text-sm text-gray-400 font-light">
            We typically respond within 24 hours on business days.
          </p>
        </div>
      </div>
    </main>
  )
}