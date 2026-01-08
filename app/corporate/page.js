// app/corporate/page.js
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  Users,
  Gift,
  Handshake,
  Award,
  CheckCircle,
  ArrowRight,
  Mail,
  Phone,
  Building,
  Calendar,
  Package,
  Shield,
  TrendingUp,
} from "lucide-react";

const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

const CORPORATE_SERVICES = [
  {
    title: "Corporate Gifting",
    description:
      "Custom ceramic pieces for employee recognition, client appreciation, and corporate events. Each piece tells your brand story through timeless craftsmanship.",
    icon: Gift,
    features: [
      "Custom branding options",
      "Bulk order discounts",
      "Gift wrapping & personalization",
      "Nationwide delivery",
    ],
    idealFor: [
      "Employee rewards",
      "Client gifts",
      "Conference souvenirs",
      "Festival presents",
    ],
  },
  {
    title: "Team Building Workshops",
    description:
      "Hands-on pottery workshops designed to foster creativity, collaboration, and mindfulness within your team. Led by master artisans.",
    icon: Users,
    features: [
      "2-4 hour sessions",
      "All materials provided",
      "Take-home creations",
      "Custom team activities",
    ],
    idealFor: [
      "Team offsites",
      "Leadership retreats",
      "Wellness programs",
      "Creative brainstorming",
    ],
  },
  {
    title: "Brand Collaborations",
    description:
      "Exclusive ceramic collections co-created with brands that value craftsmanship and sustainability. Limited edition pieces that resonate with your audience.",
    icon: Handshake,
    features: [
      "Co-design process",
      "Limited edition runs",
      "Sustainability focused",
      "Marketing support",
    ],
    idealFor: [
      "Luxury brands",
      "Sustainability initiatives",
      "Cultural projects",
      "Special anniversaries",
    ],
  },
];

const CLIENT_LOGOS = [
  { name: "Google", logo: "/logos/google.png" },
  { name: "Microsoft", logo: "/logos/microsoft.png" },
  { name: "Adobe", logo: "/logos/adobe.png" },
  { name: "Airbnb", logo: "/logos/airbnb.png" },
  { name: "Spotify", logo: "/logos/spotify.png" },
  { name: "Tata Group", logo: "/logos/tata.png" },
];

const PROCESS_STEPS = [
  {
    step: 1,
    title: "Consultation",
    description:
      "We understand your needs, timeline, and budget through detailed discussions.",
    icon: Phone,
  },
  {
    step: 2,
    title: "Design & Proposal",
    description:
      "Our artisans create design concepts and present a detailed proposal.",
    icon: Briefcase,
  },
  {
    step: 3,
    title: "Creation",
    description: "Handcrafting begins with regular updates and quality checks.",
    icon: Package,
  },
  {
    step: 4,
    title: "Delivery & Follow-up",
    description: "Careful packaging and delivery with post-service support.",
    icon: Shield,
  },
];

