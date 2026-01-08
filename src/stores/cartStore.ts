import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Cart, CartItem } from '../types';

interface CartState extends Cart {
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  clearCart: () => void;
  calculateTotals: () => void;
}

const TAX_RATE = 0.21; // 21% IVA

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      couponCode: undefined,
      discount: 0,

      addItem: (item) => {
        const id = `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        set((state) => {
          const newItems = [...state.items, { ...item, id }];
          const subtotal = newItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
          const discountAmount = state.discount;
          const taxableAmount = subtotal - discountAmount;
          const tax = taxableAmount * TAX_RATE;
          const total = taxableAmount + tax;

          return {
            items: newItems,
            subtotal,
            tax,
            total,
          };
        });
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((i) => i.id !== id);
          const subtotal = newItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
          const discountAmount = state.discount;
          const taxableAmount = Math.max(0, subtotal - discountAmount);
          const tax = taxableAmount * TAX_RATE;
          const total = taxableAmount + tax;

          return {
            items: newItems,
            subtotal,
            tax,
            total,
          };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity < 1) return;
        
        set((state) => {
          const newItems = state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          );
          const subtotal = newItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
          const discountAmount = state.discount;
          const taxableAmount = Math.max(0, subtotal - discountAmount);
          const tax = taxableAmount * TAX_RATE;
          const total = taxableAmount + tax;

          return {
            items: newItems,
            subtotal,
            tax,
            total,
          };
        });
      },

      applyCoupon: async (code) => {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock coupons
        const coupons: Record<string, number> = {
          'WELCOME10': 10,
          'SAVE20': 20,
          'HOSTING50': 50,
        };

        const discountPercent = coupons[code.toUpperCase()];
        
        if (!discountPercent) {
          return false;
        }

        set((state) => {
          const discountAmount = (state.subtotal * discountPercent) / 100;
          const taxableAmount = Math.max(0, state.subtotal - discountAmount);
          const tax = taxableAmount * TAX_RATE;
          const total = taxableAmount + tax;

          return {
            couponCode: code.toUpperCase(),
            discount: discountAmount,
            tax,
            total,
          };
        });

        return true;
      },

      removeCoupon: () => {
        set((state) => {
          const tax = state.subtotal * TAX_RATE;
          const total = state.subtotal + tax;

          return {
            couponCode: undefined,
            discount: 0,
            tax,
            total,
          };
        });
      },

      clearCart: () => {
        set({
          items: [],
          subtotal: 0,
          tax: 0,
          total: 0,
          couponCode: undefined,
          discount: 0,
        });
      },

      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce((acc, i) => acc + i.price * i.quantity, 0);
        const taxableAmount = Math.max(0, subtotal - state.discount);
        const tax = taxableAmount * TAX_RATE;
        const total = taxableAmount + tax;

        set({ subtotal, tax, total });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
