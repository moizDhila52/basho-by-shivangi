"use client";

import React, {
  useState,
  useCallback,
  memo,
  useRef,
  useEffect,
  Suspense,
} from "react";
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
  Loader2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import CartSlider from "@/components/CartSlider";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/components/AuthProvider";
import toast from "react-hot-toast";

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

// Fetch products function
async function fetchProducts(params = {}) {
  const {
    category = "all",
    sort = "featured",
    minPrice,
    maxPrice,
    search,
    material,
    features,
    page = 1,
    limit = 20,
  } = params;

  const queryParams = new URLSearchParams({
    category,
    sort,
    page: page.toString(),
    limit: limit.toString(),
    ...(search && { search }),
    ...(minPrice && { minPrice }),
    ...(maxPrice && { maxPrice }),
    ...(material && {
      material: Array.isArray(material) ? material.join(",") : material,
    }),
    ...(features && {
      features: Array.isArray(features) ? features.join(",") : features,
    }),
  });

  const response = await fetch(`/api/products?${queryParams}`);
  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }
  return response.json();
}

// Fetch categories function
async function fetchCategories() {
  const response = await fetch("/api/categories");
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

// Update API functions
// Update fetchWishlist
const fetchWishlist = async () => {
  try {
    const response = await fetch("/api/wishlist", {
      credentials: "include", // This sends cookies automatically
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.wishlist || [];
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return [];
  }
};

// Update addToWishlistAPI
const addToWishlistAPI = async (productId) => {
  try {
    const response = await fetch("/api/wishlist/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include", // This sends cookies automatically
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to add to wishlist",
      };
    }

    return data;
  } catch (error) {
    console.error("Error in addToWishlistAPI:", error);
    return { success: false, error: error.message || "Network error" };
  }
};

// Update removeFromWishlistAPI
const removeFromWishlistAPI = async (productId) => {
  try {
    const response = await fetch(
      `/api/wishlist/remove?productId=${productId}`,
      {
        method: "DELETE",
        credentials: "include", // This sends cookies automatically
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || "Failed to remove from wishlist",
      };
    }

    return data;
  } catch (error) {
    console.error("Error in removeFromWishlistAPI:", error);
    return { success: false, error: error.message || "Network error" };
  }
};

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
    isWishlistLoading,
    authLoading,
    isUpdating,
  }) {
    const quantityInCart =
      cartItems.find((item) => item.id === product.id)?.quantity || 0;
    const rating = product.averageRating || 0;
    const reviewCount = product._count?.Review || 0;
    const isInWishlist = wishlist.has(product.id);

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
            console.log("Wishlist button clicked!");
            console.log("isWishlistLoading:", isWishlistLoading);
            console.log(
              "Condition check - !isWishlistLoading:",
              !isWishlistLoading
            );
            console.log("authLoading:", authLoading);
            if (!isWishlistLoading) {
              console.log("✅ Calling onWishlistToggle");
              onWishlistToggle(product.id, product);
            } else {
              console.log("❌ NOT calling onWishlistToggle - loading is true");
            }
          }}
          disabled={isWishlistLoading || authLoading}
          className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWishlistLoading || authLoading ? (
            <Loader2 className="w-5 h-5 text-[#C85428] animate-spin" />
          ) : (
            <Heart
              className={`w-5 h-5 transition-colors ${
                isInWishlist
                  ? "fill-[#C85428] text-[#C85428]"
                  : "text-stone-400 hover:text-[#C85428]"
              }`}
            />
          )}
        </button>

        {/* Product Image */}
        <Link href={`/products/${product.slug}`}>
          <div className="relative h-80 overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50 cursor-pointer">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-100">
                <div className="w-20 h-20 rounded-full bg-stone-200 flex items-center justify-center">
                  <ShoppingBag className="w-10 h-10 text-stone-400" />
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </Link>

        {/* Product Info */}
        <div className="p-6">
          <Link href={`/products/${product.slug}`}>
            <div className="cursor-pointer">
              <span className="text-sm text-[#8E5022] font-medium uppercase tracking-wider">
                {product.Category?.name}
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
          {reviewCount > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(rating)
                        ? "fill-[#C85428] text-[#C85428]"
                        : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-stone-500">
                {rating.toFixed(1)} ({reviewCount})
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-baseline gap-2">
              <span className="font-serif text-3xl text-[#442D1C]">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-stone-400 line-through">
                    ${product.originalPrice.toFixed(2)}
                  </span>
                )}
            </div>
          </div>

          {/* Quick Features */}
          {product.features && product.features.length > 0 && (
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
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Link href={`/products/${product.slug}`} className="flex-1">
              <button className="w-full bg-transparent border-2 border-[#442D1C] text-[#442D1C] py-3 rounded-xl font-medium hover:bg-[#442D1C] hover:text-white transition-all text-center">
                View Details
              </button>
            </Link>

            {/* Cart Button */}
            {quantityInCart > 0 ? (
              <div className="flex-1">
                <div className="flex items-center justify-between bg-[#EDD8B4] rounded-xl p-1">
                  <button
                    onClick={() =>
                      onUpdateQuantity(product.id, quantityInCart - 1)
                    }
                    disabled={isUpdating}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#E8D0A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                    onClick={() => onAddToCart(product)}
                    disabled={isUpdating}
                    className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-[#E8D0A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4 text-[#442D1C]" />
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                disabled={!product.inStock || isUpdating}
                className={`flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                  product.inStock
                    ? "bg-[#8E5022] text-white hover:bg-[#652810]"
                    : "bg-stone-200 text-stone-400 cursor-not-allowed"
                } ${isUpdating ? "opacity-75" : ""}`}
              >
                <>
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  },
  (prevProps, nextProps) => {
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
      prevQuantity === nextQuantity &&
      prevProps.isWishlistLoading === nextProps.isWishlistLoading &&
      prevProps.isUpdating === nextProps.isUpdating
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

// Main Products Page Component
function ProductsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [wishlistLoading, setWishlistLoading] = useState(new Set());
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    price: [],
    material: [],
    features: [],
  });
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "featured");
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [wishlist, setWishlist] = useState(new Set());
  const { addToCart, updateQuantity, removeFromCart, cartItems, isUpdating } =
    useCart();

  // Prepare categories for display
  const displayCategories = [
    {
      slug: "all",
      name: "All Categories",
      productCount: categories.reduce(
        (sum, cat) => sum + (cat._count?.Product || 0),
        0
      ),
    },
    ...categories.map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      productCount: cat._count?.Product || 0,
    })),
  ];

  // Load wishlist from localStorage
  const loadWishlist = useCallback(async () => {
    if (user) {
      const wishlistData = await fetchWishlist();
      const wishlistSet = new Set(wishlistData.map((item) => item.productId));
      setWishlist(wishlistSet);
    } else {
      setWishlist(new Set());
    }
  }, [user]);

  // Fetch initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch categories
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);

        // Load wishlist from localStorage
        loadWishlist();
      } catch (err) {
        console.error("Error loading initial data:", err);
        setError("Failed to load data. Please try again.");
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, [user, loadWishlist]);

  // Fetch products when filters change
  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = {
          category: selectedCategory,
          sort: sortBy,
          search: searchQuery || undefined,
          page: 1,
          limit: 20,
        };

        // Add price filters
        if (selectedFilters.price.length > 0) {
          selectedFilters.price.forEach((priceRange) => {
            if (priceRange === "Under $100") {
              params.maxPrice = "100";
            } else if (priceRange === "$100 - $250") {
              params.minPrice = "100";
              params.maxPrice = "250";
            } else if (priceRange === "$250 - $500") {
              params.minPrice = "250";
              params.maxPrice = "500";
            } else if (priceRange === "Over $500") {
              params.minPrice = "500";
            }
          });
        }

        // Add material filters
        if (selectedFilters.material.length > 0) {
          params.material = selectedFilters.material;
        }

        // Add feature filters
        if (selectedFilters.features.length > 0) {
          params.features = selectedFilters.features;
        }

        const data = await fetchProducts(params);
        setProducts(data.products || []);
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Failed to load products. Please try again.");
        toast.error("Failed to load products");
      } finally {
        setProductsLoading(false);
      }
    };

    // Add debounce to search
    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, sortBy, searchQuery, selectedFilters]);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();

    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (sortBy !== "featured") params.set("sort", sortBy);
    if (searchQuery) params.set("search", searchQuery);

    // Update URL without page reload
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, sortBy, searchQuery, router]);

  // Toggle wishlist handler
  const toggleWishlistHandler = useCallback(
    async (productId, product) => {
      console.log("🔵 toggleWishlistHandler called with productId:", productId);
      console.log("🔵 authLoading:", authLoading);
      console.log("🔵 user:", user);
      // Check if auth is still loading
      if (authLoading) {
        toast.error("Please wait...");
        return;
      }

      // Check if user exists BEFORE calling any API
      if (!user) {
        toast.error("Please login to add to wishlist");
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
        return;
      }

      console.log("✅ User authenticated, proceeding with wishlist toggle");

      // Set loading state
      setWishlistLoading((prev) => new Set([...prev, productId]));

      try {
        const isInWishlist = wishlist.has(productId);
        console.log("🔵 Is product in wishlist?", isInWishlist);

        if (isInWishlist) {
          console.log("🔵 Removing from wishlist...");
          // Remove from wishlist
          const result = await removeFromWishlistAPI(productId);
          console.log("🔵 Remove result:", result);

          if (result.success) {
            setWishlist((prev) => {
              const newSet = new Set(prev);
              newSet.delete(productId);
              return newSet;
            });
            toast.success("Removed from wishlist");
          } else {
            // Don't show "Authentication required" since we already checked
            if (result.error && result.error !== "Authentication required") {
              toast.error(result.error);
            } else if (!result.error) {
              toast.error("Failed to remove from wishlist");
            }
          }
        } else {
          console.log("🔵 Adding to wishlist...");
          // Add to wishlist
          const result = await addToWishlistAPI(productId);
          console.log("🔵 Add result:", result);

          if (result.success) {
            setWishlist((prev) => new Set([...prev, productId]));
            toast.success("Added to wishlist");
          } else {
            // Don't show "Authentication required" since we already checked
            if (result.error && result.error !== "Authentication required") {
              toast.error(result.error);
            } else if (!result.error) {
              toast.error("Failed to add to wishlist");
            }
          }
        }
      } catch (err) {
        console.error("Error in toggleWishlistHandler:", err);
        // Don't show authentication errors since we handle login redirect above
        if (err.message !== "Authentication required") {
          toast.error(err.message || "Failed to update wishlist");
        }
      } finally {
        setWishlistLoading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [user, authLoading, router, wishlist]
  );

  // Add to cart handler
  const handleAddToCart = useCallback(
    (product) => {
      const cartProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || "/placeholder-image.jpg",
        inStock: product.inStock,
        category: product.Category?.name,
        quantity: 1,
      };

      addToCart(cartProduct);
    },
    [addToCart]
  );

  // Update quantity handler
  const handleUpdateQuantity = useCallback(
    (productId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(productId);
      } else {
        updateQuantity(productId, quantity);
      }
    },
    [updateQuantity, removeFromCart]
  );

  // Clear filters
  const clearFilters = useCallback(() => {
    setSelectedFilters({
      price: [],
      material: [],
      features: [],
    });
    setSelectedCategory("all");
    setSearchQuery("");
    setSortBy("featured");
    toast.success("Filters cleared");
  }, []);

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
  };

  const toggleFilter = (type, value) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter((v) => v !== value)
        : [...prev[type], value],
    }));
  };

  // Handle loading and error states
  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
          <p className="text-stone-600">Loading products...</p>
        </div>
      </main>
    );
  }

  if (error && !productsLoading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-[#C85428] mx-auto mb-4" />
          <h2 className="font-serif text-3xl text-[#442D1C] mb-2">Oops!</h2>
          <p className="text-stone-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-[#8E5022] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#652810] transition-colors"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

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
            {/* Category Filter */}
            <div className="flex-1 overflow-x-auto pt-2 pb-4">
              <div className="flex gap-2">
                {displayCategories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-6 py-3 rounded-full font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                      selectedCategory === category.slug
                        ? "bg-[#442D1C] text-white shadow-md"
                        : "bg-white text-stone-600 hover:bg-stone-100 shadow-sm"
                    }`}
                  >
                    {category.name}
                    {category.productCount > 0 && (
                      <span className="ml-2 text-xs opacity-75">
                        ({category.productCount})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-4">
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

          {/* Results Count & Loading State */}
          <div className="mb-8">
            {productsLoading ? (
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-[#8E5022] animate-spin" />
                <p className="text-stone-600">Loading products...</p>
              </div>
            ) : (
              <p className="text-stone-600">
                Showing{" "}
                <span className="font-medium text-[#442D1C]">
                  {products.length}
                </span>{" "}
                products
                {selectedCategory !== "all" &&
                  ` in ${
                    displayCategories.find((c) => c.slug === selectedCategory)
                      ?.name
                  }`}
                {searchQuery && ` for "${searchQuery}"`}
              </p>
            )}
          </div>

          {/* Product Grid */}
          {productsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden shadow-lg animate-pulse"
                >
                  <div className="h-80 bg-stone-200" />
                  <div className="p-6 space-y-4">
                    <div className="h-4 bg-stone-200 rounded w-1/4" />
                    <div className="h-6 bg-stone-200 rounded w-3/4" />
                    <div className="h-4 bg-stone-200 rounded w-full" />
                    <div className="h-4 bg-stone-200 rounded w-2/3" />
                    <div className="h-10 bg-stone-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  wishlist={wishlist}
                  cartItems={cartItems}
                  onWishlistToggle={toggleWishlistHandler}
                  onAddToCart={handleAddToCart}
                  onUpdateQuantity={handleUpdateQuantity}
                  isWishlistLoading={wishlistLoading.has(product.id)}
                  authLoading={authLoading}
                  isUpdating={isUpdating}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
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

// Main export with Suspense wrapper
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
            <p className="text-stone-600">Loading page...</p>
          </div>
        </main>
      }
    >
      <ProductsPageContent />
    </Suspense>
  );
}
