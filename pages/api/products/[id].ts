import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { removeProductImages, uploadProductImage } from "@/lib/productImages";
import { parseProductInput } from "@/lib/productInput";
import { serializeProduct } from "@/lib/products";
import { supabase, unwrap } from "@/lib/supabase";

export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

function parseId(value: unknown) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default apiHandler({
  async PUT(req, res) {
    if (!(await requireAdmin(req, res))) return;
    const id = parseId(req.query.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid product id." });

    const input = parseProductInput(req.body);
    if (typeof input === "string") {
      return res.status(400).json({ success: false, message: input });
    }
    if (!unwrap(await supabase.from("products").select("id").eq("id", id).maybeSingle())) {
      return res.status(404).json({ success: false, message: "Product not found." });
    }

    if (input.image) {
      input.data.image_url = await uploadProductImage(id, input.image);
    }
    const product = unwrap(await supabase.from("products").update(input.data).eq("id", id).select().single());

    // Clean up photos that are no longer used (replaced, or image URL changed).
    await removeProductImages(id, product.image_url).catch((err) =>
      console.error(`Failed to clean up images for product ${id}:`, err)
    );

    return res.status(200).json({ success: true, product: serializeProduct(product) });
  },

  async DELETE(req, res) {
    if (!(await requireAdmin(req, res))) return;
    const id = parseId(req.query.id);
    if (!id) return res.status(400).json({ success: false, message: "Invalid product id." });

    // Past order items keep their name/price snapshot; product_id is set to NULL.
    const deleted = unwrap(await supabase.from("products").delete().eq("id", id).select("id"));
    if (!deleted.length) return res.status(404).json({ success: false, message: "Product not found." });

    await removeProductImages(id).catch((err) =>
      console.error(`Failed to clean up images for product ${id}:`, err)
    );

    return res.status(200).json({ success: true });
  },
});
