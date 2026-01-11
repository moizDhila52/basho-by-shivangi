'use client';

import React from 'react';
import { MapPin, Clock, Package } from 'lucide-react';

export default function ShippingPolicy() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] py-32 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl border border-[#EDD8B4] shadow-sm">
        <h1 className="font-serif text-3xl md:text-4xl text-[#442D1C] mb-6">
          Shipping & Collection Policy
        </h1>
        <p className="text-[#8E5022] italic mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="space-y-8 text-stone-600 leading-relaxed">
          <div className="bg-[#FDFBF7] p-6 rounded-2xl border border-[#EDD8B4]">
            <h2 className="font-serif text-xl text-[#442D1C] mb-3 flex items-center gap-2">
              <Package className="text-[#C85428]" /> Studio Pickup Only
            </h2>
            <p>
              At Bashō Ceramics, we handle delicate, handcrafted pieces. To
              ensure the safety of your items and to reduce our carbon
              footprint,
              <strong>
                {' '}
                we currently do not offer shipping or delivery services.
              </strong>{' '}
              All orders must be collected directly from our studio.
            </p>
          </div>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              How it Works
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              <li>Place your order online through our website.</li>
              <li>You will receive an "Order Confirmed" email immediately.</li>
              <li>
                Once your item is ready for collection (usually within 24-48
                hours), you will receive a <strong>"Ready for Pickup"</strong>{' '}
                notification.
              </li>
              <li>
                Please visit the studio with your Order ID to collect your
                piece.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              Pickup Location
            </h3>
            <div className="flex items-start gap-3 bg-stone-50 p-4 rounded-xl">
              <MapPin className="text-[#8E5022] mt-1 shrink-0" />
              <div>
                <p className="font-medium text-[#442D1C]">Studio Bashō</p>
                <p>Surat, Gujarat, India</p>
                <a
                  href="https://www.google.com/maps?q=21.1299866,72.7239895&z=17&hl=en"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#C85428] text-sm mt-1 block hover:underline transition-all"
                >
                  View on Google Maps
                </a>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              Pickup Hours
            </h3>
            <div className="flex items-start gap-3">
              <Clock className="text-[#8E5022] mt-1 shrink-0" />
              <div>
                <p>Monday - Saturday: 10:00 AM - 7:00 PM</p>
                <p>Sunday: Closed (except for scheduled workshops)</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="font-bold text-[#442D1C] text-lg mb-2">
              Important Notes
            </h3>
            <p>
              Please inspect your items carefully upon collection. Once the item
              leaves our studio premises, we cannot be held responsible for any
              damage incurred during transit.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
