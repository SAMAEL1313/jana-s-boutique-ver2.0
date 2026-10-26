import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/fetcher";
import type { CartItem, Product } from "@/types";

// Carts used to live in localStorage under this key; they're now saved on the account.
const LEGACY_STORAGE_KEY = "cart";
const SAVE_DELAY_MS = 300;

interface CartContextValue {
  cartItems: CartItem[];
  /** True when a signed-in customer can add to the bag (guests and the admin can't). */
  canShop: boolean;
  /** Returns false (and changes nothing) if the visitor can't shop. */
  addToCart: (product: Product, quantity?: number, size?: string | null) => boolean;
  removeFromCart: (item: Pick<CartItem, "id" | "size">) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

const sameLine = (a: Pick<CartItem, "id" | "size">, b: Pick<CartItem, "id" | "size">) =>
  a.id === b.id && a.size === b.size;

export function CartProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const userId = currentUser && !currentUser.isAdmin ? currentUser.id : null;

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  // The user whose saved bag is in `cartItems`; edits are only saved once it's loaded.
  const [loadedFor, setLoadedFor] = useState<number | null>(null);
  // Set by local edits so loading a bag from the server doesn't save it straight back.
  const dirty = useRef(false);

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  // Load the signed-in customer's bag; empty it when they sign out.
  useEffect(() => {
    dirty.current = false;
    setCartItems([]);
    setLoadedFor(null);
    if (userId === null) return;

    let cancelled = false;
    api<{ items: CartItem[] }>("/api/cart").then((data) => {
      if (cancelled) return;
      if (data.success) setCartItems(data.items);
      setLoadedFor(userId);
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  // Save edits to the account shortly after they happen.
  useEffect(() => {
    if (!dirty.current || userId === null || loadedFor !== userId) return;
    const timer = setTimeout(() => {
      dirty.current = false;
      api("/api/cart", {
        method: "PUT",
        body: {
          items: cartItems
            .filter((i) => i.quantity > 0)
            .map((i) => ({ productId: i.id, quantity: i.quantity, size: i.size })),
        },
      }).then((data) => {
        if (!data.success) console.error("Failed to save bag:", data.message);
      });
    }, SAVE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [cartItems, userId, loadedFor]);

  const edit = (update: (prev: CartItem[]) => CartItem[]) => {
    dirty.current = true;
    setCartItems(update);
  };

  // Stock-safe add to cart
  const addToCart = (product: Product, quantity = 1, size: string | null = null) => {
    if (userId === null) return false;
    edit((prev) => {
      const index = prev.findIndex((item) => sameLine(item, { id: product.id, size }));
      if (index > -1) {
        const updated = [...prev];
        const existing = updated[index];
        updated[index] = { ...existing, quantity: Math.min(existing.quantity + quantity, product.stock) };
        return updated;
      }
      return [...prev, { ...product, quantity: Math.min(quantity, product.stock), size }];
    });
    return true;
  };

  const removeFromCart = (item: Pick<CartItem, "id" | "size">) =>
    edit((prev) => prev.filter((i) => !sameLine(i, item)));

  const clearCart = () => edit(() => []);

  return (
    <CartContext.Provider value={{ cartItems, canShop: userId !== null, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
