import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { toast } from 'sonner' // Optional: for nice alerts, or we use simple alert()

export const useCart = create(
  persist(
    (set, get) => ({
      items: [],
      
      // Add item to cart
      addItem: (data) => {
        const currentItems = get().items
        const existingItem = currentItems.find((item) => item.id === data.id)

        if (existingItem) {
          // If item exists, just increment quantity? (Optional logic)
          return alert('Item already in cart!')
        }

        set({ items: [...get().items, { ...data, quantity: 1 }] })
        // toast.success("Item added to cart") // If you install sonner later
      },

      // Remove item
      removeItem: (id) => {
        set({ items: [...get().items.filter((item) => item.id !== id)] })
      },

      // Clear cart
      removeAll: () => set({ items: [] }),
    }),
    {
      name: 'basho-cart-storage', // unique name for local storage
      storage: createJSONStorage(() => localStorage),
    }
  )
)