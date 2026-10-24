import type { Product as ProductRow } from "@/generated/prisma/client";
import type { Category, Product } from "@/types";

export const SHIPPING_COST = 100;

export const CATEGORIES: Record<Category, string[]> = {
  tops: [],
  bottoms: [],
  dresses: [],
  perfumes: [],
  shoes: ["sandals", "heels", "flats"],
  accessories: ["handbags", "earrings", "necklace", "bracelets", "rings"],
};

export function isCategory(value: unknown): value is Category {
  return typeof value === "string" && value in CATEGORIES;
}

export function isValidSubcategory(category: Category, subcategory: string | null) {
  const subs = CATEGORIES[category];
  return subcategory === null ? subs.length === 0 : subs.includes(subcategory);
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export function folderLabel(category: string, subcategory: string | null) {
  return subcategory
    ? `${capitalize(category)} > ${capitalize(subcategory)}`
    : capitalize(category);
}

/** Storefront URL for a product's listing page. */
export function productListPath(p: Pick<Product, "category" | "subcategory">) {
  return p.subcategory ? `/${p.category}/${p.subcategory}` : `/${p.category}`;
}

export function parseFeatures(value: unknown): Record<string, number> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>)
    .map(([k, v]) => [k, Number(v)] as const)
    .filter(([, v]) => Number.isFinite(v));
  return entries.length ? Object.fromEntries(entries) : null;
}

export function serializeProduct(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    category: row.category as Category,
    subcategory: row.subcategory,
    folder: folderLabel(row.category, row.subcategory),
    price: Number(row.price),
    stock: row.stock,
    overview: row.overview,
    features: parseFeatures(row.features),
    stylingTip: row.stylingTip,
    imageUrl: row.imageUrl,
  };
}

/** Normalizes a stored image path into something next/image can load. */
export function imageSrc(url: string | null | undefined) {
  if (!url) return "/images/placeholder.svg";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return "/" + url.replace(/^public\//, "");
}
