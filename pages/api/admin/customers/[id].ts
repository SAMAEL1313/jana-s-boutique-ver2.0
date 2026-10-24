import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { serializeOrder } from "@/lib/orders";
import { supabase, unwrap } from "@/lib/supabase";

export default apiHandler({
  async GET(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const id = Number(req.query.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ success: false, message: "Invalid customer id." });
    }

    const customer = unwrap(
      await supabase
        .from("users")
        .select("id, first_name, last_name, email, orders(*, order_items(*))")
        .eq("id", id)
        .eq("is_admin", false)
        .order("purchase_date", { referencedTable: "orders", ascending: false })
        .maybeSingle()
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: "Customer not found." });
    }

    const profile = {
      id: customer.id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
    };
    return res.status(200).json({ success: true, customer: profile, orders: customer.orders.map(serializeOrder) });
  },
});
