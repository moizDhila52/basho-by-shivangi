"use client";

import { cn } from "@/lib/utils";
import React, { useEffect, useState, useRef } from "react";
import { User, Star, Eye, EyeOff, Play } from "lucide-react";

// =========================================
// INTERNAL: INDIVIDUAL CARD COMPONENT
// =========================================
const TestimonialCard = ({ item, onReadMore }) => {
  const isAnonymous = item.isAnonymous;

  // 1. AVATAR LOGIC
  const renderAvatar = () => {
    if (isAnonymous) {
      // IF ANONYMOUS: Show generic User icon
      return <User className="w-5 h-5 text-[#442D1C]" />;
    }
    // IF NOT ANONYMOUS: Show User's Initial
    return item.name ? item.name.charAt(0).toUpperCase() : "?";
  };

  const hasMedia = item.image || item.video;
  // Check if text is long enough to warrant a "Read More" button
  const isLongText = item.quote && item.quote.length > 150;

  return (
    <li
      className={cn(
        "w-[350px] max-w-full relative rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300",
        "flex flex-col", 
        // Hover Logic
        "group-hover:opacity-50 hover:!opacity-100 hover:scale-[1.02] hover:shadow-xl hover:border-[#8E5022]/30"
      )}
      style={{
        background: "linear-gradient(180deg, #ffffff, #fafafa)",
      }}
    >
      {/* Decorative gradient border/background effect */}
      <div
        aria-hidden="true"
        className="user-select-none -z-1 pointer-events-none absolute -left-0.5 -top-0.5 h-[calc(100%_+_4px)] w-[calc(100%_+_4px)] rounded-2xl"
      ></div>

      {/* CARD CONTENT CONTAINER */}
      <div className="relative z-20 flex flex-col h-full p-6">
        
        {/* HEADER: Rating */}
        <div className="flex gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={14}
              className={cn(
                "fill-[#C85428] text-[#C85428]",
                i >= (item.rating || 5) && "opacity-30"
              )}
            />
          ))}
        </div>

        {/* BODY: Text & Media */}
        <div className="flex-grow flex flex-col gap-4">
          
          {/* Quote Text */}
          {item.quote && (
            <div className="relative">
              <p className="text-sm leading-[1.6] text-stone-700 font-normal italic line-clamp-4">
                "{item.quote}"
              </p>
              {isLongText && (
                <button
                  onClick={() => onReadMore(item)} 
                  className="mt-1 text-xs font-bold text-[#8E5022] hover:underline focus:outline-none"
                >
                  Read More
                </button>
              )}
            </div>
          )}

          {/* MEDIA ATTACHMENTS (Video/Image) */}
          {hasMedia && (
            <div className="flex flex-col gap-3">
              
              {/* VIDEO ATTACHMENT */}
              {item.video && (
                <div className="rounded-xl overflow-hidden border border-stone-100 bg-stone-50">
                  <div className="relative w-full bg-black aspect-video flex items-center justify-center group/video cursor-pointer">
                    <video
                      src={item.video}
                      className="w-full h-full object-cover"
                      controls
                      preload="metadata"
                    />
                  </div>
                </div>
              )}

              {/* IMAGE ATTACHMENT */}
              {item.image && (
                <div className="rounded-xl overflow-hidden border border-stone-100 bg-stone-50">
                  <div className="relative w-full h-48">
                    <img
                      src={item.image}
                      alt="Review attachment"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. RENDER FOOTER (Merged Logic) */}
        <div className="mt-6 flex flex-row items-center gap-3 border-t border-stone-100 pt-4">
          {/* Avatar Circle */}
          <div className="w-10 h-10 rounded-full bg-[#EDD8B4] flex items-center justify-center text-[#442D1C] font-bold text-base shadow-inner shrink-0">
            {renderAvatar()} 
          </div>

          {/* Name & Role Text */}
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-bold text-[#442D1C] line-clamp-1">
              {/* HIDE NAME IF ANONYMOUS */}
              {isAnonymous ? "Community Member" : item.name}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-full">
                {/* HIDE ROLE IF ANONYMOUS */}
                {isAnonymous ? "Verified Buyer" : (item.title || "Verified Buyer")}
              </span>
              {/* OPTIONAL: Icon indicating privacy */}
              {isAnonymous && <EyeOff size={12} className="text-stone-400" />}
            </div>
          </div>
        </div>

      </div>
    </li>
  );
};

// =========================================
// EXPORTED: INFINITE SCROLL CONTAINER
// =========================================
export const InfiniteMovingCards = ({
  items,
  direction = "left",
  speed = "fast",
  pauseOnHover = true,
  className,
  onReadMore, // Receive callback
}) => {
  const containerRef = useRef(null);
  const scrollerRef = useRef(null);
  const [start, setStart] = useState(false);

  useEffect(() => {
    addAnimation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function addAnimation() {
    if (containerRef.current && scrollerRef.current) {
      getDirection();
      getSpeed();
      setStart(true);
    }
  }

  const getDirection = () => {
    if (containerRef.current) {
      if (direction === "left") {
        containerRef.current.style.setProperty("--animation-direction", "forwards");
      } else {
        containerRef.current.style.setProperty("--animation-direction", "reverse");
      }
    }
  };

  const getSpeed = () => {
    if (containerRef.current) {
      if (speed === "fast") {
        containerRef.current.style.setProperty("--animation-duration", "20s");
      } else if (speed === "normal") {
        containerRef.current.style.setProperty("--animation-duration", "40s");
      } else {
        containerRef.current.style.setProperty("--animation-duration", "80s");
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)]",
        className
      )}
    >
      <ul
        ref={scrollerRef}
        className={cn(
          "group flex w-max min-w-full shrink-0 flex-nowrap gap-4 py-4 items-start", 
          start && "animate-scroll",
          pauseOnHover && "hover:[animation-play-state:paused]"
        )}
      >
        {items.concat(items).map((item, idx) => (
          <TestimonialCard 
             key={`${item.name}-${idx}`} 
             item={item} 
             onReadMore={onReadMore}
          />
        ))}
      </ul>
    </div>
  );
};