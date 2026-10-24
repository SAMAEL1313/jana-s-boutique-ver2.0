import { apiHandler, EMAIL_PATTERN, str } from "@/lib/api";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    await prisma.user.create({
      data: { firstName, lastName, email, passwordHash: await hashPassword(password) },
    });

    return res.status(201).json({ success: true });
  },
});
