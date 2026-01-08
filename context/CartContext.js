'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import toast from 'react-hot-toast';

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load cart on mount and when user changes
  useEffect(() => {
    const loadCart = async () => {
      if (authLoading) return; // Wait for auth to finish loading

      setLoading(true);

      try {
        if (user) {
          // User is logged in - fetch from database
          await fetchCartFromDB();

          // Check for guest cart in localStorage and merge
          const guestCart = getGuestCart();
          if (guestCart.length > 0) {
            await mergeGuestCart(guestCart);
            clearGuestCart();
          }
        } else {
          // User is not logged in - load from localStorage
          const guestCart = getGuestCart();
          setCartItems(guestCart);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user, authLoading]);

  // Save guest cart to localStorage whenever it changes
  useEffect(() => {
    if (!user && cartItems.length > 0) {
      saveGuestCart(cartItems);
    }
  }, [cartItems, user]);

  // ===== Guest Cart Functions (localStorage) =====
  const getGuestCart = () => {
    try {
      const savedCart = localStorage.getItem('basho-guest-cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error('Error loading guest cart:', error);
      return [];
    }
  };

  const saveGuestCart = (cart) => {
    try {
      localStorage.setItem('basho-guest-cart', JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving guest cart:', error);
    }
  };

  const clearGuestCart = () => {
    try {
      localStorage.removeItem('basho-guest-cart');
    } catch (error) {
      console.error('Error clearing guest cart:', error);
    }
  };

  // ===== Database Cart Functions =====
  const fetchCartFromDB = async () => {
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }

      const data = await response.json();
      setCartItems(data.cartItems || []);
    } catch (error) {
      console.error('Error fetching cart from DB:', error);
      toast.error('Failed to load cart');
    }
  };

  const mergeGuestCart = async (guestCart) => {
    try {
      const response = await fetch('/api/cart/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ guestCart }),
      });

      if (!response.ok) {
        throw new Error('Failed to merge cart');
      }

      const data = await response.json();
      setCartItems(data.cartItems || []);
      toast.success('Cart synced successfully!');
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  const moveToWishlist = async (product) => {
    if (!user) {
      toast.error('Please login to save items');
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Add to Wishlist
      const wishlistRes = await fetch('/api/wishlist/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });

      if (!wishlistRes.ok) throw new Error('Failed to add to wishlist');

      // 2. Remove from Cart
      // We reuse the existing removeFromCart logic but suppress the toast to avoid double notifications
      const removeRes = await fetch(
        `/api/cart/remove?productId=${product.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (removeRes.ok) {
        const data = await removeRes.json();
        setCartItems(data.cartItems); // Update state with fresh cart
        toast.success('Moved to Wishlist');
      }
    } catch (error) {
      console.error('Error moving to wishlist:', error);
      toast.error('Failed to move item');
    } finally {
      setIsUpdating(false);
    }
  };

  // ===== Cart Actions =====
  const addToCart = async (product) => {
    // 1. Logged In User Logic
    if (user) {
      setIsUpdating(true);
      try {
        const response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            productId: product.id,
            quantity: product.quantity || 1,
          }),
        });

        const data = await response.json();

        // If backend says "Out of Stock" (400), this block runs
        if (!response.ok) {
          throw new Error(data.error || 'Failed to add to cart');
        }

        setCartItems(data.cartItems);
        setIsCartOpen(true);

        return data;
      } catch (error) {
        console.error('Error adding to cart:', error);

        throw error;
      } finally {
        setIsUpdating(false);
      }
    } else {
      setCartItems((prevItems) => {
        const existingItem = prevItems.find((item) => item.id === product.id);

        if (existingItem) {
          return prevItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + (product.quantity || 1) }
              : item,
          );
        } else {
          return [
            ...prevItems,
            { ...product, quantity: product.quantity || 1 },
          ];
        }
      });

      setIsCartOpen(true);
    }
  };

  const removeFromCart = async (productId) => {
    if (user) {
      // Logged in - remove from database
      setIsUpdating(true);
      try {
        const response = await fetch(
          `/api/cart/remove?productId=${productId}`,
          {
            method: 'DELETE',
            credentials: 'include',
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to remove from cart');
        }

        setCartItems(data.cartItems);
        toast.success('Removed from cart');
      } catch (error) {
        console.error('Error removing from cart:', error);
        toast.error('Failed to remove from cart');
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Guest - remove from localStorage
      setCartItems((prevItems) =>
        prevItems.filter((item) => item.id !== productId),
      );
      toast.success('Removed from cart');
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    if (user) {
      // Logged in - update in database
      setIsUpdating(true);
      try {
        const response = await fetch('/api/cart/update', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ productId, quantity }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to update quantity');
        }

        setCartItems(data.cartItems);
      } catch (error) {
        console.error('Error updating quantity:', error);
        toast.error(error.message || 'Failed to update quantity');
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Guest - update in localStorage
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.id === productId ? { ...item, quantity } : item,
        ),
      );
    }
  };

  const clearCart = async () => {
    if (user) {
      // Logged in - clear database cart
      setIsUpdating(true);
      try {
        const response = await fetch('/api/cart/clear', {
          method: 'DELETE',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to clear cart');
        }

        setCartItems([]);
        toast.success('Cart cleared');
      } catch (error) {
        console.error('Error clearing cart:', error);
        toast.error('Failed to clear cart');
      } finally {
        setIsUpdating(false);
      }
    } else {
      // Guest - clear localStorage
      setCartItems([]);
      clearGuestCart();
      toast.success('Cart cleared');
    }
  };

  // ===== Helper Functions =====
  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getItemQuantity = (productId) => {
    const item = cartItems.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getTotalItems,
        getItemQuantity,
        isCartOpen,
        setIsCartOpen,
        loading,
        isUpdating,
        moveToWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
