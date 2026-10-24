import type { ParsedImage } from "@/lib/productInput";
import { supabase } from "@/lib/supabase";

const BUCKET = "product-images";

const EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/** Uploads a product photo to Supabase Storage and returns its public URL. */
export async function uploadProductImage(productId: number, image: ParsedImage) {
  // A new file name per upload, so cached copies of the old photo never show.
  const path = `${productId}/${Date.now()}.${EXTENSIONS[image.mimeType] ?? "img"}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, image.data, { contentType: image.mimeType, cacheControl: "31536000" });
  if (error) throw error;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Deletes a product's stored photos, except the one at `keepUrl`. */
export async function removeProductImages(productId: number, keepUrl?: string | null) {
  const { data: files, error } = await supabase.storage.from(BUCKET).list(String(productId));
  if (error) throw error;

  const stale = files
    .map((file) => `${productId}/${file.name}`)
    .filter((path) => supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl !== keepUrl);
  if (stale.length) {
    const { error: removeError } = await supabase.storage.from(BUCKET).remove(stale);
    if (removeError) throw removeError;
  }
}
