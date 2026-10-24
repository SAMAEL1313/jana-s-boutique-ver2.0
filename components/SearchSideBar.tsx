import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { X } from "lucide-react";
import { FaSearch } from "react-icons/fa";
import ProductPhoto from "@/components/ProductPhoto";
import { api } from "@/lib/fetcher";
import { productListPath } from "@/lib/products";
import type { Product } from "@/types";

export default function SearchSidebar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    setIsVisible(true);
    api<{ products: Product[] }>("/api/products").then((data) => {
      if (data.success) setProducts(data.products);
      else console.error("Error loading products:", data.message);
    });
  }, []);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(keyword) ||
        p.overview?.toLowerCase().includes(keyword) ||
        p.folder.toLowerCase().includes(keyword)
    );
  }, [query, products]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const openProduct = (product: Product) => {
    handleClose();
    router.push(`${productListPath(product)}?productId=${product.id}`);
  };

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${isVisible ? "opacity-100" : "opacity-0"}`}
      />

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-full max-w-md transform flex-col border-r border-line bg-surface text-ink shadow-2xl transition-transform duration-300 ${isVisible ? "translate-x-0" : "-translate-x-full"}`}
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl font-semibold">Search</h2>
          <button onClick={handleClose} className="cursor-pointer text-muted transition-colors hover:text-accent" aria-label="Close search">
            <X size={22} />
          </button>
        </header>

        <div className="relative mx-6 mt-5">
          <FaSearch className="absolute top-1/2 left-0 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the collection..."
            autoFocus
            className="w-full border-b border-line bg-transparent py-2.5 pr-14 pl-7 font-display text-xl text-ink placeholder:text-muted placeholder:italic focus:border-gold focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute top-1/2 right-0 -translate-y-1/2 cursor-pointer text-sm text-muted hover:text-gold"
            >
              Clear
            </button>
          )}
        </div>

        <div className="custom-scrollbar mt-4 flex-1 space-y-1 overflow-y-auto px-4 pb-6">
          {filtered.map((product) => (
            <button
              key={product.id}
              onClick={() => openProduct(product)}
              className="flex w-full cursor-pointer items-center gap-4 rounded-sm p-2 text-left transition-colors hover:bg-surface-2"
            >
              <div className="relative h-14 w-12 flex-shrink-0 bg-surface-2">
                <ProductPhoto src={product.imageUrl} alt={product.name} fill sizes="48px" className="object-cover" />
              </div>
              <div>
                <p className="font-display text-lg leading-tight font-semibold">{product.name}</p>
                <p className="text-sm text-muted">{product.folder}</p>
              </div>
            </button>
          ))}

          {query && filtered.length === 0 && <p className="pt-6 text-center text-muted italic">No results found.</p>}
        </div>
      </aside>
    </>
  );
}
