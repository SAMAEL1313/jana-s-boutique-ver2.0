import { apiHandler, str } from "@/lib/api";
import { isAdminEmail, setSessionCookie, signInAdmin, toSessionUser, verifyPassword } from "@/lib/auth";
import { checkRateLimits, clientIp, limits, resetRateLimit } from "@/lib/rateLimit";
import { supabase, unwrap } from "@/lib/supabase";

export default apiHandler({
  async POST(req, res) {
    const email = str(req.body?.email).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    const adminOnly = req.body?.admin === true;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please enter both email and password." });
    }

    // Every attempt counts; a successful login clears the per-account counter.
    const emailLimit = limits.loginEmail(email);
    if (!(await checkRateLimits(res, emailLimit, limits.loginIp(clientIp(req))))) return;

    const admin = await signInAdmin(email, password);
    if (admin) {
      await resetRateLimit(emailLimit);
      setSessionCookie(res, admin);
      return res.status(200).json({ success: true, user: toSessionUser(admin) });
    }
    if (adminOnly) {
      return res.status(401).json({ success: false, message: "Invalid admin login." });
    }
    // The admin's stored password never counts; only ADMIN_PASSWORD does.
    if (isAdminEmail(email)) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    const user = unwrap(await supabase.from("users").select("*").eq("email", email).maybeSingle());
    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    await resetRateLimit(emailLimit);
    setSessionCookie(res, user);
    return res.status(200).json({ success: true, user: toSessionUser(user) });
  },
});
