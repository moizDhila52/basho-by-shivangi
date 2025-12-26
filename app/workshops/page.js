"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  Star,
  CheckCircle,
  Sparkles,
  Leaf,
  Heart,
  Palette,
  Coffee,
  Cake,
  Gift,
  ChevronDown,
  X,
  Send,
  ArrowRight,
} from "lucide-react";
import CartSlider from "@/components/CartSlider";

// --- Brand Colors from Palette ---
const COLORS = {
  dark: "#442D1C",
  brown: "#652810",
  clay: "#8E5022",
  terracotta: "#C85428",
  cream: "#EDD8B4",
  background: "#FDFBF7",
};

// --- Animation Variants ---
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

// --- Workshop Data ---
const WORKSHOPS = [
  {
    id: 1,
    title: "Introduction to Wheel Throwing",
    category: "Beginners",
    level: "Beginner",
    duration: "3 hours",
    price: 120,
    maxParticipants: 8,
    availableSpots: 4,
    date: "2024-03-15",
    time: "10:00 AM - 1:00 PM",
    location: "Main Studio",
    instructor: "Shivangi",
    rating: 4.9,
    reviews: 47,
    description:
      "Discover the magic of the potter's wheel. Learn basic throwing techniques and create your first functional pottery piece.",
    includes: [
      "All materials & tools provided",
      "Personal instruction",
      "Two pieces to take home",
      "Bisque firing included",
      "Refreshments",
    ],
    image: "/images/workshops/wheel-throwing.jpg",
    popular: true,
  },
  {
    id: 2,
    title: "Wabi-sabi Hand Building",
    category: "All Levels",
    level: "Intermediate",
    duration: "4 hours",
    price: 145,
    maxParticipants: 6,
    availableSpots: 2,
    date: "2024-03-20",
    time: "2:00 PM - 6:00 PM",
    location: "Garden Studio",
    instructor: "Kenji",
    rating: 4.8,
    reviews: 32,
    description:
      "Explore Japanese aesthetics through hand-building techniques. Create organic forms celebrating imperfections.",
    includes: [
      "Special Japanese clay",
      "Traditional tools",
      "Glazing session",
      "All firings included",
      "Tea ceremony break",
    ],
    image: "/images/workshops/hand-building.jpg",
    popular: true,
  },
  {
    id: 3,
    title: "Raku Firing Experience",
    category: "Advanced",
    level: "Advanced",
    duration: "6 hours",
    price: 220,
    maxParticipants: 4,
    availableSpots: 1,
    date: "2024-03-25",
    time: "9:00 AM - 3:00 PM",
    location: "Outdoor Kiln Area",
    instructor: "Shivangi",
    rating: 5.0,
    reviews: 28,
    description:
      "Master the ancient raku technique. Experience the dramatic firing process and unique glaze effects.",
    includes: [
      "Raku-specific materials",
      "Safety equipment",
      "Post-firing workshop",
      "Lunch included",
      "Certificate of completion",
    ],
    image: "/images/workshops/raku.jpg",
    popular: false,
  },
  {
    id: 4,
    title: "Tea Bowl Meditation",
    category: "Mindfulness",
    level: "Beginner",
    duration: "2.5 hours",
    price: 95,
    maxParticipants: 10,
    availableSpots: 6,
    date: "2024-03-18",
    time: "6:00 PM - 8:30 PM",
    location: "Zen Garden",
    instructor: "Mika",
    rating: 4.7,
    reviews: 41,
    description:
      "Combine pottery with mindfulness. Create a personal tea bowl while practicing meditation techniques.",
    includes: [
      "Meditation guidance",
      "Organic clay",
      "Matcha tea tasting",
      "Incense & music",
      "Guided glazing",
    ],
    image: "/images/workshops/tea-bowl.jpg",
    popular: false,
  },
  {
    id: 5,
    title: "Family Pottery Day",
    category: "Family",
    level: "All Levels",
    duration: "3 hours",
    price: 180,
    maxParticipants: 12,
    availableSpots: 8,
    date: "2024-03-22",
    time: "10:00 AM - 1:00 PM",
    location: "Family Studio",
    instructor: "Kenji & Mika",
    rating: 4.9,
    reviews: 56,
    description:
      "Perfect for families. Create memories together while learning pottery basics in a fun environment.",
    includes: [
      "Family discount (2 adults + 2 children)",
      "Age-appropriate projects",
      "All materials",
      "Snacks & drinks",
      "Group photo",
    ],
    image: "/images/workshops/family.jpg",
    popular: true,
  },
  {
    id: 6,
    title: "Glaze Chemistry Workshop",
    category: "Technique",
    level: "Intermediate",
    duration: "5 hours",
    price: 195,
    maxParticipants: 6,
    availableSpots: 3,
    date: "2024-03-28",
    time: "11:00 AM - 4:00 PM",
    location: "Glaze Lab",
    instructor: "Shivangi",
    rating: 4.8,
    reviews: 23,
    description:
      "Dive into the science of glazes. Learn to mix your own glazes and understand firing effects.",
    includes: [
      "Glaze recipe book",
      "All chemicals & materials",
      "Test tile set",
      "Lab coat & safety gear",
      "Take-home glaze samples",
    ],
    image: "/images/workshops/glaze.jpg",
    popular: false,
  },
];

