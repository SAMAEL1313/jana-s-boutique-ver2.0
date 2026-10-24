import { useState } from "react";
import { motion } from "framer-motion";
import ProductPhoto from "@/components/ProductPhoto";
import QuickViewModal from "@/components/QuickViewModal";
import type { Product } from "@/types";

interface Props {
  product: Product;
  index?: number;
  /** Open the quick view immediately (e.g. when arriving from search). */
  initiallyOpen?: boolean;
}

export default function ProductCard({ product, index = 0, initiallyOpen = false }: Props) {
  const [showModal, setShowModal] = useState(initiallyOpen);

  return (
    <motion.article
      className="group card w-full overflow-hidden transition-shadow duration-300 hover:shadow-xl"
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.05 }}
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface-2">
        <ProductPhoto
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {product.stock <= 0 && (
          <span className="absolute top-3 left-3 bg-ink/80 px-2 py-1 font-display text-xs tracking-[0.2em] text-paper uppercase">
            Sold out
          </span>
        )}
        <div className="absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button onClick={() => setShowModal(true)} className="btn shadow-lg">
            Quick View
          </button>
        </div>
      </div>

      <button onClick={() => setShowModal(true)} className="block w-full cursor-pointer px-4 py-4 text-left">
        <p className="eyebrow mb-1 !text-[0.65rem]">{product.folder}</p>
        <h3 className="font-display text-xl leading-tight font-semibold text-ink">{product.name}</h3>
        <p className="mt-1 text-muted">₱{product.price.toLocaleString()}</p>
      </button>

      {showModal && <QuickViewModal product={product} onClose={() => setShowModal(false)} />}
    </motion.article>
  );
}
