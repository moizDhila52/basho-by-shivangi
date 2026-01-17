'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ToastProvider';

// Brand Colors
const COLORS = {
  dark: '#442D1C',
  brown: '#652810',
  clay: '#8E5022',
  terracotta: '#C85428',
  cream: '#EDD8B4',
  background: '#FDFBF7',
};

export default function ConnectPage() {
  const [inquiryType, setInquiryType] = useState('general'); // "general" or "corporate"
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    service: '',
    teamSize: '',
    budget: '',
    timeline: '',
    message: '',
  });

  const services = [
    {
      icon: <Mail className="w-6 h-6 md:w-8 md:h-8" />,
      title: 'General Inquiries',
      description:
        'Questions about your order, shipping, or our handcrafted process?',
      features: ['Quick support', 'Order tracking', 'Care instructions'],
    },
    {
      icon: <Users className="w-6 h-6 md:w-8 md:h-8" />,
      title: 'Workshops & Events',
      description:
        'Inquire about private sessions, group bookings, or studio visits.',
      features: ['Private lessons', 'Team building', 'Event space'],
    },
    {
      icon: <Gift className="w-6 h-6 md:w-8 md:h-8" />,
      title: 'Bespoke & Corporate',
      description:
        'Custom commissions, bulk orders, and corporate gifting solutions.',
      features: ['Custom branding', 'B2B solutions', 'Bulk gifting'],
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error('Submission failed');

      addToast(
        'Inquiry sent successfully! We will contact you soon.',
        'success',
      );

      // Reset Form
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        service: '',
        teamSize: '',
        budget: '',
        timeline: '',
        message: '',
      });
    } catch (error) {
      console.error(error);
      addToast('Something went wrong. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen font-sans selection:bg-[#C85428] selection:text-white pb-24 md:pb-0"
      style={{ backgroundColor: COLORS.background }}
    >
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden pt-28 md:pt-32 pb-16 md:pb-24 px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-block">
              Get in Touch
            </span>
            <h1 className="font-serif text-4xl md:text-6xl lg:text-7xl text-[#442D1C] mb-4 md:mb-6 leading-tight">
              Connect with <br />{' '}
              <span className="text-[#C85428]">Bashō</span>
            </h1>
            <p className="text-[#652810] text-base md:text-xl max-w-2xl mx-auto leading-relaxed px-4">
              Whether you have a question about a piece, a special request, or a
              business proposal, we’re here to listen and create together.
            </p>
          </motion.div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 md:w-96 md:h-96 bg-[#EDD8B4] rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-0 w-48 h-48 md:w-72 md:h-72 bg-[#C85428] rounded-full blur-3xl"></div>
        </div>
      </section>

      {/* --- SERVICES GRID --- */}
      <section className="py-12 md:py-20 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 md:p-8 rounded-2xl border border-[#EDD8B4] hover:border-[#C85428] hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#FDFBF7] flex items-center justify-center text-[#8E5022] group-hover:bg-[#C85428] group-hover:text-white transition-colors mb-4 md:mb-6">
                {s.icon}
              </div>
              <h3 className="font-serif text-xl md:text-2xl text-[#442D1C] mb-2 md:mb-3">
                {s.title}
              </h3>
              <p className="text-[#652810]/80 text-sm md:text-base mb-4 md:mb-6 leading-relaxed">
                {s.description}
              </p>
              <ul className="space-y-2">
                {s.features.map((f, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 text-xs md:text-sm text-[#8E5022]"
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
      <section className="py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-[#EDD8B4] flex flex-col lg:flex-row">
          {/* Left: Contact Info */}
          <div className="lg:w-1/3 bg-[#442D1C] text-[#EDD8B4] p-8 md:p-14 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="font-serif text-2xl md:text-3xl mb-4 md:mb-6 text-white">
                Get in Touch
              </h2>
              <p className="mb-8 md:mb-10 text-white/80 text-sm md:text-base">
                Have something specific in mind? Reach out to our studio team
                directly.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-5 h-5 md:w-6 md:h-6 text-[#C85428] mt-1" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Write to us
                    </p>
                    <a
                      href="mailto:corporate@basho.com"
                      className="text-base md:text-lg hover:text-white transition-colors"
                    >
                      corporate@basho.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <Phone className="w-5 h-5 md:w-6 md:h-6 text-[#C85428] mt-1" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Call us
                    </p>
                    <p className="text-base md:text-lg">+91 98765 43210</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-[#C85428] mt-1" />
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Studio
                    </p>
                    <p className="text-base md:text-lg">
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
                    <Icon size={18} className="md:w-5 md:h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Decoration */}
            <div className="absolute bottom-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#C85428] rounded-full blur-[80px] md:blur-[100px] opacity-20 pointer-events-none"></div>
          </div>

          {/* Right: Form */}
          <div className="lg:w-2/3 p-6 md:p-14 bg-white">
            {/* Inquiry Type Toggle */}
            <div className="flex gap-4 mb-6 md:mb-8 border-b border-[#EDD8B4] pb-4 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setInquiryType('general')}
                className={`pb-2 px-2 md:px-4 font-bold text-xs md:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                  inquiryType === 'general'
                    ? 'text-[#C85428] border-b-2 border-[#C85428]'
                    : 'text-stone-400 hover:text-[#8E5022]'
                }`}
              >
                General Contact
              </button>
              <button
                type="button"
                onClick={() => setInquiryType('corporate')}
                className={`pb-2 px-2 md:px-4 font-bold text-xs md:text-sm uppercase tracking-wider transition-all whitespace-nowrap ${
                  inquiryType === 'corporate'
                    ? 'text-[#C85428] border-b-2 border-[#C85428]'
                    : 'text-stone-400 hover:text-[#8E5022]'
                }`}
              >
                Business Inquiry
              </button>
            </div>

            <h2 className="font-serif text-2xl md:text-3xl text-[#442D1C] mb-6 md:mb-8">
              {inquiryType === 'general'
                ? 'Send us a Message'
                : 'Start a Conversation'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {/* Conditional Company Name */}
                {inquiryType === 'corporate' && (
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                      Company Name *
                    </label>
                    <input
                      required
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] focus:border-transparent outline-none transition-all text-[#442D1C] text-sm md:text-base"
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                    {inquiryType === 'corporate'
                      ? 'Contact Person *'
                      : 'Your Name *'}
                  </label>
                  <input
                    required
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] focus:border-transparent outline-none transition-all text-[#442D1C] text-sm md:text-base"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] focus:border-transparent outline-none transition-all text-[#442D1C] text-sm md:text-base"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] focus:border-transparent outline-none transition-all text-[#442D1C] text-sm md:text-base"
                  />
                </div>
              </div>

              {/* Conditional Business Details */}
              {inquiryType === 'corporate' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                      Service
                    </label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] outline-none text-[#442D1C] appearance-none cursor-pointer text-sm md:text-base"
                    >
                      <option value="">Select...</option>
                      <option value="Corporate Gifting">
                        Corporate Gifting
                      </option>
                      <option value="Team Workshop">Team Workshop</option>
                      <option value="Brand Collaboration">Collaboration</option>
                      <option value="Bulk Order">Bulk Order</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                      Budget
                    </label>
                    <select
                      name="budget"
                      value={formData.budget}
                      onChange={handleChange}
                      className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] outline-none text-[#442D1C] appearance-none cursor-pointer text-sm md:text-base"
                    >
                      <option value="">Select...</option>
                      <option value="Under 50k">Under ₹50k</option>
                      <option value="50k - 1L">₹50k - ₹1L</option>
                      <option value="1L - 5L">₹1L - ₹5L</option>
                      <option value="5L+">₹5L+</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs md:text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                      Timeline
                    </label>
                    <select
                      name="timeline"
                      value={formData.timeline}
                      onChange={handleChange}
                      className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] outline-none text-[#442D1C] appearance-none cursor-pointer text-sm md:text-base"
                    >
                      <option value="">Select...</option>
                      <option value="Urgent">Urgent (2 weeks)</option>
                      <option value="1 Month">1 Month</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-[#8E5022] uppercase tracking-wider">
                  Message *
                </label>
                <textarea
                  required
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="4"
                  className="w-full bg-[#FDFBF7] border border-[#EDD8B4] rounded-xl p-3 focus:ring-2 focus:ring-[#C85428] focus:border-transparent outline-none transition-all text-[#442D1C] text-sm md:text-base"
                  placeholder={
                    inquiryType === 'general'
                      ? 'How can we help you today?'
                      : 'How can we help you today? Share your thoughts or questions with us...'
                  }
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#C85428] to-[#8E5022] text-white font-bold py-3.5 md:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed text-sm md:text-base"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />{' '}
                    {inquiryType === 'general'
                      ? 'Send Message'
                      : 'Send Inquiry'}
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