const EXPERIENCES = [
  {
    id: "exp-1",
    title: "Couple Pottery Date",
    icon: <Heart className="w-8 h-8" />,
    duration: "3 hours",
    price: 250,
    capacity: "2 people",
    description:
      "Romantic pottery session for couples. Create matching pieces and enjoy private studio time.",
    features: [
      "Private studio session",
      "Professional photographer (optional)",
      "Champagne & chocolates",
      "Customized project",
      "Keepsake certificate",
    ],
    image: "/images/experiences/couple-date.jpg",
  },
  {
    id: "exp-2",
    title: "Birthday Celebration",
    icon: <Cake className="w-8 h-8" />,
    duration: "4 hours",
    price: 400,
    capacity: "Up to 12 people",
    description:
      "Celebrate your special day with creative pottery. Perfect for all ages and skill levels.",
    features: [
      "Private party space",
      "Birthday decorations",
      "Custom cake",
      "Party favors",
      "Group project option",
    ],
    image: "/images/experiences/birthday.jpg",
  },
  {
    id: "exp-3",
    title: "Farm & Garden Party",
    icon: <Leaf className="w-8 h-8" />,
    duration: "5 hours",
    price: 600,
    capacity: "Up to 20 people",
    description:
      "Combine pottery with farm-to-table experience in our garden studio.",
    features: [
      "Garden pottery station",
      "Farm tour",
      "Organic lunch",
      "Herb planting activity",
      "Live music",
    ],
    image: "/images/experiences/farm-party.jpg",
  },
  {
    id: "exp-4",
    title: "Corporate Team Building",
    icon: <Users className="w-8 h-8" />,
    duration: "4 hours",
    price: 800,
    capacity: "Up to 25 people",
    description:
      "Boost team creativity and collaboration through collaborative pottery projects.",
    features: [
      "Custom team-building exercises",
      "Professional facilitation",
      "Catered meals",
      "Group art installation",
      "Team photos",
    ],
    image: "/images/experiences/corporate.jpg",
  },
];

const INSTRUCTORS = [
  {
    id: 1,
    name: "Shivangi",
    role: "Master Potter & Founder",
    experience: "15+ years",
    specialty: "Wheel throwing, Raku, Glaze chemistry",
    bio: "Trained in traditional Japanese pottery techniques. Believes in teaching the soul of clay.",
    image: "/images/instructors/shivangi.jpg",
    rating: 5.0,
  },
  {
    id: 2,
    name: "Kenji",
    role: "Ceramic Artist",
    experience: "8 years",
    specialty: "Hand building, Sculpture, Installation art",
    bio: "Blends contemporary art with ancient techniques. Focuses on organic forms and textures.",
    image: "/images/instructors/kenji.jpg",
    rating: 4.9,
  },
  {
    id: 3,
    name: "Mika",
    role: "Mindfulness & Pottery Guide",
    experience: "6 years",
    specialty: "Meditative pottery, Tea ceremony, Zen arts",
    bio: "Integrates pottery with mindfulness practices. Creates sacred spaces for creative expression.",
    image: "/images/instructors/mika.jpg",
    rating: 4.8,
  },
];

