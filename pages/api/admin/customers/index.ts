import { apiHandler } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { supabase, unwrap } from "@/lib/supabase";

export default apiHandler({
  async GET(req, res) {
    if (!(await requireAdmin(req, res))) return;

    const rows = unwrap(
      await supabase
        .from("users")
        .select("id, first_name, last_name, email")
        .eq("is_admin", false)
        .order("created_at", { ascending: false })
    );
    const customers = rows.map((c) => ({ id: c.id, firstName: c.first_name, lastName: c.last_name, email: c.email }));

    return res.status(200).json({ success: true, customers });
  },
});
