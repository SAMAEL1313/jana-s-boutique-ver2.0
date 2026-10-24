import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { AiOutlineHome } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa";
import ProductPhoto from "@/components/ProductPhoto";
import ThemeToggle from "@/components/ThemeToggle";
import Wordmark from "@/components/Wordmark";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/fetcher";
import { SHIPPING_COST } from "@/lib/products";
import type { OrderDTO } from "@/types";

const paymentOptions = [{ name: "GCash", logo: "/images/GCASH.png" }];

const emptyInfo = {
  firstName: "",
  lastName: "",
  address: "",
  city: "",
  province: "",
  zip: "",
  phone: "",
  country: "Philippines",
};
type ShippingInfo = typeof emptyInfo;

const savedInfoKey = (email: string) => `savedCheckoutInfo_${email}`;

const inputClass = "input-field";

export default function Checkout() {
  const router = useRouter();
  const { cartItems, clearCart } = useCart();
  const { currentUser, loading: authLoading } = useAuth();

  const [info, setInfo] = useState<ShippingInfo>(emptyInfo);
  const [selectedPayment, setSelectedPayment] = useState("GCash");
  const [countryOpen, setCountryOpen] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [alert, setAlert] = useState("");
  const [showGcashModal, setShowGcashModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const setField = (field: keyof ShippingInfo) => (value: string) => setInfo((prev) => ({ ...prev, [field]: value }));

  // Load saved shipping info for this user (per-browser convenience only)
  useEffect(() => {
    if (!currentUser) return;
    try {
      const saved = JSON.parse(localStorage.getItem(savedInfoKey(currentUser.email)) || "{}");
      setInfo((prev) => ({ ...prev, ...saved }));
    } catch {
      // ignore unreadable saved info
    }
  }, [currentUser]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Disable scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showGcashModal ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showGcashModal]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = cartItems.length > 0 ? SHIPPING_COST : 0;
  const total = subtotal + shippingCost;

  const handlePayNow = () => {
    const { country: _, ...required } = info;
    if (Object.values(required).some((v) => !v.trim())) return setAlert("Please fill in all required fields!");
    if (cartItems.length === 0) return setAlert("Your cart is empty!");
    if (!authLoading && !currentUser) return setAlert("You must be logged in to place an order.");
    setAlert("");
    setShowGcashModal(true);
  };

  const processOrder = async () => {
    if (!currentUser) return setAlert("You must be logged in to place an order.");

    if (rememberMe) {
      try {
        localStorage.setItem(savedInfoKey(currentUser.email), JSON.stringify(info));
      } catch {
        // storage unavailable — skip saving
      }
    }

    setIsProcessing(true);
    const data = await api<{ order: OrderDTO }>("/api/checkout", {
      body: {
        ...info,
        paymentMethod: selectedPayment,
        items: cartItems.map((item) => ({ productId: item.id, quantity: item.quantity, size: item.size })),
      },
    });
    setIsProcessing(false);

    if (!data.success) {
      setShowGcashModal(false);
      return setAlert(`Error: ${data.message}`);
    }

    clearCart();
    router.push("/thankyou");
  };

  const handleCancel = () => {
    clearCart();
    if (currentUser) {
      try {
        localStorage.removeItem(savedInfoKey(currentUser.email));
      } catch {
        // ignore
      }
    }
    setInfo(emptyInfo);
    setRememberMe(false);
  };

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Header */}
      <header className="fixed top-0 left-0 z-50 w-full border-b border-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" aria-label="Back to the shop" className="flex w-36 items-center gap-3 text-muted transition-colors hover:text-gold">
            <AiOutlineHome size={22} />
            <span className="font-display text-sm tracking-[0.2em] uppercase">Shop</span>
          </Link>
          <Wordmark size="sm" />
          <div className="flex w-36 justify-end">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pt-36 pb-20">
        <p className="eyebrow">Checkout</p>
        <h1 className="mt-2 mb-10 font-display text-5xl font-medium">Shipping &amp; Payment</h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Form */}
          <section className="card space-y-4 p-8">
            {alert && <div className="rounded-sm border border-accent/40 bg-accent/10 p-3 text-accent">{alert}</div>}

            {/* Country */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setCountryOpen(!countryOpen)}
                className="input-field flex cursor-pointer items-center justify-between text-left"
              >
                <span>{info.country}</span>
                <FaChevronDown size={12} className={`transition-transform duration-200 ${countryOpen ? "rotate-180" : ""}`} />
              </button>
              {countryOpen && (
                <div className="card absolute z-10 mt-1 w-full shadow-lg">
                  <button
                    className="w-full cursor-pointer p-2.5 text-left hover:bg-surface-2"
                    onClick={() => {
                      setField("country")("Philippines");
                      setCountryOpen(false);
                    }}
                  >
                    Philippines
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <input placeholder="First Name" value={info.firstName} onChange={(e) => setField("firstName")(e.target.value)} className={inputClass} />
              <input placeholder="Last Name" value={info.lastName} onChange={(e) => setField("lastName")(e.target.value)} className={inputClass} />
            </div>
            <input placeholder="Address" value={info.address} onChange={(e) => setField("address")(e.target.value)} className={inputClass} />
            <div className="grid grid-cols-3 gap-4">
              <input placeholder="City" value={info.city} onChange={(e) => setField("city")(e.target.value)} className={inputClass} />
              <input placeholder="Province" value={info.province} onChange={(e) => setField("province")(e.target.value)} className={inputClass} />
              <input placeholder="ZIP / Postal" value={info.zip} onChange={(e) => setField("zip")(e.target.value)} className={inputClass} />
            </div>
            <input type="tel" placeholder="Phone +63" value={info.phone} onChange={(e) => setField("phone")(e.target.value)} className={inputClass} />

            {/* Payment */}
            <div className="space-y-4 border-t border-line pt-6">
              <div>
                <h2 className="font-display text-2xl font-medium">Payment Method</h2>
                <p className="text-sm text-muted">All transactions are secure and encrypted.</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {paymentOptions.map((option) => {
                  const selected = selectedPayment === option.name;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setSelectedPayment(option.name)}
                      className={`flex cursor-pointer items-center gap-3 rounded-sm border px-4 py-2 transition-colors ${
                        selected ? "border-gold bg-surface-2" : "border-line hover:border-gold"
                      }`}
                    >
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${selected ? "border-accent bg-accent" : "border-line"}`}
                      >
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-accent-ink" />}
                      </span>
                      <span className="relative h-8 w-20 overflow-hidden rounded-sm">
                        <Image src={option.logo} alt={option.name} fill sizes="80px" className="object-contain" />
                      </span>
                    </button>
                  );
                })}
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-muted">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                <span className="text-sm">Save my information for faster checkout</span>
              </label>

              <button onClick={handlePayNow} disabled={isProcessing} className="btn w-full py-3.5">
                {isProcessing ? "Processing..." : "Pay Now"} <span aria-hidden>→</span>
              </button>
            </div>
          </section>

          {/* Order summary */}
          <aside className="card h-fit p-8">
            <h2 className="mb-6 font-display text-2xl font-medium">Your Order</h2>
            <div className="space-y-4">
              {cartItems.length === 0 && <p className="text-muted italic">Your bag is empty.</p>}
              {cartItems.map((item) => (
                <div key={`${item.id}_${item.size}`} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-16 w-14 flex-shrink-0 bg-surface-2">
                      <ProductPhoto src={item.imageUrl} alt={item.name} fill sizes="56px" className="object-cover" />
                    </div>
                    <div>
                      <p className="font-display text-lg leading-tight font-semibold">{item.name}</p>
                      <p className="text-sm text-muted">
                        {item.size ? `${item.size} · ` : ""}Qty {item.quantity}
                      </p>
                    </div>
                  </div>
                  <span>₱{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div className="space-y-2 border-t border-line pt-4">
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>₱{shippingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-display text-2xl font-semibold">
                  <span>Total</span>
                  <span>₱{total.toLocaleString()}</span>
                </div>
              </div>

              <button type="button" onClick={handleCancel} className="btn-outline w-full">
                Cancel Order
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* GCash modal */}
      {showGcashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="border-b border-line bg-surface-2 p-5 text-center">
              <h2 className="font-display text-2xl font-medium">Pay with GCash</h2>
              <span className="text-sm text-muted">Jana&apos;s Boutique | janas.work.ph</span>
            </div>

            <div className="space-y-4 p-6 text-center">
              <p className="text-sm text-muted">Send your payment to the following GCash number:</p>
              <p className="font-display text-2xl tracking-wider">0948-892-9764</p>
              <p className="text-lg">
                Amount: <span className="font-semibold text-accent">₱{total.toLocaleString()}</span>
              </p>
              <button type="button" onClick={processOrder} disabled={isProcessing} className="btn w-full">
                {isProcessing ? "Processing..." : "Confirm Payment"}
              </button>
              <button type="button" onClick={() => setShowGcashModal(false)} className="btn-outline w-full">
                Cancel
              </button>
            </div>

            <div className="flex justify-center border-t border-line p-4">
              <Image src="/images/GCASH.png" alt="GCash Logo" width={96} height={40} className="h-auto w-24" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