export default function WorkshopsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    participants: 1,
    specialRequests: "",
    experienceLevel: "beginner",
    dietaryRequirements: "",
    newsletter: true,
  });
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const categories = [
    "All",
    "Beginners",
    "All Levels",
    "Advanced",
    "Mindfulness",
    "Family",
    "Technique",
  ];

  const filteredWorkshops =
    selectedCategory === "All"
      ? WORKSHOPS
      : WORKSHOPS.filter(
          (workshop) =>
            workshop.category === selectedCategory ||
            workshop.level.toLowerCase() === selectedCategory.toLowerCase()
        );

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegistration = (workshop) => {
    setSelectedWorkshop(workshop);
    setShowRegistration(true);
    setRegistrationStep(1);
    setFormData((prev) => ({
      ...prev,
      participants: 1,
    }));
  };

  const handleSubmitRegistration = (e) => {
    e.preventDefault();
    if (registrationStep < 3) {
      setRegistrationStep((prev) => prev + 1);
    } else {
      // In real app, submit to API
      console.log("Registration submitted:", {
        workshop: selectedWorkshop,
        ...formData,
      });
      setRegistrationComplete(true);
      setTimeout(() => {
        setShowRegistration(false);
        setRegistrationComplete(false);
        setSelectedWorkshop(null);
      }, 3000);
    }
  };

  const WorkshopCard = ({ workshop }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
    >
      {/* Popular Badge */}
      {workshop.popular && (
        <div className="absolute top-4 left-4 z-10">
          <span className="bg-[#C85428] text-white text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Popular
          </span>
        </div>
      )}

      {/* Availability Badge */}
      <div className="absolute top-4 right-4 z-10">
        <span
          className={`text-xs font-medium px-3 py-1.5 rounded-full ${
            workshop.availableSpots === 1
              ? "bg-red-100 text-red-700"
              : workshop.availableSpots <= 3
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {workshop.availableSpots} spots left
        </span>
      </div>

      {/* Image */}
      <div className="relative h-64 overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50">
        <div className="w-full h-full bg-gradient-to-br from-[#EDD8B4]/30 to-[#8E5022]/10" />
        {/* <img
          src={workshop.image}
          alt={workshop.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        /> */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <span className="text-sm text-[#8E5022] font-medium uppercase tracking-wider">
              {workshop.category}
            </span>
            <h3 className="font-serif text-2xl text-[#442D1C] mt-1 mb-2 group-hover:text-[#C85428] transition-colors">
              {workshop.title}
            </h3>
          </div>
          <div className="text-right">
            <div className="font-serif text-3xl text-[#442D1C]">
              ${workshop.price}
            </div>
            <div className="text-sm text-stone-500">per person</div>
          </div>
        </div>

        <p className="text-stone-600 text-sm mb-6 line-clamp-2">
          {workshop.description}
        </p>

        {/* Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Clock className="w-4 h-4" />
            <span>{workshop.duration}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Users className="w-4 h-4" />
            <span>{workshop.maxParticipants} max</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Calendar className="w-4 h-4" />
            <span>
              {new Date(workshop.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <MapPin className="w-4 h-4" />
            <span>{workshop.location}</span>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(workshop.rating)
                      ? "fill-[#C85428] text-[#C85428]"
                      : "text-stone-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-stone-500">
              {workshop.rating} ({workshop.reviews})
            </span>
          </div>
          <div className="text-sm font-medium text-[#8E5022]">
            Instructor: {workshop.instructor}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => handleRegistration(workshop)}
          disabled={workshop.availableSpots === 0}
          className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
            workshop.availableSpots === 0
              ? "bg-stone-200 text-stone-400 cursor-not-allowed"
              : "bg-[#8E5022] text-white hover:bg-[#652810]"
          }`}
        >
          {workshop.availableSpots === 0 ? "Fully Booked" : "Register Now"}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );

  const ExperienceCard = ({ experience }) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className="group relative bg-gradient-to-br from-white to-[#EDD8B4]/20 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500"
    >
      <div className="relative h-56 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-[#8E5022]/20 to-[#C85428]/10" />
        {/* <img
          src={experience.image}
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        /> */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute top-6 left-6">
          <div className="w-14 h-14 rounded-2xl bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#8E5022]">
            {experience.icon}
          </div>
        </div>
      </div>

      <div className="p-8">
        <h3 className="font-serif text-3xl text-[#442D1C] mb-3">
          {experience.title}
        </h3>

        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-600">
              <Clock className="w-5 h-5" />
              <span className="font-medium">Duration:</span>
            </div>
            <span className="font-medium">{experience.duration}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-600">
              <Users className="w-5 h-5" />
              <span className="font-medium">Capacity:</span>
            </div>
            <span className="font-medium">{experience.capacity}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-600">
              <Palette className="w-5 h-5" />
              <span className="font-medium">Starting From:</span>
            </div>
            <span className="font-serif text-2xl text-[#8E5022]">
              ${experience.price}
            </span>
          </div>
        </div>

        <p className="text-stone-600 mb-8 leading-relaxed">
          {experience.description}
        </p>

        <div className="mb-8">
          <h4 className="font-serif text-lg text-[#442D1C] mb-3">Includes:</h4>
          <ul className="space-y-2">
            {experience.features.map((feature, idx) => (
              <li key={idx} className="flex items-center gap-2 text-stone-600">
                <CheckCircle className="w-4 h-4 text-[#8E5022]" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() =>
            handleRegistration({
              ...experience,
              category: "Experience",
              isExperience: true,
            })
          }
          className="w-full bg-[#442D1C] text-white py-4 rounded-xl font-medium hover:bg-[#652810] transition-all flex items-center justify-center gap-3 group"
        >
          Inquire About This Experience
          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </motion.div>
  );

  const InstructorCard = ({ instructor }) => (
    <motion.div
      whileHover={{ y: -8 }}
      className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all"
    >
      <div className="relative h-64 overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-[#EDD8B4] to-[#8E5022]/20" />
        {/* <img
          src={instructor.image}
          alt={instructor.name}
          className="w-full h-full object-cover"
        /> */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      </div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-serif text-2xl text-[#442D1C] mb-1">
              {instructor.name}
            </h3>
            <div className="text-sm text-[#8E5022] font-medium">
              {instructor.role}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 fill-[#C85428] text-[#C85428]" />
            <span className="font-medium">{instructor.rating}</span>
          </div>
        </div>
        <div className="text-sm text-stone-500 mb-4">
          {instructor.experience} experience
        </div>
        <p className="text-stone-600 text-sm mb-6">{instructor.bio}</p>
        <div className="text-sm text-[#8E5022] font-medium">
          Specialty: {instructor.specialty}
        </div>
      </div>
    </motion.div>
  );

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-[#EDD8B4]/20 pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#8E5022]"
              style={{
                width: Math.random() * 100 + 20 + "px",
                height: Math.random() * 100 + 20 + "px",
                left: Math.random() * 100 + "%",
                top: Math.random() * 100 + "%",
                opacity: Math.random() * 0.2 + 0.1,
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="text-center mb-12"
          >
            <motion.div variants={fadeInUp}>
              <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium mb-4 inline-block">
                Connect with Clay
              </span>
              <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
                Workshops & <br />
                <span className="text-[#C85428]">Experiences</span>
              </h1>
              <p className="text-xl text-stone-600 max-w-2xl mx-auto">
                Discover the meditative art of pottery through hands-on
                workshops and memorable experiences.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Workshops Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-serif text-5xl text-[#442D1C] mb-6">
              Upcoming <span className="text-[#C85428]">Workshops</span>
            </h2>
            <p className="text-xl text-stone-600 max-w-3xl mx-auto">
              From beginner wheel throwing to advanced techniques, find the
              perfect workshop for your journey.
            </p>
          </motion.div>

          {/* Category Filter */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-[#442D1C] text-white"
                      : "bg-white text-stone-600 hover:bg-stone-100"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Workshops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredWorkshops.map((workshop) => (
              <WorkshopCard key={workshop.id} workshop={workshop} />
            ))}
          </div>

          {/* Experiences Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-20"
          >
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-4 mb-6">
                <div className="w-12 h-px bg-[#8E5022]" />
                <span className="text-[#8E5022] uppercase tracking-[0.3em] text-sm font-medium">
                  Special Experiences
                </span>
                <div className="w-12 h-px bg-[#8E5022]" />
              </div>
              <h2 className="font-serif text-5xl text-[#442D1C] mb-6">
                Create <span className="text-[#C85428]">Memories</span>
              </h2>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                Celebrate life's special moments with unique pottery experiences
                designed just for you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {EXPERIENCES.map((experience) => (
                <ExperienceCard key={experience.id} experience={experience} />
              ))}
            </div>
          </motion.div>

          {/* Instructors Section */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="text-center mb-16">
              <h2 className="font-serif text-5xl text-[#442D1C] mb-6">
                Meet Our <span className="text-[#C85428]">Instructors</span>
              </h2>
              <p className="text-xl text-stone-600 max-w-3xl mx-auto">
                Learn from experienced ceramic artists passionate about sharing
                their knowledge.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {INSTRUCTORS.map((instructor) => (
                <InstructorCard key={instructor.id} instructor={instructor} />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Registration Modal */}
      <AnimatePresence>
        {showRegistration && selectedWorkshop && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() =>
                !registrationComplete && setShowRegistration(false)
              }
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-4 md:inset-20 z-50 overflow-y-auto"
            >
              <div className="min-h-full flex items-center justify-center p-4">
                <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl">
                  {registrationComplete ? (
                    <div className="p-12 text-center">
                      <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                      </div>
                      <h3 className="font-serif text-3xl text-[#442D1C] mb-4">
                        Registration Complete!
                      </h3>
                      <p className="text-stone-600 mb-8">
                        Thank you for registering for{" "}
                        <span className="font-medium">
                          {selectedWorkshop.title}
                        </span>
                        . We've sent a confirmation email with all the details.
                      </p>
                      <div className="bg-[#FDFBF7] rounded-2xl p-6 mb-8">
                        <div className="text-sm text-stone-500 mb-2">
                          Registration Details
                        </div>
                        <div className="font-medium text-lg">
                          {selectedWorkshop.title}
                        </div>
                        <div className="text-stone-600">
                          {selectedWorkshop.date} • {selectedWorkshop.time}
                        </div>
                      </div>
                      <button
                        onClick={() => setShowRegistration(false)}
                        className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="p-6 border-b border-stone-200">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-serif text-2xl text-[#442D1C]">
                              Register for Workshop
                            </h3>
                            <p className="text-stone-600 mt-1">
                              Step {registrationStep} of 3
                            </p>
                          </div>
                          <button
                            onClick={() => setShowRegistration(false)}
                            className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="px-6 pt-6">
                        <div className="flex gap-2 mb-8">
                          {[1, 2, 3].map((step) => (
                            <div
                              key={step}
                              className={`h-2 flex-1 rounded-full transition-all ${
                                step <= registrationStep
                                  ? "bg-[#8E5022]"
                                  : "bg-stone-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Workshop Info */}
                      <div className="px-6 mb-8">
                        <div className="bg-gradient-to-r from-[#FDFBF7] to-[#EDD8B4]/20 rounded-2xl p-6">
                          <h4 className="font-serif text-xl text-[#442D1C] mb-2">
                            {selectedWorkshop.title}
                          </h4>
                          <div className="flex flex-wrap gap-4 text-sm text-stone-600">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(
                                selectedWorkshop.date
                              ).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              {selectedWorkshop.time}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {selectedWorkshop.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              {selectedWorkshop.availableSpots} spots available
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Registration Form */}
                      <form onSubmit={handleSubmitRegistration} className="p-6">
                        {registrationStep === 1 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                          >
                            <h4 className="font-serif text-xl text-[#442D1C] mb-4">
                              Your Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                  Full Name *
                                </label>
                                <input
                                  type="text"
                                  name="name"
                                  required
                                  value={formData.name}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-[#8E5022] focus:outline-none"
                                  placeholder="Enter your full name"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-stone-700 mb-2">
                                  Email Address *
                                </label>
                                <input
                                  type="email"
                                  name="email"
                                  required
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-[#8E5022] focus:outline-none"
                                  placeholder="your@email.com"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">
                                Phone Number *
                              </label>
                              <input
                                type="tel"
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-[#8E5022] focus:outline-none"
                                placeholder="+1 (555) 123-4567"
                              />
                            </div>
                          </motion.div>
                        )}

                        {registrationStep === 2 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                          >
                            <h4 className="font-serif text-xl text-[#442D1C] mb-4">
                              Workshop Details
                            </h4>
                            <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">
                                Number of Participants *
                              </label>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center border-2 border-stone-200 rounded-xl overflow-hidden">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        participants: Math.max(
                                          1,
                                          prev.participants - 1
                                        ),
                                      }))
                                    }
                                    className="w-12 h-12 flex items-center justify-center hover:bg-stone-100 transition-colors"
                                  >
                                    <span className="text-xl">-</span>
                                  </button>
                                  <span className="w-12 h-12 flex items-center justify-center font-medium text-lg">
                                    {formData.participants}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setFormData((prev) => ({
                                        ...prev,
                                        participants: Math.min(
                                          selectedWorkshop.availableSpots,
                                          prev.participants + 1
                                        ),
                                      }))
                                    }
                                    className="w-12 h-12 flex items-center justify-center hover:bg-stone-100 transition-colors"
                                  >
                                    <span className="text-xl">+</span>
                                  </button>
                                </div>
                                <div className="text-stone-600">
                                  Max: {selectedWorkshop.availableSpots} spots
                                  available
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">
                                Experience Level
                              </label>
                              <select
                                name="experienceLevel"
                                value={formData.experienceLevel}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-[#8E5022] focus:outline-none"
                              >
                                <option value="beginner">
                                  Beginner (First time)
                                </option>
                                <option value="intermediate">
                                  Intermediate (Some experience)
                                </option>
                                <option value="advanced">
                                  Advanced (Regular practice)
                                </option>
                              </select>
                            </div>
                          </motion.div>
                        )}

                        {registrationStep === 3 && (
                          <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6"
                          >
                            <h4 className="font-serif text-xl text-[#442D1C] mb-4">
                              Additional Information
                            </h4>
                            <div>
                              <label className="block text-sm font-medium text-stone-700 mb-2">
                                Special Requests
                              </label>
                              <textarea
                                name="specialRequests"
                                value={formData.specialRequests}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-[#8E5022] focus:outline-none"
                                placeholder="Any dietary requirements, accessibility needs, or special requests..."
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                name="newsletter"
                                checked={formData.newsletter}
                                onChange={handleInputChange}
                                id="newsletter"
                                className="w-5 h-5 rounded border-2 border-stone-300 checked:bg-[#8E5022] checked:border-[#8E5022]"
                              />
                              <label
                                htmlFor="newsletter"
                                className="text-sm text-stone-600"
                              >
                                Subscribe to our newsletter for workshop updates
                                and pottery tips
                              </label>
                            </div>
                          </motion.div>
                        )}

                        {/* Form Actions */}
                        <div className="flex justify-between mt-12 pt-6 border-t border-stone-200">
                          {registrationStep > 1 ? (
                            <button
                              type="button"
                              onClick={() =>
                                setRegistrationStep((prev) => prev - 1)
                              }
                              className="px-8 py-3 rounded-xl font-medium border-2 border-stone-300 text-stone-700 hover:border-[#8E5022] hover:text-[#8E5022] transition-colors"
                            >
                              Back
                            </button>
                          ) : (
                            <div />
                          )}
                          <button
                            type="submit"
                            className="px-8 py-3 rounded-xl font-medium bg-[#8E5022] text-white hover:bg-[#652810] transition-colors flex items-center gap-2"
                          >
                            {registrationStep === 3 ? (
                              <>
                                <Send className="w-5 h-5" />
                                Complete Registration
                              </>
                            ) : (
                              <>
                                Continue
                                <ArrowRight className="w-5 h-5" />
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-[#FDFBF7] to-[#EDD8B4]/30">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-5xl text-[#442D1C] mb-8">
              Ready to Get{" "}
              <span className="text-[#C85428]">Your Hands Dirty?</span>
            </h2>
            <p className="text-xl text-stone-600 mb-12 max-w-2xl mx-auto">
              Whether you're looking for a one-time experience or want to deepen
              your practice, we have something for everyone.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="bg-[#C85428] text-white px-12 py-5 rounded-full font-medium text-lg hover:shadow-2xl transition-all shadow-lg"
              >
                Browse All Workshops
              </button>
              <button className="bg-transparent border-2 border-[#8E5022] text-[#8E5022] px-12 py-5 rounded-full font-medium text-lg hover:bg-[#8E5022]/10 transition-all">
                Contact for Private Events
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Cart Slider */}
      <CartSlider />
    </main>
  );
}
