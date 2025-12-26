"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Heart,
  ShoppingBag,
  Star,
  Check,
  Truck,
  Shield,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Mail,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";
import CartSlider from "@/components/CartSlider";
import { useCart } from "@/context/CartContext";

// Product Data - In real app, fetch from API based on slug
const PRODUCT_DATA = {
  id: 1,
  slug: "kintsugi-tea-bowl",
  name: "Kintsugi Tea Bowl",
  category: "Tea Ware",
  price: 245,
  originalPrice: 295,
  description:
    "Hand-thrown matcha bowl with gold repair accents inspired by the Japanese art of kintsugi, where breaks are repaired with gold, celebrating imperfections as part of the object's history.",
  material: "Stoneware with kintsugi-inspired glaze",
  dimensions: "Ø12cm × H8cm",
  color: "Terracotta with gold accents",
  inStock: true,
  isNew: true,
  isBestseller: true,
  rating: 4.9,
  reviewCount: 42,
  images: [
    "/showcase/products/1.png",
    "/showcase/products/2.png",
    "/showcase/products/3.png",
    "/showcase/products/1.png",
  ],
  features: [
    "Microwave Safe",
    "Dishwasher Safe",
    "Food Safe Glaze",
    "Hand-thrown on Potter's Wheel",
    "Lead-free & Non-toxic",
    "Oven Safe up to 250°C",
  ],
  care: "Hand wash recommended to preserve gold accents. Use mild detergent and soft cloth. Avoid abrasive cleaners.",
  leadTime: "Ships in 3-5 business days",
  shipping: "Free worldwide shipping on orders over $200",
  returnPolicy: "30-day return policy",
  details:
    "Each bowl is unique, featuring natural variations in the glaze and gold repair lines. The terracotta clay body provides excellent heat retention, perfect for traditional tea ceremonies.",
  artist: "Crafted by Master Potter Shivangi",
  year: 2024,
  origin: "Studio in Kyoto, Japan",
};

const RELATED_PRODUCTS = [
  {
    id: 2,
    slug: "wabi-sabi-dinner-set",
    name: "Wabi-sabi Dinner Set",
    category: "Dinnerware",
    price: 420,
    image: "/showcase/products/2.png",
  },
  {
    id: 3,
    slug: "mountain-vase",
    name: "Mountain Vase",
    category: "Home Decor",
    price: 180,
    image: "/showcase/products/3.png",
  },
  {
    id: 5,
    slug: "raku-incense-holder",
    name: "Raku Incense Holder",
    category: "Ritual Objects",
    price: 85,
    image: "/showcase/products/2.png",
  },
];

