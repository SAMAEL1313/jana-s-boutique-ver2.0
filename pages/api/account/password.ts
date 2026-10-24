import { confirmPassword, requireCustomerRow } from "@/lib/account";
import { apiHandler } from "@/lib/api";
import { hashPassword, setSessionCookie, verifyPassword } from "@/lib/auth";
import { supabase, unwrap } from "@/lib/supabase";

export default apiHandler({
  async POST(req, res) {
    const user = await requireCustomerRow(req, res);
    if (!user) return;

    const newPassword = typeof req.body?.newPassword === "string" ? req.body.newPassword : "";
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: "New password must be at least 8 characters." });
    }
    if (!(await confirmPassword(res, user, req.body?.currentPassword))) return;
    if (await verifyPassword(newPassword, user.password_hash)) {
      return res.status(400).json({ success: false, message: "New password must be different from the current one." });
    }

    const updated = unwrap(
      await supabase
        .from("users")
        .update({
          password_hash: await hashPassword(newPassword),
          reset_token_hash: null,
          reset_token_expires: null,
          // Sign out every other device; this one gets a fresh cookie below.
          session_version: user.session_version + 1,
        })
        .eq("id", user.id)
        .select("id, email, session_version")
        .single()
    );
    setSessionCookie(res, updated);

    return res.status(200).json({ success: true });
  },
});