export default function CorporatePage() {
  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    companySize: "",
    interests: [],
    message: "",
  });

  const handleInterestToggle = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/corporate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          "Inquiry submitted successfully! We will contact you within 24 hours."
        );
        setFormData({
          companyName: "",
          contactName: "",
          email: "",
          phone: "",
          companySize: "",
          interests: [],
          message: "",
        });
      } else {
        alert(data.error || "Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Failed to submit inquiry. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-[#EDD8B4]/20 pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-block">
              Business Partnerships
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
              Crafting <span className="text-[#C85428]">Meaningful</span>{" "}
              Connections
            </h1>
            <p className="text-xl text-stone-600 max-w-2xl mx-auto">
              Elevate your corporate gifting, team experiences, and brand
              collaborations with authentic handcrafted ceramics that tell a
              story.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl text-stone-500 mb-8">
              Trusted by forward-thinking organizations
            </h2>
            <div className="flex flex-wrap justify-center items-center gap-12">
              {CLIENT_LOGOS.map((client, index) => (
                <motion.div
                  key={client.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="grayscale hover:grayscale-0 transition-all duration-300"
                >
                  <div className="w-32 h-16 bg-white rounded-xl flex items-center justify-center shadow-sm">
                    <span className="font-medium text-stone-700">
                      {client.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-[#442D1C] mb-6">
              Tailored Corporate Solutions
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              From executive gifts to immersive team experiences, we create
              meaningful connections through the art of ceramics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CORPORATE_SERVICES.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <div className="p-8">
                    <div className="w-16 h-16 rounded-2xl bg-[#EDD8B4] flex items-center justify-center mb-6 group-hover:bg-[#C85428] transition-colors">
                      <Icon className="w-8 h-8 text-[#8E5022] group-hover:text-white transition-colors" />
                    </div>

                    <h3 className="font-serif text-2xl text-[#442D1C] mb-4">
                      {service.title}
                    </h3>
                    <p className="text-stone-600 mb-6">{service.description}</p>

                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-stone-700 mb-2">
                          Key Features
                        </h4>
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="flex items-center gap-2 text-sm text-stone-600"
                            >
                              <CheckCircle className="w-4 h-4 text-[#8E5022]" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-stone-700 mb-2">
                          Ideal For
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {service.idealFor.map((item, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs"
                            >
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <button className="w-full mt-8 bg-transparent border-2 border-[#442D1C] text-[#442D1C] py-3 rounded-xl font-medium hover:bg-[#442D1C] hover:text-white transition-all flex items-center justify-center gap-2">
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-[#442D1C] mb-6">
              Our Collaborative Process
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              From initial concept to final delivery, we ensure a seamless
              experience with attention to every detail.
            </p>
          </div>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-[#EDD8B4] hidden lg:block" />

            <div className="space-y-12 lg:space-y-0">
              {PROCESS_STEPS.map((step, index) => {
                const Icon = step.icon;
                const isEven = index % 2 === 0;

                return (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`flex flex-col lg:flex-row items-center ${
                      isEven ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Step Content */}
                    <div
                      className={`flex-1 ${isEven ? "lg:pr-12" : "lg:pl-12"}`}
                    >
                      <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-12 h-12 rounded-full bg-[#EDD8B4] flex items-center justify-center">
                            <Icon className="w-6 h-6 text-[#8E5022]" />
                          </div>
                          <div>
                            <div className="text-sm text-[#C85428] font-medium">
                              Step {step.step}
                            </div>
                            <h3 className="font-serif text-xl text-[#442D1C]">
                              {step.title}
                            </h3>
                          </div>
                        </div>
                        <p className="text-stone-600">{step.description}</p>
                      </div>
                    </div>

                    {/* Step Number */}
                    <div className="relative z-10 my-6 lg:my-0">
                      <div className="w-16 h-16 rounded-full bg-[#442D1C] text-white flex items-center justify-center text-xl font-bold shadow-lg">
                        {step.step}
                      </div>
                    </div>

                    {/* Empty Space for Alignment */}
                    <div className="flex-1" />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section className="px-4 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl shadow-lg p-8"
            >
              <div className="mb-8">
                <h2 className="font-serif text-3xl text-[#442D1C] mb-4">
                  Start the Conversation
                </h2>
                <p className="text-stone-600">
                  Tell us about your requirements, and our corporate team will
                  create a tailored proposal just for you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                      placeholder="Your company"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Contact Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          contactName: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                      placeholder="Your name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                      placeholder="you@company.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Company Size
                  </label>
                  <select
                    value={formData.companySize}
                    onChange={(e) =>
                      setFormData({ ...formData, companySize: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                  >
                    <option value="">Select company size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="501+">501+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-3">
                    Areas of Interest *
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      "Corporate Gifting",
                      "Team Workshops",
                      "Brand Collaborations",
                      "Custom Commissions",
                      "Other",
                    ].map((interest) => (
                      <button
                        key={interest}
                        type="button"
                        onClick={() => handleInterestToggle(interest)}
                        className={`px-4 py-2 rounded-full font-medium transition-all ${
                          formData.interests.includes(interest)
                            ? "bg-[#8E5022] text-white"
                            : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        }`}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-2">
                    Tell us about your requirements *
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#8E5022]/20 focus:border-[#8E5022]"
                    placeholder="Please include details like quantity, timeline, budget range, and any specific requirements..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#8E5022] text-white py-4 rounded-xl font-medium hover:bg-[#652810] transition-colors flex items-center justify-center gap-2"
                >
                  Submit Inquiry
                  <ArrowRight className="w-5 h-5" />
                </button>

                <p className="text-sm text-stone-500 text-center">
                  We typically respond within 24 hours. For urgent inquiries,
                  call us at +91 98765 43210.
                </p>
              </form>
            </motion.div>

            {/* Benefits & Contact */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="bg-gradient-to-br from-[#442D1C] to-[#8E5022] rounded-3xl p-8 text-white">
                <h3 className="font-serif text-2xl mb-6">
                  Why Choose Bashō for Corporate?
                </h3>
                <ul className="space-y-4">
                  {[
                    "Sustainable & ethical production",
                    "Custom design capabilities",
                    "Bulk order expertise",
                    "Nationwide logistics",
                    "Premium packaging",
                    "Brand storytelling integration",
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#EDD8B4]" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-8 border border-stone-200">
                <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
                  Direct Contact
                </h3>
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-[#8E5022]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-700 mb-1">
                        Corporate Email
                      </h4>
                      <p className="text-stone-600">
                        corporate@bashoceramics.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-[#8E5022]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-700 mb-1">
                        Corporate Line
                      </h4>
                      <p className="text-stone-600">+91 98765 43210 (Ext. 2)</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#EDD8B4] flex items-center justify-center flex-shrink-0">
                      <Building className="w-6 h-6 text-[#8E5022]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-700 mb-1">
                        Office Hours
                      </h4>
                      <p className="text-stone-600">
                        Monday-Friday, 9:00 AM - 6:00 PM IST
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#FDFBF7] rounded-2xl p-8 border border-[#EDD8B4]">
                <h3 className="font-medium text-[#442D1C] text-xl mb-4">
                  What Happens Next?
                </h3>
                <ol className="space-y-3 text-stone-600">
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-[#C85428]">1.</span>
                    <span>We acknowledge your inquiry within 4 hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-[#C85428]">2.</span>
                    <span>Initial consultation call within 24 hours</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-[#C85428]">3.</span>
                    <span>Custom proposal within 3 business days</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="font-medium text-[#C85428]">4.</span>
                    <span>Refinement and confirmation</span>
                  </li>
                </ol>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
