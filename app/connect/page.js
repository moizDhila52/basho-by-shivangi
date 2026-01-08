"use client";

import React, { useState } from "react";
import {
  Gift,
  Users,
  Handshake,
  Mail,
  Phone,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Send,
  Check,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ToastProvider"; // Ensure you have this wrapped in layout

// Brand Colors
const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

export default function ConnectPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    service: "",
    teamSize: "",
    budget: "",
    timeline: "",
    message: "",
  });

  const services = [
    {
      icon: <Gift className="w-8 h-8" />,
      title: "Corporate Gifting",
      description: "Bespoke ceramic gifts that reflect your company's values.",
      features: ["Custom branding", "Bulk orders", "Premium packaging"],
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Workshops",
      description: "Hands-on pottery workshops for creative team building.",
      features: [
        "On-site or studio",
        "All materials included",
        "Expert instruction",
      ],
    },
    {
      icon: <Handshake className="w-8 h-8" />,
      title: "Collaborations",
      description: "Co-branded collections aligned with your brand identity.",
      features: [
        "Product development",
        "Marketing support",
        "Exclusive designs",
      ],
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Submission failed");

      addToast(
        "Inquiry sent successfully! We will contact you soon.",
        "success"
      );

      // Reset Form
      setFormData({
        companyName: "",
        contactName: "",
        email: "",
        phone: "",
        service: "",
        teamSize: "",
        budget: "",
        timeline: "",
        message: "",
      });
    } catch (error) {
      console.error(error);
      addToast("Something went wrong. Please try again.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans selection:bg-[#C85428] selection:text-white"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-32 pb-24 px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#C85428] font-bold tracking-widest text-sm uppercase mb-4 block">
              Partnerships & Inquiries
            </span>
            <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
              Let's Create <br />{" "}
              <span className="italic text-[#8E5022]">Together.</span>
            </h1>
            <p className="text-[#652810] text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
              Explore partnerships, corporate solutions, and collaborative
              opportunities that bring artisanal craftsmanship to your business.
            </p>
          </motion.div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-96 h-96 bg-[#EDD8B4] rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-0 w-72 h-72 bg-[#C85428] rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-2xl border border-[#EDD8B4] hover:border-[#C85428] hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-16 h-16 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#8E5022] group-hover:bg-[#C85428] group-hover:text-white transition-colors mb-6">
                {s.icon}
              </div>
              <h3 className="font-serif text-2xl text-[#442D1C] mb-3">
                {s.title}
              </h3>
              <p className="text-[#652810]/80 mb-6 leading-relaxed">
                {s.description}
              </p>
              <ul className="space-y-2">
                {s.features.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-sm text-[#8E5022]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#C85428]" />
                    {f}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* --- INQUIRY FORM SECTION --- */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EDD8B4] flex flex-col md:flex-row">
          {/* Left: Contact Info */}
          <div className="md:w-1/3 bg-[#442D1C] text-[#EDD8B4] p-10 md:p-14 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-serif text-3xl mb-6 text-white">
                Get in Touch
              </h2>
              <p className="mb-10 text-white/80">
                Prefer to speak directly? Reach out to our corporate team via
                email or visit our studio.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-[#C85428] mt-1" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Email
                    </p>
                    <a
                      href="mailto:corporate@basho.com"
                      className="text-lg hover:text-white transition-colors"
                    >
                      corporate@basho.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-6 h-6 text-[#C85428] mt-1" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Phone
                    </p>
                    <p className="text-lg">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-6 h-6 text-[#C85428] mt-1" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Studio
                    </p>
                    <p className="text-lg">
                      123 Artisan Lane,
                      <br />
                      Surat, Gujarat
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="relative z-10 mt-12 pt-12 border-t border-white/10">
              <div className="flex gap-4">
                {[Instagram, Facebook, Linkedin, Twitter].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="p-2 bg-white/5 rounded-lg hover:bg-[#C85428] hover:text-white transition-colors"
                  >
                    <Icon size={20} />
                  </a>
                ))}
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#C85428] rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
          </div>

          {/* Right: Form */}
          <div className="md:w-2/3 p-10 md:p-14 bg-white">
            <h2 className="font-serif text-3xl text-[#442D1C] mb-8">
              Start a Conversation
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                    Company Name *
                  </label>
                  <input
                    required
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] focus:border-transparent outline-none transition-all text-[#442D1C]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                    Contact Person *
                  </label>
                  <input
                    required
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] focus:border-transparent outline-none transition-all text-[#442D1C]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] focus:border-transparent outline-none transition-all text-[#442D1C]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] focus:border-transparent outline-none transition-all text-[#442D1C]"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                    Service
                  </label>
                  <select
                    name="service"
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] outline-none text-[#442D1C] appearance-none cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="Corporate Gifting">Corporate Gifting</option>
                    <option value="Team Workshop">Team Workshop</option>
                    <option value="Brand Collaboration">Collaboration</option>
                    <option value="Bulk Order">Bulk Order</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                    Budget
                  </label>
                  <select
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] outline-none text-[#442D1C] appearance-none cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="Under 50k">Under ₹50k</option>
                    <option value="50k - 1L">₹50k - ₹1L</option>
                    <option value="1L - 5L">₹1L - ₹5L</option>
                    <option value="5L+">₹5L+</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                    Timeline
                  </label>
                  <select
                    name="timeline"
                    value={formData.timeline}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] outline-none text-[#442D1C] appearance-none cursor-pointer"
                  >
                    <option value="">Select...</option>
                    <option value="Urgent">Urgent (2 weeks)</option>
                    <option value="1 Month">1 Month</option>
                    <option value="Flexible">Flexible</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                  Message *
                </label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] focus:border-transparent outline-none transition-all text-[#442D1C]"
                  placeholder="Tell us more about your requirements..."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> Send Inquiry
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
