'use client';

import React from 'react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] py-32 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-[#EDD8B4] shadow-sm">
        <h1 className="font-serif text-3xl md:text-4xl text-[#442D1C] mb-6">
          Terms of Service
        </h1>
        <p className="text-[#8E5022] italic mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-6 text-stone-600 leading-relaxed text-sm md:text-base">
          <p>
            By accessing or using the Bashō Ceramics website, you agree to be
            bound by these terms of service and all applicable laws and
            regulations.
          </p>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              1. Workshop Registrations
            </h3>
            <p>When you book a workshop with us, you agree to the following:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>
                <strong>Final Sale:</strong> All workshop bookings are final and
                non-refundable.
              </li>
              <li>
                <strong>Attendance:</strong> Please arrive 10 minutes before
                your scheduled slot. Late arrivals may not be accommodated to
                ensure the class runs smoothly for everyone.
              </li>
              <li>
                <strong>Conduct:</strong> We reserve the right to refuse service
                to anyone demonstrating inappropriate behavior in the studio.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              2. Product Purchases
            </h3>
            <p>
              Since our ceramics are handcrafted, slight variations in color,
              texture, and size are expected and celebrated. These are not
              considered defects. All sales are final once collected from the
              studio, unless the item is found to be structurally defective upon
              inspection at pickup.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              3. Intellectual Property
            </h3>
            <p>
              The content, organization, graphics, design, and other matters
              related to the Site are protected under applicable copyrights and
              other proprietary laws. The copying, redistribution, use, or
              publication by you of any such matters or any part of the Site is
              strictly prohibited.
            </p>
          </section>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              4. Governing Law
            </h3>
            <p>
              These terms and conditions are governed by and construed in
              accordance with the laws of India and you irrevocably submit to
              the exclusive jurisdiction of the courts in Surat, Gujarat.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
