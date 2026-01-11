'use client';

import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] py-32 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-[#EDD8B4] shadow-sm">
        <h1 className="font-serif text-3xl md:text-4xl text-[#442D1C] mb-6">
          Privacy Policy
        </h1>
        <p className="text-[#8E5022] italic mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-stone-600 leading-relaxed text-sm md:text-base">
          <p>
            Welcome to Bashō Ceramics ("we," "our," or "us"). We respect your
            privacy and are committed to protecting your personal data. This
            privacy policy explains how we look after your personal data when
            you visit our website.
          </p>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              1. Information We Collect
            </h3>
            <p>
              We may collect, use, store, and transfer different kinds of
              personal data about you, including:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Identity Data:</strong> First name, last name.
              </li>
              <li>
                <strong>Contact Data:</strong> Billing address, email address,
                and telephone numbers.
              </li>
              <li>
                <strong>Transaction Data:</strong> Details about payments to and
                from you and other details of products/workshops you have
                purchased from us.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              2. How We Use Your Data
            </h3>
            <p>
              We will only use your personal data when the law allows us to.
              Most commonly, we use your data to:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Process your orders and workshop registrations.</li>
              <li>
                Manage your relationship with us (including notifying you about
                changes to our terms or privacy policy).
              </li>
              <li>Send you newsletters (only if you have opted in).</li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              3. Data Security
            </h3>
            <p>
              We have implemented appropriate security measures to prevent your
              personal data from being accidentally lost, used, or accessed in
              an unauthorized way. We use secure payment gateways (Razorpay) for
              all financial transactions, and we do not store your credit/debit
              card details on our servers.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              4. Third-Party Links
            </h3>
            <p>
              This website may include links to third-party websites, plug-ins,
              and applications. Clicking on those links may allow third parties
              to collect or share data about you. We do not control these
              third-party websites and are not responsible for their privacy
              statements.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              5. Contact Us
            </h3>
            <p>
              If you have any questions about this privacy policy, please
              contact us at:
            </p>
            <p className="mt-2 font-medium text-[#442D1C]">
              hello@bashoceramics.com
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
