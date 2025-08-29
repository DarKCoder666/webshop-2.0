'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = {
  // Variation ID from backend (productId in order payload)
  productId: string;
  // Base product info for UI
  productName: string;
  productBaseId?: string;
  imageUrl?: string;
  // Pricing
  price: number;
  discountPrice?: number;
  // Variation attributes (e.g., Color: Black, Size: M)
  attributes?: Record<string, string>;
  // Quantity in cart
  quantity: number;
};

type CartState = {
  items: Record<string, CartItem>; // keyed by productId (variation)
  updatedAt: number | null;

  // Derived getters
  getItemCount: () => number; // total quantity
  getItemsList: () => CartItem[];
  getItemSubtotal: (productId: string) => number;
  getSubtotal: () => number; // using discount if available

  // Actions
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
};

function getUnitPrice(item: CartItem): number {
  return typeof item.discountPrice === 'number' && item.discountPrice >= 0
    ? item.discountPrice
    : item.price;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      updatedAt: null,

      getItemCount: () => {
        const { items } = get();
        return Object.values(items).reduce((sum, it) => sum + it.quantity, 0);
      },

      getItemsList: () => Object.values(get().items),

      getItemSubtotal: (productId: string) => {
        const item = get().items[productId];
        if (!item) return 0;
        return getUnitPrice(item) * item.quantity;
      },

      getSubtotal: () => {
        const { items } = get();
        return Object.values(items).reduce((sum, it) => sum + getUnitPrice(it) * it.quantity, 0);
      },

      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items[item.productId];
          const nextQuantity = (existing?.quantity || 0) + quantity;
          return {
            items: {
              ...state.items,
              [item.productId]: {
                ...existing,
                ...item,
                quantity: nextQuantity,
              },
            },
            updatedAt: Date.now(),
          };
        });
      },

      removeItem: (productId) => {
        set((state) => {
          const next = { ...state.items };
          delete next[productId];
          return { items: next, updatedAt: Date.now() };
        });
      },

      updateQuantity: (productId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            const next = { ...state.items };
            delete next[productId];
            return { items: next, updatedAt: Date.now() };
          }
          const existing = state.items[productId];
          if (!existing) return state;
          return {
            items: {
              ...state.items,
              [productId]: { ...existing, quantity },
            },
            updatedAt: Date.now(),
          };
        });
      },

      clear: () => set({ items: {}, updatedAt: Date.now() }),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items, updatedAt: state.updatedAt }),
    }
  )
);



