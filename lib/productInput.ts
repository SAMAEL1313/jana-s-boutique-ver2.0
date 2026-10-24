import { Prisma } from "@/generated/prisma/client";
import { str } from "@/lib/api";
import { isCategory, isValidSubcategory, parseFeatures } from "@/lib/products";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const IMAGE_DATA_URL = /^data:(image\/(?:png|jpe?g|webp|gif));base64,(.+)$/;

export interface ParsedImage {
  mimeType: string;
  data: Uint8Array<ArrayBuffer>;
}

export type ProductInput = {
  data: Omit<Prisma.ProductCreateInput, "image" | "orderItems">;
  image: ParsedImage | null;
};

/** Validates an admin create/update payload. Returns an error message on failure. */
export function parseProductInput(body: unknown): ProductInput | string {
  const b = (body ?? {}) as Record<string, unknown>;

  const name = str(b.name);
  if (!name) return "Product name is required.";

  const category = str(b.category).toLowerCase();
  if (!isCategory(category)) return "Please choose a valid category.";
  const subcategory = str(b.subcategory).toLowerCase() || null;
  if (!isValidSubcategory(category, subcategory)) return "Please choose a valid subcategory.";

  const price = Number(b.price);
  if (!Number.isFinite(price) || price < 0) return "Price must be a non-negative number.";

  const stock = Number(b.stock ?? 0);
  if (!Number.isInteger(stock) || stock < 0) return "Stock must be a non-negative whole number.";

  let features: Record<string, number> | null = null;
  if (typeof b.features === "string" && b.features.trim()) {
    try {
      features = parseFeatures(JSON.parse(b.features));
    } catch {
      return 'Features must be JSON, e.g. {"50ml": 1890, "100ml": 2990}.';
    }
    if (!features) return 'Features must map sizes to prices, e.g. {"50ml": 1890}.';
  } else if (b.features && typeof b.features === "object") {
    features = parseFeatures(b.features);
  }

  let image: ParsedImage | null = null;
  if (typeof b.image === "string" && b.image) {
    const match = IMAGE_DATA_URL.exec(b.image);
    if (!match) return "Image must be a PNG, JPEG, WEBP or GIF.";
    const buffer = Buffer.from(match[2], "base64");
    if (buffer.length > MAX_IMAGE_BYTES) return "Image must be 5 MB or smaller.";
    image = { mimeType: match[1], data: new Uint8Array(buffer) };
  }

  return {
    data: {
      name,
      category,
      subcategory,
      price,
      stock,
      overview: str(b.overview) || null,
      stylingTip: str(b.stylingTip) || null,
      features: features ?? Prisma.DbNull,
      imageUrl: str(b.imageUrl) || null,
    },
    image,
  };
}

export const productImageUrl = (productId: number) =>
  `/api/product-images/${productId}?v=${Date.now()}`;
