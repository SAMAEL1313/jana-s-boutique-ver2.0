import crypto from "node:crypto";
import { apiHandler, str } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { receiptEmail, sendMail } from "@/lib/mailer";
import { ORDER_WITH_ITEMS, serializeOrder } from "@/lib/orders";
import { SHIPPING_COST } from "@/lib/products";
import { parseShippingAddress } from "@/lib/shippingAddress";
import { supabase, unwrap } from "@/lib/supabase";

const PAYMENT_METHODS = ["GCash"];

/** SQLSTATE that `place_order` raises for problems the customer should see. */
const CHECKOUT_ERROR = "JB409";

export default apiHandler({
  async POST(req, res) {
    const user = await requireUser(req, res);
    if (!user) return;

    const b = req.body ?? {};
    const shipping = parseShippingAddress(b);
    if (typeof shipping === "string") {
      return res.status(400).json({ success: false, message: shipping });
    }

    const paymentMethod = str(b.paymentMethod);
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: "Unsupported payment method." });
    }

    const requested: { productId: number; quantity: number; size: string | null }[] = Array.isArray(b.items)
      ? b.items.map((i: Record<string, unknown>) => ({
          productId: Number(i?.productId),
          quantity: Number(i?.quantity),
          size: str(i?.size) || null,
        }))
      : [];
    if (
      requested.length === 0 ||
      requested.some((i) => !Number.isInteger(i.productId) || !Number.isInteger(i.quantity) || i.quantity < 1)
    ) {
      return res.status(400).json({ success: false, message: "Your cart is empty!" });
    }

    // Stock checks, prices and the order insert all happen in one database
    // transaction inside place_order (see supabase/migrations).
    const { data: orderId, error } = await supabase.rpc("place_order", {
      p_user_id: user.id,
      p_email: user.email,
      p_order_number: `ORD-${Date.now()}-${crypto.randomInt(1000, 9999)}`,
      p_billing_id: `BILL-${crypto.randomInt(100000, 999999)}`,
      p_shipping: { ...shipping },
      p_payment_method: paymentMethod,
      p_shipping_cost: SHIPPING_COST,
      p_items: requested.map((i) => ({ product_id: i.productId, quantity: i.quantity, size: i.size })),
    });
    if (error) {
      if (error.code === CHECKOUT_ERROR) {
        return res.status(409).json({ success: false, message: error.message });
      }
      throw error;
    }

    const order = unwrap(await supabase.from("orders").select(ORDER_WITH_ITEMS).eq("id", orderId).single());
    const dto = serializeOrder(order);

    if (b.saveAddress === true && !user.isAdmin) {
      // Best effort: the order is placed even if remembering the address fails.
      const { error: saveError } = await supabase
        .from("users")
        .update({ shipping_address: { ...shipping } })
        .eq("id", user.id);
      if (saveError) console.error("Failed to save shipping address:", saveError);
    }

    // The bought items are no longer in the bag.
    const { error: cartError } = await supabase.from("cart_items").delete().eq("user_id", user.id);
    if (cartError) console.error("Failed to clear cart:", cartError);

    // The order is already saved; a failed receipt email shouldn't fail checkout.
    sendMail(dto.email, `Your Jana's Boutique receipt — ${dto.orderNumber}`, receiptEmail(dto)).catch((err) =>
      console.error("Failed to send receipt:", err)
    );

    return res.status(201).json({ success: true, order: dto });
  },
});