export default function ProductDetailPage({ params }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const { addToCart, updateQuantity, getItemQuantity } = useCart();

  const product = PRODUCT_DATA;
  const quantityInCart = getItemQuantity(product.id);

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setSelectedImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  const addToCartHandler = () => {
    if (quantityInCart > 0) {
      updateQuantity(product.id, quantityInCart + quantity);
    } else {
      addToCart({
        ...product,
        quantity,
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-stone-800 font-sans">
      {/* Back Button */}
      <div className="fixed top-6 left-6 z-30">
        <Link href="/products">
          <motion.button
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Products</span>
          </motion.button>
        </Link>
      </div>

      {/* Product Content */}
      <div className="max-w-7xl mx-auto px-4 py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left Column - Images */}
          <div className="relative">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative h-[600px] rounded-3xl overflow-hidden bg-gradient-to-b from-stone-100 to-stone-50"
            >
              <div className="w-full h-full relative">
                <img
                  src={product.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevImage}
                className="absolute left-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-6 top-1/2 transform -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Badges */}
              <div className="absolute top-6 right-6 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-[#C85428] text-white text-sm font-medium px-4 py-2 rounded-full">
                    New Arrival
                  </span>
                )}
                {product.isBestseller && (
                  <span className="bg-[#442D1C] text-white text-sm font-medium px-4 py-2 rounded-full">
                    Bestseller
                  </span>
                )}
              </div>
            </motion.div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-4 mt-6 overflow-x-auto p-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden transition-all ${
                    selectedImage === index
                      ? "ring-4 ring-[#8E5022] ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column - Details */}
          <div>
            {/* Category & Breadcrumb */}
            <div className="mb-6">
              <span className="text-[#8E5022] font-medium uppercase tracking-wider">
                {product.category}
              </span>
              <div className="flex items-center gap-2 text-sm text-stone-500 mt-2">
                <Link
                  href="/products"
                  className="hover:text-[#8E5022] transition-colors"
                >
                  Products
                </Link>
                <span>/</span>
                <Link
                  href={`/products?category=${product.category.toLowerCase()}`}
                  className="hover:text-[#8E5022] transition-colors"
                >
                  {product.category}
                </Link>
                <span>/</span>
                <span className="text-stone-800">{product.name}</span>
              </div>
            </div>

            {/* Product Name */}
            <h1 className="font-serif text-5xl md:text-6xl text-[#442D1C] mb-6 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? "fill-[#C85428] text-[#C85428]"
                        : "text-stone-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-stone-600">
                {product.rating} ({product.reviewCount} reviews)
              </span>
              <span className="text-stone-500">•</span>
              <span
                className={`font-medium ${
                  product.inStock ? "text-green-600" : "text-red-600"
                }`}
              >
                {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Description */}
            <p className="text-stone-600 text-lg mb-8 leading-relaxed">
              {product.description}
            </p>
            <p className="text-stone-600 mb-8">{product.details}</p>

            {/* Price */}
            <div className="mb-8 p-8 bg-gradient-to-r from-[#FDFBF7] to-[#EDD8B4]/20 rounded-3xl">
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-serif text-6xl text-[#442D1C]">
                  ${product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-2xl text-stone-400 line-through">
                    ${product.originalPrice}
                  </span>
                )}
                {product.originalPrice && (
                  <span className="bg-[#C85428] text-white text-sm font-medium px-4 py-1.5 rounded-full">
                    Save ${product.originalPrice - product.price}
                  </span>
                )}
              </div>
              <p className="text-stone-600 flex items-center gap-2">
                <Truck className="w-5 h-5" />
                {product.shipping}
              </p>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              <div className="space-y-2">
                <div className="text-sm text-stone-500">Material</div>
                <div className="font-medium text-lg">{product.material}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-stone-500">Dimensions</div>
                <div className="font-medium text-lg">{product.dimensions}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-stone-500">Color</div>
                <div className="font-medium text-lg">{product.color}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm text-stone-500">Artist</div>
                <div className="font-medium text-lg">{product.artist}</div>
              </div>
            </div>

            {/* Quantity Selector - Shows different UI if item is already in cart */}
            <div className="mb-8">
              <div className="text-sm text-stone-500 mb-3">Quantity</div>
              {quantityInCart > 0 ? (
                <div className="flex items-center gap-6">
                  <div className="flex items-center border-2 border-[#EDD8B4] rounded-2xl overflow-hidden bg-[#EDD8B4]/20">
                    <button
                      onClick={() =>
                        updateQuantity(product.id, quantityInCart - 1)
                      }
                      className="w-12 h-12 flex items-center justify-center hover:bg-[#EDD8B4]/40 transition-colors"
                    >
                      <Minus className="w-4 h-4 text-[#442D1C]" />
                    </button>
                    <div className="w-12 h-12 flex flex-col items-center justify-center">
                      <div className="flex items-center gap-1">
                        <ShoppingBag className="w-4 h-4 text-[#8E5022]" />
                        <span className="font-medium text-lg">
                          {quantityInCart}
                        </span>
                      </div>
                      <div className="text-xs text-stone-500">in cart</div>
                    </div>
                    <button
                      onClick={() =>
                        updateQuantity(product.id, quantityInCart + 1)
                      }
                      className="w-12 h-12 flex items-center justify-center hover:bg-[#EDD8B4]/40 transition-colors"
                    >
                      <Plus className="w-4 h-4 text-[#442D1C]" />
                    </button>
                  </div>
                  <div className="text-stone-500">{product.leadTime}</div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="flex items-center border-2 border-stone-200 rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 flex items-center justify-center hover:bg-stone-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 h-12 flex items-center justify-center font-medium text-lg">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-12 h-12 flex items-center justify-center hover:bg-stone-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-stone-500">{product.leadTime}</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              {quantityInCart > 0 ? (
                <>
                  <button
                    onClick={() =>
                      updateQuantity(product.id, quantityInCart + quantity)
                    }
                    className="flex-1 py-5 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 bg-[#8E5022] text-white hover:bg-[#652810]"
                  >
                    <Plus className="w-6 h-6" />
                    Add {quantity} More
                  </button>
                  <Link href="/cart" className="flex-1">
                    <button className="w-full bg-transparent border-2 border-[#8E5022] text-[#8E5022] py-5 rounded-2xl font-medium text-lg hover:bg-[#8E5022]/10 transition-all flex items-center justify-center gap-3">
                      <ShoppingBag className="w-6 h-6" />
                      View Cart ({quantityInCart})
                    </button>
                  </Link>
                </>
              ) : (
                <button
                  onClick={addToCartHandler}
                  disabled={!product.inStock}
                  className={`flex-1 py-5 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 ${
                    product.inStock
                      ? "bg-[#8E5022] text-white hover:bg-[#652810]"
                      : "bg-stone-200 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  <ShoppingBag className="w-6 h-6" />
                  Add to Cart
                </button>
              )}
              <button
                onClick={() => setWishlisted(!wishlisted)}
                className={`flex-1 py-5 rounded-2xl font-medium text-lg transition-all flex items-center justify-center gap-3 ${
                  wishlisted
                    ? "bg-[#FDFBF7] border-2 border-[#C85428] text-[#C85428]"
                    : "bg-[#FDFBF7] border-2 border-stone-300 text-stone-700 hover:border-[#C85428]"
                }`}
              >
                <Heart
                  className={`w-6 h-6 ${wishlisted ? "fill-[#C85428]" : ""}`}
                />
                {wishlisted ? "In Wishlist" : "Add to Wishlist"}
              </button>
            </div>

            {/* Features */}
            <div className="mb-12">
              <h3 className="font-serif text-2xl text-[#442D1C] mb-6">
                Features
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {product.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-stone-600"
                  >
                    <Check className="w-5 h-5 text-[#8E5022]" />
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Care & Shipping */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-gradient-to-br from-white to-[#EDD8B4]/20 rounded-2xl p-6">
                <h4 className="font-serif text-xl text-[#442D1C] mb-3">
                  Care Instructions
                </h4>
                <p className="text-stone-600">{product.care}</p>
              </div>
              <div className="bg-gradient-to-br from-white to-[#EDD8B4]/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-[#8E5022]" />
                  <h4 className="font-serif text-xl text-[#442D1C]">
                    Guarantee
                  </h4>
                </div>
                <p className="text-stone-600 mb-3">{product.returnPolicy}</p>
                <div className="flex items-center gap-2 text-sm text-stone-500">
                  <RefreshCw className="w-4 h-4" />
                  Easy returns & exchanges
                </div>
              </div>
            </div>

            {/* Share */}
            <div>
              <h4 className="font-serif text-xl text-[#442D1C] mb-4">
                Share this piece
              </h4>
              <div className="flex gap-3">
                {[Facebook, Twitter, Mail].map((Icon, index) => (
                  <button
                    key={index}
                    className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-stone-600" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        <div className="mt-32">
          <h2 className="font-serif text-4xl text-[#442D1C] mb-12 text-center">
            You may also <span className="text-[#C85428]">like</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {RELATED_PRODUCTS.map((relatedProduct) => (
              <Link
                key={relatedProduct.id}
                href={`/products/${relatedProduct.slug}`}
              >
                <motion.div
                  whileHover={{ y: -8 }}
                  className="group bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-6">
                    <span className="text-sm text-[#8E5022] font-medium uppercase tracking-wider">
                      {relatedProduct.category}
                    </span>
                    <h3 className="font-serif text-2xl text-[#442D1C] mt-2 mb-3 group-hover:text-[#C85428] transition-colors">
                      {relatedProduct.name}
                    </h3>
                    <div className="font-serif text-2xl text-[#442D1C]">
                      ${relatedProduct.price}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Slider */}
      <CartSlider />
    </main>
  );
}
