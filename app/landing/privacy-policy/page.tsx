"use client"
export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-8 tracking-tight">Privacy Policy</h1>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Introduction</h2>
            <p>
              At Kalnut, we are committed to protecting your privacy and ensuring you have a positive experience on
              our platform. This Privacy Policy explains how we collect, use, disclose, and safeguard your information
              when you use our mobile application and website.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Information We Collect</h2>
            <p>
              We may collect information about you in a variety of ways. The information we may collect on the Site
              includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Personal Data: Name, email address, phone number, and dietary preferences</li>
              <li>Health Data: Nutritional information, meal logs, and health metrics</li>
              <li>Device Information: Device type, operating system, and unique device identifiers</li>
              <li>Usage Data: How you interact with our app and features</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">How We Use Your Information</h2>
            <p>Kalnut uses the information we collect in the following ways:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>To provide, maintain, and improve our services</li>
              <li>To personalize your experience and deliver customized nutrition recommendations</li>
              <li>To send you service-related announcements and updates</li>
              <li>To respond to your inquiries and provide customer support</li>
              <li>To analyze usage patterns and improve our app functionality</li>
            </ul>
          </section>

          <section>
            <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
              over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-2xl font-bold mt-8 mb-4">Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us at kalnutcompany@gmail.com</p>
          </section>
        </div>
      </div>
    </main>
  )
}
