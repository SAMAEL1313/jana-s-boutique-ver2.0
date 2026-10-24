import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { supabase, unwrap } from "@/lib/supabase";

export default apiHandler({
  async GET(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const stats = unwrap(await supabase.rpc("admin_stats").single());

    return res.status(200).json({
      success: true,
      totalProducts: Number(stats.total_products),
      totalOrders: Number(stats.total_orders),
      totalEarnings: Number(stats.total_earnings),
    });
  },
});
