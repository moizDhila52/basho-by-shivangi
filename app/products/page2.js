"use client";

import React, { useState, useCallback, memo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Search,
  Heart,
  ShoppingBag,
  Star,
  ChevronDown,
  X,
  Plus,
  Minus,
  Sparkles,
  TrendingUp,
  Clock,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import CartSlider from "@/components/CartSlider";
import { useCart } from "@/context/CartContext";

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

// --- Sample Products Data ---
const PRODUCTS = [
  {
    id: 1,
    slug: "kintsugi-tea-bowl",
    name: "Kintsugi Tea Bowl",
    category: "Tea Ware",
    price: 245,
    originalPrice: 295,
    description: "Hand-thrown matcha bowl with gold repair accents",
    material: "Stoneware with kintsugi-inspired glaze",
    dimensions: "Ø12cm × H8cm",
    color: "Terracotta with gold",
    inStock: true,
    isNew: true,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 42,
    images: [
      "/showcase/products/1.png",
      "/showcase/products/2.png",
      "/showcase/products/3.png",
    ],
    features: ["Microwave Safe", "Dishwasher Safe", "Food Safe"],
    care: "Hand wash recommended to preserve gold accents",
    leadTime: "Ships in 3-5 days",
  },
  {
    id: 2,
    slug: "wabi-sabi-dinner-set",
    name: "Wabi-sabi Dinner Set",
    category: "Dinnerware",
    price: 420,
    originalPrice: 480,
    description: "Set of 6 plates & bowls celebrating natural imperfections",
    material: "High-fire stoneware",
    dimensions: "Plate: Ø25cm, Bowl: Ø18cm × H7cm",
    color: "Charcoal & Cream",
    inStock: true,
    isNew: false,
    isBestseller: true,
    rating: 4.8,
    reviewCount: 67,
    images: ["/showcase/products/2.png", "/showcase/products/1.png"],
    features: ["Oven Safe", "Freezer Safe", "Stackable"],
    care: "Dishwasher safe, but air drying preserves glaze",
    leadTime: "Ships in 5-7 days",
  },
  {
    id: 3,
    slug: "mountain-vase",
    name: "Mountain Vase",
    category: "Home Decor",
    price: 180,
    originalPrice: null,
    description: "Sculptural vase inspired by Japanese mountains",
    material: "Unglazed stoneware",
    dimensions: "H35cm × W20cm × D15cm",
    color: "Natural Clay",
    inStock: true,
    isNew: true,
    isBestseller: false,
    rating: 4.7,
    reviewCount: 23,
    images: ["/showcase/products/3.png"],
    features: ["Water Tight", "UV Resistant", "Indoor/Outdoor"],
    care: "Wipe clean with damp cloth",
    leadTime: "Ships in 7-10 days",
  },
  {
    id: 4,
    slug: "zen-sake-set",
    name: "Zen Sake Set",
    category: "Drinkware",
    price: 165,
    originalPrice: 195,
    description: "2 cups & carafe for traditional sake service",
    material: "Porcelain with ash glaze",
    dimensions: "Carafe: H12cm, Cups: Ø6cm",
    color: "Celadon Green",
    inStock: false,
    isNew: false,
    isBestseller: true,
    rating: 4.9,
    reviewCount: 38,
    images: ["/showcase/products/1.png"],
    features: ["Food Safe", "Delicate Hand Wash", "Heat Resistant"],
    care: "Hand wash with mild detergent",
    leadTime: "Restocking in 2 weeks",
  },
  {
    id: 5,
    slug: "raku-incense-holder",
    name: "Raku Incense Holder",
    category: "Ritual Objects",
    price: 85,
    originalPrice: null,
    description: "Hand-fired raku ware for meditation rituals",
    material: "Raku pottery with crackle glaze",
    dimensions: "H5cm × W8cm × D8cm",
    color: "Metallic Copper & Black",
    inStock: true,
    isNew: true,
    isBestseller: false,
    rating: 4.6,
    reviewCount: 19,
    images: ["/showcase/products/2.png"],
    features: ["Handmade", "Unique Patterns", "Smoke Resistant"],
    care: "Wipe with dry cloth only",
    leadTime: "Ships in 1-2 days",
  },
  {
    id: 6,
    slug: "bamboo-sushi-plates",
    name: "Bamboo Sushi Plates",
    category: "Dinnerware",
    price: 320,
    originalPrice: 360,
    description: "Set of 4 oval plates with bamboo-inspired texture",
    material: "Stoneware with matte glaze",
    dimensions: "25cm × 18cm × H3cm",
    color: "Bamboo Green & White",
    inStock: true,
    isNew: false,
    isBestseller: true,
    rating: 4.8,
    reviewCount: 51,
    images: ["/showcase/products/3.png"],
    features: ["Microwave Safe", "Dishwasher Safe", "Stackable"],
    care: "Dishwasher safe up to 60°C",
    leadTime: "Ships in 4-6 days",
  },
];

const CATEGORIES = [
  "All Categories",
  "Tea Ware",
  "Dinnerware",
  "Drinkware",
  "Home Decor",
  "Ritual Objects",
  "Seasonal",
];

const SORT_OPTIONS = [
  {
    value: "featured",
    label: "Featured",
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    value: "newest",
    label: "New Arrivals",
    icon: <Clock className="w-4 h-4" />,
  },
  {
    value: "price-low",
    label: "Price: Low to High",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    value: "price-high",
    label: "Price: High to Low",
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    value: "rating",
    label: "Highest Rated",
    icon: <Star className="w-4 h-4" />,
  },
  {
    value: "bestseller",
    label: "Bestsellers",
    icon: <TrendingUp className="w-4 h-4" />,
  },
];

const FILTERS = {
  price: ["Under $100", "$100 - $250", "$250 - $500", "Over $500"],
  material: ["Stoneware", "Porcelain", "Raku", "Unglazed Clay"],
  features: [
    "Dishwasher Safe",
    "Microwave Safe",
    "Oven Safe",
    "Hand Wash Only",
    "New Arrival",
    "Bestseller",
  ],
};

// Memoized Product Card Component
const ProductCard = memo(
  function ProductCard({
    product,
    onWishlistToggle,
    wishlist,
    cartItems,
    onAddToCart,
    onUpdateQuantity,
  }) {
    const quantityInCart =
      cartItems.find((item) => item.id === product.id)?.quantity || 0;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        whileHover={{ y: -8 }}
        className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
      >
        {/* Badges */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {product.isNew && (
            <span className="bg-[#C85428] text-white text-xs font-medium px-3 py-1 rounded-full">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-[#442D1C] text-white text-xs font-medium px-3 py-1 rounded-full">
              Bestseller
            </span>
          )}
          {!product.inStock && (
            <span className="bg-stone-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onWishlistToggle(product.id);
          }}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${
              wishlist.has(product.id)
                ? "fill-[#C85428] text-[#C85428]"
                : "text-stone-400"
            }`}
          />
        </button>

        {/* Product Image */}
        <Link href={`/products/${product.slug}`}>
          <div className="relative h-80 overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50 cursor-pointer">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-6">
          <Link href={`/products/${product.slug}`}>
            <div className="cursor-pointer">
              <span className="text-sm text-[#8E5022] font-medium uppercase tracking-wider">
                {product.category}
              </span>
              <h3 className="font-serif text-2xl text-[#442D1C] mt-1 mb-2 group-hover:text-[#C85428] transition-colors">
                {product.name}
              </h3>
            </div>
          </Link>

          <p className="text-stone-600 text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(product.rating)
                      ? "fill-[#C85428] text-[#C85428]"
                      : "text-stone-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-stone-500">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          {/* Price */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-[#442D1C]">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-stone-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
          </div>

          {/* Quick Features */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {product.features.slice(0, 2).map((feature, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1 text-xs text-stone-600"
              >
                <div className="w-2 h-2 rounded-full bg-[#8E5022]" />
                {feature}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link href={`/products/${product.slug}`} className="flex-1">
              <button className="w-full bg-transparent border-2 border-[#442D1C] text-[#442D1C] py-3 rounded-xl font-medium hover:bg-[#442D1C] hover:text-white transition-all text-center">
                View Details
              </button>
            </Link>

            {/* Cart Button - Changes based on quantity in cart */}
            {quantityInCart > 0 ? (
              <div className="flex-1">
                <div className="flex items-center justify-between bg-[#EDD8B4] rounded-xl p-1">
                  <button
                    onClick={() =>
                      onUpdateQuantity(product.id, quantityInCart - 1)
                    }
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#E8D0A0] transition-colors"
                  >
                    <Minus className="w-4 h-4 text-[#442D1C]" />
                  </button>

                  <div className="flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[#442D1C]" />
                    <span className="font-medium text-[#442D1C]">
                      {quantityInCart}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddToCart({ ...product, quantity: 1 })}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#E8D0A0] transition-colors"
                  >
                    <Plus className="w-4 h-4 text-[#442D1C]" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart({ ...product, quantity: 1 })}
                disabled={!product.inStock}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  product.inStock
                    ? "bg-[#8E5022] text-white hover:bg-[#652810]"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function to prevent unnecessary re-renders
    const prevWishlisted = prevProps.wishlist.has(prevProps.product.id);
    const nextWishlisted = nextProps.wishlist.has(nextProps.product.id);
    const prevQuantity =
      prevProps.cartItems.find((item) => item.id === prevProps.product.id)
        ?.quantity || 0;
    const nextQuantity =
      nextProps.cartItems.find((item) => item.id === nextProps.product.id)
        ?.quantity || 0;

    return (
      prevProps.product.id === nextProps.product.id &&
      prevWishlisted === nextWishlisted &&
      prevQuantity === nextQuantity
    );
  }
);

// Custom Dropdown Component
const CustomDropdown = ({ value, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption =
    options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-white border-2 border-stone-200 rounded-xl px-6 py-3 hover:border-[#8E5022] transition-colors w-full md:w-auto min-w-[220px]"
      >
        <div className="flex items-center gap-3">
          <span className="text-stone-600">{selectedOption.icon}</span>
          <span className="font-medium">{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-stone-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-stone-200 z-40 overflow-hidden"
          >
            <div className="py-2">
              {options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex items-center gap-3 w-full px-6 py-3 hover:bg-stone-50 transition-colors ${
                    value === option.value
                      ? "bg-[#FDFBF7] text-[#8E5022]"
                      : "text-stone-600"
                  }`}
                >
                  <span
                    className={`${
                      value === option.value
                        ? "text-[#8E5022]"
                        : "text-stone-400"
                    }`}
                  >
                    {option.icon}
                  </span>
                  <span className="font-medium">{option.label}</span>
                  {value === option.value && (
                    <div className="ml-auto w-2 h-2 rounded-full bg-[#8E5022]" />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    price: [],
    material: [],
    features: [],
  });
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState(new Set());
  const { addToCart, updateQuantity, cartItems } = useCart();

  // Filter products based on selections
  const filteredProducts = PRODUCTS.filter((product) => {
    // Category filter
    if (
      selectedCategory !== "All Categories" &&
      product.category !== selectedCategory
    ) {
      return false;
    }

    // Search filter
    if (
      searchQuery &&
      !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !product.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }

    // Price filter
    if (selectedFilters.price.length > 0) {
      const priceInRange = selectedFilters.price.some((range) => {
        if (range === "Under $100") return product.price < 100;
        if (range === "$100 - $250")
          return product.price >= 100 && product.price <= 250;
        if (range === "$250 - $500")
          return product.price >= 250 && product.price <= 500;
        if (range === "Over $500") return product.price > 500;
        return true;
      });
      if (!priceInRange) return false;
    }

    // Material filter
    if (selectedFilters.material.length > 0) {
      if (
        !selectedFilters.material.some((material) =>
          product.material.toLowerCase().includes(material.toLowerCase())
        )
      ) {
        return false;
      }
    }

    // Features filter
    if (selectedFilters.features.length > 0) {
      const hasFeatures = selectedFilters.features.every((feature) => {
        if (feature === "New Arrival") return product.isNew;
        if (feature === "Bestseller") return product.isBestseller;
        return product.features.includes(feature);
      });
      if (!hasFeatures) return false;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "rating":
        return b.rating - a.rating;
      case "newest":
        return b.isNew - a.isNew;
      case "bestseller":
        return b.isBestseller - a.isBestseller;
      default: // featured
        return b.isBestseller - a.isBestseller;
    }
  });

  const toggleFilter = (type, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  const clearFilters = useCallback(() => {
    setSelectedFilters({
      price: [],
      material: [],
      features: [],
    });
  }, []);

  const toggleWishlist = useCallback((productId) => {
    setWishlist((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  }, []);

  const handleAddToCart = useCallback(
    (product) => {
      addToCart(product);
    },
    [addToCart]
  );

  const handleUpdateQuantity = useCallback(
    (productId, quantity) => {
      updateQuantity(productId, quantity);
    },
    [updateQuantity]
  );

  const clearSearch = () => {
    setSearchQuery("");
  };

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
                Bashō Collections
              </span>
              <h1 className="font-serif text-5xl md:text-7xl text-[#442D1C] mb-6 leading-tight">
                Handcrafted <br />
                <span className="text-[#C85428]">Ceramics</span> for Life
              </h1>
              <p className="text-xl text-stone-600 max-w-2xl mx-auto">
                Each piece tells a story—of earth transformed by fire, of
                moments captured in clay.
              </p>
            </motion.div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search for tea bowls, dinner sets, vases..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-12 py-4 bg-white rounded-2xl border-2 border-stone-200 focus:border-[#8E5022] focus:outline-none shadow-lg"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                >
                  <X className="w-4 h-4 text-stone-500" />
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Filters & Controls */}
          <div className="flex flex-col lg:flex-row gap-6 mb-12 pt-8">
            {" "}
            {/* Added pt-8 for top padding */}
            {/* Category Filter */}
            <div className="flex-1 overflow-x-auto pt-2 pb-4">
              {" "}
              {/* Added padding for better spacing */}
              <div className="flex gap-2">
                {CATEGORIES.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedCategory === category
                        ? "bg-[#442D1C] text-white shadow-md"
                        : "bg-white text-stone-600 hover:bg-stone-100 shadow-sm"
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-4">
              {/* Custom Dropdown */}
              <CustomDropdown
                value={sortBy}
                options={SORT_OPTIONS}
                onChange={setSortBy}
              />

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white border-2 border-stone-200 rounded-xl px-6 py-3 hover:border-[#8E5022] transition-colors"
              >
                <Filter className="w-5 h-5" />
                Filters
                {Object.values(selectedFilters).flat().length > 0 && (
                  <span className="bg-[#C85428] text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                    {Object.values(selectedFilters).flat().length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-white rounded-3xl p-8 shadow-xl">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="font-serif text-2xl text-[#442D1C]">
                      Filters
                    </h3>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={clearFilters}
                        className="text-sm text-stone-500 hover:text-[#C85428] transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={() => setShowFilters(false)}
                        className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {/* Price Filter */}
                    <div>
                      <h4 className="font-medium text-stone-700 mb-4">Price</h4>
                      <div className="space-y-2">
                        {FILTERS.price.map((range) => (
                          <label
                            key={range}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.price.includes(range)}
                              onChange={() => toggleFilter("price", range)}
                              className="hidden"
                            />
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                selectedFilters.price.includes(range)
                                  ? "bg-[#8E5022] border-[#8E5022]"
                                  : "border-stone-300"
                              }`}
                            >
                              {selectedFilters.price.includes(range) && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="text-stone-600">{range}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Material Filter */}
                    <div>
                      <h4 className="font-medium text-stone-700 mb-4">
                        Material
                      </h4>
                      <div className="space-y-2">
                        {FILTERS.material.map((material) => (
                          <label
                            key={material}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.material.includes(
                                material
                              )}
                              onChange={() =>
                                toggleFilter("material", material)
                              }
                              className="hidden"
                            />
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                selectedFilters.material.includes(material)
                                  ? "bg-[#8E5022] border-[#8E5022]"
                                  : "border-stone-300"
                              }`}
                            >
                              {selectedFilters.material.includes(material) && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="text-stone-600">{material}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Features Filter */}
                    <div>
                      <h4 className="font-medium text-stone-700 mb-4">
                        Features
                      </h4>
                      <div className="space-y-2">
                        {FILTERS.features.map((feature) => (
                          <label
                            key={feature}
                            className="flex items-center gap-3 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.features.includes(
                                feature
                              )}
                              onChange={() => toggleFilter("features", feature)}
                              className="hidden"
                            />
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                                selectedFilters.features.includes(feature)
                                  ? "bg-[#8E5022] border-[#8E5022]"
                                  : "border-stone-300"
                              }`}
                            >
                              {selectedFilters.features.includes(feature) && (
                                <div className="w-2 h-2 rounded-full bg-white" />
                              )}
                            </div>
                            <span className="text-stone-600">{feature}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          <div className="mb-8">
            <p className="text-stone-600">
              Showing{" "}
              <span className="font-medium text-[#442D1C]">
                {sortedProducts.length}
              </span>{" "}
              products
              {selectedCategory !== "All Categories" &&
                ` in ${selectedCategory}`}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                wishlist={wishlist}
                cartItems={cartItems}
                onWishlistToggle={toggleWishlist}
                onAddToCart={handleAddToCart}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>

          {/* Empty State */}
          {sortedProducts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-stone-100 flex items-center justify-center">
                <Search className="w-12 h-12 text-stone-400" />
              </div>
              <h3 className="font-serif text-3xl text-[#442D1C] mb-4">
                No products found
              </h3>
              <p className="text-stone-600 mb-8 max-w-md mx-auto">
                Try adjusting your filters or search term to find what you're
                looking for.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={clearFilters}
                  className="bg-[#8E5022] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
                >
                  Clear All Filters
                </button>
                <button
                  onClick={clearSearch}
                  className="bg-transparent border-2 border-[#8E5022] text-[#8E5022] px-8 py-3 rounded-xl font-medium hover:bg-[#8E5022]/10 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Cart Slider */}
      <CartSlider />
    </main>
  );
}
