import { requireCustomerRow } from "@/lib/account";
import { apiHandler, str } from "@/lib/api";
import { serializeProduct } from "@/lib/products";
import { supabase, unwrap } from "@/lib/supabase";
import type { CartItem } from "@/types";

/** The user's saved bag, with current product details and prices. */
async function loadCart(userId: number): Promise<CartItem[]> {
  const rows = unwrap(
    await supabase
      .from("cart_items")
      .select("quantity, size, products(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
  );
  return rows.flatMap((row) => {
    if (!row.products) return [];
    const product = serializeProduct(row.products);
    const size = row.size || null;
    // Products with per-size prices (perfumes) are priced by the chosen size.
    const price = (size ? product.features?.[size] : undefined) ?? product.price;
    return [{ ...product, price, quantity: row.quantity, size }];
  });
}

export default apiHandler({
  async GET(req, res) {
    const user = await requireCustomerRow(req, res);
    if (!user) return;
    return res.status(200).json({ success: true, items: await loadCart(user.id) });
  },

  /** Replaces the whole bag: { items: [{ productId, quantity, size }] }. */
  async PUT(req, res) {
    const user = await requireCustomerRow(req, res);
    if (!user) return;

    const raw: unknown = req.body?.items;
    if (!Array.isArray(raw) || raw.length > 100) {
      return res.status(400).json({ success: false, message: "Invalid bag." });
    }
    const items = raw.map((i: Record<string, unknown>) => ({
      product_id: Number(i?.productId),
      quantity: Number(i?.quantity),
      size: str(i?.size),
    }));
    if (items.some((i) => !Number.isInteger(i.product_id) || !Number.isInteger(i.quantity) || i.quantity < 1)) {
      return res.status(400).json({ success: false, message: "Invalid bag." });
    }

    unwrap(await supabase.rpc("set_cart", { p_user_id: user.id, p_items: items }));
    return res.status(200).json({ success: true, items: await loadCart(user.id) });
  },
});
