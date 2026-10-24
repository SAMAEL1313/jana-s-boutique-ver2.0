import { apiHandler, str } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { uploadProductImage } from "@/lib/productImages";
import { parseProductInput } from "@/lib/productInput";
import { serializeProduct } from "@/lib/products";
import { supabase, unwrap } from "@/lib/supabase";

export const config = { api: { bodyParser: { sizeLimit: "8mb" } } };

export default apiHandler({
  async GET(req, res) {
    const category = str(req.query.category).toLowerCase();
    const subcategory = str(req.query.subcategory).toLowerCase();

    let query = supabase.from("products").select("*");
    if (category) query = query.eq("category", category);
    if (subcategory) query = query.eq("subcategory", subcategory);
    const rows = unwrap(await query.order("id", { ascending: true }));

    return res.status(200).json({ success: true, products: rows.map(serializeProduct) });
  },

  async POST(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const input = parseProductInput(req.body);
    if (typeof input === "string") {
      return res.status(400).json({ success: false, message: input });
    }

    let product = unwrap(await supabase.from("products").insert(input.data).select().single());
    if (input.image) {
      try {
        const imageUrl = await uploadProductImage(product.id, input.image);
        product = unwrap(
          await supabase.from("products").update({ image_url: imageUrl }).eq("id", product.id).select().single()
        );
      } catch (err) {
        // Don't leave a half-created product behind if the upload fails.
        await supabase.from("products").delete().eq("id", product.id);
        throw err;
      }
    }

    return res.status(201).json({ success: true, product: serializeProduct(product) });
  },
});
