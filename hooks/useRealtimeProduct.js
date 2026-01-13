// hooks/useRealtimeProduct.js
import { useState, useEffect } from 'react';

/**
 * Automatically updates product stock in real-time.
 * Returns the updated product object.
 */
export function useRealtimeProduct(initialProduct) {
  const [product, setProduct] = useState(initialProduct);

  // Sync state if the initial prop changes (e.g. navigation)
  useEffect(() => {
    setProduct(initialProduct);
  }, [initialProduct]);

  useEffect(() => {
    if (!product?.id) return;

    // Handler for the custom event dispatched by SocketContext
    const handleStockUpdate = (e) => {
      const { productId, stock } = e.detail;

      if (productId === product.id) {
        console.log(`⚡ Realtime update for ${product.name}: Stock ${stock}`);

        setProduct((prev) => ({
          ...prev,
          stock: stock,
          inStock: stock > 0,
        }));
      }
    };

    // Listen to the window event we created in SocketContext
    window.addEventListener('product-stock-update', handleStockUpdate);

    return () => {
      window.removeEventListener('product-stock-update', handleStockUpdate);
    };
  }, [product?.id, product?.name]);

  return product;
}
