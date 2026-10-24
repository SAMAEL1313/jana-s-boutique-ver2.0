import { apiHandler, appUrl, str } from "@/lib/api";
import { createResetToken, isAdminEmail } from "@/lib/auth";
import { resetPasswordEmail, sendMail } from "@/lib/mailer";
import { checkRateLimits, clientIp, limits } from "@/lib/rateLimit";
import { supabase, unwrap } from "@/lib/supabase";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export default apiHandler({
  async POST(req, res) {
    const email = str(req.body?.email).toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Please enter your registered email." });
    }
    // Stops reset emails being used to flood someone's inbox.
    if (!(await checkRateLimits(res, limits.forgotEmail(email), limits.forgotIp(clientIp(req))))) return;

    const user = unwrap(await supabase.from("users").select("id, email").eq("email", email).maybeSingle());
    // The admin password lives in .env (ADMIN_PASSWORD), so it can't be reset by email.
    if (user && !isAdminEmail(user.email)) {
      const { token, tokenHash } = createResetToken();
      unwrap(
        await supabase
          .from("users")
          .update({
            reset_token_hash: tokenHash,
            reset_token_expires: new Date(Date.now() + RESET_TTL_MS).toISOString(),
          })
          .eq("id", user.id)
      );
      const link = `${appUrl(req)}/resetpassword?token=${token}`;
      await sendMail(user.email, "Reset your Online Boutique password", resetPasswordEmail(link));
    }

    // Same response either way so the endpoint can't be used to discover accounts.
    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  },
});
