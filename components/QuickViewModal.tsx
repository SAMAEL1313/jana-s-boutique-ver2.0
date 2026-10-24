import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { X } from "lucide-react";
import ProductPhoto from "@/components/ProductPhoto";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";

interface SizeConfig {
  options: string[];
  defaultSize: string | null;
  label: string;
}

/** Size choices per product type. Products with per-size prices use those sizes instead. */
function sizeConfig(product: Product): SizeConfig {
  if (product.features) {
    const options = Object.keys(product.features);
    return { options, defaultSize: options[0] ?? null, label: "Size" };
  }

  switch (product.subcategory ?? product.category) {
    case "flats":
    case "heels":
    case "sandals":
      return { options: ["36", "37", "38", "39", "40", "41"], defaultSize: "39", label: "Size" };
    case "perfumes":
      return { options: ["30ml", "50ml", "75ml", "100ml"], defaultSize: "50ml", label: "Size" };
    case "necklace":
      return {
        options: ["14 inches", "16 inches", "18 inches", "20 inches", "24 inches"],
        defaultSize: "16 inches",
        label: "Length",
      };
    case "bracelets":
      return {
        options: ["Small (6–6.5 inches)", "Medium (6.5–7 inches)", "Large (7–7.5 inches)"],
        defaultSize: "Medium (6.5–7 inches)",
        label: "Wrist Size",
      };
    case "rings":
      return { options: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5"], defaultSize: "6", label: "Ring Size" };
    case "tops":
    case "bottoms":
    case "dresses":
      return { options: ["Small", "Medium", "Large"], defaultSize: "Medium", label: "Size" };
    default:
      // earrings, handbags
      return { options: [], defaultSize: null, label: "Size" };
  }
}

interface Props {
  product: Product;
  onClose: () => void;
}

export default function QuickViewModal({ product, onClose }: Props) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();

  const sizes = sizeConfig(product);
  const isPerfume = product.category === "perfumes";
  const outOfStock = product.stock <= 0;

  const [size, setSize] = useState<string | null>(sizes.defaultSize);
  const [quantity, setQuantity] = useState(1);
  const [show, setShow] = useState(false);

  const displayedPrice = (size ? product.features?.[size] : undefined) ?? product.price;

  useEffect(() => {
    setShow(true);
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const add = (qty: number) => {
    if (outOfStock) {
      alert("Sorry, this product is out of stock.");
      return false;
    }
    addToCart({ ...product, price: displayedPrice }, Math.min(qty, product.stock), size);
    return true;
  };

  const handleBuyNow = () => {
    if (add(1)) router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div
        onClick={handleClose}
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${show ? "opacity-100" : "opacity-0"}`}
      />

      <div
        className={`card relative flex h-[620px] w-full max-w-5xl overflow-hidden text-ink shadow-2xl transition-all duration-300 ${show ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <button
          className="absolute top-4 right-4 z-10 cursor-pointer text-muted transition-colors hover:text-accent"
          onClick={handleClose}
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Image */}
        <div className="relative w-1/2 bg-surface-2">
          <ProductPhoto src={product.imageUrl} alt={product.name} fill sizes="50vw" className="object-cover" />
        </div>

        {/* Info */}
        <div className="flex w-1/2 flex-col overflow-hidden p-8">
          <p className="eyebrow mb-2">{product.folder}</p>
          <h2 className="font-display text-4xl leading-tight font-medium">{product.name}</h2>
          <p className="mt-2 font-display text-2xl text-accent">₱{displayedPrice.toLocaleString()}</p>
          <div className="my-5 h-px w-16 bg-gold" />

          {sizes.options.length > 0 && (
            <div className="mb-5">
              <p className="mb-2 text-sm text-muted">
                {sizes.label}: <span className="text-ink">{size}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {sizes.options.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`cursor-pointer rounded-sm border px-3 py-1 text-sm transition-colors ${
                      size === s ? "border-accent bg-accent text-accent-ink" : "border-line hover:border-gold"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-5 flex items-center gap-4">
            <span className="text-sm text-muted">Quantity</span>
            <div className="flex items-center rounded-sm border border-line">
              <button
                className="cursor-pointer px-3 py-1 transition-colors hover:text-gold"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="min-w-8 border-x border-line px-3 py-1 text-center">{quantity}</span>
              <button
                className="cursor-pointer px-3 py-1 transition-colors hover:text-gold disabled:opacity-40"
                onClick={() => setQuantity((q) => Math.min(q + 1, product.stock))}
                disabled={outOfStock}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <span className={`text-sm ${product.stock <= 3 ? "text-accent" : "text-muted"}`}>
              {outOfStock ? "Out of stock" : `${product.stock} left`}
            </span>
          </div>

          {/* Description */}
          <div className="custom-scrollbar mb-6 min-h-0 flex-1 space-y-4 overflow-y-auto pr-3 leading-relaxed">
            {product.overview && <p>{product.overview}</p>}
            {isPerfume && product.features && (
              <ul className="space-y-1">
                {Object.entries(product.features).map(([key, value]) => (
                  <li key={key} className="flex justify-between border-b border-dotted border-line pb-1">
                    <span className="text-muted">{key}</span>
                    <span>₱{value.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
            {product.stylingTip && (
              <p className="border-l-2 border-gold pl-4 italic">
                <span className="eyebrow mr-2 not-italic">{isPerfume ? "Recommended" : "Styling tip"}</span>
                {product.stylingTip}
              </p>
            )}
          </div>

          {!currentUser?.isAdmin && (
            <div className="flex gap-3">
              <button className="btn flex-1" onClick={() => add(quantity)} disabled={outOfStock}>
                {outOfStock ? "Out of Stock" : "Add to Bag"}
              </button>
              <button className="btn-outline flex-1" onClick={handleBuyNow} disabled={outOfStock}>
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
