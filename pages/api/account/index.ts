import { confirmPassword, requireCustomerRow } from "@/lib/account";
import { apiHandler, EMAIL_PATTERN, str } from "@/lib/api";
import { clearSessionCookie, isAdminEmail, toSessionUser } from "@/lib/auth";
import { toShippingAddress } from "@/lib/shippingAddress";
import { supabase, unwrap } from "@/lib/supabase";

export default apiHandler({
  async GET(req, res) {
    const user = await requireCustomerRow(req, res);
    if (!user) return;
    return res.status(200).json({
      success: true,
      user: toSessionUser(user),
      shippingAddress: toShippingAddress(user.shipping_address),
    });
  },

  /** Update name and email. Changing the email needs the current password. */
  async PATCH(req, res) {
    const user = await requireCustomerRow(req, res);
    if (!user) return;

    const firstName = str(req.body?.firstName);
    const lastName = str(req.body?.lastName);
    const email = str(req.body?.email).toLowerCase();

    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: "First and last name are required." });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    const emailChanged = email !== user.email;
    if (emailChanged) {
      if (!(await confirmPassword(res, user, req.body?.currentPassword))) return;
      const taken = unwrap(await supabase.from("users").select("id").eq("email", email).maybeSingle());
      if (taken || isAdminEmail(email)) {
        return res.status(409).json({ success: false, message: "An account with this email already exists." });
      }
    }

    const updated = unwrap(
      await supabase
        .from("users")
        .update({
          first_name: firstName,
          last_name: lastName,
          email,
          // A reset link sent to the old address shouldn't keep working.
          ...(emailChanged && { reset_token_hash: null, reset_token_expires: null }),
        })
        .eq("id", user.id)
        .select()
        .single()
    );

    return res.status(200).json({ success: true, user: toSessionUser(updated) });
  },

  /** Delete the account. Past orders stay for the shop's records, unlinked from the user. */
  async DELETE(req, res) {
    const user = await requireCustomerRow(req, res);
    if (!user) return;
    if (!(await confirmPassword(res, user, req.body?.currentPassword))) return;

    unwrap(await supabase.from("users").delete().eq("id", user.id));
    clearSessionCookie(res);
    return res.status(200).json({ success: true });
  },
});
