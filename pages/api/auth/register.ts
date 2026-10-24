import { apiHandler, EMAIL_PATTERN, str } from "@/lib/api";
import { hashPassword, isAdminEmail } from "@/lib/auth";
import { checkRateLimits, clientIp, limits } from "@/lib/rateLimit";
import { supabase, unwrap } from "@/lib/supabase";

export default apiHandler({
  async POST(req, res) {
    const firstName = str(req.body?.firstName);
    const lastName = str(req.body?.lastName);
    const email = str(req.body?.email).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!firstName || !lastName) {
      return res.status(400).json({ success: false, message: "First and last name are required." });
    }
    if (!EMAIL_PATTERN.test(email)) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address!" });
    }
    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
    }

    if (!(await checkRateLimits(res, limits.registerIp(clientIp(req))))) return;

    const existing = unwrap(await supabase.from("users").select("id").eq("email", email).maybeSingle());
    if (existing || isAdminEmail(email)) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    unwrap(
      await supabase.from("users").insert({
        first_name: firstName,
        last_name: lastName,
        email,
        password_hash: await hashPassword(password),
      })
    );

    return res.status(201).json({ success: true });
  },
});
