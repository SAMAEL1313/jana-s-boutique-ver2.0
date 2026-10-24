import { requireCustomerRow } from "@/lib/account";
import { apiHandler } from "@/lib/api";
import { parseShippingAddress } from "@/lib/shippingAddress";
import { supabase, unwrap } from "@/lib/supabase";

export default apiHandler({
  /** Saves the default shipping address used to pre-fill checkout. */
  async PUT(req, res) {
    const user = await requireCustomerRow(req, res);
    if (!user) return;

    const address = parseShippingAddress(req.body);
    if (typeof address === "string") {
      return res.status(400).json({ success: false, message: address });
    }

    unwrap(await supabase.from("users").update({ shipping_address: { ...address } }).eq("id", user.id));
    return res.status(200).json({ success: true, shippingAddress: address });
  },

  async DELETE(req, res) {
    const user = await requireCustomerRow(req, res);
    if (!user) return;
    unwrap(await supabase.from("users").update({ shipping_address: null }).eq("id", user.id));
    return res.status(200).json({ success: true });
  },
});
