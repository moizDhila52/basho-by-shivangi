// app/studio/page.js
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  ArrowRight,
  Users,
  Award,
  Shield,
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
} from "lucide-react";

const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

const STUDIO_INFO = {
  name: "Bashō Studio & Gallery",
  address: "47-A, Khan Market, Lodhi Colony, New Delhi 110003",
  phone: "+91 98765 43210",
  email: "studio@bashoceramics.com",
  website: "www.bashoceramics.com",
  instagram: "@bashoceramics",
  hours: [
    { day: "Monday", time: "11:00 AM - 7:00 PM" },
    { day: "Tuesday", time: "11:00 AM - 7:00 PM" },
    { day: "Wednesday", time: "11:00 AM - 7:00 PM" },
    { day: "Thursday", time: "11:00 AM - 7:00 PM" },
    { day: "Friday", time: "11:00 AM - 8:00 PM" },
    { day: "Saturday", time: "10:00 AM - 8:00 PM" },
    { day: "Sunday", time: "10:00 AM - 6:00 PM" },
  ],
  policies: [
    {
      title: "Studio Visits",
      description:
        "Appointments are preferred for studio visits to ensure personal attention. Walk-ins are welcome during business hours.",
      icon: Users,
    },
    {
      title: "Collection & Shipping",
      description:
        "Local collection available within 3-5 days. Nationwide shipping via premium couriers with insurance coverage.",
      icon: Shield,
    },
    {
      title: "Workshop Participation",
      description:
        "All workshops require prior registration. Materials are provided. Age limit: 16+ unless specified.",
      icon: Award,
    },
  ],
  features: [
    "Wheel-throwing demonstrations",
    "Kiln room viewing",
    "Gallery space with curated collections",
    "Private viewing rooms",
    "Custom commission consultations",
    "Workshop facilities",
    "Artisan meet-ups",
  ],
};

