import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Trash2, X } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useCart } from "@/context/CartContext";
import { SHIPPING_COST } from "@/lib/products";

export default function CartSidebar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { cartItems, removeFromCart } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const stockWarning = (item: (typeof cartItems)[number]) =>
    item.quantity > item.stock ? `Only ${item.stock} left in stock` : null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = cartItems.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shippingCost;
  const hasStockIssues = cartItems.some((item) => stockWarning(item));

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-md transform flex-col border-l border-line bg-surface text-ink shadow-2xl transition-transform duration-300 ${isVisible ? "translate-x-0" : "translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl font-semibold">Your Bag</h2>
          <button onClick={handleClose} className="cursor-pointer text-muted transition-colors hover:text-accent" aria-label="Close cart">
            <X size={22} />
          </button>
        </header>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <p className="font-display text-xl text-muted italic">Your bag is empty.</p>
            <button onClick={handleClose} className="btn">
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            <div className="custom-scrollbar flex-1 space-y-4 overflow-y-auto px-6 py-5">
              {cartItems.map((item) => {
                const warning = stockWarning(item);
                return (
                  <div key={`${item.id}_${item.size}`} className="flex gap-4 border-b border-line pb-4 last:border-b-0">
                    <div className="relative h-20 w-16 flex-shrink-0 bg-surface-2">
                      <ProductPhoto src={item.imageUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-display text-lg leading-tight font-semibold">{item.name}</p>
                      {item.size && <p className="mt-1 text-sm text-muted">Size: {item.size}</p>}
                      <p className="text-sm text-muted">Qty: {item.quantity}</p>
                      <p className="mt-1">₱{item.price.toLocaleString()}</p>
                      {warning && <p className="mt-1 text-sm text-accent">{warning}</p>}
                    </div>
                    <button
                      onClick={() => removeFromCart(item)}
                      aria-label={`Remove ${item.name}`}
                      className="h-fit cursor-pointer text-muted transition-colors hover:text-accent"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                );
              })}
            </div>

            <footer className="border-t border-line px-6 py-5">
              <div className="mb-2 flex justify-between text-muted">
                <span>Shipping</span>
                <span>₱{shippingCost.toLocaleString()}</span>
              </div>
              <div className="mb-5 flex justify-between font-display text-xl font-semibold">
                <span>Total</span>
                <span>₱{total.toLocaleString()}</span>
              </div>
              <button disabled={hasStockIssues} className="btn w-full" onClick={() => router.push("/checkout")}>
                {hasStockIssues ? "Fix Quantity" : "Checkout"}
              </button>
              <button onClick={handleClose} className="mt-3 w-full cursor-pointer text-center text-muted underline-offset-4 hover:text-gold hover:underline">
                Continue Shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}
