import { apiHandler } from "@/lib/api";
import { requireUser } from "@/lib/auth";
import { ORDER_WITH_ITEMS, serializeOrder } from "@/lib/orders";
import { supabase, unwrap } from "@/lib/supabase";

export default apiHandler({
  async GET(req, res) {
    const user = await requireUser(req, res);
    if (!user) return;

    const orders = unwrap(
      await supabase
        .from("orders")
        .select(ORDER_WITH_ITEMS)
        .eq("user_id", user.id)
        .order("purchase_date", { ascending: false })
    );

    return res.status(200).json({ success: true, orders: orders.map(serializeOrder) });
  },
});
