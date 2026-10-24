import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import ProductPhoto from "@/components/ProductPhoto";
import ProfileDropdown from "@/components/ProfileDropdown";
import ThemeToggle from "@/components/ThemeToggle";
import Wordmark from "@/components/Wordmark";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/fetcher";
import type { OrderDTO } from "@/types";

export default function Profile() {
  const router = useRouter();
  const { currentUser, loading, logout } = useAuth();
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [zoomAnim, setZoomAnim] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!currentUser) {
      router.replace("/auth?form=login");
      return;
    }
    api<{ orders: OrderDTO[] }>("/api/orders/mine").then((data) => {
      if (data.success) setOrders(data.orders);
      setOrdersLoading(false);
    });
  }, [currentUser, loading, router]);

  const handleShopClick = () => {
    setZoomAnim(true);
    setTimeout(() => router.push("/"), 300);
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-10">
            <Wordmark size="sm" />
            <nav className="flex gap-6 font-display text-sm font-semibold tracking-[0.2em] uppercase">
              <button
                onClick={handleShopClick}
                className={`link-underline cursor-pointer text-muted transition-colors hover:text-gold ${zoomAnim ? "animate-zoom" : ""}`}
              >
                Shop
              </button>
              <span className="text-ink">Orders</span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ProfileDropdown email={currentUser.email} onSignOut={() => logout("/")} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-6 pt-36 pb-20">
        <p className="eyebrow">Welcome back, {currentUser.firstName}</p>
        <h1 className="mt-2 mb-10 font-display text-5xl font-medium">Order History</h1>

        {ordersLoading ? (
          <p className="text-muted italic">Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className="card flex h-64 flex-col items-center justify-center gap-4 text-center">
            <p className="font-display text-2xl italic">No orders yet</p>
            <p className="text-muted">Go to the store to place an order.</p>
            <button onClick={handleShopClick} className="btn-outline">
              Browse the collection
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <article key={order.id} className="card p-6">
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3">
                  <h2 className="font-display text-xl font-semibold">{order.orderNumber}</h2>
                  <p className="text-sm text-muted">
                    {new Date(order.createdAt).toLocaleString()} · {order.paymentMethod}
                  </p>
                </div>

                {order.items.map((item) => (
                  <div key={item.id} className="mb-3 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-16 w-14 flex-shrink-0 bg-surface-2">
                        <ProductPhoto src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                      </div>
                      <div>
                        <p className="font-display text-lg leading-tight font-semibold">{item.name}</p>
                        <p className="text-sm text-muted">
                          {item.size ? `${item.size} · ` : ""}
                          {item.quantity} × ₱{item.unitPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span>₱{(item.unitPrice * item.quantity).toLocaleString()}</span>
                  </div>
                ))}

                <div className="mt-4 space-y-1 border-t border-line pt-3">
                  <div className="flex justify-between text-sm text-muted">
                    <span>Shipping</span>
                    <span>₱{order.shippingCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between font-display text-xl font-semibold">
                    <span>Total</span>
                    <span>₱{order.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
