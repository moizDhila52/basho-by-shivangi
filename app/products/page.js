'use client';

import React, {
  useState,
  useCallback,
  memo,
  useRef,
  useEffect,
  Suspense,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import CartSlider from '@/components/CartSlider';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';
import NotifyButton from '@/components/NotifyButton';
import { useRealtimeProduct } from '@/hooks/useRealtimeProduct';

// --- Brand Colors from Palette ---
const COLORS = {
  dark: '#442D1C',
  brown: '#652810',
  clay: '#8E5022',
  terracotta: '#C85428',
  cream: '#EDD8B4',
  background: '#FDFBF7',
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

async function fetchProducts(params = {}) {
  const {
    category = 'all',
    sort = 'featured',
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
      material: Array.isArray(material) ? material.join(',') : material,
    }),
    ...(features && {
      features: Array.isArray(features) ? features.join(',') : features,
    }),
  });

  const response = await fetch(`/api/products?${queryParams}`);
  if (!response.ok) {
    throw new Error('Failed to fetch products');
  }
  return response.json();
}

async function fetchCategories() {
  const response = await fetch('/api/admin/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
}

const fetchWishlist = async () => {
  try {
    const response = await fetch('/api/wishlist', {
      credentials: 'include',
    });

    if (!response.ok) return [];
    const data = await response.json();
    return data.wishlist || [];
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
};

const addToWishlistAPI = async (productId) => {
  try {
    const response = await fetch('/api/wishlist/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ productId }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to add to wishlist',
      };
    }

    return data;
  } catch (error) {
    console.error('Error in addToWishlistAPI:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

const removeFromWishlistAPI = async (productId) => {
  try {
    const response = await fetch(
      `/api/wishlist/remove?productId=${productId}`,
      {
        method: 'DELETE',
        credentials: 'include',
      },
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Failed to remove from wishlist',
      };
    }

    return data;
  } catch (error) {
    console.error('Error in removeFromWishlistAPI:', error);
    return { success: false, error: error.message || 'Network error' };
  }
};

const RealtimeProductCard = ({ product, ...props }) => {
  const liveProduct = useRealtimeProduct(product);
  return <ProductCard product={liveProduct} {...props} />;
};

const SORT_OPTIONS = [
  {
    value: 'featured',
    label: 'Featured',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    value: 'newest',
    label: 'New Arrivals',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    value: 'price-low',
    label: 'Price: Low to High',
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    value: 'price-high',
    label: 'Price: High to Low',
    icon: <DollarSign className="w-4 h-4" />,
  },
  {
    value: 'bestseller',
    label: 'Bestsellers',
    icon: <TrendingUp className="w-4 h-4" />,
  },
];

const FILTERS = {
  price: ['Under ₹100', '₹100 - ₹250', '₹250 - ₹500', 'Over ₹500'],
  material: ['Stoneware', 'Porcelain', 'Raku', 'Unglazed Clay'],
  features: [
    'Dishwasher Safe',
    'Microwave Safe',
    'Oven Safe',
    'Hand Wash Only',
  ],
};

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
        whileHover={product.inStock ? { y: -8 } : {}}
        className={`group relative bg-white rounded-2xl md:rounded-3xl overflow-hidden transition-all duration-300 ${
          !product.inStock
            ? 'opacity-75 border-2 border-orange-100 shadow-none'
            : 'shadow-lg hover:shadow-2xl'
        }`}
      >
        <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 flex flex-col gap-1 md:gap-2">
          {product.isNew && (
            <span className="bg-[#C85428] text-white text-[10px] md:text-xs font-medium px-2 py-0.5 md:px-3 md:py-1 rounded-full text-center">
              New
            </span>
          )}
          {product.isBestseller && (
            <span className="bg-[#442D1C] text-white text-[10px] md:text-xs font-medium px-2 py-0.5 md:px-3 md:py-1 rounded-full text-center">
              Bestseller
            </span>
          )}
          {!product.inStock && (
            <span className="bg-stone-600 text-white text-[10px] md:text-xs font-medium px-2 py-0.5 md:px-3 md:py-1 rounded-full text-center">
              OOS
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isWishlistLoading) {
              onWishlistToggle(product.id, product);
            }
          }}
          disabled={isWishlistLoading || authLoading}
          className="absolute top-3 right-3 md:top-4 md:right-4 z-10 w-9 h-9 md:w-10 md:h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:shadow-lg transition-all hover:scale-110 disabled:opacity-50"
        >
          {isWishlistLoading || authLoading ? (
            <Loader2 className="w-4 h-4 md:w-5 md:h-5 text-[#C85428] animate-spin" />
          ) : (
            <Heart
              className={`w-4 h-4 md:w-5 md:h-5 transition-colors ${
                isInWishlist
                  ? 'fill-[#C85428] text-[#C85428]'
                  : 'text-stone-400 hover:text-[#C85428]'
              }`}
            />
          )}
        </button>

        <Link href={`/products/${product.slug}`}>
          <div className="relative h-64 md:h-80 overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50 cursor-pointer">
            {product.images?.[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-stone-100">
                <ShoppingBag className="w-10 h-10 text-stone-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        </Link>

        <div className="p-4 md:p-6">
          <Link href={`/products/${product.slug}`}>
            <div className="cursor-pointer">
              <span className="text-[10px] md:text-sm text-[#8E5022] font-medium uppercase tracking-wider">
                {product.Category?.name}
              </span>
              <h3 className="font-serif text-lg md:text-2xl text-[#442D1C] mt-1 mb-2 group-hover:text-[#C85428] transition-colors truncate">
                {product.name}
              </h3>
            </div>
          </Link>

          <p className="text-stone-600 text-xs md:text-sm mb-4 line-clamp-2">
            {product.description}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 md:w-4 md:h-4 ${
                    i < Math.floor(rating)
                      ? 'fill-[#C85428] text-[#C85428]'
                      : 'text-stone-300'
                  }`}
                />
              ))}
            </div>
            {reviewCount > 0 && (
              <span className="text-[10px] md:text-sm text-stone-500">
                {rating.toFixed(1)} ({reviewCount})
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mb-4 md:mb-6">
            <div className="flex items-baseline gap-1 md:gap-2">
              <span className="font-serif text-xl md:text-3xl text-[#442D1C]">
                ₹{product.price.toFixed(0)}
              </span>
              {product.originalPrice &&
                product.originalPrice > product.price && (
                  <span className="text-stone-400 line-through text-[10px] md:text-base">
                    ₹{product.originalPrice.toFixed(0)}
                  </span>
                )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
            <Link href={`/products/${product.slug}`} className="flex-1">
              <button className="w-full bg-transparent border-2 border-[#442D1C] text-[#442D1C] py-2 md:py-3 rounded-xl font-medium hover:bg-[#442D1C] hover:text-white transition-all text-xs md:text-base">
                Details
              </button>
            </Link>

            {quantityInCart > 0 ? (
              <div className="flex-1">
                <div className="flex items-center justify-between bg-[#EDD8B4] rounded-xl p-1">
                  <button
                    onClick={() => onUpdateQuantity(product.id, quantityInCart - 1)}
                    disabled={isUpdating}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg hover:bg-[#E8D0A0] transition-colors disabled:opacity-50"
                  >
                    <Minus className="w-3 h-3 md:w-4 md:h-4 text-[#442D1C]" />
                  </button>
                  <span className="font-medium text-[#442D1C] text-xs md:text-base">
                    {quantityInCart}
                  </span>
                  <button
                    onClick={() => onAddToCart(product)}
                    disabled={isUpdating}
                    className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-lg hover:bg-[#E8D0A0] transition-colors disabled:opacity-50"
                  >
                    <Plus className="w-3 h-3 md:w-4 md:h-4 text-[#442D1C]" />
                  </button>
                </div>
              </div>
            ) : !product.inStock ? (
              <div className="flex-1">
                <NotifyButton productId={product.id} stock={product.stock} />
              </div>
            ) : (
              <button
                onClick={() => onAddToCart(product)}
                disabled={isUpdating}
                className={`flex-1 py-2 md:py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 bg-[#8E5022] text-white hover:bg-[#652810] text-xs md:text-base ${
                  isUpdating ? 'opacity-75' : ''
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                Add
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
  },
);

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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full md:w-auto" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between bg-white border-2 border-stone-200 rounded-xl px-4 py-3 md:px-6 hover:border-[#8E5022] transition-colors w-full md:min-w-[220px]"
      >
        <div className="flex items-center gap-3">
          <span className="text-stone-600">{selectedOption.icon}</span>
          <span className="font-medium text-sm md:text-base">{selectedOption.label}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 md:w-5 md:h-5 text-stone-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
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
                  className={`flex items-center gap-3 w-full px-6 py-3 hover:bg-stone-50 transition-colors text-sm md:text-base ${
                    value === option.value
                      ? 'bg-[#FDFBF7] text-[#8E5022]'
                      : 'text-stone-600'
                  }`}
                >
                  <span className={value === option.value ? 'text-[#8E5022]' : 'text-stone-400'}>
                    {option.icon}
                  </span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
    searchParams.get('category') || 'all',
  );
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    price: [],
    material: [],
    features: [],
  });
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'featured');
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || '',
  );
  const [wishlist, setWishlist] = useState(new Set());
  const { addToCart, updateQuantity, removeFromCart, cartItems, isUpdating } =
    useCart();

  const displayCategories = [
    {
      slug: 'all',
      name: 'All',
      productCount: categories.reduce(
        (sum, cat) => sum + (cat._count?.Product || 0),
        0,
      ),
    },
    ...categories.map((cat) => ({
      slug: cat.slug,
      name: cat.name,
      productCount: cat._count?.Product || 0,
    })),
  ];

  const loadWishlist = useCallback(async () => {
    if (user) {
      const wishlistData = await fetchWishlist();
      const wishlistSet = new Set(wishlistData.map((item) => item.productId));
      setWishlist(wishlistSet);
    } else {
      setWishlist(new Set());
    }
  }, [user]);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);
        setError(null);
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
        loadWishlist();
      } catch (err) {
        console.error('Error loading initial data:', err);
        setError('Failed to load data.');
      } finally {
        setLoading(false);
      }
    }
    loadInitialData();
  }, [user, loadWishlist]);

  useEffect(() => {
    const loadProducts = async () => {
      setProductsLoading(true);
      setError(null);
      try {
        const params = {
          category: selectedCategory,
          sort: sortBy,
          search: searchQuery || undefined,
          page: 1,
          limit: 20,
        };

        if (selectedFilters.price.length > 0) {
          selectedFilters.price.forEach((priceRange) => {
            if (priceRange === 'Under ₹100') params.maxPrice = '100';
            else if (priceRange === '₹100 - ₹250') { params.minPrice = '100'; params.maxPrice = '250'; }
            else if (priceRange === '₹250 - ₹500') { params.minPrice = '250'; params.maxPrice = '500'; }
            else if (priceRange === 'Over ₹500') params.minPrice = '500';
          });
        }

        if (selectedFilters.material.length > 0) params.material = selectedFilters.material;
        if (selectedFilters.features.length > 0) params.features = selectedFilters.features;

        const data = await fetchProducts(params);
        const sortedProducts = (data.products || []).sort((a, b) => {
          return a.inStock === b.inStock ? 0 : a.inStock ? -1 : 1;
        });
        setProducts(sortedProducts);
      } catch (err) {
        console.error('Error loading products:', err);
        setError('Failed to load products.');
      } finally {
        setProductsLoading(false);
      }
    };

    const timeoutId = setTimeout(() => {
      loadProducts();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedCategory, sortBy, searchQuery, selectedFilters]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    if (sortBy !== 'featured') params.set('sort', sortBy);
    if (searchQuery) params.set('search', searchQuery);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [selectedCategory, sortBy, searchQuery, router]);

  const toggleWishlistHandler = useCallback(
    async (productId) => {
      if (authLoading) return;
      if (!user) {
        toast.error('Please login');
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/login?returnUrl=${encodeURIComponent(currentPath)}`);
        return;
      }
      setWishlistLoading((prev) => new Set([...prev, productId]));
      try {
        const isInWishlist = wishlist.has(productId);
        if (isInWishlist) {
          const result = await removeFromWishlistAPI(productId);
          if (result.success) {
            setWishlist((prev) => {
              const newSet = new Set(prev);
              newSet.delete(productId);
              return newSet;
            });
            toast.success('Removed');
          }
        } else {
          const result = await addToWishlistAPI(productId);
          if (result.success) {
            setWishlist((prev) => new Set([...prev, productId]));
            toast.success('Added');
          }
        }
      } catch (err) {
        toast.error('Error');
      } finally {
        setWishlistLoading((prev) => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
      }
    },
    [user, authLoading, router, wishlist],
  );

  const handleAddToCart = useCallback(
    (product) => {
      const cartProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        originalPrice: product.originalPrice,
        image: product.images?.[0] || '/placeholder-image.jpg',
        inStock: product.inStock,
        category: product.Category?.name,
        quantity: 1,
      };
      addToCart(cartProduct);
    },
    [addToCart],
  );

  const handleUpdateQuantity = useCallback(
    (productId, quantity) => {
      if (quantity <= 0) removeFromCart(productId);
      else updateQuantity(productId, quantity);
    },
    [updateQuantity, removeFromCart],
  );

  const clearFilters = useCallback(() => {
    setSelectedFilters({ price: [], material: [], features: [] });
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    toast.success('Cleared');
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#8E5022] animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-white to-[#EDD8B4]/20 pt-24 pb-12 md:pt-32 md:pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-[#8E5022]"
              style={{
                width: Math.random() * 80 + 20 + 'px',
                height: Math.random() * 80 + 20 + 'px',
                left: Math.random() * 100 + '%',
                top: Math.random() * 100 + '%',
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
            className="text-center mb-8 md:mb-12"
          >
            <motion.div variants={fadeInUp}>
              <span className="text-[#8E5022] uppercase tracking-[0.2em] text-xs md:sm font-medium mb-3 md:4 inline-block">
                Bashō Collections
              </span>
              <h1 className="font-serif text-3xl md:text-7xl text-[#442D1C] mb-4 md:6 leading-tight">
                Handcrafted <br />
                <span className="text-[#C85428]">Ceramics for Life</span> 
              </h1>
              <p className="text-base md:xl text-stone-600 max-w-2xl mx-auto px-4">
                Each piece tells a story—of earth transformed by fire, of moments captured in clay.
              </p>
            </motion.div>
          </motion.div>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="max-w-2xl mx-auto mb-8 md:mb-12 px-2"
          >
            <div className="relative">
              <Search className="absolute left-4 md:left-6 top-1/2 transform -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-stone-400" />
              <input
                type="text"
                placeholder="Search ceramics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 md:pl-14 pr-10 py-3 md:py-4 bg-white rounded-xl md:rounded-2xl border-2 border-stone-200 focus:border-[#8E5022] focus:outline-none shadow-lg text-sm md:text-base"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center"
                >
                  <X className="w-3 h-3 text-stone-500" />
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Custom Order Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-4 flex justify-center"
        >
          <Link href="/custom-order">
            <button className="bg-gradient-to-r from-[#8E5022] to-[#C85428] text-white px-6 py-3 md:px-8 md:py-4 rounded-xl md:rounded-2xl font-medium hover:scale-105 transition-all flex items-center gap-2 md:gap-3 text-sm md:text-base shadow-lg">
              <Sparkles className="w-4 h-4" />
              <span>Custom Order</span>
            </button>
          </Link>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="pb-20 md:pb-32 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Filters & Controls */}
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6 mb-8 md:mb-12 pt-4 md:pt-8">
            {/* Category Filter - Scrollable on mobile */}
            <div className="flex-1 overflow-x-auto no-scrollbar pt-2 pb-2">
              <div className="flex gap-2 min-w-max md:min-w-0">
                {displayCategories.map((category) => (
                  <button
                    key={category.slug}
                    onClick={() => setSelectedCategory(category.slug)}
                    className={`px-4 py-2 md:px-6 md:py-3 rounded-full font-medium whitespace-nowrap transition-all text-xs md:text-sm ${
                      selectedCategory === category.slug
                        ? 'bg-[#442D1C] text-white shadow-md'
                        : 'bg-white text-stone-600 border border-stone-100 shadow-sm'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort & Filter Buttons */}
            <div className="flex items-center gap-2 md:gap-4">
              <div className="flex-1 md:flex-none">
                <CustomDropdown
                  value={sortBy}
                  options={SORT_OPTIONS}
                  onChange={setSortBy}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center justify-center gap-2 bg-white border-2 border-stone-200 rounded-xl px-4 py-3 md:px-6 hover:border-[#8E5022] transition-colors flex-1 md:flex-none"
              >
                <Filter className="w-4 h-4 md:w-5 md:h-5" />
                <span className="text-sm md:text-base font-medium">Filters</span>
                {Object.values(selectedFilters).flat().length > 0 && (
                  <span className="bg-[#C85428] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
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
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-xl">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-serif text-xl md:text-2xl text-[#442D1C]">Filters</h3>
                    <button onClick={clearFilters} className="text-xs md:text-sm text-[#C85428] font-medium">Clear All</button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {Object.entries(FILTERS).map(([key, options]) => (
                      <div key={key}>
                        <h4 className="font-medium text-stone-700 mb-3 capitalize text-sm md:text-base">{key}</h4>
                        <div className="space-y-2">
                          {options.map((opt) => (
                            <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                              <input
                                type="checkbox"
                                checked={selectedFilters[key].includes(opt)}
                                onChange={() => toggleFilter(key, opt)}
                                className="hidden"
                              />
                              <div className={`w-4 h-4 md:w-5 md:h-5 rounded border-2 transition-all flex items-center justify-center ${
                                selectedFilters[key].includes(opt) ? 'bg-[#8E5022] border-[#8E5022]' : 'border-stone-300'
                              }`}>
                                {selectedFilters[key].includes(opt) && <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-white" />}
                              </div>
                              <span className="text-stone-600 text-xs md:text-sm group-hover:text-[#8E5022]">{opt}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results Count */}
          {!productsLoading && (
            <div className="mb-6 md:mb-8 text-center md:text-left px-2">
              <p className="text-stone-600 text-xs md:text-sm">
                Showing <span className="font-bold text-[#442D1C]">{products.length}</span> handcrafted pieces
              </p>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {productsLoading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl md:rounded-3xl h-[450px] animate-pulse shadow-sm" />
              ))
            ) : products.length > 0 ? (
              products.map((product) => (
                <RealtimeProductCard
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
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <Search className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <h3 className="font-serif text-2xl text-[#442D1C] mb-2">Nothing found</h3>
                <p className="text-stone-500 mb-6">Adjust your search or filters to see more results.</p>
                <button onClick={clearFilters} className="bg-[#8E5022] text-white px-8 py-3 rounded-xl">Clear All</button>
              </div>
            )}
          </div>
        </div>
      </section>

      <CartSlider />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center"><Loader2 className="animate-spin text-[#8E5022]" /></div>}>
      <ProductsPageContent />
    </Suspense>
  );
}