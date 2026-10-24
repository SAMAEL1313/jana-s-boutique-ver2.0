import { apiHandler, str } from "@/lib/api";
import { hashPassword, hashToken } from "@/lib/auth";
import { supabase, unwrap } from "@/lib/supabase";

export default apiHandler({
  async POST(req, res) {
    const token = str(req.body?.token);
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!token) {
      return res.status(400).json({ success: false, message: "Invalid or missing token." });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    const user = unwrap(
      await supabase
        .from("users")
        .select("id, reset_token_expires, session_version")
        .eq("reset_token_hash", hashToken(token))
        .maybeSingle()
    );
    if (!user || !user.reset_token_expires || new Date(user.reset_token_expires) < new Date()) {
      return res.status(400).json({ success: false, message: "This reset link is invalid or has expired." });
    }

    unwrap(
      await supabase
        .from("users")
        .update({
          password_hash: await hashPassword(password),
          reset_token_hash: null,
          reset_token_expires: null,
          // Sign out every device that was using the old password.
          session_version: user.session_version + 1,
        })
        .eq("id", user.id)
    );

    return res.status(200).json({ success: true });
  },
});
