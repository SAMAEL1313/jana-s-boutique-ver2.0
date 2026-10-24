import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { CartItem, Product } from "@/types";

const STORAGE_KEY = "cart";

interface CartContextValue {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number, size?: string | null) => void;
  removeFromCart: (item: Pick<CartItem, "id" | "size">) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const sameLine = (a: Pick<CartItem, "id" | "size">, b: Pick<CartItem, "id" | "size">) =>
  a.id === b.id && a.size === b.size;

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const loaded = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setCartItems(JSON.parse(saved));
    } catch {
      // Ignore unreadable storage; start with an empty cart.
    }
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Storage may be unavailable (private mode); the cart still works in memory.
    }
  }, [cartItems]);

  // Stock-safe add to cart
  const addToCart = (product: Product, quantity = 1, size: string | null = null) => {
    setCartItems((prev) => {
      const index = prev.findIndex((item) => sameLine(item, { id: product.id, size }));
      if (index > -1) {
        const updated = [...prev];
        const existing = updated[index];
        updated[index] = { ...existing, quantity: Math.min(existing.quantity + quantity, product.stock) };
        return updated;
      }
      return [...prev, { ...product, quantity: Math.min(quantity, product.stock), size }];
    });
  };

  const removeFromCart = (item: Pick<CartItem, "id" | "size">) =>
    setCartItems((prev) => prev.filter((i) => !sameLine(i, item)));

  const clearCart = () => setCartItems([]);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
