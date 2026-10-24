import { apiHandler, str } from "@/lib/api";
import { hashPassword, hashToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const user = await prisma.user.findUnique({ where: { resetTokenHash: hashToken(token) } });
    if (!user || !user.resetTokenExpires || user.resetTokenExpires < new Date()) {
      return res.status(400).json({ success: false, message: "This reset link is invalid or has expired." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(password),
        resetTokenHash: null,
        resetTokenExpires: null,
      },
    });

    return res.status(200).json({ success: true });
  },
});