export default function StudioPage() {
  const [activeSection, setActiveSection] = useState("visit");

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#EDD8B4]/10 to-transparent" />
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-block">
              Our Creative Home
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
              Bashō <span className="text-[#C85428]">Studio</span>
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Where clay transforms into art, and visitors become part of our
              creative journey.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Studio Overview */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Studio Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src="/images/studio-interior.jpg"
                alt="Bashō Studio Interior"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <h3 className="font-serif text-3xl mb-2">
                  A Space for Creation
                </h3>
                <p className="text-white/90">Established 2018, New Delhi</p>
              </div>
            </motion.div>

            {/* Studio Description */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="font-serif text-4xl text-[#442D1C]">
                More Than a Gallery
              </h2>
              <p className="text-stone-600 text-lg">
                Our studio in the heart of Delhi is both a working ceramics
                studio and a gallery space. Here, you can witness the entire
                process—from raw clay to finished pieces—and connect directly
                with the artisans behind each creation.
              </p>
              <p className="text-stone-600">
                We believe in transparency and education. Every piece in our
                collection was born here, shaped by hands that value tradition
                while embracing contemporary aesthetics.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-2 gap-4 pt-6">
                {STUDIO_INFO.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#8E5022]" />
                    <span className="text-stone-700">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Visit Information & Policies */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-12">
            {["visit", "policies", "contact"].map((section) => (
              <button
                key={section}
                onClick={() => setActiveSection(section)}
                className={`px-8 py-4 rounded-xl font-medium transition-all capitalize ${
                  activeSection === section
                    ? "bg-[#442D1C] text-white shadow-md"
                    : "bg-white text-stone-600 hover:bg-stone-100 shadow-sm"
                }`}
              >
                {section === "visit" && "Visit Information"}
                {section === "policies" && "Studio Policies"}
                {section === "contact" && "Contact Details"}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="bg-white rounded-3xl shadow-lg p-8">
            {/* Visit Information */}
            {activeSection === "visit" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12"
              >
                {/* Location & Hours */}
                <div className="space-y-8">
                  <div>
                    <h3 className="font-serif text-2xl text-[#442D1C] mb-6 flex items-center gap-3">
                      <MapPin className="w-6 h-6 text-[#C85428]" />
                      Location
                    </h3>
                    <div className="space-y-4">
                      <p className="text-stone-700 text-lg">
                        {STUDIO_INFO.address}
                      </p>
                      <div className="aspect-video rounded-xl overflow-hidden">
                        {/* Embed Google Map */}
                        <iframe
                          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3504.017964642569!2d77.22441131508122!3d28.570071982444437!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce3a8a8e8f0a9%3A0x9e0c1c6c6b5b5c6d!2sKhan%20Market%2C%20New%20Delhi%2C%20Delhi!5e0!3m2!1sen!2sin!4v1636543210987!5m2!1sen!2sin"
                          width="100%"
                          height="100%"
                          style={{ border: 0 }}
                          allowFullScreen=""
                          loading="lazy"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div>
                    <h3 className="font-serif text-2xl text-[#442D1C] mb-6 flex items-center gap-3">
                      <Clock className="w-6 h-6 text-[#C85428]" />
                      Operating Hours
                    </h3>
                    <div className="space-y-3">
                      {STUDIO_INFO.hours.map((hour, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center py-3 border-b border-stone-100"
                        >
                          <span className="font-medium text-stone-700">
                            {hour.day}
                          </span>
                          <span className="text-stone-600">{hour.time}</span>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-stone-500 mt-4">
                      *Hours may vary during festivals and special events
                    </p>
                  </div>
                </div>

                {/* Visit Tips & Getting There */}
                <div>
                  <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
                    Planning Your Visit
                  </h3>
                  <div className="space-y-6">
                    <div className="bg-[#FDFBF7] rounded-2xl p-6 border border-[#EDD8B4]">
                      <h4 className="font-medium text-[#442D1C] mb-3">
                        Before You Come
                      </h4>
                      <ul className="space-y-2 text-stone-600">
                        <li className="flex items-start gap-3">
                          <ChevronRight className="w-5 h-5 text-[#8E5022] flex-shrink-0 mt-0.5" />
                          <span>
                            Appointments recommended for personalized attention
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <ChevronRight className="w-5 h-5 text-[#8E5022] flex-shrink-0 mt-0.5" />
                          <span>
                            Allow 60-90 minutes for a complete studio tour
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <ChevronRight className="w-5 h-5 text-[#8E5022] flex-shrink-0 mt-0.5" />
                          <span>Photography allowed for personal use only</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-[#FDFBF7] rounded-2xl p-6 border border-[#EDD8B4]">
                      <h4 className="font-medium text-[#442D1C] mb-3">
                        Getting Here
                      </h4>
                      <div className="space-y-4">
                        <div>
                          <span className="font-medium text-stone-700 block mb-1">
                            Metro
                          </span>
                          <span className="text-stone-600">
                            Central Secretariat (Yellow Line) - 10 min walk
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-stone-700 block mb-1">
                            Parking
                          </span>
                          <span className="text-stone-600">
                            Limited parking available. Public transport
                            recommended.
                          </span>
                        </div>
                        <div>
                          <span className="font-medium text-stone-700 block mb-1">
                            Accessibility
                          </span>
                          <span className="text-stone-600">
                            Wheelchair accessible entrance and facilities
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#FDFBF7] rounded-2xl p-6 border border-[#EDD8B4]">
                      <h4 className="font-medium text-[#442D1C] mb-3">
                        What to Expect
                      </h4>
                      <p className="text-stone-600">
                        Experience live pottery demonstrations, explore our
                        gallery collections, and interact with our artisans. Our
                        team is always happy to share stories behind each piece
                        and discuss custom commission possibilities.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Studio Policies */}
            {activeSection === "policies" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <h3 className="font-serif text-3xl text-[#442D1C]">
                  Studio Guidelines & Policies
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {STUDIO_INFO.policies.map((policy, index) => {
                    const Icon = policy.icon;
                    return (
                      <div
                        key={index}
                        className="bg-[#FDFBF7] rounded-2xl p-6 border border-[#EDD8B4]"
                      >
                        <div className="w-12 h-12 rounded-full bg-[#EDD8B4] flex items-center justify-center mb-4">
                          <Icon className="w-6 h-6 text-[#8E5022]" />
                        </div>
                        <h4 className="font-medium text-[#442D1C] text-xl mb-3">
                          {policy.title}
                        </h4>
                        <p className="text-stone-600">{policy.description}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Additional Policies */}
                <div className="bg-white rounded-2xl p-8 border border-stone-200">
                  <h4 className="font-medium text-[#442D1C] text-xl mb-4">
                    Additional Information
                  </h4>
                  <div className="space-y-6">
                    <div>
                      <h5 className="font-medium text-stone-700 mb-2">
                        Safety Guidelines
                      </h5>
                      <ul className="space-y-2 text-stone-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#8E5022] mt-2 flex-shrink-0" />
                          <span>
                            Children must be accompanied by adults at all times
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#8E5022] mt-2 flex-shrink-0" />
                          <span>No food or drinks in the studio area</span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#8E5022] mt-2 flex-shrink-0" />
                          <span>
                            Closed-toe shoes recommended for workshop
                            participants
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h5 className="font-medium text-stone-700 mb-2">
                        Collection & Shipping
                      </h5>
                      <ul className="space-y-2 text-stone-600">
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#8E5022] mt-2 flex-shrink-0" />
                          <span>
                            Local collection available 3-5 days after purchase
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#8E5022] mt-2 flex-shrink-0" />
                          <span>
                            Shipping nationwide with insurance coverage
                          </span>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-[#8E5022] mt-2 flex-shrink-0" />
                          <span>
                            International shipping available upon request
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Contact Details */}
            {activeSection === "contact" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12"
              >
                {/* Contact Information */}
                <div className="space-y-8">
                  <h3 className="font-serif text-3xl text-[#442D1C]">
                    Get In Touch
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                        <Phone className="w-6 h-6 text-[#8E5022]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-stone-700 mb-1">
                          Phone
                        </h4>
                        <p className="text-stone-600 text-lg">
                          {STUDIO_INFO.phone}
                        </p>
                        <p className="text-sm text-stone-500">
                          Call during business hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                        <Mail className="w-6 h-6 text-[#8E5022]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-stone-700 mb-1">
                          Email
                        </h4>
                        <p className="text-stone-600 text-lg">
                          {STUDIO_INFO.email}
                        </p>
                        <p className="text-sm text-stone-500">
                          Response within 24 hours
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                        <Globe className="w-6 h-6 text-[#8E5022]" />
                      </div>
                      <div>
                        <h4 className="font-medium text-stone-700 mb-1">
                          Website
                        </h4>
                        <p className="text-stone-600 text-lg">
                          {STUDIO_INFO.website}
                        </p>
                        <p className="text-sm text-stone-500">
                          Explore our online collections
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Social Media */}
                  <div>
                    <h4 className="font-medium text-stone-700 mb-4">
                      Follow Our Journey
                    </h4>
                    <div className="flex gap-4">
                      <a
                        href="https://instagram.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center hover:bg-[#EDD8B4] transition-colors"
                      >
                        <Instagram className="w-6 h-6 text-stone-600" />
                      </a>
                      <a
                        href="https://facebook.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center hover:bg-[#EDD8B4] transition-colors"
                      >
                        <Facebook className="w-6 h-6 text-stone-600" />
                      </a>
                      <a
                        href="https://twitter.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center hover:bg-[#EDD8B4] transition-colors"
                      >
                        <Twitter className="w-6 h-6 text-stone-600" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="bg-[#FDFBF7] rounded-2xl p-8 border border-[#EDD8B4]">
                  <h4 className="font-medium text-[#442D1C] text-xl mb-6">
                    Send a Message
                  </h4>
                  <form className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                        placeholder="Your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Subject
                      </label>
                      <select className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]">
                        <option>Studio Visit Inquiry</option>
                        <option>Workshop Information</option>
                        <option>Custom Commission</option>
                        <option>General Question</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        required
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                        placeholder="Your message..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#8E5022] text-white py-4 rounded-xl font-medium hover:bg-[#652810] transition-colors flex items-center justify-center gap-2"
                    >
                      Send Message
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-[#442D1C] to-[#8E5022] rounded-3xl p-12 text-center text-white">
            <h2 className="font-serif text-4xl mb-6">
              Ready to Experience Bashō?
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
              Book your studio visit today and immerse yourself in the world of
              handcrafted ceramics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-[#442D1C] px-8 py-4 rounded-xl font-medium hover:bg-stone-100 transition-colors">
                Book a Studio Visit
              </button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-medium hover:bg-white/10 transition-colors">
                View Workshop Schedule
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
