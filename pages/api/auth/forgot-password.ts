import { apiHandler, appUrl, str } from "@/lib/api";
import { createResetToken } from "@/lib/auth";
import { resetPasswordEmail, sendMail } from "@/lib/mailer";
import { prisma } from "@/lib/prisma";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

export default apiHandler({
  async POST(req, res) {
    const email = str(req.body?.email).toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: "Please enter your registered email." });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const { token, tokenHash } = createResetToken();
      await prisma.user.update({
        where: { id: user.id },
        data: { resetTokenHash: tokenHash, resetTokenExpires: new Date(Date.now() + RESET_TTL_MS) },
      });
      const link = `${appUrl(req)}/resetpassword?token=${token}`;
      await sendMail(user.email, "Reset your Jana Boutique password", resetPasswordEmail(link));
    }

    // Same response either way so the endpoint can't be used to discover accounts.
    return res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent.",
    });
  },
});
